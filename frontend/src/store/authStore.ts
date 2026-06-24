import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const cachedUser = localStorage.getItem('user');
  const initialUser = cachedUser ? JSON.parse(cachedUser) : null;

  return {
    token: null,
    user: initialUser,
    isAuthenticated: !!initialUser,
    login: (token, user) => {
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false });
    },
    setToken: (token) => {
      set({ token });
    }
  };
});
