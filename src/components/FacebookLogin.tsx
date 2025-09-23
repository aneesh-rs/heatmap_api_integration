import { FaFacebook } from 'react-icons/fa';
import { signInWithFacebook } from '../services/firebase';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function FacebookLogin() {
  const { setUser } = useAuth();

  const navigate = useNavigate();
  const { t } = useTranslation('');

  const handleFacebookLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await signInWithFacebook();
      if (res.success && res.user) {
        toast.success(t('Login.facebookSuccess'));
        setUser(res.user as User);
        navigate('/');
      } else {
        toast.error(t('Login.facebookError'));
      }
    } catch (err) {
      console.error('Facebook sign-in error', err);
      toast.error(t('Login.facebookError'));
    }
  };
  return (
    <button onClick={handleFacebookLogin}>
      <FaFacebook
        color='#007AFF'
        size={35}
        className='duration-300 hover:scale-110 cursor-pointer'
      />
    </button>
  );
}
