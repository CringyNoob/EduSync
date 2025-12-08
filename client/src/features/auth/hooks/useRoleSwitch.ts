import { useState, useCallback } from 'react';
import { UserRole } from '../types/auth.types';
import { useAuth } from './useAuth';

export const useRoleSwitch = () => {
  const { user, activeRole, switchRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const availableRoles = user?.roles || [];
  const canSwitch = availableRoles.length > 1;

  const handleRoleSwitch = useCallback(
    async (newRole: UserRole) => {
      if (!canSwitch) return;
      if (newRole === activeRole) return;

      setIsLoading(true);
      try {
        await switchRole(newRole);
      } catch (error) {
        console.error('Role switch failed:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [canSwitch, activeRole, switchRole]
  );

  return {
    availableRoles,
    activeRole,
    canSwitch,
    isLoading,
    switchRole: handleRoleSwitch,
  };
};
