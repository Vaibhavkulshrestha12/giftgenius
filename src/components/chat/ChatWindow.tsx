import React, { useRef, useEffect } from 'react';
import ChatBubble from '../ui/ChatBubble';
import { useChat } from '../../context/ChatContext';

const ChatWindow: React.FC = () => {
  const { messages, isBotTyping } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message.content}
            role={message.role}
          />
        ))}
        
        {isBotTyping && (
          <ChatBubble
            message=""
            role="bot"
            isLoading={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;