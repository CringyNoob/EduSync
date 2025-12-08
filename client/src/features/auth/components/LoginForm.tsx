import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Chrome, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { validateEmail } from '../utils/validators';

const loginSchema = z.object({
  email: z.string().email('Invalid email').refine(validateEmail, {
    message: 'Please use your university email (@uiu.ac.bd)',
  }),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome Back!
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Sign in to continue to EduSync
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Input */}
        <Input
          {...register('email')}
          label="University Email"
          type="email"
          placeholder="your.email@uiu.ac.bd"
          error={errors.email?.message}
          leftIcon={<Mail className="w-5 h-5" />}
          autoComplete="email"
        />

        {/* Password Input */}
        <Input
          {...register('password')}
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          leftIcon={<Lock className="w-5 h-5" />}
          autoComplete="current-password"
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register('rememberMe')}
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Remember me
            </span>
          </label>

          <Link
            to="/auth/forgot-password"
            className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          Sign In
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Auth Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="secondary"
            size="md"
            leftIcon={<Chrome className="w-5 h-5" />}
            onClick={() => {/* TODO: Google OAuth */}}
          >
            Google
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            leftIcon={<Zap className="w-5 h-5" />}
            onClick={() => {/* TODO: Magic Link */}}
          >
            Magic Link
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default LoginForm;
