import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FaLock, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type UnauthorizedAccessProps = {
  isOpen: boolean;
  onClose?: () => void;
  redirectPath?: string;
};

const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({
  isOpen,
  onClose,
  redirectPath = '/',
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleReturn = () => {
    if (onClose) onClose();
    navigate(redirectPath);
  };

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
              {onClose && (
                <button
                  onClick={onClose}
                  className='absolute right-4 top-4 text-gray-500 hover:text-gray-700'
                  aria-label='Close'
                >
                  <FaTimes size={20} />
                </button>
              )}

              <div className='flex justify-center mb-6'>
                <div className='w-20 h-20 bg-red-500 rounded-full flex items-center justify-center'>
                  <FaLock className='text-white text-3xl' />
                </div>
              </div>

              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                {t('UnauthorizedAccess.title')}
              </h2>

              <p className='text-gray-600 mb-8'>
                {t('UnauthorizedAccess.message')}
              </p>

              <button
                onClick={handleReturn}
                className='w-full cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-full transition-colors'
              >
                {t('UnauthorizedAccess.returnToHome')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UnauthorizedAccess;
