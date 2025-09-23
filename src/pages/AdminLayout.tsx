import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { logout } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useMapModeStore } from '../store/useMapModeStore';

const AdminLayout = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { mode: selectedMode, setMode: setSelectedMode } = useMapModeStore();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
    }
  };
  return (
    <div>
      {/* Optional: Admin Sidebar, Header, etc. */}
      <Sidebar
        handleLogout={handleLogout}
        selectedMode={selectedMode}
        handleModeChange={(mode) => setSelectedMode(mode)}
      />
      <Outlet /> {/* This renders nested routes */}
    </div>
  );
};

export default AdminLayout;
