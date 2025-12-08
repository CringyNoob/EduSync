import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Logo from './Logo';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Logo size="xl" showText={true} className="justify-center mb-6" />
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Loading...
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
