import { LuMousePointer2 } from 'react-icons/lu';
import { GoGear } from 'react-icons/go';
import { AiOutlineDownload } from 'react-icons/ai';
import {
  IoArrowForwardCircleOutline,
  IoPieChartOutline,
} from 'react-icons/io5';
import { MapMode } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type NavbarProps = {
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

export default function Navbar({
  selectedMode,
  handleModeChange,
  handleLogout,
}: NavbarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const topSet = user?.role === 'Admin' ? topButtonsAdmin : topButtons;
  const bottomSet = user?.role === 'Admin' ? bottomButtonsAdmin : bottomButtons;

  return (
    <div className='sm:hidden w-[calc(100%-1.5rem)] h-16 bottom-4 left-3 z-20 absolute bg-white shadow-lg rounded-xl flex items-center justify-between px-4'>
      {/* Top Buttons */}
      <div className='flex gap-4'>
        {topSet.map(({ mode, Icon }) => (
          <button
            key={mode}
            className={`p-3 ${
              selectedMode === mode
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-blue-500 hover:text-white'
            } duration-300 rounded-md transition cursor-pointer`}
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
        ))}
      </div>

      {/* Bottom Buttons */}
      <div className='flex gap-4'>
        {bottomSet.map(({ mode, Icon, action }) => (
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
            } duration-300 rounded-md transition cursor-pointer`}
          >
            <Icon size={22} />
          </button>
        ))}
      </div>
    </div>
  );
}
