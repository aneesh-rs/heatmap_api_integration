import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IMAGES } from '../assets/images/ImageConstants';
import { PiEnvelope } from 'react-icons/pi';
import { MdOutlineLock } from 'react-icons/md';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { login, fetchUserProfile } from '../services/auth';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import ForgotPasswordModal from '../components/ForgotPassword';

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const { t, i18n } = useTranslation('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { user, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const navigate = useNavigate();

  const handleNavigator = () => {
    navigate('/signup');
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    const res = await login(data.email, data.password);
    if (res.success && res.data) {
      // Fetch profile after storing token
      const prof = await fetchUserProfile();
      if (prof.success && prof.data) {
        toast.success(t('Login.successToast'));
        setUser(prof.data);
        if (prof.data.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast.error(prof.error || t('Login.errorToast'));
      }
    } else {
      if (res.error === 'EMAIL_NOT_VERIFIED') {
        toast.error(t('Login.emailNotVerified'));
      } else {
        console.error('Login Error:', res.error);
        toast.error(res.error || t('Login.errorToast'));
      }
    }
    setLoading(false);
  };
  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

  if (user) {
    return <Navigate to={user.role === 'Admin' ? '/admin' : '/'} />;
  }

  return (
    <div className='relative overflow-hidden w-screen h-screen bg-gray-100'>
      <div className='absolute top-10 right-4 sm:right-20 z-30'>
        <LanguageSwitcher changeLanguage={changeLanguage} />
      </div>
      <img
        src={IMAGES.LoginAsset1}
        alt=''
        className='absolute w-[70%] top-0 right-0 z-0 max-sm:hidden'
      />
      <img
        src={IMAGES.LoginAsset2}
        alt=''
        className='absolute w-1/2 right-[29%] bottom-0 z-0 max-sm:hidden'
      />
      <img
        src={IMAGES.LoginAsset3}
        alt=''
        className='absolute bottom-0 -right-10 z-0 max-sm:hidden'
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='relative flex w-11/12 sm:w-1/4 flex-col items-start justify-start py-10 gap-2 text-black text-base mx-4 sm:ml-20 z-20'
      >
        <img src={IMAGES.Logo} alt='Logo' className='w-1/5' />
        <h1 className='my-3 text-2xl'>{t('Login.loginTitle')}</h1>
        <p>{t('Login.noAccount')}</p>
        <p
          className='text-blue-500 cursor-pointer hover:underline'
          onClick={handleNavigator}
        >
          {t('Login.registerHere')}
        </p>

        <div className='w-full flex flex-col gap-5 my-5'>
          <div className='w-full flex flex-col gap-1'>
            <label htmlFor='email' className='text-gray-500'>
              {t('Login.emailLabel')}
            </label>
            <div className='w-full flex items-center gap-2 border-b border-slate-500'>
              <PiEnvelope />
              <input
                id='email'
                type='email'
                placeholder={t('Login.emailPlaceholder')}
                className='w-full border-none rounded-md p-2 outline-none bg-transparent'
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email format',
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className='text-red-500 text-sm'>{errors.email.message}</p>
            )}
          </div>

          <div className='w-full flex flex-col gap-1'>
            <label htmlFor='password' className='text-gray-500'>
              {t('Login.passwordLabel')}
            </label>
            <div className='w-full flex items-center gap-2 border-b border-slate-500'>
              <MdOutlineLock />
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder={t('Login.passwordPlaceholder')}
                className='w-full border-none rounded-md p-2 outline-none bg-transparent'
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <span
                className='cursor-pointer'
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <IoMdEye size={20} color='gray' />
                ) : (
                  <IoMdEyeOff size={20} color='gray' />
                )}
              </span>
            </div>
            {errors.password && (
              <p className='text-red-500 text-sm'>{errors.password.message}</p>
            )}
          </div>

          <div className='flex w-full justify-between items-center'>
            <div className='flex items-center gap-2'>
              <input type='checkbox' id='remember' className='mr-2' />
              <label htmlFor='remember' className='text-gray-500'>
                {t('Login.rememberMe')}
              </label>
            </div>
            <button
              type='button'
              className='text-blue-500 cursor-pointer hover:underline text-sm'
              onClick={() => setShowForgotPassword(true)}
            >
              {t('Login.forgotPassword')}
            </button>
          </div>

          {/* Login Button */}
          <button
            type='submit'
            className='w-full disabled:bg-blue-600/80 cursor-pointer py-3 shadow-2xl rounded-full bg-blue-500 text-white hover:bg-blue-600 transition'
            disabled={loading}
          >
            {loading ? (
              <div className='flex justify-center items-center'>
                <Loader />
              </div>
            ) : (
              t('Login.loginButton')
            )}
          </button>
          {/* Social logins temporarily disabled during API migration */}
        </div>
      </form>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
}
