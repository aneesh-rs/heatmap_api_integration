import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from './Home';

export default function Admin() {
  const { user } = useAuth();
  if (!user) return <Navigate to={'/login'} />;
  if (user?.role !== 'Admin') return <Navigate to={'/'} />;
  return <Home role='Admin' />;
}
