import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/ui/Logo';
import { GraduationCap, Users, BookOpen, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Showcase (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            animate={{
              y: [0, 30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"
            animate={{
              y: [0, -40, 0],
              x: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md text-center"
          >
            <Logo size="xl" showText={false} className="justify-center mb-8" />
            <h1 className="text-5xl font-bold mb-4">EDUSYNC</h1>
            <p className="text-2xl font-semibold mb-8 text-purple-100">
              Connecting Campus, Empowering Students
            </p>

            {/* Feature Highlights */}
            <div className="space-y-4 mt-12">
              {[
                {
                  icon: GraduationCap,
                  title: 'Academic Excellence',
                  desc: 'Track courses, grades, and achievements',
                },
                {
                  icon: Users,
                  title: 'Campus Community',
                  desc: 'Connect with students and faculty',
                },
                {
                  icon: BookOpen,
                  title: 'Resource Hub',
                  desc: 'Access library and study materials',
                },
                {
                  icon: Sparkles,
                  title: 'Smart Features',
                  desc: 'AI-powered recommendations',
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4 text-left bg-white/10 backdrop-blur-sm rounded-lg p-4"
                >
                  <feature.icon className="w-8 h-8 flex-shrink-0 text-cyan-300" />
                  <div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-sm text-purple-100">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Logo size="lg" className="justify-center" />
          </div>
          
          {children}
          
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>
              © 2025 EduSync. All rights reserved.
            </p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">
                Privacy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">
                Terms
              </a>
              <span>•</span>
              <a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">
                Help
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
