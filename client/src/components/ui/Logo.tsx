import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'icon' | 'full';
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant = 'full',
}) => {
  const heightClasses: Record<string, string> = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
  };

  const src = variant === 'icon' || !showText
    ? '/(only logo).png'
    : '/edusyncnav(logo with name Edusync).png';

  return (
    <motion.div
      className={`flex items-center ${className}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <img src={src} alt="EduSync" className={`${heightClasses[size]} w-auto`} />
    </motion.div>
  );
};

export default Logo;
