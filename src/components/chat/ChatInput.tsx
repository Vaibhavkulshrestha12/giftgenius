import React, { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { MessageRole, Gender, Relationship } from '../../types';

interface OptionType {
  gender: string[];
  relationship: string[];
  [key: string]: string[];
}

const ChatInput: React.FC = () => {
  const [options, setOptions] = useState<OptionType | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [hasSubmittedFinal, setHasSubmittedFinal] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addMessage, userInputs, updateUserInputs, currentQuestion, setCurrentQuestion } = useChat();
  const { socket, connected, sendMessage, sendGeminiPrompt } = useSocket();

  const defaultOptions: OptionType = {
    gender: ['Male', 'Female', 'Other'],
    relationship: ['Friend', 'Partner', 'Parent', 'Sibling', 'Colleague', 'Other'],
  };

  useEffect(() => {
    if (!options) {
      setOptions(defaultOptions);
    }
    
    if (socket) {
      socket.emit('request-options');
      
      const handleOptions = (receivedOptions: OptionType) => {
        setOptions(receivedOptions);
      };
      
      socket.on('options', handleOptions);
      return () => {
        socket.off('options', handleOptions);
      };
    }
  }, [socket, options, defaultOptions]);

  useEffect(() => {
    if (currentQuestion === 'age' || currentQuestion === 'budget') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [currentQuestion]);

  const getNextQuestion = (currentQ: string, userInput: string): string => {
    switch (currentQ) {
      case 'gender': {
        updateUserInputs({ gender: userInput as Gender });
        return 'relationship';
      }
      case 'relationship': {
        updateUserInputs({ relationship: userInput as Relationship });
        return 'age';
      }
      case 'age': {
        const ageNum = parseInt(userInput, 10);
        if (isNaN(ageNum) || ageNum <= 0) {
          return 'age';
        }
        updateUserInputs({ age: ageNum });
        return 'budget';
      }
      case 'budget': {
        const budgetNum = parseInt(userInput, 10);
        if (isNaN(budgetNum) || budgetNum <= 0) {
          return 'budget';
        }
        updateUserInputs({ budget: budgetNum });
        return 'complete';
      }
      default:
        return '';
    }
  };

  const getBotResponse = (question: string, userInput: string): string => {
    switch (question) {
      case 'gender':
        return `Great! And what's your relationship with this ${userInput.toLowerCase()} person?`;
      case 'relationship':
        return `Perfect! Now, how old is your ${userInput.toLowerCase()}?`;
      case 'age': {
        const ageNum = parseInt(userInput, 10);
        if (isNaN(ageNum) || ageNum <= 0) {
          return "Please enter a valid age as a number greater than 0.";
        }
        return `Got it! And what's your budget in ₹ (INR)?`;
      }
      case 'budget': {
        const budgetNum = parseInt(userInput, 10);
        if (isNaN(budgetNum) || budgetNum <= 0) {
          return "Please enter a valid budget as a number greater than 0.";
        }
        return "Thanks for providing all the details! I'm generating some personalized gift ideas for you...";
      }
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      if (isRefining) {
        handleRefinementSubmit();
      } else {
        handleOptionSelect(inputValue.trim());
      }
    }
  };

  const handleRefinementSubmit = () => {
    if (!inputValue.trim()) return;
    
    addMessage(inputValue, MessageRole.USER);
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleOptionSelect = (option: string) => {
    // Add the user's selection as a message (visual only)
    addMessage(option, MessageRole.USER);
    
    const nextQuestion = getNextQuestion(currentQuestion, option);
    const botResponse = getBotResponse(currentQuestion, option);
    
    // Add the bot's response
    if (botResponse) {
      setTimeout(() => {
        addMessage(botResponse, MessageRole.BOT);
      }, 500);
    }
    
    if (nextQuestion === 'complete' && !hasSubmittedFinal) {
      const budgetNum = parseInt(option, 10);
      updateUserInputs({ budget: budgetNum });
      
      setHasSubmittedFinal(true);
      setIsRefining(true);
      
      // Now we send the complete data to Gemini
      setTimeout(() => {
        sendGeminiPrompt({
          gender: userInputs.gender,
          relationship: userInputs.relationship,
          age: userInputs.age,
          budget: budgetNum
        });
      }, 1000);
    } else {
      if (currentQuestion === 'age') {
        const ageNum = parseInt(option, 10);
        if (!isNaN(ageNum) && ageNum > 0) {
          updateUserInputs({ age: ageNum });
        }
      }
    }
    
    setCurrentQuestion(nextQuestion);
    setInputValue('');
  };

  const renderOptions = () => {
    if (!options) {
      return (
        <div className="text-center text-gray-500 py-2">
          Loading options...
        </div>
      );
    }

    if (isRefining) {
      return (
        <div className="flex gap-2">
          <input
            type="text"
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="Ask for more specific suggestions or refined ideas..."
            className="flex-1 p-2 border rounded-lg bg-white text-gray-900"
          />
          <Button onClick={handleRefinementSubmit} disabled={!inputValue.trim()}>
            Send
          </Button>
        </div>
      );
    }

    if (currentQuestion === 'complete') {
      return (
        <div className="text-center text-gray-500 py-2">
          Generating gift recommendations...
        </div>
      );
    }

    if (currentQuestion === 'age' || currentQuestion === 'budget') {
      return (
        <input
          ref={inputRef}
          type="number"
          placeholder={currentQuestion === 'age' ? "Enter age" : "Enter budget in ₹"}
          className="w-full p-2 border rounded bg-white text-gray-900"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
        />
      );
    }

    const currentOptions = options[currentQuestion] || [];
    
    if (currentOptions.length === 0) {
      return (
        <div className="text-center text-gray-500 py-2">
          No options available. Please refresh the page.
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 gap-2">
        {currentOptions.map((option: string) => (
          <Button
            key={option}
            onClick={() => handleOptionSelect(option)}
            variant="outline"
            className="w-full"
          >
            {option}
          </Button>
        ))}
      </div>
    );
  };

  if (!connected && currentQuestion !== 'complete') {
    return (
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="text-center text-orange-600 py-2">
          <p>Connecting to server... If this persists, please refresh the page.</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-2"
          >
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="space-y-4">
        {renderOptions()}
      </div>
    </div>
  );
};

export default ChatInput;