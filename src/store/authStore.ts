import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  role: string | null;
  userId: number | null;
  isAuthenticated: boolean;
  setAuth: (token: string, role: string, userId: number) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      userId: null,
      isAuthenticated: false,
      setAuth: (token, role, userId) =>
        set({ token, role, userId, isAuthenticated: true }),
      clearAuth: () =>
        set({
          token: null,
          role: null,
          userId: null,
          isAuthenticated: false,
        }),
    }),
    { name: 'auth-storage' }
  )
);
