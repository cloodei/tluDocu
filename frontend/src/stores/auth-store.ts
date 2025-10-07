import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setToken: (token) => set({ token }),
        setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

        login: (user, token) => {
          set({
            user,
            token,
            isAuthenticated: true
          });
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false
          });
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);

const useUser = () => useAuthStore((state) => state.user);
const useAuthToken = () => useAuthStore((state) => state.token);
const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  setUser: state.setUser,
  setToken: state.setToken,
  setIsAuthenticated: state.setIsAuthenticated
}));

export { useUser, useAuthToken, useIsAuthenticated, useAuthActions };
