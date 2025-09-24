import React, { useEffect, useState } from 'react';
import { IMAGES } from '../assets/images/ImageConstants';
import Button from './ui/CustomButton';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/auth';
import { User } from '../types';
import toast from 'react-hot-toast';
import AdvancedSettingsModal from './AdvancedSettingsModal';
import { useMapModeStore } from '../store/useMapModeStore';
import { useTranslation } from 'react-i18next';
import { IoMdClose } from 'react-icons/io';

const Settings = () => {
  const { user, setUser } = useAuth();
  const { mode: mapMode, setMode } = useMapModeStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<User>({
    id: user?.id || '',
    name: user?.name || '',
    firstSurname: user?.firstSurname || '',
    secondSurname: user?.secondSurname || '',
    birthday: user?.birthday || '',
    email: user?.email || '',
    role: user?.role || 'User',
    photoURL: user?.photoURL || '',
  });
  const [errors, setErrors] = useState<{ birthday?: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'birthday') {
      setErrors((prev) => ({ ...prev, birthday: '' }));
    }
  };

  const validateBirthday = (birthday: string): boolean => {
    if (!birthday) return true;

    const selectedDate = new Date(birthday);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      setErrors((prev) => ({
        ...prev,
        birthday: t('Settings.birthdayFutureError'),
      }));
      return false;
    }

    const minAgeDate = new Date();
    minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
    if (selectedDate > minAgeDate) {
      setErrors((prev) => ({
        ...prev,
        birthday: t('Settings.birthdayAgeError'),
      }));
      return false;
    }

    return true;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateBirthday(formData.birthday)) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: formData.email,
        name: formData.name,
        firstSurname: formData.firstSurname,
        secondSurname: formData.secondSurname,
        birthday: formData.birthday,
        photoURL: formData.photoURL || '',
        role: formData.role,
      };
      const res = await updateUserProfile(payload);
      if (res.success && res.data) {
        toast.success(t('Settings.userDataUpdatedSuccess'));
        setUser(res.data);
        setFormData(res.data);
        setSelectedFile(null);
      } else {
        toast.error(res.error ?? t('Settings.userDataUpdatedError'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('Settings.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mapMode !== 'settings') {
      setAdvancedSettingsOpen(false);
    }
  }, [mapMode]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <div
        className={`fixed inset-y-0 right-0 duration-300 z-50 flex justify-center items-center ${
          mapMode === 'settings' ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='h-screen bg-white rounded-s-3xl self-start overflow-y-scroll shadow-md max-w-md text-sm min-w-sm'>
          <div className='h-max'>
            <form
              onSubmit={handleSubmit}
              className='px-6 py-3 flex flex-col gap-4'
            >
              <div className='flex items-center justify-center gap-2'>
                <label className='px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors'>
                  {t('Settings.uploadPhoto')}
                  <input
                    type='file'
                    accept='image/*'
                    onChange={handleImageUpload}
                    className='hidden'
                  />
                </label>
                <div className='w-20 h-20 rounded-full overflow-hidden bg-blue-50 flex items-center justify-center'>
                  <img
                    src={
                      selectedFile
                        ? URL.createObjectURL(selectedFile)
                        : formData.photoURL
                        ? formData.photoURL
                        : IMAGES.Logo || '/assets/images/logo.png'
                    }
                    alt='Profile'
                    className='w-full h-full object-cover'
                  />
                </div>
                <button
                  className='cursor-pointer absolute right-7 top-7 text-gray-500 duration-300 hover:text-gray-700'
                  onClick={() => setMode('drag')}
                  type='button'
                >
                  <IoMdClose size={20} />
                </button>
              </div>
              <div className='flex flex-col gap-3'>
                <div className='flex flex-col gap-1'>
                  <label className='text-gray-700 font-medium'>
                    {t('Settings.name')}{' '}
                    <span className='text-gray-700 font-light'>
                      {t('Settings.nameRequired')}
                    </span>
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('Settings.namePlaceholder')}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-gray-700 font-medium'>
                    {t('Settings.firstSurname')}
                  </label>
                  <input
                    type='text'
                    name='firstSurname'
                    value={formData.firstSurname}
                    onChange={handleChange}
                    placeholder={t('Settings.firstSurnamePlaceholder')}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-gray-700 font-medium'>
                    {t('Settings.secondSurname')}
                  </label>
                  <input
                    type='text'
                    name='secondSurname'
                    value={formData.secondSurname}
                    onChange={handleChange}
                    placeholder={t('Settings.secondSurnamePlaceholder')}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-gray-700 font-medium'>
                    {t('Settings.birthday')}
                  </label>
                  <input
                    type='date'
                    name='birthday'
                    value={formData.birthday}
                    onChange={handleChange}
                    max={today}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.birthday && (
                    <p className='text-red-500 text-xs mt-1'>
                      {errors.birthday}
                    </p>
                  )}
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-gray-700 font-medium'>
                    {t('Settings.email')}{' '}
                    <span className='text-gray-700 font-light'>
                      {t('Settings.nameRequired')}
                    </span>
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('Settings.emailPlaceholder')}
                    className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <h3 className='text-gray-700 font-medium'>
                    {t('Settings.security')}
                  </h3>
                  <ul className='list-disc pl-5 text-gray-700'>
                    <li>{t('Settings.withPassword')}</li>
                    <li>
                      <a href='#' className='text-blue-500 hover:underline'>
                        {t('Settings.configure2FA')}
                      </a>
                    </li>
                  </ul>
                </div>
                {user?.role === 'Admin' && (
                  <>
                    <div className='flex flex-col gap-1'>
                      <label className='text-gray-700 font-medium'>
                        {t('Settings.accountRole')}
                      </label>
                      <p className='text-gray-500'>{t('Settings.userType')}</p>
                      <select
                        name='role'
                        value={formData.role}
                        onChange={handleChange}
                        className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none'
                      >
                        <option value='Admin'>Admin</option>
                        <option value='User'>User</option>
                      </select>
                    </div>
                    <div className='flex justify-end'>
                      <button
                        type='button'
                        onClick={() =>
                          setAdvancedSettingsOpen(!advancedSettingsOpen)
                        }
                        className='text-gray-400 cursor-pointer hover:text-gray-600'
                      >
                        {t('Settings.advancedSettings')}
                      </button>
                    </div>
                  </>
                )}
                <Button disabled={loading} type='submit' className='bg-primary'>
                  {loading ? t('Settings.saving') : t('Settings.saveChanges')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <AdvancedSettingsModal
        isOpen={advancedSettingsOpen}
        onClose={() => setAdvancedSettingsOpen(false)}
      />
    </>
  );
};

export default Settings;
