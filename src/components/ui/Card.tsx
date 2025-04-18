import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hasShadow?: boolean;
  hasBorder?: boolean;
  isPadded?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hasShadow = true,
  hasBorder = false,
  isPadded = true,
}) => {
  const shadowClass = hasShadow ? 'shadow-card' : '';
  const borderClass = hasBorder ? 'border border-gray-200' : '';
  const paddingClass = isPadded ? 'p-6' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl ${shadowClass} ${borderClass} ${paddingClass} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;