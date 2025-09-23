import { LuMousePointer2 } from 'react-icons/lu';
import { GoGear } from 'react-icons/go';
import { AiOutlineDownload } from 'react-icons/ai';
import {
  IoArrowForwardCircleOutline,
  IoPieChartOutline,
} from 'react-icons/io5';
import { IMAGES } from '../assets/images/ImageConstants';
import { MapMode } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type SidebarProps = {
  selectedMode: string;
  handleModeChange: (mode: MapMode) => void;
  handleLogout: () => void;
};

const topButtons = [
  {
    mode: 'drag',
    Icon: LuMousePointer2,
  },
  {
    mode: 'settings',
    Icon: GoGear,
  },
];

const topButtonsAdmin = [
  {
    mode: 'drag',
    Icon: LuMousePointer2,
  },
  {
    mode: 'chart',
    Icon: IoPieChartOutline,
  },
  {
    mode: 'settings',
    Icon: GoGear,
  },
];

const bottomButtons = [
  {
    mode: 'logout',
    Icon: IoArrowForwardCircleOutline,
    action: 'logout' as const,
  },
];

const bottomButtonsAdmin = [
  {
    mode: 'import',
    Icon: AiOutlineDownload,
    action: 'mode' as const,
  },
  {
    mode: 'logout',
    Icon: IoArrowForwardCircleOutline,
    action: 'logout' as const,
  },
];

export default function Sidebar({
  selectedMode,
  handleModeChange,
  handleLogout,
}: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className='fixed top-0 left-0 h-full max-sm:hidden flex flex-col items-center gap-6 py-8 px-4 bg-white shadow-lg z-20 justify-between'>
      <div className='flex flex-col gap-4'>
        <img src={IMAGES.Logo} alt='Logo' className='w-10 h-10 mb-4' />
        {(user?.role === 'Admin' ? topButtonsAdmin : topButtons).map(
          ({ mode, Icon }) => (
            <button
              key={mode}
              className={`p-3 ${
                selectedMode === mode
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-blue-500 hover:text-white'
              } duration-300 rounded-md transition cursor-pointer `}
              onClick={
                mode === 'chart'
                  ? () => {
                      handleModeChange(mode as MapMode);
                      navigate('/dashboard');
                    }
                  : () => {
                      handleModeChange(mode as MapMode);
                      navigate('/');
                    }
              }
            >
              <Icon size={22} />
            </button>
          )
        )}
      </div>
      <div className='flex flex-col gap-4'>
        {(user?.role === 'Admin' ? bottomButtonsAdmin : bottomButtons).map(
          ({ mode, Icon, action }) => (
            <button
              key={mode}
              onClick={
                action === 'logout'
                  ? handleLogout
                  : () => {
                      handleModeChange(mode as MapMode);
                      navigate('/');
                    }
              }
              className={`p-3 ${
                selectedMode === mode && action !== 'logout'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-blue-500 hover:text-white'
              } hover:bg-blue-300 duration-300 rounded-md transition cursor-pointer`}
            >
              <Icon size={22} />
            </button>
          )
        )}
      </div>
    </div>
  );
}
