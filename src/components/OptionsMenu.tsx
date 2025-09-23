import { useEffect, useRef } from 'react';
import { FaPlus } from 'react-icons/fa';
import { HiOutlineMailOpen } from 'react-icons/hi';
import { TbInfoOctagon } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import { useCityStore } from '../store/useCityStore';

type Props = {
  fabOpen: boolean;
  setFabOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleCreateModalToggle: () => void;
};

export default function OptionsMenu({
  fabOpen,
  setFabOpen,
  handleCreateModalToggle,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedCity } = useCityStore();
  const { t } = useTranslation();

  const isTerrassa = selectedCity.value === 'terrassa';

  useEffect(() => {
    if (!fabOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setFabOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fabOpen, setFabOpen]);

  return (
    <div
      ref={containerRef}
      className='fixed sm:bottom-8 left-1/2 bottom-24 -translate-x-1/2 z-30 flex flex-col items-center'
    >
      {fabOpen && (
        <div className='mb-4 flex flex-col p-2 items-center animate-fade-in bg-white shadow-lg rounded-xl'>
          <button className='rounded-xl px-5 py-2 flex items-center font-medium justify-between w-full cursor-pointer gap-2 hover:bg-blue-50 transition'>
            <span>{t('OptionsMenu.sendEmail')}</span>
            <HiOutlineMailOpen size={20} className='text-blue-500' />
          </button>
          <button
            onClick={() => {
              if (isTerrassa) {
                handleCreateModalToggle();
              }
            }}
            disabled={!isTerrassa}
            className={`rounded-xl px-5 py-2 flex items-center font-medium justify-between w-full gap-2 transition 
              ${
                !isTerrassa
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-blue-50'
              }
            `}
          >
            <span>{t('OptionsMenu.createReport')}</span>
            <TbInfoOctagon size={20} className='text-blue-500' />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        disabled={!isTerrassa}
        onClick={() => {
          if (isTerrassa) setFabOpen((fab) => !fab);
        }}
        className={`rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition text-3xl focus:outline-none 
          ${
            !isTerrassa
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer focus:ring-4 focus:ring-blue-300'
          }
        `}
      >
        <FaPlus size={20} />
      </button>
    </div>
  );
}
