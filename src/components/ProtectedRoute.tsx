import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Roles } from '../types';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: Roles[] }) => {
  const { user } = useAuth();

  console.log(user?.role, user?.role === 'Admin');
  if (!user) return <Navigate to='/login' />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to='/unauthorized' />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
