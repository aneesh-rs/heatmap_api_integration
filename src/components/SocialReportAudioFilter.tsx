import { useTranslation } from 'react-i18next';
import { FaMotorcycle, FaMusic, FaDog, FaUser, FaBicycle, FaCar, FaPlane, FaWind, FaTools, FaBell, FaTruck, FaTrain, FaShip, FaBolt, FaWater } from 'react-icons/fa';
import { GiGunshot, GiPartyPopper, GiPoliceBadge } from 'react-icons/gi';
import { HiViewGrid } from 'react-icons/hi';
import { LuBird } from 'react-icons/lu';
import useFilterDistrictStore from '../store/useFilterDistrictStore';

const audioTypes = [
    { icon: <FaPlane size={15} />, label: 'AudioTypes.plane' },
    { icon: <FaBicycle />, label: 'AudioTypes.bicycle' },
    { icon: <FaWind />, label: 'AudioTypes.wind' },
    { icon: <FaCar />, label: 'AudioTypes.car' },
    { icon: <FaBell />, label: 'AudioTypes.alarm' },
    { icon: <FaDog />, label: 'AudioTypes.pets' },
    { icon: <FaWater />, label: 'AudioTypes.rain' },
    { icon: <FaBell />, label: 'AudioTypes.bells' },
    { icon: <FaUser />, label: 'AudioTypes.humans' },
    { icon: <FaMusic />, label: 'AudioTypes.music' },
    { icon: <LuBird />, label: 'AudioTypes.bird' },
    { icon: <FaMotorcycle />, label: 'AudioTypes.motorcycle' },
    { icon: <FaTools />, label: 'AudioTypes.tools' },
    { icon: <GiPoliceBadge />, label: 'AudioTypes.sirens' },
    { icon: <FaTruck />, label: 'AudioTypes.truck' },
    { icon: <FaTrain />, label: 'AudioTypes.trains' },
    { icon: <FaShip />, label: 'AudioTypes.boat' },
    { icon: <FaBolt />, label: 'AudioTypes.thunderstorm' },
    { icon: <GiPartyPopper />, label: 'AudioTypes.fireworks' },
    { icon: <GiGunshot />, label: 'AudioTypes.gunshots' },
    { icon: <FaWater />, label: 'AudioTypes.water' },
  ];
const reportCounts = ['All', '1', '5', '10', '15', '20', '25', '30', '35'];


export default function SocialReportAudioFilter() {
  const { t } = useTranslation();
  const { 
    reportCount, 
    setReportCount, 
    selectedAudioTypes, 
    toggleAudioType 
  } = useFilterDistrictStore();

  return (
    <>
    <div className='mb-6'>
              <label className='block text-gray-500 mb-4'>
                {t('FilterDistrict.numberOfReports')}
              </label>
              <div className='grid grid-cols-5 gap-2'>
                {reportCounts.map((count) => (
                  <button
                    key={count}
                    className={`py-2 px-4 text-center rounded-full text-sm ${
                      reportCount === count
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setReportCount(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by audio type */}
            <div>
              <label className='block text-gray-500 mb-4'>
                {t('FilterDistrict.filterByAudioType')}
              </label>
              <div className='flex flex-wrap gap-3'>
                <button
                  className={`px-3 py-2 flex items-center gap-1 justify-center rounded-full ${
                    selectedAudioTypes.includes('All')
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => toggleAudioType('All')}
                >
                  <span className='flex items-center justify-center'>
                    <HiViewGrid />
                  </span>
                  <span className='text-xs'>{t('FilterDistrict.all')}</span>
                </button>
                {audioTypes.map((type) => (
                  <button
                    key={type.label}
                    className={`px-3 py-2 flex items-center gap-1 justify-center rounded-full ${
                      selectedAudioTypes.includes(t(type.label))
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => toggleAudioType(t(type.label))}
                  >
                    <span className='flex items-center justify-center'>
                      {type.icon}
                    </span>
                    <span className='text-xs'>{t(type.label)}</span>
                  </button>
                ))}
              </div>
            </div></>
  )
}
