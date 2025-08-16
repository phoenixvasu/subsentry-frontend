import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
      },
      
      setUser: (user) => {
        set({ user });
      },
      
      login: (userData, token) => {
        set({
          user: userData,
          token,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);