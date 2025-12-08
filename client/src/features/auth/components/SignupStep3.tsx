import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Calendar } from 'lucide-react';
import Input from '@/components/ui/Input';
import { DEPARTMENTS } from '../types/auth.types';

interface SignupStep3Props {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
}

const SignupStep3: React.FC<SignupStep3Props> = ({
  register,
  errors,
  watch,
  setValue,
}) => {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Academic Information
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Complete your academic profile
        </p>
      </div>

      {/* Department */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Department <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            {...register('department')}
            className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg transition-all outline-none bg-white dark:bg-slate-800 dark:text-white ${
              errors.department
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                : 'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
            }`}
          >
            <option value="">Select your department</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
        {errors.department && (
          <p className="mt-2 text-sm text-red-500">{errors.department.message}</p>
        )}
      </div>

      {/* Batch & Semester */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Batch Year */}
        <Input
          {...register('batch')}
          label="Batch Year"
          type="text"
          placeholder="2023"
          error={errors.batch?.message}
          helperText="e.g., 2023"
          leftIcon={<Calendar className="w-5 h-5" />}
          maxLength={4}
          required
        />

        {/* Semester */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Semester <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              {...register('semester')}
              className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg transition-all outline-none bg-white dark:bg-slate-800 dark:text-white ${
                errors.semester
                  ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20'
              }`}
            >
              <option value="">Select semester</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
            </select>
          </div>
          {errors.semester && (
            <p className="mt-2 text-sm text-red-500">{errors.semester.message}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SignupStep3;
