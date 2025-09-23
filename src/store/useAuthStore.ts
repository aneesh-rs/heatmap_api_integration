import { create } from 'zustand';
import { User } from '../types'; // same User interface you already have
import { getCurrentUser, login, logout } from '../services/api';
// ↑ replace with your actual API calls

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;

  // actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
  fetchCurrentUser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (err) => set({ error: err }),

  fetchCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const user = await getCurrentUser(); // e.g. GET /me with cookie/token
      set({ user });
    } catch (err: any) {
      set({ user: null, error: err.message || 'Failed to fetch user' });
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const user = await login(email, password); // POST /login
      set({ user });
    } catch (err: any) {
      set({ error: err.message || 'Login failed' });
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await logout(); // POST /logout or remove token
      set({ user: null });
    } catch (err: any) {
      set({ error: err.message || 'Logout failed' });
    } finally {
      set({ loading: false });
    }
  },
}));
