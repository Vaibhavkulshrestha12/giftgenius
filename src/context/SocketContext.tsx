import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChat } from './ChatContext';
import { MessageRole } from '../types';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  sendMessage: (message: string) => void;
  sendGeminiPrompt: (userInputs: any) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  sendMessage: () => {},
  sendGeminiPrompt: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { addMessage, setIsBotTyping } = useChat();
  const connectAttempts = useRef(0);
  const keepAliveInterval = useRef<NodeJS.Timeout | null>(null);
  const geminiPromptQueue = useRef<any[]>([]);

  
  useEffect(() => {
    const connectSocket = () => {
      
      const socketClient = io('http://localhost:3001', {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      socketClient.on('connect', () => {
        console.log('Connected to socket server with ID:', socketClient.id);
        setConnected(true);
        connectAttempts.current = 0;
        
        
        if (geminiPromptQueue.current.length > 0) {
          console.log('Processing queued Gemini prompts:', geminiPromptQueue.current.length);
          geminiPromptQueue.current.forEach(inputs => {
            socketClient.emit('gemini-prompt', inputs);
          });
          geminiPromptQueue.current = [];
        }
        
        
        if (keepAliveInterval.current) {
          clearInterval(keepAliveInterval.current);
        }
        keepAliveInterval.current = setInterval(() => {
          if (socketClient.connected) {
            socketClient.emit('ping-server');
          }
        }, 25000);
      });

      socketClient.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setConnected(false);
      });

      socketClient.on('connect_error', (error) => {
        console.error('Connection error:', error);
        connectAttempts.current += 1;
        
        
        if (connectAttempts.current >= 3) {
          addMessage('I seem to be having trouble connecting to the server. Please refresh the page or try again later.', MessageRole.BOT);
        }
      });

      socketClient.on('bot-message', (message: string) => {
        console.log('Received bot message of length:', message.length);
        setIsBotTyping(false);
        addMessage(message, MessageRole.BOT);
      });

      socketClient.on('typing-start', () => {
        console.log('Bot is typing...');
        setIsBotTyping(true);
      });

      socketClient.on('typing-end', () => {
        console.log('Bot stopped typing');
        setIsBotTyping(false);
      });

      socketClient.on('pong-client', () => {
        console.log('Received pong from server (connection alive)');
      });

      setSocket(socketClient);

      return socketClient;
    };

    const socketClient = connectSocket();

    
    return () => {
      console.log('Cleaning up socket connection');
      if (keepAliveInterval.current) {
        clearInterval(keepAliveInterval.current);
      }
      socketClient.disconnect();
    };
  }, [addMessage, setIsBotTyping]);

  const sendMessage = (message: string) => {
    if (socket?.connected) {
      console.log('Sending user message:', message);
      socket.emit('user-message', message);
    } else {
      console.error('Socket not connected. Cannot send message.');
      
      
      if (socket) {
        console.log('Attempting to reconnect socket...');
        socket.connect();
      }
    }
  };

  const sendGeminiPrompt = (userInputs: any) => {
    console.log('sendGeminiPrompt called with inputs:', userInputs);
    
    if (socket?.connected) {
      console.log('Socket connected, sending Gemini prompt');
      setIsBotTyping(true);
      socket.emit('gemini-prompt', userInputs);
    } else {
      console.log('Socket not connected, queueing prompt');
      
     
      geminiPromptQueue.current.push(userInputs);
      
      
      setIsBotTyping(true);
      
      
      setTimeout(() => {
        addMessage("I'm preparing gift recommendations for you. This might take a moment...", MessageRole.BOT);
      }, 1000);
      
     
      if (socket) {
        console.log('Attempting to reconnect socket for Gemini prompt...');
        socket.connect();
      }
      
      
      setTimeout(() => {
        if (geminiPromptQueue.current.includes(userInputs)) {
          console.log('Providing fallback suggestions after timeout');
          setIsBotTyping(false);
          
          
          const { gender, relationship, age, budget } = userInputs;
          let suggestions = '';
          
          if (gender === 'Female') {
            suggestions = `Based on your inputs, here are some gift suggestions for your ${relationship} (age ${age}, budget ₹${budget}):\n\n`;
            suggestions += `1. Personalized Photo Frame from Amazon.in (₹${Math.min(budget, 800)})\n`;
            suggestions += `2. Scented Candle Gift Set from Bath & Body Works (₹${Math.min(budget, 1200)})\n`;
            suggestions += `3. Handcrafted Jewelry Box from Craft Centrals (₹${Math.min(budget, 1500)})\n\n`;
            suggestions += `These gifts combine sentiment with practicality and are readily available in India.`;
          } else {
            suggestions = `Based on your inputs, here are some gift suggestions for your ${relationship} (age ${age}, budget ₹${budget}):\n\n`;
            suggestions += `1. Leather Wallet from Hidesign (₹${Math.min(budget, 1500)})\n`;
            suggestions += `2. Wireless Earbuds from Boat on Flipkart (₹${Math.min(budget, 1800)})\n`;
            suggestions += `3. Customized Name Keychain from Giftsmate.com (₹${Math.min(budget, 500)})\n\n`;
            suggestions += `These gifts are thoughtful options that show you care while staying within your budget.`;
          }
          
          addMessage(suggestions, MessageRole.BOT);
          
         
          geminiPromptQueue.current = geminiPromptQueue.current.filter(item => item !== userInputs);
        }
      }, 8000);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, sendMessage, sendGeminiPrompt }}>
      {children}
    </SocketContext.Provider>
  );
};