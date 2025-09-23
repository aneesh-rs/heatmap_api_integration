import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Button from './ui/CustomButton';
import RichTextEditor from './ui/RichTextEditor';
import { Category, Feeling, ReportFormData } from '../types';
import { createReport } from '../services/firebase';
import toast from 'react-hot-toast';
import { categories, feelings } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import ThankYouModal from './ThankYouModal';
import { getPossibleLocations } from '../utils';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { FaTimes } from 'react-icons/fa';

type Props = {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  initialLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  onReportCreated?: () => void;
};

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const CreateReport = ({
  isOpen,
  setIsOpen,
  initialLocation,
  onReportCreated,
}: Props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { control, handleSubmit, setValue, watch, reset } =
    useForm<ReportFormData>({
      defaultValues: {
        feeling: 'happy',
        category: 'rubbish',
        reportText: '',
        firstName: '',
        lastName: '',
        location: initialLocation || { lat: 0, lng: 0, address: '' },
      },
    });

  const [locationInput, setLocationInput] = useState(
    initialLocation?.address || ''
  );
  const [isLocationFocused, setIsLocationFocused] = useState(false);

  const [debouncedLocation] = useDebounce(locationInput, 400); // 400ms debounce

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const [locationList, setLocationList] = useState<LocationSuggestion[]>([]);

  const selectedFeeling = watch('feeling');
  const selectedCategory = watch('category');

  // Update both form and input when initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setValue('location', initialLocation);
      setLocationInput(initialLocation.address);
      setLocationList([]); // Clear suggestions when marker is updated
    }
  }, [initialLocation, setValue]);

  const onSubmit = async (data: ReportFormData) => {
    if (!user?.id) {
      toast.error(t('CreateReport.userNotAuthenticated'));
      return;
    }

    setIsSubmitting(true);
    const res = await createReport(data, user.id);
    if (res.success) {
      toast.success(t('CreateReport.reportCreatedSuccess'));
      setIsOpen(false);
      setShowThankYou(true);
      reset({
        ...data,
        location: initialLocation,
      });
      onReportCreated?.();
    } else {
      toast.error(t('CreateReport.reportCreatedError'));
    }
    setValue('category', 'rubbish');
    setValue('feeling', 'happy');
    setValue('reportText', '');
    setValue('lastName', '');
    setValue('firstName', '');

    setIsSubmitting(false);
  };

  useEffect(() => {
    const fetchLocations = async () => {
      if (debouncedLocation.trim() === '') {
        setLocationList([]);
        return;
      }
      const list = await getPossibleLocations(debouncedLocation);
      setLocationList(list);
    };

    fetchLocations();
  }, [debouncedLocation]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='absolute top-4 z-40 h-screen right-10 flex justify-center items-center max-w-2xl'
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className='bg-white rounded-xl shadow-lg px-8 py-4 w-full self-start text-sm relative'>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='absolute top-3 right-3 text-gray-600 hover:text-gray-800'
                aria-label='Close'
              >
                <FaTimes size={18} />
              </button>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className='flex flex-col gap-3'
              >
                <h1 className='font-medium text-center'>
                  {t('CreateReport.title')}
                </h1>
                <div className='flex flex-col items-center justify-center gap-2'>
                  <h2 className='text-center'>
                    {t('CreateReport.feelingTitle')}
                  </h2>
                  <div className='flex justify-center gap-4'>
                    {feelings.map((feeling) => (
                      <button
                        key={feeling.id}
                        type='button'
                        className={`p-1 rounded-full cursor-pointer transition-colors ${selectedFeeling === feeling.id
                            ? 'text-blue-500'
                            : 'text-gray-700'
                          }`}
                        onClick={() =>
                          setValue('feeling', feeling.id as Feeling)
                        }
                        aria-label={`Feeling ${feeling.id}`}
                      >
                        {feeling.icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className=''>
                  <div className='flex gap-3'>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type='button'
                        className={`flex flex-1 flex-col items-center justify-start py-3 rounded-lg cursor-pointer transition-colors ${selectedCategory === category.id
                            ? 'bg-blue-100 text-blue-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        onClick={() =>
                          setValue('category', category.id as Category)
                        }
                      >
                        <div
                          className={`${selectedCategory === category.id
                              ? 'text-blue-500'
                              : 'text-gray-600'
                            }`}
                        >
                          {category.icon}
                        </div>
                        <span className='text-wrap font-light'>
                          {t(category.label)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <Controller
                  name='reportText'
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      reportText={field.value}
                      setReportText={field.onChange}
                    />
                  )}
                />

                <div className='flex flex-col gap-3'>
                  <div>
                    <label htmlFor='firstName' className='block mb-1'>
                      {t('CreateReport.firstName')}
                    </label>
                    <Controller
                      name='firstName'
                      control={control}
                      rules={{ required: t('CreateReport.firstNameRequired') }}
                      render={({ field, fieldState }) => (
                        <>
                          <input
                            {...field}
                            type='text'
                            id='firstName'
                            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldState.error ? 'border-red-500' : ''
                              }`}
                            placeholder={t('CreateReport.firstNamePlaceholder')}
                          />
                          {fieldState.error && (
                            <p className='text-red-500 text-xs mt-1'>
                              {fieldState.error.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <label htmlFor='lastName' className='block mb-1'>
                      {t('CreateReport.lastName')}
                    </label>
                    <Controller
                      name='lastName'
                      control={control}
                      rules={{ required: t('CreateReport.lastNameRequired') }}
                      render={({ field, fieldState }) => (
                        <>
                          <input
                            {...field}
                            type='text'
                            id='lastName'
                            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldState.error ? 'border-red-500' : ''
                              }`}
                            placeholder={t('CreateReport.lastNamePlaceholder')}
                          />
                          {fieldState.error && (
                            <p className='text-red-500 text-xs mt-1'>
                              {fieldState.error.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div className='relative'>
                    <label htmlFor='location' className='block mb-1'>
                      {t('CreateReport.location')}
                    </label>
                    <Controller
                      name='location'
                      control={control}
                      rules={{
                        validate: (value) =>
                          (value &&
                            value.address &&
                            value.address.trim() !== '') ||
                          t('CreateReport.locationRequired'),
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <input
                            value={locationInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setLocationInput(val);
                              // Only update the form's location address, keep existing lat/lng
                              setValue('location', {
                                ...(field.value || { lat: 0, lng: 0 }),
                                address: val,
                              });
                            }}
                            onFocus={() => setIsLocationFocused(true)}
                            onBlur={() => {
                              // Delay hiding the dropdown to allow for clicking suggestions
                              setTimeout(
                                () => setIsLocationFocused(false),
                                200
                              );
                            }}
                            type='text'
                            id='location'
                            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldState.error ? 'border-red-500' : ''
                              }`}
                            placeholder={t('CreateReport.locationPlaceholder')}
                          />

                          {locationList.length > 0 && isLocationFocused && (
                            <div className='absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                              {locationList.map((loc, index) => (
                                <div
                                  key={index}
                                  className='px-4 py-2 text-black hover:bg-blue-100 cursor-pointer text-sm'
                                  onClick={() => {
                                    const selected = {
                                      address: loc.display_name,
                                      lat: parseFloat(loc.lat),
                                      lng: parseFloat(loc.lon),
                                    };
                                    setLocationInput(loc.display_name);
                                    setValue('location', selected);
                                    setLocationList([]);
                                  }}
                                >
                                  {loc.display_name}
                                </div>
                              ))}
                            </div>
                          )}

                          {fieldState.error && (
                            <p className='text-red-500 text-xs mt-1'>
                              {fieldState.error.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>
                </div>

                <Button
                  variant='secondary'
                  type='submit'
                  disabled={isSubmitting}
                >
                  {t('CreateReport.submitReview')}
                </Button>

                <p className='text-center text-gray-700'>
                  {t('CreateReport.thankYouMessage')}
                </p>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ThankYouModal
        isOpen={showThankYou}
        onClose={() => setShowThankYou(false)}
        onKeepBrowsing={() => setShowThankYou(false)}
      />
    </>
  );
};

export default CreateReport;
