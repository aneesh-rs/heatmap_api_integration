import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/auth';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { IMAGES } from '../assets/images/ImageConstants';
import { MdOutlineLock } from 'react-icons/md';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import LanguageSwitcher from '../components/LanguageSwitcher';

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const { t, i18n } = useTranslation('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (!token) {
      toast.error(t('Login.invalidResetLink'));
      navigate('/login');
    }
  }, [token, navigate, t]);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error(t('Login.invalidResetLink'));
      return;
    }

    setLoading(true);

    const result = await resetPassword(token, data.newPassword);
    if (result.success) {
      toast.success(t('Login.resetPasswordSuccess'));
      navigate('/login');
    } else {
      toast.error(result.error || t('Login.resetPasswordError'));
    }

    setLoading(false);
  };

  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

  if (!token) {
    return null; // Will redirect to login
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
        <h1 className='my-3 text-2xl'>{t('Login.resetPassword')}</h1>
        <p className='text-gray-600 mb-4'>
          Enter your new password below. It must be at least 6 characters long.
        </p>

        <div className='w-full flex flex-col gap-5 my-5'>
          <div className='w-full flex flex-col gap-1'>
            <label htmlFor='newPassword' className='text-gray-500'>
              {t('Login.newPasswordLabel')}
            </label>
            <div className='w-full flex items-center gap-2 border-b border-slate-500'>
              <MdOutlineLock />
              <input
                id='newPassword'
                type={showPassword ? 'text' : 'password'}
                placeholder={t('Login.newPasswordPlaceholder')}
                className='w-full border-none rounded-md p-2 outline-none bg-transparent'
                {...register('newPassword', {
                  required: 'New password is required',
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
            {errors.newPassword && (
              <p className='text-red-500 text-sm'>
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className='w-full flex flex-col gap-1'>
            <label htmlFor='confirmPassword' className='text-gray-500'>
              {t('Login.confirmPasswordLabel')}
            </label>
            <div className='w-full flex items-center gap-2 border-b border-slate-500'>
              <MdOutlineLock />
              <input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('Login.confirmPasswordPlaceholder')}
                className='w-full border-none rounded-md p-2 outline-none bg-transparent'
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === newPassword || 'Passwords do not match',
                })}
              />
              <span
                className='cursor-pointer'
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <IoMdEye size={20} color='gray' />
                ) : (
                  <IoMdEyeOff size={20} color='gray' />
                )}
              </span>
            </div>
            {errors.confirmPassword && (
              <p className='text-red-500 text-sm'>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Reset Password Button */}
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
              t('Login.resetPasswordButton')
            )}
          </button>

          <div className='text-center'>
            <p className='text-gray-500'>
              {t('Login.rememberPassword')}{' '}
              <button
                type='button'
                className='text-blue-500 cursor-pointer hover:underline'
                onClick={() => navigate('/login')}
              >
                {t('Login.backToLogin')}
              </button>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
