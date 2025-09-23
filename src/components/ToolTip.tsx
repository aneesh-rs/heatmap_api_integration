import { FaThermometerHalf } from 'react-icons/fa';
import { GiSettingsKnobs } from 'react-icons/gi';
import { useMapModeStore } from '../store/useMapModeStore';
import { useCityStore } from '../store/useCityStore';

type ToolTipProps = {
  zoomIn: () => void;
  zoomOut: () => void;
};

export default function ToolTip({ zoomIn, zoomOut }: ToolTipProps) {
  const { selectedCity } = useCityStore();
  const {
    mode: selectedMode,
    setMode,
    heatmapActive,
    setHeatmapActive,
  } = useMapModeStore();

  const isTerrassa = selectedCity?.value === 'terrassa';

  return (
    <div
      className={`fixed top-2 left-2 sm:top-auto sm:left-auto sm:bottom-8 sm:right-8 z-30 flex items-center gap-4 ${
        selectedMode !== 'drag' && selectedMode !== 'chart'
          ? '-translate-x-96'
          : 'translate-x-0'
      } duration-300 ease-in-out flex sm:row flex-row-reverse`}
    >
      {/* Filter Button */}
      <button
        disabled={!isTerrassa}
        onClick={() => isTerrassa && setMode('filter')}
        className={`shadow-lg h-max rounded-lg px-4 py-6 transition cursor-pointer 
          ${
            !isTerrassa
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : selectedMode === 'filter'
              ? 'bg-blue-500 text-white hover:bg-blue-500'
              : 'bg-white hover:bg-blue-500 hover:text-white'
          }`}
      >
        <GiSettingsKnobs size={25} />
      </button>

      {/* Filter District Button */}
      <button
        onClick={() => setHeatmapActive(!heatmapActive)}
        className={`shadow-lg h-max rounded-lg px-4 py-6 transition cursor-pointer 
          ${
            heatmapActive
              ? 'bg-blue-500 text-white hover:bg-blue-500'
              : 'bg-white hover:bg-blue-500 hover:text-white'
          }`}
      >
        <FaThermometerHalf size={25} />
      </button>

      {/* Zoom Controls */}
      <button className='bg-white shadow-lg rounded-lg hover:bg-blue-50 transition text-xl overflow-hidden flex flex-col items-center'>
        <span
          className='text-neutral-800 text-lg flex py-1 items-center justify-center cursor-pointer px-3 duration-500 hover:bg-blue-500 hover:text-white'
          onClick={zoomIn}
        >
          +
        </span>
        <hr className='w-full border-t border-gray-300' />
        <span
          className='text-neutral-800 text-lg flex py-1 items-center justify-center cursor-pointer px-3 w-full duration-500 hover:bg-blue-500 hover:text-white'
          onClick={zoomOut}
        >
          -
        </span>
      </button>
    </div>
  );
}
