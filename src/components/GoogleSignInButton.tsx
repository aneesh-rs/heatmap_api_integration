import { FaGoogle } from 'react-icons/fa';
import { signInWithGoogle } from '../services/firebase';
import { googleLogin } from '../services/auth';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function GoogleSignInButton() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t } = useTranslation('');

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await signInWithGoogle();
      if (!res.success || !res.user) {
        toast.error(res.error || t('Login.googleError'));
        return;
      }

      // Exchange Google ID token for Nest JWT so /api/reports etc. work
      if (!res.googleIdToken) {
        toast.error(t('Login.googleError'));
        return;
      }

      const invitationId = params.get('invitationId');
      const nest = await googleLogin(res.googleIdToken, invitationId);
      if (!nest.success || !nest.data) {
        toast.error(nest.error || t('Login.googleError'));
        return;
      }

      const fb = res.user as Partial<User>;
      const user: User = {
        id: nest.data.user.id,
        email: nest.data.user.email,
        role: nest.data.user.role,
        birthday: fb.birthday ?? '',
        firstSurname: fb.firstSurname ?? '',
        secondSurname: fb.secondSurname ?? '',
        name: fb.name ?? '',
      };

      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success(t('Login.googleSuccess'));
      navigate(user.role === 'Admin' ? '/admin' : '/');
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
