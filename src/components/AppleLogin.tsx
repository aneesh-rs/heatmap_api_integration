import { FaApple } from 'react-icons/fa';
import { signInWithApple } from '../services/firebase';

export default function AppleLogin() {
  const handleAppleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    const result = await signInWithApple();
    if (result.success) {
      console.log('Logged in with Apple:', result.user);
    } else {
      console.error('Apple login error:', result.error);
    }
  };
  return (
    <button
      onClick={handleAppleLogin}
      className='bg-neutral-800 rounded-full p-2 cursor-pointer duration-300 hover:scale-110'
    >
      <FaApple color='white' size={20} />
    </button>
  );
}
