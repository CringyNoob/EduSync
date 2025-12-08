import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { SignupData } from '../types/auth.types';
import { sessionManager } from '../utils/tokenManager';
import { useAuth } from '../hooks/useAuth';
import SignupStep1 from './SignupStep1';
import SignupStep2 from './SignupStep2';
import SignupStep3 from './SignupStep3';

const signupSchema = z.object({
  // Step 1
  email: z.string().email(),
  otp: z.string().length(6).optional(),
  password: z.string().min(8),
  passwordConfirm: z.string(),
  
  // Step 2
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  studentId: z.string().length(10),
  phone: z.string().optional(),
  profilePhoto: z.any().optional(),
  
  // Step 3
  department: z.string().min(1),
  batch: z.string().length(4),
  semester: z.string().min(1),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ['passwordConfirm'],
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(() => {
    // Load saved step from sessionStorage
    const saved = sessionManager.getFormData('currentStep');
    return saved?.step || 1;
  });
  const [emailVerified, setEmailVerified] = useState(() => {
    // Load saved email verification state
    const saved = sessionManager.getFormData('emailVerified');
    return saved?.verified || false;
  });
  const [verifiedEmail, setVerifiedEmail] = useState(() => {
    // Load the verified email
    const saved = sessionManager.getFormData('emailVerified');
    return saved?.email || '';
  });
  const totalSteps = 3;
  const { signup, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    shouldUnregister: false,
  });

  // Check if current email matches the verified email
  const currentEmail = watch('email') || '';
  const isCurrentEmailVerified = emailVerified && currentEmail.trim().toLowerCase() === verifiedEmail.toLowerCase();

  // Load saved form data
  React.useEffect(() => {
    const savedStep1 = sessionManager.getFormData('step1');
    const savedStep2 = sessionManager.getFormData('step2');
    const savedStep3 = sessionManager.getFormData('step3');

    if (savedStep1) {
      Object.keys(savedStep1).forEach((key) => {
        setValue(key as any, savedStep1[key]);
      });
    }
    if (savedStep2) {
      Object.keys(savedStep2).forEach((key) => {
        setValue(key as any, savedStep2[key]);
      });
    }
    if (savedStep3) {
      Object.keys(savedStep3).forEach((key) => {
        setValue(key as any, savedStep3[key]);
      });
    }
  }, [setValue]);

  // Persist current step
  React.useEffect(() => {
    sessionManager.saveFormData('currentStep', { step: currentStep });
  }, [currentStep]);

  // Persist email verified state
  React.useEffect(() => {
    sessionManager.saveFormData('emailVerified', { verified: emailVerified, email: verifiedEmail });
  }, [emailVerified, verifiedEmail]);

  // Keep the verified email in the form values so it's always submitted
  React.useEffect(() => {
    if (verifiedEmail) {
      setValue('email', verifiedEmail);
    }
  }, [verifiedEmail, setValue]);

  // Handler for when email is verified in Step 1
  const handleEmailVerified = (verified: boolean) => {
    setEmailVerified(verified);
    if (verified) {
      const email = watch('email') || '';
      setVerifiedEmail(email.trim().toLowerCase());
    } else {
      setVerifiedEmail('');
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    
    if (currentStep === 1) {
      // For Step 1, check if email is verified before allowing to proceed
      if (!isCurrentEmailVerified) {
        return; // Don't proceed if email not verified
      }
      fieldsToValidate = ['email', 'password', 'passwordConfirm'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['firstName', 'lastName', 'studentId'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['department', 'batch', 'year', 'semester'];
    }

    const isValid = await trigger(fieldsToValidate as any);
    
    if (!isValid) return;

    // Save current step data
    const formData = watch();
    sessionManager.saveFormData(`step${currentStep}`, formData);

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    // Merge all saved step data with current form data
    // This ensures fields from all steps are included even if not currently rendered
    const savedStep1 = sessionManager.getFormData('step1') || {};
    const savedStep2 = sessionManager.getFormData('step2') || {};
    const savedStep3 = sessionManager.getFormData('step3') || {};
    
    const mergedData = {
      ...savedStep1,
      ...savedStep2,
      ...savedStep3,
      ...data, // Current form data takes precedence
    };
    
    // Ensure email is included (use verified email if available)
    if (!mergedData.email && verifiedEmail) {
      mergedData.email = verifiedEmail;
    }
    
    console.log('Form submitted with merged data:', mergedData);
    
    try {
      console.log('Calling signup with data:', mergedData);
      // Call backend to register user
      await signup(mergedData as any);
      
      // Clear saved form data on success
      sessionManager.clearFormData();
      sessionManager.saveFormData('currentStep', { step: 1 });
      sessionManager.saveFormData('emailVerified', { verified: false, email: '' });
      
    } catch (error) {
      console.error('Signup error:', error);
      // Error is already handled by signup function with toast
    }
  };

  return (
    <motion.div
      key="signup"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Create Your Account
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Join the EduSync community today
        </p>
      </div>

      {/* Progress Bar */}
      <ProgressBar current={currentStep} total={totalSteps} className="mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hidden field to ensure email is always part of submitted data */}
        <input type="hidden" {...register('email')} />
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <SignupStep1
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              onEmailVerified={handleEmailVerified}
            />
          )}
          {currentStep === 2 && (
            <SignupStep2
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
            />
          )}
          {currentStep === 3 && (
            <SignupStep3
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-4">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={prevStep}
              leftIcon={<ArrowLeft className="w-5 h-5" />}
            >
              Back
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={nextStep}
              disabled={currentStep === 1 && !isCurrentEmailVerified}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<Check className="w-5 h-5" />}
            >
              Complete Registration
            </Button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default SignupForm;
