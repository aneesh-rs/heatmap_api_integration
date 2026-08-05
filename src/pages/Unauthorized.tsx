import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-6'>
      <div className='bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center'>
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>
          {t('UnauthorizedAccess.title')}
        </h1>
        <p className='text-gray-600 mb-8'>{t('UnauthorizedAccess.message')}</p>
        <button
          type='button'
          onClick={() => navigate('/')}
          className='w-full cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-full transition-colors'
        >
          {t('UnauthorizedAccess.returnToHome')}
        </button>
      </div>
    </div>
  );
}
