import React, { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import ChatHistory from './ChatHistory';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatContainer: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isSidebarOpen && !target.closest('.sidebar-content')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-full overflow-hidden relative">
      
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/40 z-10"
          />
        )}
      </AnimatePresence>

     
      <motion.div
        className={`absolute md:relative w-[280px] h-full z-20 shadow-xl transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transition-transform duration-300 ease-in-out sidebar-content`}
      >
        <div className="flex items-center justify-between md:hidden p-2 border-b border-gray-200 bg-white">
          <h2 className="font-medium">Chat History</h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="h-full md:h-[calc(100%-49px)] overflow-hidden">
          <ChatHistory onClose={() => setIsSidebarOpen(false)} />
        </div>
      </motion.div>

      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
       
        <header className="p-3 border-b border-gray-200 flex items-center bg-white">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-full hover:bg-gray-100 mr-2 md:hidden"
            aria-label="Open chat history"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">GiftGenius</h1>
        </header>

        
        <ChatWindow />

        
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatContainer;