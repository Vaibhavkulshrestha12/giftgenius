import React, { useState, useEffect, useCallback, useRef } from 'react';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import ChatHistory from './ChatHistory';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../ui/ThemeToggle';

const ChatContainer: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!sidebarRef.current?.contains(e.target as Node) && 
          !menuButtonRef.current?.contains(e.target as Node)) {
        closeSidebar();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSidebar();
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSidebarOpen, closeSidebar]);

  return (
    <div className="flex h-full overflow-hidden relative bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-10 md:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        ref={sidebarRef}
        className={`fixed md:relative w-[280px] h-full bg-white dark:bg-gray-800 z-20 shadow-xl transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transition-transform duration-300 ease-in-out`}
        initial={false}
      >
        <div className="flex items-center justify-between md:hidden p-2 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-medium text-gray-900 dark:text-white">Chat History</h2>
          <button 
            onClick={closeSidebar}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="h-full md:h-[calc(100%-49px)] overflow-hidden">
          <ChatHistory onClose={closeSidebar} />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <button
              ref={menuButtonRef}
              onClick={toggleSidebar}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2 md:hidden transition-colors"
              aria-label="Toggle chat history"
            >
              <Menu size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">GiftGenius</h1>
          </div>
          <ThemeToggle />
        </header>

        <ChatWindow />
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatContainer;