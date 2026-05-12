import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Roles } from '../types';
import LoaderScreen from '../pages/LoaderScreen';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: Roles[] }) => {
  const { user, authReady } = useAuth();

  // Wait for auth to complete before showing anything
  if (!authReady) return <LoaderScreen />;

  if (!user) return <Navigate to='/login' />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to='/unauthorized' />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
