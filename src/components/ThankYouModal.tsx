import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from './ui/CustomButton';
import { FaTimes } from 'react-icons/fa';
import { IMAGES } from '../assets/images/ImageConstants';
import { useTranslation } from 'react-i18next';

type ThankYouModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onKeepBrowsing: () => void;
};

const ThankYouModal: React.FC<ThankYouModalProps> = ({
  isOpen,
  onClose,
  onKeepBrowsing,
}) => {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className='fixed inset-0 bg-black/60 z-40'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md'
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className='bg-white rounded-xl shadow-lg p-8 w-full text-center'>
              <button
                onClick={onClose}
                className='absolute top-4 right-4 text-gray-700 hover:text-gray-900'
                aria-label='Close'
              >
                <FaTimes size={20} />
              </button>

              <div className='flex justify-center mb-6'>
                <div className='relative'>
                  <img
                    src={IMAGES.StarSmile}
                    alt=''
                    className='w-4/5 mx-auto'
                  />
                </div>
              </div>

              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                {t('ThankYouModal.title')}
              </h2>

              <p className='text-gray-700 mb-8'>
                {t('ThankYouModal.message')}
              </p>

              <Button
                variant='secondary'
                onClick={onKeepBrowsing}
                className='w-full'
              >
                {t('ThankYouModal.keepBrowsing')}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ThankYouModal;
