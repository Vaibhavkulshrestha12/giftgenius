import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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

export const ChatContext = createContext<ChatContextType>(defaultContext);

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
  }, []);

  React.useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    }
  }, [conversations.length, createNewConversation]);

  const addMessage = useCallback((content: string, role: MessageRole) => {
    setCurrentConversationState(prev => {
      if (!prev) return null;
      
      const newMessage: Message = {
        id: Date.now().toString(),
        content,
        role,
        timestamp: new Date()
      };
      
      const updatedMessages = [...prev.messages, newMessage];
      const updatedConversation = { ...prev, messages: updatedMessages };
      
      setConversations(conversations => 
        conversations.map(c => c.id === prev.id ? updatedConversation : c)
      );
      
      return updatedConversation;
    });
  }, []);

  const updateUserInputs = useCallback((inputs: Partial<UserInputs>) => {
    setCurrentConversationState(prev => {
      if (!prev) return null;
      
      const updatedInputs = { ...prev.userInputs, ...inputs };
      const updatedConversation = { ...prev, userInputs: updatedInputs };
      
      setConversations(conversations => 
        conversations.map(c => c.id === prev.id ? updatedConversation : c)
      );
      
      return updatedConversation;
    });
  }, []);

  const setCurrentConversation = useCallback((id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversationState(conversation);
      
      const inputs = conversation.userInputs || {};
      if (!inputs.gender) setCurrentQuestion('gender');
      else if (!inputs.relationship) setCurrentQuestion('relationship');
      else if (inputs.age === undefined) setCurrentQuestion('age');
      else if (inputs.budget === undefined) setCurrentQuestion('budget');
      else setCurrentQuestion('complete');
    }
  }, [conversations]);

  const value = {
    conversations,
    currentConversation,
    messages: currentConversation?.messages || [],
    userInputs: currentConversation?.userInputs || {},
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