import React from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import TechStackSection from '../components/landing/TechStackSection';
import AboutSection from '../components/landing/AboutSection';
import Footer from '../components/landing/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TechStackSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default LandingPage;