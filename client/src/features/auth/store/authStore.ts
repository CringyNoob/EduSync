import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types/auth.types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  activeRole: UserRole | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRole: (role: UserRole | null) => void;
  setAuthenticated: (isAuth: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      activeRole: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ accessToken: token }),
      setRole: (role) => set({ activeRole: role }),
      setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
      
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          activeRole: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'edusync-auth-storage',
      partialize: (state) => ({
        user: state.user,
        activeRole: state.activeRole,
      }),
    }
  )
);
