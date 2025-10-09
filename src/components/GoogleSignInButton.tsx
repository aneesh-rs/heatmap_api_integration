import { useAuth } from '@/context/AuthContext';
import { googleLogin } from '@/services/auth';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function GoogleSignInButton() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const handleGoogleLoginWithDefaultButton = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      if (!credentialResponse.credential) return;
      console.log(params);
      const invitationId = params.get('invitationId');
      const result = await googleLogin(
        credentialResponse.credential,
        invitationId
      );

      if (result.success && result.data) {
        localStorage.setItem('access_token', result.data.access_token);

        const user = result.data.user;
        setUser({ ...user, birthday: '', firstSurname: '', name: '' });
        toast.success('Login successful!');
        console.log('Google sign-in');
        if (user.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast.error(result.error || 'Google login failed');
      }
    } catch (err) {
      console.error('Google sign-in error', err);
    }
  };
  return (
    <>
      <GoogleLogin
        onSuccess={handleGoogleLoginWithDefaultButton}
        type='icon'
        theme='filled_blue'
        shape='circle'
        size='large'
      />
      {/* <button
        onClick={() => handleGoogleLogin()}
        className='hover:scale-115 duration-300 cursor-pointer'
      >
        <img src={IMAGES.Google} alt='' className='w-10 h-10' />
      </button> */}
    </>
  );
}
