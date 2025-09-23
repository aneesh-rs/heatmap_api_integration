import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Fixed the import from 'motion/react' to 'framer-motion'
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaRegSmile, FaRegMeh } from 'react-icons/fa';
import { ImConfused } from 'react-icons/im';
import { PiSmileyAngry, PiSmileySadBold } from 'react-icons/pi';
import { BiDizzy } from 'react-icons/bi';
import { LuSprayCan } from 'react-icons/lu';
import { FaTrash, FaExclamationCircle, FaCar } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import {
  AdminMarker,
  useAdminMarkersStore,
} from '../store/useAdminMarkersStore';
import { TbInfoOctagon, TbInfoOctagonFilled } from 'react-icons/tb';
import { IMAGES } from '../assets/images/ImageConstants';
import Button from './ui/CustomButton';
import toast from 'react-hot-toast';
import { ReportStatus } from '../types';
import { updateReportStatus } from '../services/reports';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  marker: AdminMarker;
  locationReports: AdminMarker[];
}

const colors = [
  { id: 1, hex: '#91E1F6', interval: 5 },
  { id: 2, hex: '#CEFE99', interval: 10 },
  { id: 3, hex: '#6AC700', interval: 15 },
  { id: 4, hex: '#FEFE00', interval: 20 },
  { id: 5, hex: '#FCCD01', interval: 25 },
  { id: 6, hex: '#FD8002', interval: 30 },
  { id: 7, hex: '#FF0103', interval: 35 },
  { id: 8, hex: '#FF00FE', interval: 40 },
  { id: 9, hex: '#4647FA', interval: 45 },
];

const cumulativeIndex = [0, 5, 10, 15, 20, 25, 30, 35, '≥40'];

const LocationDetailsModal = ({
  isOpen,
  onClose,
  marker,
  locationReports,
}: Props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sliderValue, setSliderValue] = useState(0);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  const { fetchMarkers } = useAdminMarkersStore();

  const [currentStatus, setCurrentStatus] = useState<ReportStatus>(
    marker?.reportStatus
  );

  const isAdmin = user?.role === 'Admin';

  const currentReport = locationReports[currentReportIndex];

  const handlePreviousReport = () => {
    if (currentReportIndex > 0) {
      setCurrentReportIndex((prev) => prev - 1);
    }
  };

  const handleNextReport = () => {
    if (currentReportIndex < locationReports.length - 1) {
      setCurrentReportIndex((prev) => prev + 1);
    }
  };

  const handleUpdateReportStatus = async () => {
    if (!currentReport) return;

    const res = await updateReportStatus(currentReport.id, currentStatus);
    if (res.success) {
      toast.success(t('LocationDetailsModal.reportStatusUpdatedSuccess'));
      onClose();
      fetchMarkers();
    } else {
      toast.error(t('LocationDetailsModal.reportStatusUpdatedError'));
    }
  };

  useEffect(() => {
    if (currentReport) {
      setCurrentStatus(currentReport.reportStatus);
    }
  }, [currentReportIndex, currentReport]);

  useEffect(() => {
    if (isOpen) {
      setCurrentReportIndex(0);
    }
  }, [isOpen]);

  const categories = [
    {
      id: 'traffic',
      icon: <FaCar size={16} />,
      label: t('Categories.traffic'),
    },
    {
      id: 'rubbish',
      icon: <FaTrash size={16} />,
      label: t('Categories.rubbish'),
    },
    {
      id: 'vandalism',
      icon: <LuSprayCan size={16} />,
      label: t('Categories.vandalism'),
    },
    {
      id: 'hazard',
      icon: <FaExclamationCircle size={16} />,
      label: t('Categories.hazard'),
    },
    {
      id: 'others',
      icon: <FaExclamationCircle size={16} />,
      label: t('Categories.others'),
    },
  ];

  const reactions = [
    { id: 'happy', icon: <FaRegSmile size={24} /> },
    { id: 'neutral', icon: <FaRegMeh size={24} /> },
    { id: 'confused', icon: <ImConfused size={24} /> },
    { id: 'sad', icon: <PiSmileySadBold size={28} /> },
    { id: 'angry', icon: <PiSmileyAngry size={28} /> },
    { id: 'surprised', icon: <BiDizzy size={28} /> },
  ];
  console.log(marker);

  if (!marker || !currentReport) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/10 bg-opacity-50'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className='bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto'
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='p-6 flex flex-col gap-4'>
              <div className='flex items-center gap-2'>
                <TbInfoOctagonFilled className='text-gray-800' size={25} />
                <h2 className='text-xl font-medium text-gray-800'>
                  {t('LocationDetailsModal.socialReports')}
                </h2>
              </div>

              <div className='w-full h-32 rounded-lg overflow-hidden'>
                <MapContainer
                  center={[marker.location.lat, marker.location.lng]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                  scrollWheelZoom={false}
                  dragging={false}
                  touchZoom={false}
                  doubleClickZoom={false}
                  boxZoom={false}
                  keyboard={false}
                  tapHold={false}
                >
                  <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                  <Marker
                    position={[marker.location.lat, marker.location.lng]}
                  />
                </MapContainer>
              </div>

              <div className='relative'>
                <input
                  type='text'
                  className='w-full p-3 pr-10 border border-gray-300 rounded-lg'
                  placeholder='Street Example, 123, 08130, Sta. Perpetua de Mogoda'
                  value={marker.location.address}
                  readOnly
                />
                <FaMapMarkerAlt
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-800'
                  size={18}
                />
              </div>

              <div className='flex flex-col gap-3'>
                <p className='text-gray-500'>
                  {t('LocationDetailsModal.numberOfIncidents')}
                </p>
                <div className='w-full flex flex-col items-center justify-center gap-2'>
                  <div className='h-2 w-full rounded-full flex items-center bg-gray-200 overflow-hidden'>
                    <div className='flex-1 h-full bg-[#91E1F6]' />
                    <div className='flex-1 h-full bg-[#CEFE99]' />
                    <div className='flex-1 h-full bg-[#6AC700]' />
                    <div className='flex-1 h-full bg-[#FEFE00]' />
                    <div className='flex-1 h-full bg-[#FCCD01]' />
                    <div className='flex-1 h-full bg-[#FD8002]' />
                    <div className='flex-1 h-full bg-[#FF0103]' />
                    <div className='flex-1 h-full bg-[#FF00FE]' />
                    <div className='flex-1 h-full bg-[#4647FA]' />
                  </div>
                  <div className='w-full rounded-full flex items-center overflow-hidden'>
                    {cumulativeIndex.map((value, index) => (
                      <span key={index} className='flex-1 text-sm'>
                        {value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className='mt-4 relative'>
                  <p
                    className='font-medium absolute -top-6 left-0'
                    style={{
                      color: colors.find((c) => c.interval >= sliderValue)?.hex,
                    }}
                  >
                    &lt;{sliderValue}
                  </p>
                  <input
                    type='range'
                    min='0'
                    max='45'
                    value={sliderValue}
                    onChange={(e) => setSliderValue(parseInt(e.target.value))}
                    className='w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                    style={{
                      accentColor: colors.find((c) => c.interval >= sliderValue)
                        ?.hex,
                    }}
                  />
                </div>
              </div>

              {locationReports.length > 1 && (
                <div className='flex flex-col items-start gap-2'>
                  <p className='text-gray-500'>
                    {t('LocationDetailsModal.reports')}{' '}
                    <span className='text-blue-400 text-xl'>
                      {locationReports.length}
                    </span>
                  </p>
                  <div className='flex gap-2 ml-2'>
                    {locationReports.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentReportIndex(index)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          currentReportIndex === index
                            ? 'bg-blue-100 text-blue-500'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className='flex items-center gap-2'>
                <p className='text-gray-800 font-medium'>
                  {t('LocationDetailsModal.source')}
                </p>
                <TbInfoOctagon className='text-blue-500' size={20} />
                <p className='text-gray-600'>
                  {marker.firstName} {marker.lastName}
                </p>
              </div>
              <div className='flex gap-4'>
                {reactions.map((reaction) => (
                  <div
                    key={reaction.id}
                    className={`transition-colors ${
                      reaction.id === currentReport.feeling
                        ? 'text-blue-500'
                        : 'text-gray-600'
                    }`}
                  >
                    {reaction.icon}
                  </div>
                ))}
              </div>

              <div className='overflow-x-auto'>
                <div className='flex gap-3 min-w-max'>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg min-w-[100px] ${
                        currentReport.category === category.id
                          ? 'bg-blue-100 text-blue-500'
                          : `bg-gray-200 text-zinc-700`
                      }`}
                    >
                      <div>{category.icon}</div>
                      <span className='text-xs mt-1'>{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className='text-gray-700 mb-2'>
                  {t('LocationDetailsModal.description')}
                </p>
                <div className='border border-gray-300 rounded-lg p-3'>
                  {currentReport.reportText}
                </div>
              </div>

              <div>
                <p className='text-gray-700 mb-2'>
                  {t('LocationDetailsModal.photosOptional')}
                </p>
                <div className='w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center'>
                  <p className='text-gray-400'>
                    {t('LocationDetailsModal.dropPhotosHere')}
                  </p>
                </div>
              </div>

              <div className='flex justify-center'>
                <div>
                  <img
                    src={IMAGES.CustomMarkerImg}
                    className='w-1/2'
                    alt='Marker'
                  />
                </div>

                <div className='flex items-center justify-center gap-2'>
                  {[
                    t('ReportStatus.new'),
                    t('ReportStatus.pending'),
                    t('ReportStatus.closed'),
                  ].map((status) => {
                    const isActive = status === currentStatus;
                    const bgColor = isActive ? 'bg-blue-500' : 'bg-gray-300';
                    const borderColor = isActive
                      ? 'border-blue-500'
                      : 'border-gray-300';
                    const textColor = isActive
                      ? 'text-blue-500'
                      : 'text-gray-400';

                    return (
                      <div
                        key={status}
                        className='flex items-center justify-center gap-2 cursor-pointer'
                        onClick={() =>
                          isAdmin && setCurrentStatus(status as ReportStatus)
                        }
                      >
                        <span
                          className={`flex items-center justify-center border-2 rounded-full p-1 ${borderColor}`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full ${bgColor}`}
                          ></span>
                        </span>
                        <span className={`font-bold ${textColor}`}>
                          {status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className='flex justify-between mt-2'>
                {isAdmin && (
                  <Button
                    disabled={currentStatus === currentReport.reportStatus}
                    onClick={handleUpdateReportStatus}
                    variant='secondary'
                  >
                    {t('LocationDetailsModal.save')}
                  </Button>
                )}
                {locationReports.length > 1 && (
                  <div className='flex gap-2 items-center'>
                    <Button
                      variant='secondary'
                      onClick={handlePreviousReport}
                      disabled={currentReportIndex === 0}
                    >
                      {t('LocationDetailsModal.previous')}
                    </Button>
                    <Button
                      variant='secondary'
                      onClick={handleNextReport}
                      disabled={
                        currentReportIndex === locationReports.length - 1
                      }
                    >
                      {t('LocationDetailsModal.next')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationDetailsModal;
