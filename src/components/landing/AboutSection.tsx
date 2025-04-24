import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Heart, Gift, Zap, MapPin } from 'lucide-react';

const FeatureItem: React.FC<{
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
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="flex items-start mb-8"
    >
      <div className="mr-4 p-3 rounded-lg bg-primary-100 text-primary-600">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

const AboutSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Column - Image */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute -top-5 -left-5 w-full h-full rounded-2xl bg-primary-200 transform rotate-3"></div>
              <img 
                src="https://images.pexels.com/photos/5699514/pexels-photo-5699514.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" 
                alt="People exchanging gifts" 
                className="relative z-10 rounded-2xl shadow-lg w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Finding The Perfect Gift Made Easy
              </h2>
              <p className="text-lg text-gray-600">
                Our AI-powered assistant helps you find thoughtful, personalized gifts for your loved ones in just a few simple steps. No more stress or endless browsing - get tailored recommendations in seconds.
              </p>
            </motion.div>

            <div>
              <FeatureItem
                icon={<Heart size={24} />}
                title="Personalized Recommendations"
                description="Get unique gift ideas based on relationship, age, gender, and budget that truly reflect your connection."
                delay={0.1}
              />
              <FeatureItem
                icon={<Zap size={24} />}
                title="Real-Time Conversations"
                description="Our chatbot provides instant responses and suggestions through a natural, intuitive conversation."
                delay={0.2}
              />
              <FeatureItem
                icon={<MapPin size={24} />}
                title="India-Focused"
                description="All recommendations are specially curated for the Indian market, ensuring availability and cultural relevance."
                delay={0.3}
              />
              <FeatureItem
                icon={<Gift size={24} />}
                title="Smart Gift Selection"
                description="Our AI analyzes thousands of potential gifts to find options that match your specific requirements."
                delay={0.4}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;