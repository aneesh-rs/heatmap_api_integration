import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/firebase';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import { useMapModeStore } from '../store/useMapModeStore';
import { Outlet, useNavigate } from 'react-router-dom';
import { useModalStore } from '../store/useModalStore';
import { MapMode } from '../types';
import Navbar from '@/components/Navbar';

export default function Layout() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mode: selectedMode, setMode: setSelectedMode } = useMapModeStore();
  const { setCreateReportModalOpen, setFabOpen } = useModalStore();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/login');
      toast.success(t('Home.logoutSuccess'));
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error(t('Home.logoutError'));
    }
  };
  const handleModeChange = (mode: MapMode) => {
    if (mode != 'drag') {
      setFabOpen(false);
      setCreateReportModalOpen(false);
    }
    setSelectedMode(mode);
  };
  return (
    <div className='relative w-screen h-screen overflow-hidden'>
      <Sidebar
        handleLogout={handleLogout}
        selectedMode={selectedMode}
        handleModeChange={handleModeChange}
      />
      <Navbar
        handleLogout={handleLogout}
        selectedMode={selectedMode}
        handleModeChange={handleModeChange}
      />
      <Outlet />
    </div>
  );
}
