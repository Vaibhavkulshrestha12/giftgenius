import React from 'react';
import { MessageRole } from '../../types';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatBubbleProps {
  message: string;
  role: MessageRole;
  isLoading?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, role, isLoading }) => {
  const isUser = role === MessageRole.USER;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`my-2 flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`px-4 py-3 rounded-2xl max-w-[80%] break-words ${
          isUser
            ? 'bg-primary-500 text-white rounded-tr-none'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                a: ({ node, ...props }) => (
                  <a 
                    {...props} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`${isUser ? 'text-white underline' : 'text-primary-500 dark:text-primary-400'} hover:opacity-80`}
                  />
                ),
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                h2: ({ node, ...props }) => (
                  <h2 {...props} className="text-lg font-semibold mt-4 mb-2" />
                ),
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                p: ({ node, ...props }) => (
                  <p {...props} className="mb-2" />
                ),
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ul: ({ node, ...props }) => (
                  <ul {...props} className="list-disc ml-4 mb-2" />
                ),
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                li: ({ node, ...props }) => (
                  <li {...props} className="mb-1" />
                ),
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                strong: ({ node, ...props }) => (
                  <strong {...props} className="font-semibold" />
                )
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatBubble;