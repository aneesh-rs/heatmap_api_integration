// AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '../types';
import { fetchUserProfile, isAuthenticated } from '../services/auth';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  authReady: boolean; // New: indicates auth check is complete
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false); // New: track auth confirmation

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      setLoading(true);
      setAuthReady(false);

      if (isAuthenticated()) {
        const res = await fetchUserProfile();
        if (res.success && res.data) {
          setUser(res.data);
          setAuthReady(true); // Auth confirmed
        } else {
          console.log('Profile fetch failed:', res.error);
          setUser(null);
          setAuthReady(true); // Auth check complete, but no user
          // Clear invalid token
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      } else {
        console.log('User is not authenticated');
        setUser(null);
        setAuthReady(true); // Auth check complete
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, setLoading, authReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
