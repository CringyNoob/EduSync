import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import AuthLayout from '@/components/layouts/AuthLayout';
import Card from '@/components/ui/Card';
import AuthToggle from '@/features/auth/components/AuthToggle';
import LoginForm from '@/features/auth/components/LoginForm';
import SignupForm from '@/features/auth/components/SignupForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthLayout>
      <Card>
        <AuthToggle isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />
        
        <AnimatePresence mode="wait">
          {isLogin ? <LoginForm key="login" /> : <SignupForm key="signup" />}
        </AnimatePresence>
      </Card>
    </AuthLayout>
  );
};

export default AuthPage;
