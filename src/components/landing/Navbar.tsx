import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileDropdown from '../ui/ProfileDropdown';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-500 rounded-lg">
                <Gift size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">GiftGenie</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-gray-700 hover:text-primary-500 transition-colors">
                About
              </a>
              <a href="#tech" className="text-gray-700 hover:text-primary-500 transition-colors">
                Technology
              </a>
              {currentUser ? (
                <>
                  <Link
                    to="/chat"
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Open Chat
                  </Link>
                  <ProfileDropdown />
                </>
              ) : (
                <Link
                  to="/signin"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              {currentUser && <ProfileDropdown />}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t mt-2"
            >
              <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
                <a
                  href="#about"
                  className="text-gray-700 hover:text-primary-500 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
                <a
                  href="#tech"
                  className="text-gray-700 hover:text-primary-500 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Technology
                </a>
                {currentUser ? (
                  <Link
                    to="/chat"
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Open Chat
                  </Link>
                ) : (
                  <Link
                    to="/signin"
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {/* Spacer for fixed navbar */}
      <div className={`${isScrolled ? 'h-16' : 'h-20'} transition-all duration-300`} />
    </>
  );
};

export default Navbar;