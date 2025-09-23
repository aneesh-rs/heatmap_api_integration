import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FaTimes } from 'react-icons/fa';
import { FaFolder } from 'react-icons/fa';
import Button from './ui/CustomButton';
import { useMapModeStore } from '../store/useMapModeStore';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { useHeatmapStore } from '@/store/useHeatmapStore';
import { AudioType, DataPoint } from '@/types';

export type HeatmapPoint = [number, number, number];

const ImportDataModal = () => {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { mode: mapMode, setMode, activateHeatmap } = useMapModeStore();
  const [loading, setLoading] = useState(false);

  const { setData } = useHeatmapStore();

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const uploadedFiles = Array.from(e.dataTransfer.files);
      setFiles(uploadedFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFiles = Array.from(e.target.files);
      setFiles(uploadedFiles);
    }
  };

  const handleNext = () => {
    setLoading(true);
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<
        Record<string, string | number>
      >(worksheet, { defval: '' });

      const parsedData: (DataPoint | null)[] = jsonData.map((row) => {
        const lat = parseFloat(row['lat']?.toString().replace(',', '.') || '');
        const lon = parseFloat(row['lon']?.toString().replace(',', '.') || '');
        const frequency = parseFloat(
          row['frequency']?.toString().replace(',', '.') || ''
        );
        const date = row['date']?.toString() || '';
        const time = row['time']?.toString() || '';
        const audioType = row['audioType']?.toString() || '';

        if (!isNaN(lat) && !isNaN(lon) && !isNaN(frequency) && date && time) {
          // Combine DATE + TIME into a JS Date
          const timestamp = new Date(`${date}T${time}`).toISOString();
          return {
            lat,
            lon,
            frequency,
            date,
            time,
            timestamp,
            audioType: audioType as AudioType,
          };
        }
        return null;
      });

      const cleanData: DataPoint[] = parsedData.filter(
        (d): d is DataPoint => d !== null
      );
      console.log(cleanData);

      // Push parsed data into Zustand store
      setData(cleanData);
      activateHeatmap();

      console.log('Uploaded data stored in Zustand:', cleanData);
    };

    reader.readAsArrayBuffer(file);
    setLoading(false);
  };

  useEffect(() => {
    return () => setFiles([]);
  }, []);

  return (
    <AnimatePresence>
      {mapMode === 'import' && (
        <>
          {/* Modal container with sliding animation */}
          <motion.div
            className='fixed inset-y-0 right-0 z-50 flex items-center justify-center'
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <div
              className='bg-white rounded-l-3xl h-full w-sm max-w-[90vw] shadow-lg flex flex-col'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='px-6 py-4 flex flex-col gap-6 h-full overflow-y-auto'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h2 className='text-xl font-bold text-gray-800'>
                      {t('ImportData.title')}
                    </h2>
                    <p className='text-gray-500 mt-1'>
                      {t('ImportData.subtitle')}
                    </p>
                  </div>
                  <button
                    onClick={() => setMode('drag')}
                    className='text-gray-500 hover:text-gray-700 transition-colors'
                    aria-label='Close'
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <div
                  className={`border-2 border-dashed border-blue-400 h-full rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] ${
                    dragActive ? 'bg-blue-50' : 'bg-white'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FaFolder className='text-blue-500 text-5xl mb-4' />
                  <p className='text-gray-700 mb-4'>
                    {t('ImportData.dragAndDrop')}
                  </p>

                  {/* Horizontal line with circle */}
                  <div className='w-full relative flex items-center justify-center mb-4'>
                    <div className='border-t border-gray-300 w-full'></div>
                    <div className='absolute bg-white p-1'>
                      <div className='w-3 h-3 rounded-full border border-gray-300'></div>
                    </div>
                  </div>

                  {/* File input button */}
                  <label className='cursor-pointer'>
                    <input
                      type='file'
                      className='hidden'
                      onChange={handleFileChange}
                      multiple
                      accept='.xlsx'
                    />
                    <div className='border border-blue-500 text-blue-500 rounded-full px-4 py-2 hover:bg-blue-50 transition-colors'>
                      {t('ImportData.searchComputer')}
                    </div>
                  </label>
                  {files.length > 0 && (
                    <div className='mt-4 w-full'>
                      <h3 className='text-gray-700 font-semibold mb-2'>
                        {files.length > 1
                          ? t('ImportData.selectedFilesPlural')
                          : t('ImportData.selectedFiles')}
                        :
                      </h3>
                      <ul className='space-y-2 max-h-[150px] overflow-y-auto'>
                        {files.map((file, index) => (
                          <li
                            key={index}
                            className='flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-800'
                          >
                            <span className='truncate max-w-[80%]'>
                              {file.name}
                            </span>
                            <button
                              onClick={() => {
                                const updatedFiles = files.filter(
                                  (_, i) => i !== index
                                );
                                setFiles(updatedFiles);
                              }}
                              className='text-red-500 hover:text-red-700 transition-colors'
                              aria-label='Remove file'
                            >
                              <FaTimes />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <p className='text-gray-500 text-sm'>
                  {t('ImportData.onlyXlsxFiles')}
                </p>

                <div className='flex justify-between'>
                  <button
                    onClick={() => setMode('drag')}
                    className='bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-full transition-colors'
                  >
                    {t('ImportData.cancel')}
                  </button>
                  <Button
                    disabled={files.length === 0 || loading}
                    onClick={handleNext}
                    className='px-8'
                  >
                    {t('ImportData.next')}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ImportDataModal;
