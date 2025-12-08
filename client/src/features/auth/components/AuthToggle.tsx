import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}

const AuthToggle: React.FC<AuthToggleProps> = ({ isLogin, onToggle }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="relative bg-slate-100 dark:bg-slate-800 p-1 rounded-full flex">
        <AnimatePresence mode="wait">
          <motion.div
            className="absolute top-1 bottom-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
            initial={false}
            animate={{
              left: isLogin ? '4px' : '50%',
              right: isLogin ? '50%' : '4px',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </AnimatePresence>
        
        <button
          type="button"
          onClick={() => isLogin || onToggle()}
          className={`relative z-10 px-8 py-2 rounded-full font-semibold transition-colors duration-300 ${
            isLogin
              ? 'text-white'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Login
        </button>
        
        <button
          type="button"
          onClick={() => !isLogin || onToggle()}
          className={`relative z-10 px-8 py-2 rounded-full font-semibold transition-colors duration-300 ${
            !isLogin
              ? 'text-white'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default AuthToggle;
