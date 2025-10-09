import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IMAGES } from '../assets/images/ImageConstants';
import { PiEnvelope } from 'react-icons/pi';
import { MdOutlineLock } from 'react-icons/md';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { signUp } from '../services/auth';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import SocialLoginButtons from '@/components/SocialLoginButtons';
// Social logins removed during API migration

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUp() {
  const { t, i18n } = useTranslation('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

  const inviteId =
    new URLSearchParams(window.location.search).get('invitationId') || '';

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error(t('passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const response = await signUp(
        data.email,
        data.password,
        '',
        '',
        '',
        '',
        inviteId
      );

      if (response.success) {
        toast.success(t('signupVerificationToast')); // e.g., "Verification email sent! Please check your inbox."
        navigate('/login');
      } else {
        toast.error(response.error || t('errorToast'));
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || t('errorToast'));
      } else {
        toast.error(t('errorToast'));
      }
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className='my-3 text-2xl'>{t('signup')}</h1>
        <p>{t('If You have an Account')}</p>
        <p
          className='text-blue-500 cursor-pointer hover:underline'
          onClick={() => navigate('/login')}
        >
          {t('loginHere')}
        </p>

        <div className='w-full flex flex-col gap-5 my-5'>
          {/* Email Field */}
          <div className='w-full flex flex-col gap-1'>
            <label htmlFor='email' className='text-gray-500'>
              {t('emailLabel')}
            </label>
            <div className='w-full flex items-center gap-2 border-b border-slate-500'>
              <PiEnvelope />
              <input
                id='email'
                type='email'
                placeholder={t('emailPlaceholder')}
                className='w-full border-none rounded-md p-2 outline-none bg-transparent'
                {...register('email', {
                  required: t('emailRequired'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('SignUp.emailInvalid'),
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className='text-red-500 text-sm'>{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className='w-full flex flex-col gap-1'>
            <label htmlFor='password' className='text-gray-500'>
              {t('passwordLabel')}
            </label>
            <div className='w-full flex items-center gap-2 border-b border-slate-500'>
              <MdOutlineLock />
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                className='w-full border-none rounded-md p-2 outline-none bg-transparent'
                {...register('password', {
                  required: t('passwordRequired'),
                  minLength: {
                    value: 6,
                    message: t('passwordMinLength'),
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

          {/* Confirm Password Field */}
          <div className='w-full flex flex-col gap-1'>
            <label htmlFor='confirmPassword' className='text-gray-500'>
              {t('confirmPassword')}
            </label>
            <div className='w-full flex items-center gap-2 border-b border-slate-500'>
              <MdOutlineLock />
              <input
                id='confirmPassword'
                type={showPassword ? 'text' : 'password'}
                placeholder={t('confirmPasswordPlaceholder')}
                className='w-full border-none rounded-md p-2 outline-none bg-transparent'
                {...register('confirmPassword', {
                  required: t('confirmPasswordRequired'),
                  validate: (value) =>
                    value === watch('password') || t('SignUp.passwordMismatch'),
                })}
              />
            </div>
            {errors.confirmPassword && (
              <p className='text-red-500 text-sm'>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            className='w-full py-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition disabled:bg-blue-600/80'
            disabled={loading}
          >
            {loading ? <Loader /> : t('signupButton')}
          </button>
          <SocialLoginButtons />
        </div>
      </form>
    </div>
  );
}
