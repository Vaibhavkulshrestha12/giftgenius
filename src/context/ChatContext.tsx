import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Message, MessageRole, Conversation, UserInputs } from '../types';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  userInputs: UserInputs;
  currentQuestion: string;
  isBotTyping: boolean;
  createNewConversation: () => void;
  addMessage: (content: string, role: MessageRole) => void;
  updateUserInputs: (inputs: Partial<UserInputs>) => void;
  setCurrentQuestion: (question: string) => void;
  setIsBotTyping: (isTyping: boolean) => void;
  setCurrentConversation: (id: string) => void;
}

const defaultContext: ChatContextType = {
  conversations: [],
  currentConversation: null,
  messages: [],
  userInputs: {},
  currentQuestion: '',
  isBotTyping: false,
  createNewConversation: () => {},
  addMessage: () => {},
  updateUserInputs: () => {},
  setCurrentQuestion: () => {},
  setIsBotTyping: () => {},
  setCurrentConversation: () => {}
};

const ChatContext = createContext<ChatContextType>(defaultContext);


export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversationState] = useState<Conversation | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      messages: [
        {
          id: Date.now().toString(),
          content: "Hi there! I'm GiftGenius, your AI gift recommendation assistant. I can help you find the perfect gift for your special someone in India. Let's get started! Is the gift recipient male, female, or other?",
          role: MessageRole.BOT,
          timestamp: new Date()
        }
      ],
      userInputs: {},
      createdAt: new Date()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationState(newConversation);
    setCurrentQuestion('gender');
    console.log('New conversation created with ID:', newConversation.id);
  }, []);

  
  React.useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    }
  }, [conversations.length, createNewConversation]);

  const addMessage = useCallback((content: string, role: MessageRole) => {
    if (!currentConversation) {
      console.error('Cannot add message: No current conversation');
      return;
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date()
    };

    console.log(`Adding ${role} message:`, content.substring(0, 50) + (content.length > 50 ? '...' : ''));

    setCurrentConversationState(prev => {
      if (!prev) return null;
      
      const updatedMessages = [...prev.messages, newMessage];
      const updatedConversation = { ...prev, messages: updatedMessages };
      
      setConversations(conversations => 
        conversations.map(c => c.id === prev.id ? updatedConversation : c)
      );
      
      return updatedConversation;
    });
  }, [currentConversation]);

  const updateUserInputs = useCallback((inputs: Partial<UserInputs>) => {
    if (!currentConversation) {
      console.error('Cannot update inputs: No current conversation');
      return;
    }
    
    console.log('Updating user inputs:', inputs);
    
    setCurrentConversationState(prev => {
      if (!prev) return null;
      
      const updatedInputs = { ...prev.userInputs, ...inputs };
      const updatedConversation = { ...prev, userInputs: updatedInputs };
      
      setConversations(conversations => 
        conversations.map(c => c.id === prev.id ? updatedConversation : c)
      );
      
      return updatedConversation;
    });
  }, [currentConversation]);

  const setCurrentConversation = useCallback((id: string) => {
    console.log('Setting current conversation to:', id);
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversationState(conversation);
      
      const inputs = conversation.userInputs || {};
      if (!inputs.gender) setCurrentQuestion('gender');
      else if (!inputs.relationship) setCurrentQuestion('relationship');
      else if (inputs.age === undefined) setCurrentQuestion('age');
      else if (inputs.budget === undefined) setCurrentQuestion('budget');
      else setCurrentQuestion('complete');
    } else {
      console.error('Conversation not found:', id);
    }
  }, [conversations]);

  const messages = currentConversation?.messages || [];
  const userInputs = currentConversation?.userInputs || {};

  const value = {
    conversations,
    currentConversation,
    messages,
    userInputs,
    currentQuestion,
    isBotTyping,
    createNewConversation,
    addMessage,
    updateUserInputs,
    setCurrentQuestion,
    setIsBotTyping,
    setCurrentConversation
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};