import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from './Home';
import LoaderScreen from './LoaderScreen';

export default function Admin() {
  const { user, authReady } = useAuth();
  
  // Wait for auth to complete before showing anything
  if (!authReady) return <LoaderScreen />;
  
  if (!user) return <Navigate to={'/login'} />;
  if (user?.role !== 'Admin') return <Navigate to={'/'} />;
  return <Home role='Admin' />;
}
