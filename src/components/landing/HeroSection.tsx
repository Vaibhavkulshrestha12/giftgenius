import React from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary-50 to-white">
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-60 h-60 bg-secondary-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-20 right-40 w-40 h-40 bg-accent-100 rounded-full opacity-30 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
        
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left lg:w-1/2"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Find the <span className="text-primary-500">Perfect Gift</span> with AI
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-lg mx-auto lg:mx-0">
              Struggling to find the perfect gift for your loved ones? Let our AI-powered assistant help you discover thoughtful, personalized gift ideas tailored for the Indian market.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/chat">
                <Button 
                  size="lg" 
                  variant="primary"
                  icon={<Gift className="w-5 h-5" />}
                >
                  Start Chatting
                </Button>
              </Link>
              <a href="#about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </a>
            </div>
          </motion.div>

          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8,
              delay: 0.2
            }}
            className="lg:w-1/2 flex justify-center"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut" 
                }}
                className="w-full h-full rounded-2xl bg-gradient-to-r from-primary-400 to-primary-600 shadow-3d flex items-center justify-center"
              >
                <Gift className="w-24 h-24 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ 
            repeat: Infinity, 
            duration: 2
          }}
        >
          <span className="text-sm text-gray-500 mb-2">Scroll to explore</span>
          <svg 
            className="w-6 h-6 text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;