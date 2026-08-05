import { FaGoogle } from 'react-icons/fa';
import { signInWithGoogle } from '../services/firebase';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function GoogleSignInButton() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('');

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        const user = res.user as User;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.removeItem('access_token'); // Nest JWT not used for Firebase auth
        setUser(user);
        toast.success(t('Login.googleSuccess'));
        if (user.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast.error(res.error || t('Login.googleError'));
      }
    } catch (err) {
      console.error('Google sign-in error', err);
      toast.error(t('Login.googleError'));
    }
  };

  return (
    <button
      type='button'
      onClick={handleGoogleLogin}
      aria-label='Sign in with Google'
    >
      <FaGoogle
        color='#EA4335'
        size={35}
        className='duration-300 hover:scale-110 cursor-pointer'
      />
    </button>
  );
}
