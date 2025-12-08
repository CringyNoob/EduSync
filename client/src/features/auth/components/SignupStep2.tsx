import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Hash, Phone, Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Input from '@/components/ui/Input';
import { validateProfilePhoto } from '../utils/validators';

interface SignupStep2Props {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
}

const SignupStep2: React.FC<SignupStep2Props> = ({
  register,
  errors,
  setValue,
  watch,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const error = validateProfilePhoto(file);

      if (error) {
        setFileError(error);
        return;
      }

      setFileError(null);
      setValue('profilePhoto', file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removePhoto = () => {
    setPreview(null);
    setValue('profilePhoto', null);
    setFileError(null);
  };

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Personal Information
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tell us about yourself
        </p>
      </div>

      {/* Profile Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Profile Photo (Optional)
        </label>
        
        {!preview ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-purple-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isDragActive
                ? 'Drop your photo here'
                : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              JPEG, PNG, WebP (Max 5MB)
            </p>
          </div>
        ) : (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {fileError && (
          <p className="mt-2 text-sm text-red-500">{fileError}</p>
        )}
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('firstName')}
          label="First Name"
          type="text"
          placeholder="John"
          error={errors.firstName?.message}
          leftIcon={<User className="w-5 h-5" />}
          required
        />
        <Input
          {...register('lastName')}
          label="Last Name"
          type="text"
          placeholder="Doe"
          error={errors.lastName?.message}
          leftIcon={<User className="w-5 h-5" />}
          required
        />
      </div>

      {/* Student ID */}
      <Input
        {...register('studentId')}
        label="Student ID"
        type="text"
        placeholder="0112230609"
        error={errors.studentId?.message}
        helperText="Your 10-digit student ID number"
        leftIcon={<Hash className="w-5 h-5" />}
        maxLength={10}
        required
      />

      {/* Phone (Optional) */}
      <Input
        {...register('phone')}
        label="Phone Number (Optional)"
        type="tel"
        placeholder="01712345678"
        error={errors.phone?.message}
        helperText="For 2FA and account recovery"
        leftIcon={<Phone className="w-5 h-5" />}
      />
    </motion.div>
  );
};

export default SignupStep2;
