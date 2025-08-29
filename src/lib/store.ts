import { create } from 'zustand';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  currentRole: UserRole | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setCurrentRole: (role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  currentRole: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setCurrentRole: (role) => set({ currentRole: role }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null, currentRole: null, isLoading: false }),
}));
