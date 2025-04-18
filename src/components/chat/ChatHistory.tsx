import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { motion } from 'framer-motion';

interface ChatHistoryProps {
  onClose: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ onClose }) => {
  const { conversations, createNewConversation, setCurrentConversation, currentConversation } = useChat();

  const handleNewChat = () => {
    createNewConversation();
    onClose();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
    onClose();
  };

 
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <h2 className="text-xs uppercase text-gray-500 font-semibold px-2 py-1">
          Recent Conversations
        </h2>
        
        {conversations.length > 0 ? (
          <div className="space-y-1 mt-1">
            {conversations.map((convo) => (
              <motion.button
                key={convo.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSelectConversation(convo.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentConversation?.id === convo.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  <div className="truncate flex-1">
                    {convo.userInputs?.gender && convo.userInputs?.relationship
                      ? `Gift for ${convo.userInputs.gender.toLowerCase()} ${convo.userInputs.relationship.toLowerCase()}`
                      : 'New conversation'}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(convo.createdAt)}
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;