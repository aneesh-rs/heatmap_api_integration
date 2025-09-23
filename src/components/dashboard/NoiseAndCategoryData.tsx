import { useTranslation } from 'react-i18next';
// import { GoShield } from 'react-icons/go';
import { PiSliders } from 'react-icons/pi';
import {
  FaBicycle,
  FaCar,
  FaTruck,
  FaBus,
  FaCloudRain,
  FaTools,
  FaWind,
  FaMusic,
} from 'react-icons/fa';
import { GiSiren, GiBirdTwitter } from 'react-icons/gi';
import {
  MdAlarm,
  MdOutlineNotificationsActive,
  MdPeople,
  MdThunderstorm,
} from 'react-icons/md';
import { BiTrain } from 'react-icons/bi';
import Sparkline from '../ui/SparkLine';
import { useHeatmapStore } from '@/store/useHeatmapStore';
import { IoWater } from 'react-icons/io5';
import { AiOutlineBell } from 'react-icons/ai';
import { FaPlaneArrival } from 'react-icons/fa6';
import { HiMiniUserGroup } from 'react-icons/hi2';
import FilterSelect from '../FilterSelect';
import { useState } from 'react';
import { IconType } from 'react-icons/lib';

const categoriesDataLookup = [
  { id: 'bicycle', label: 'Bicicleta', icon: FaBicycle },
  { id: 'water', label: 'Water', icon: IoWater },
  { id: 'lluvia', label: 'Lluvia', icon: FaCloudRain },
  { id: 'pets', label: 'Pets', icon: GiBirdTwitter },
  { id: 'coche', label: 'Coche', icon: FaCar },
  { id: 'bicicleta', label: 'Bicicleta', icon: FaBicycle },
  { id: 'thunderstorm', label: 'Thunderstorm', icon: MdThunderstorm },
  { id: 'tools', label: 'Tools', icon: FaTools },
  { id: 'sirens', label: 'Sirens', icon: GiSiren },
  { id: 'fireworks', label: 'Fireworks', icon: MdAlarm },
  { id: 'camión', label: 'Camión', icon: FaTruck },
  { id: 'trains', label: 'Trains', icon: BiTrain },
  { id: 'boat', label: 'Boat', icon: FaBus },
  { id: 'all', label: 'All', icon: HiMiniUserGroup },
  { id: 'bird', label: 'Bird', icon: GiBirdTwitter },
  { id: 'humans', label: 'Humans', icon: MdPeople },
  { id: 'plane', label: 'Plane', icon: FaPlaneArrival },
  { id: 'wind', label: 'Wind', icon: FaWind },
  { id: 'motorcycle', label: 'Motorcycle', icon: FaBicycle },
  { id: 'bells', label: 'Bells', icon: AiOutlineBell },
  { id: 'gunshots', label: 'Gunshots', icon: GiSiren },
  { id: 'music', label: 'Music', icon: FaMusic },
  { id: 'alarma', label: 'Alarma', icon: MdAlarm },
  { id: 'horn', label: 'Claxon', icon: MdOutlineNotificationsActive },
  { id: 'train', label: 'Ferrocarril', icon: BiTrain },
  { id: 'siren', label: 'Sirena', icon: GiSiren },
  { id: 'car', label: 'Coche', icon: FaCar },
  { id: 'birds', label: 'Pájaros', icon: GiBirdTwitter },
  { id: 'truck', label: 'Camión', icon: FaTruck },
  { id: 'alarm', label: 'Alarma', icon: MdAlarm },
  { id: 'bus', label: 'Bus', icon: FaBus },
  { id: 'rain', label: 'Lluvia', icon: FaCloudRain },
];

const labelMap: Record<string, { label: string; icon: IconType }> = {};

categoriesDataLookup.forEach((c) => {
  labelMap[c.id.toLowerCase()] = { label: c.label, icon: c.icon };
});

export default function NoiseAndCategoryData() {
  const { t } = useTranslation();
  const { data: heatMapData } = useHeatmapStore();
  const [isOpen, setIsOpen] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);

  const totalEntries = heatMapData?.length || 0;

  const aggregatedData = heatMapData?.reduce((acc: any[], item: any) => {
    const id = item.audioType.toLowerCase();
    const existing = acc.find((x) => x.id === id);

    const mapped = labelMap[id] || { label: item.audioType, icon: FaBicycle };

    if (existing) {
      existing.count += 1;
    } else {
      acc.push({
        id,
        label: mapped.label,
        IconComponent: mapped.icon,
        count: 1,
      });
    }
    return acc;
  }, []);

  aggregatedData?.forEach((item) => {
    item.percent =
      totalEntries > 0 ? Math.round((item.count / totalEntries) * 100) : 0;
    item.value = `${item.percent}% (${item.count})`;
  });

  console.log('aggregatedData : ', aggregatedData);

  const sparklineDataMap: Record<
    string,
    { time: string; frequency: number }[]
  > = {};

  heatMapData?.map((item: any) => {
    const id = item.audioType.toLowerCase();
    const timestamp = `${item.date}T${item.time}`;
    if (!sparklineDataMap[id]) sparklineDataMap[id] = [];

    sparklineDataMap[id].push({
      time: timestamp,
      frequency: item.frequency,
    });
  });

  Object.values(sparklineDataMap).forEach((arr) => {
    arr.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  });

  const cleanedAggregatedData = aggregatedData?.filter(
    (cat) => cat.id !== 'all'
  );

  // Decide which categories to show
  const filteredData = selectedFilters.includes('all')
    ? cleanedAggregatedData
    : cleanedAggregatedData?.filter((cat) => selectedFilters.includes(cat.id));

  return (
    <div className='w-full flex flex-col p-5 gap-5'>
      <div className='w-full flex flex-col gap-4'>
        <div className='flex gap-4 items-center relative'>
          <h2 className='text-gray-400 font-bold text-2xl'>
            {t('Dashboard.popularCategories')}
          </h2>
          <button
            className='p-2 bg-gray-400 rounded-md'
            onClick={() => setIsOpen(!isOpen)}
          >
            <PiSliders size={25} color='white' />
          </button>
          <div className='absolute right-0 bottom-full mb-2 z-50 top-16 right-1'>
            {isOpen && (
              <FilterSelect
                categories={aggregatedData || []}
                setSelectedFilters={setSelectedFilters}
                selectedFilters={selectedFilters}
              />
            )}
          </div>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 '>
          {filteredData?.map((category: any, index: number) => {
            const IconComponent = category.IconComponent;
            const sparkData = sparklineDataMap[category.id] || [];
            return (
              <div
                key={index}
                className='bg-white aspect-square min-h-[100px] rounded-xl p-3  flex flex-col gap-2'
              >
                <div className='flex items-center w-max gap-2 bg-zinc-200 text-zinc-700 rounded-full px-2 py-1'>
                  <IconComponent size={15} />
                  <span className='text-xs'>{category.label}</span>
                </div>
                <div>
                  <span className='text-xl font-bold text-zinc-800'>
                    {category.value}
                  </span>
                </div>
                <div>
                  <Sparkline data={sparkData} category='frequency' />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
