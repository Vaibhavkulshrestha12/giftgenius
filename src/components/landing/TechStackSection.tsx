import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Server, Bot } from 'lucide-react';
import Card from '../ui/Card';
import { useInView } from 'react-intersection-observer';

const TechCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="h-full">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </Card>
    </motion.div>
  );
};

const TechStackSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="tech" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powered by Modern Technology
          </h2>
          <p className="text-lg text-gray-600">
            Our gift recommendation system combines cutting-edge technologies to deliver personalized suggestions in real-time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TechCard
            icon={<Cpu size={32} />}
            title="React Frontend"
            description="A beautiful, responsive user interface built with React and TailwindCSS for a seamless gifting experience."
            delay={0.1}
          />
          <TechCard
            icon={<Server size={32} />}
            title="Express Backend"
            description="Robust server-side processing with Express.js and WebSocket for real-time communication."
            delay={0.2}
          />
          <TechCard
            icon={<Bot size={32} />}
            title="AI Integration"
            description="Google Gemini AI powers our recommendations engine, providing personalized gift suggestions for any occasion."
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;