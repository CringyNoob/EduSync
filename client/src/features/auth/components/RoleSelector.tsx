import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ShoppingBag, Shield, Crown } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { UserRole, RoleCard as RoleCardType } from '../types/auth.types';
import { useAuth } from '../hooks/useAuth';

interface RoleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const roleCards: RoleCardType[] = [
  {
    role: 'student',
    title: 'Student',
    description: 'Access courses, assignments, and academic resources',
    icon: 'user',
  },
  {
    role: 'vendor',
    title: 'Vendor',
    description: 'Manage your marketplace and sell products/services',
    icon: 'shopping-bag',
  },
  {
    role: 'moderator',
    title: 'Moderator',
    description: 'Monitor content and manage community guidelines',
    icon: 'shield',
  },
  {
    role: 'admin',
    title: 'Administrator',
    description: 'Full system access and user management',
    icon: 'crown',
  },
];

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    user: User,
    'shopping-bag': ShoppingBag,
    shield: Shield,
    crown: Crown,
  };
  const Icon = icons[iconName] || User;
  return <Icon className="w-12 h-12" />;
};

const RoleSelector: React.FC<RoleSelectorProps> = ({ isOpen, onClose }) => {
  const { user, switchRole, activeRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(activeRole);
  const [isLoading, setIsLoading] = useState(false);

  const availableRoles = user?.roles || [];

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    setIsLoading(true);
    
    try {
      await switchRole(role);
      onClose();
    } catch (error) {
      console.error('Failed to switch role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl"
            >
              <Card className="relative">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Switch Account
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Select a role to continue
                  </p>
                </div>

                {/* Role Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roleCards
                    .filter((roleCard) => availableRoles.includes(roleCard.role))
                    .map((roleCard) => {
                      const isSelected = selectedRole === roleCard.role;
                      const isCurrent = activeRole === roleCard.role;

                      return (
                        <motion.button
                          key={roleCard.role}
                          onClick={() => handleRoleSelect(roleCard.role)}
                          disabled={isLoading || isCurrent}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-300'
                          } ${
                            isCurrent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          {isCurrent && (
                            <span className="absolute top-3 right-3 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                              Current
                            </span>
                          )}

                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${
                              isSelected
                                ? 'bg-purple-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}>
                              {getIcon(roleCard.icon)}
                            </div>

                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                {roleCard.title}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {roleCard.description}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                </div>

                {/* Info */}
                {availableRoles.length <= 1 && (
                  <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                      You currently have access to one role only.
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RoleSelector;
