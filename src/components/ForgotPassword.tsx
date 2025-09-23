// components/ForgotPasswordModal.tsx
import React, { useEffect, useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { firebaseAuth } from '../../firebaseConfig';
import { FirebaseError } from 'firebase/app';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { t } = useTranslation();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setMessage(t('Login.forgotPasswordMessage'));
      setEmail('');
    } catch (err) {
      setError((err as FirebaseError).message);
    }
  };
  const modalRef = React.useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setError('');
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className='fixed inset-0 bg-black/60 bg-opacity-50 z-40'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className='fixed inset-0 z-50 flex items-center justify-center p-4'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div
              className='bg-white rounded-4xl shadow-xl max-w-md w-full p-6 relative'
              ref={modalRef}
            >
              <button
                className='absolute top-3 right-3 p-3 text-2xl cursor-pointer text-gray-500 hover:text-gray-700'
                onClick={handleClose}
              >
                &times;
              </button>
              <h2 className='text-xl font-semibold mb-4 text-center'>
                {t('Login.resetPassword')}
              </h2>
              <form onSubmit={handleReset} className='space-y-4'>
                <input
                  type='email'
                  className='w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder={t('Login.enterYourEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type='submit'
                  className='w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition'
                >
                  {t('Login.sendResetLink')}
                </button>
              </form>
              {message && (
                <p className='text-green-600 text-sm mt-3'>{message}</p>
              )}
              {error && <p className='text-red-500 text-sm mt-3'>{error}</p>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
