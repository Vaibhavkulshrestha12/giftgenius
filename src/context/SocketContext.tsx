import React, { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChat } from './ChatContext';
import { MessageRole, UserInputs } from '../types';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  sendMessage: (message: string) => void;
  sendGeminiPrompt: (userInputs: UserInputs & { refinement?: string }) => void;
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
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const pendingPromptRef = useRef<UserInputs & { refinement?: string } | null>(null);

  const handleBotMessage = useCallback((message: string) => {
    setIsBotTyping(false);
    addMessage(message, MessageRole.BOT);
  }, [addMessage, setIsBotTyping]);

  const handleTypingStart = useCallback(() => setIsBotTyping(true), [setIsBotTyping]);
  const handleTypingEnd = useCallback(() => setIsBotTyping(false), [setIsBotTyping]);

  useEffect(() => {
    const socketURL = import.meta.env.PROD 
      ? window.location.origin
      : 'http://localhost:3001';
    
    console.log('Connecting to socket server at:', socketURL);
    
    const socketClient = io(socketURL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: false
    });

    const handleConnect = () => {
      console.log('Connected to socket server');
      setConnected(true);
      reconnectAttempts.current = 0;

      if (pendingPromptRef.current) {
        socketClient.emit('gemini-prompt', pendingPromptRef.current);
        pendingPromptRef.current = null;
      }
    };

    const handleDisconnect = (reason: string) => {
      console.log('Disconnected:', reason);
      setConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error('Connection error:', error);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        handleBotMessage('Connection to server failed. Please refresh the page.');
      }
    };

    socketClient.on('connect', handleConnect);
    socketClient.on('disconnect', handleDisconnect);
    socketClient.on('connect_error', handleConnectError);
    socketClient.on('bot-message', handleBotMessage);
    socketClient.on('typing-start', handleTypingStart);
    socketClient.on('typing-end', handleTypingEnd);

    setSocket(socketClient);

    return () => {
      socketClient.off('connect', handleConnect);
      socketClient.off('disconnect', handleDisconnect);
      socketClient.off('connect_error', handleConnectError);
      socketClient.off('bot-message', handleBotMessage);
      socketClient.off('typing-start', handleTypingStart);
      socketClient.off('typing-end', handleTypingEnd);
      socketClient.disconnect();
    };
  }, [handleBotMessage, handleTypingStart, handleTypingEnd]);

  const sendMessage = useCallback((message: string) => {
    if (socket?.connected) {
      socket.emit('user-message', message);
    } else {
      console.error('Socket not connected');
      socket?.connect();
    }
  }, [socket]);

  const sendGeminiPrompt = useCallback((userInputs: UserInputs & { refinement?: string }) => {
    const promptData = {
      gender: userInputs.gender,
      relationship: userInputs.relationship,
      age: userInputs.age,
      budget: userInputs.budget,
      ...(userInputs.refinement && { refinement: userInputs.refinement })
    };

    if (socket?.connected) {
      setIsBotTyping(true);
      
      if (userInputs.refinement) {
        socket.emit('gemini-refinement', userInputs.refinement);
      } else {
        socket.emit('gemini-prompt', promptData);
      }
    } else {
      handleBotMessage('Connection lost. Reconnecting...');
      pendingPromptRef.current = promptData;
      socket?.connect();
    }
  }, [socket, setIsBotTyping, handleBotMessage]);

  return (
    <SocketContext.Provider value={{ socket, connected, sendMessage, sendGeminiPrompt }}>
      {children}
    </SocketContext.Provider>
  );
};