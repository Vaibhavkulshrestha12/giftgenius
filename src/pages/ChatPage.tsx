import React from 'react';
import ChatContainer from '../components/chat/ChatContainer';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gift } from 'lucide-react';

const ChatPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="p-1.5 rounded-full hover:bg-gray-100">
              <ArrowLeft size={20} />
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-500 rounded-lg">
                <Gift size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:block">GiftGenius</span>
            </Link>
          </div>
          <div>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatContainer />
      </main>
    </div>
  );
};

export default ChatPage;