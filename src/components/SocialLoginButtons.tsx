import FacebookLogin from './FacebookLogin';
import GoogleSignInButton from './GoogleSignInButton';
import AppleLogin from './AppleLogin';

export default function SocialLoginButtons() {
  return (
    <div className='flex gap-10 w-full justify-center'>
      <GoogleSignInButton />
      <FacebookLogin />
      <AppleLogin />
    </div>
  );
}
