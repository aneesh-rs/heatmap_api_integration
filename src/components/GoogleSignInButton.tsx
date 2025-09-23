import toast from 'react-hot-toast';
import { IMAGES } from '../assets/images/ImageConstants';
import { signInWithGoogle } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User } from '../types';

export default function GoogleSignInButton() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('');

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        toast.success(t('Login.googleSuccess'));
        setUser(res.user as User);
        if (res.user.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast.error(t('Login.googleError'));
      }
    } catch (err) {
      console.error('Google sign-in error', err);
      toast.error(t('Login.googleError'));
    }
  };
  return (
    <button
      className='cursor-pointer duration-300 hover:scale-110'
      onClick={handleGoogleLogin}
    >
      <img src={IMAGES.Google} alt='Google' />
    </button>
  );
}
