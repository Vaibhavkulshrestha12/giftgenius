import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-primary-500 rounded-lg">
                <Gift size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold">GiftGenie</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Discover the perfect gift for your loved ones with our AI-powered recommendation system.
            </p>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} GiftGenie. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-primary-400 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#tech" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Technology
                </a>
              </li>
              <li>
                <Link to="/chat" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <a 
              href="https://github.com/Vaibhavkulshrestha12"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors mb-3"
            >
              <Github size={20} />
              <span>GitHub</span>
            </a>
            <p className="text-gray-400 mt-6 flex items-center gap-1">
              Made with <Heart size={16} className="text-primary-500" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;