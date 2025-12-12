import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FaTimes } from 'react-icons/fa';
import { FaFolder } from 'react-icons/fa';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Button from './ui/CustomButton';
import { useMapModeStore } from '../store/useMapModeStore';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { useHeatmapStore } from '@/store/useHeatmapStore';
import { AudioType, DataPoint } from '@/types';
import axiosClient from '../apiClient';
import axios from 'axios';

export type HeatmapPoint = [number, number, number];

type ImportSource = 'manual' | 'ftp' | 'sentilo';

interface FTPFormData {
  host: string;
  port: string;
  username: string;
  password: string;
  remoteFilePath: string;
}

interface SentiloFormData {
  baseUrl: string;
  identityKey: string;
  providerId: string;
  sensorId: string;
}

const ImportDataModal = () => {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { mode: mapMode, setMode, activateHeatmap } = useMapModeStore();
  const [loading, setLoading] = useState(false);

  // New import source states
  const [importSource, setImportSource] = useState<ImportSource>('manual');
  const [ftpFormData, setFtpFormData] = useState<FTPFormData>({
    host: '',
    port: '21',
    username: '',
    password: '',
    remoteFilePath: '',
  });
  const [sentiloFormData, setSentiloFormData] = useState<SentiloFormData>({
    baseUrl: '',
    identityKey: '',
    providerId: '',
    sensorId: '',
  });
  const [importLoading, setImportLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    if (files.length === 0) {
      setLoading(false);
      return;
    }

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

      // Push parsed data into Zustand store
      setData(cleanData);
      activateHeatmap();

      setLoading(false);
    };

    reader.onerror = () => {
      setLoading(false);
      setErrorMessage('Failed to read the selected file.');
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    return () => setFiles([]);
  }, []);

  // Reset messages when source changes
  useEffect(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, [importSource]);

  const handleFtpInputChange = (field: keyof FTPFormData, value: string) => {
    setFtpFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage(null);
  };

  const handleSentiloInputChange = (
    field: keyof SentiloFormData,
    value: string
  ) => {
    setSentiloFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage(null);
  };

  const validateFtpForm = (): boolean => {
    const { host, port, username, password, remoteFilePath } = ftpFormData;
    if (!host || !port || !username || !password || !remoteFilePath) {
      setErrorMessage('Please fill in all FTP/SFTP fields');
      return false;
    }
    return true;
  };

  const validateSentiloForm = (): boolean => {
    const { baseUrl, identityKey, providerId, sensorId } = sentiloFormData;
    if (!baseUrl || !identityKey || !providerId || !sensorId) {
      setErrorMessage('Please fill in all Sentilo API fields');
      return false;
    }
    return true;
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate form based on source
    const isValid =
      importSource === 'ftp' ? validateFtpForm() : validateSentiloForm();

    if (!isValid) return;

    setImportLoading(true);

    try {
      const endpoint =
        importSource === 'ftp' ? '/import/ftp' : '/import/sentilo';
      const payload =
        importSource === 'ftp'
          ? {
              host: ftpFormData.host,
              port: parseInt(ftpFormData.port),
              username: ftpFormData.username,
              password: ftpFormData.password,
              remoteFilePath: ftpFormData.remoteFilePath,
            }
          : {
              baseUrl: sentiloFormData.baseUrl,
              identityKey: sentiloFormData.identityKey,
              providerId: sentiloFormData.providerId,
              sensorId: sentiloFormData.sensorId,
            };

      const response = await axiosClient.post(endpoint, payload);

      setSuccessMessage(
        `Data imported successfully from ${
          importSource === 'ftp' ? 'FTP/SFTP' : 'Sentilo API'
        }`
      );

      // If response contains data, update the heatmap store
      if (response.data?.data) {
        setData(response.data.data);
        activateHeatmap();
      }

      // Reset form after successful import
      setTimeout(() => {
        if (importSource === 'ftp') {
          setFtpFormData({
            host: '',
            port: '21',
            username: '',
            password: '',
            remoteFilePath: '',
          });
        } else {
          setSentiloFormData({
            baseUrl: '',
            identityKey: '',
            providerId: '',
            sensorId: '',
          });
        }
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      let errorMsg = `Failed to import data from ${
        importSource === 'ftp' ? 'FTP/SFTP' : 'Sentilo API'
      }`;

      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.message || error.message || errorMsg;
      } else if (error instanceof Error) {
        errorMsg = error.message || errorMsg;
      }

      setErrorMessage(errorMsg);
    } finally {
      setImportLoading(false);
    }
  };

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

                {/* <div
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

                  <div className='w-full relative flex items-center justify-center mb-4'>
                    <div className='border-t border-gray-300 w-full'></div>
                    <div className='absolute bg-white p-1'>
                      <div className='w-3 h-3 rounded-full border border-gray-300'></div>
                    </div>
                  </div>

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
                </div> */}

                {/* New Import Source Selection UI */}
                <div className='mt-6 space-y-6'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                      Import Data Source
                    </h3>
                    <div className='flex gap-4 mb-6'>
                      <button
                        type='button'
                        onClick={() => setImportSource('manual')}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                          importSource === 'manual'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Manual Upload
                      </button>
                      <button
                        type='button'
                        onClick={() => setImportSource('ftp')}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                          importSource === 'ftp'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        FTP/SFTP
                      </button>
                      <button
                        type='button'
                        onClick={() => setImportSource('sentilo')}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                          importSource === 'sentilo'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Sentilo API
                      </button>
                    </div>
                  </div>

                  {importSource === 'manual' ? (
                    <div className='space-y-4'>
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

                        <div className='w-full relative flex items-center justify-center mb-4'>
                          <div className='border-t border-gray-300 w-full'></div>
                          <div className='absolute bg-white p-1'>
                            <div className='w-3 h-3 rounded-full border border-gray-300'></div>
                          </div>
                        </div>

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

                      {errorMessage && (
                        <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700'>
                          <FaExclamationTriangle />
                          <span className='text-sm'>{errorMessage}</span>
                        </div>
                      )}

                      <div className='flex justify-between'>
                        <button
                          onClick={() => setMode('drag')}
                          className='bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-full transition-colors'
                          disabled={loading}
                        >
                          {t('ImportData.cancel')}
                        </button>
                        <Button
                          disabled={files.length === 0 || loading}
                          onClick={handleNext}
                          className='px-8'
                        >
                          {loading ? 'Parsing...' : t('ImportData.next')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleImportSubmit} className='space-y-4'>
                      {importSource === 'ftp' ? (
                        <>
                          <div>
                            <label
                              htmlFor='ftp-host'
                              className='block text-sm font-medium text-gray-700 mb-1'
                            >
                              Host *
                            </label>
                            <input
                              id='ftp-host'
                              type='text'
                              value={ftpFormData.host}
                              onChange={(e) =>
                                handleFtpInputChange('host', e.target.value)
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='ftp.example.com'
                              required
                            />
                          </div>

                          <div>
                            <label
                              htmlFor='ftp-port'
                              className='block text-sm font-medium text-gray-700 mb-1'
                            >
                              Port *
                            </label>
                            <input
                              id='ftp-port'
                              type='number'
                              value={ftpFormData.port}
                              onChange={(e) =>
                                handleFtpInputChange('port', e.target.value)
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='21'
                              required
                            />
                          </div>

                          <div>
                            <label
                              htmlFor='ftp-username'
                              className='block text-sm font-medium text-gray-700 mb-1'
                            >
                              Username *
                            </label>
                            <input
                              id='ftp-username'
                              type='text'
                              value={ftpFormData.username}
                              onChange={(e) =>
                                handleFtpInputChange('username', e.target.value)
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='username'
                              required
                            />
                          </div>

                          <div>
                            <label
                              htmlFor='ftp-password'
                              className='block text-sm font-medium text-gray-700 mb-1'
                            >
                              Password *
                            </label>
                            <input
                              id='ftp-password'
                              type='password'
                              value={ftpFormData.password}
                              onChange={(e) =>
                                handleFtpInputChange('password', e.target.value)
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='password'
                              required
                            />
                          </div>

                          <div>
                            <label
                              htmlFor='ftp-path'
                              className='block text-sm font-medium text-gray-700 mb-1'
                            >
                              Remote File Path *
                            </label>
                            <input
                              id='ftp-path'
                              type='text'
                              value={ftpFormData.remoteFilePath}
                              onChange={(e) =>
                                handleFtpInputChange(
                                  'remoteFilePath',
                                  e.target.value
                                )
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='/path/to/file.xlsx'
                              required
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label
                              htmlFor='sentilo-baseUrl'
                              className='block text-sm font-medium text-gray-700 mb-1'
                            >
                              Base URL *
                            </label>
                            <input
                              id='sentilo-baseUrl'
                              type='url'
                              value={sentiloFormData.baseUrl}
                              onChange={(e) =>
                                handleSentiloInputChange(
                                  'baseUrl',
                                  e.target.value
                                )
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='https://api.sentilo.example.com'
                              required
                            />
                          </div>

                          <div>
                            <label
                              htmlFor='sentilo-identityKey'
                              className='block text-sm font-medium text-gray-700 mb-1'
                            >
                              Identity Key *
                            </label>
                            <input
                              id='sentilo-identityKey'
                              type='text'
                              value={sentiloFormData.identityKey}
                              onChange={(e) =>
                                handleSentiloInputChange(
                                  'identityKey',
                                  e.target.value
                                )
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='identity-key'
                              required
                            />
                          </div>

                          <div>
                            <label
                              htmlFor='sentilo-providerId'
                              className='block text-sm font-medium text-gray-700 mb-1'
                            >
                              Provider ID *
                            </label>
                            <input
                              id='sentilo-providerId'
                              type='text'
                              value={sentiloFormData.providerId}
                              onChange={(e) =>
                                handleSentiloInputChange(
                                  'providerId',
                                  e.target.value
                                )
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='provider-id'
                              required
                            />
                          </div>

                          <div>
                            <label
                              htmlFor='sentilo-sensorId'
                              className='block text-sm font-medium text-gray-700 mb-1'
                            >
                              Sensor ID *
                            </label>
                            <input
                              id='sentilo-sensorId'
                              type='text'
                              value={sentiloFormData.sensorId}
                              onChange={(e) =>
                                handleSentiloInputChange(
                                  'sensorId',
                                  e.target.value
                                )
                              }
                              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='sensor-id'
                              required
                            />
                          </div>
                        </>
                      )}

                      {/* Success Message */}
                      {successMessage && (
                        <div className='flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700'>
                          <FaCheckCircle />
                          <span className='text-sm'>{successMessage}</span>
                        </div>
                      )}

                      {/* Error Message */}
                      {errorMessage && (
                        <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700'>
                          <FaExclamationTriangle />
                          <span className='text-sm'>{errorMessage}</span>
                        </div>
                      )}

                      {/* Submit Button */}
                      <div className='flex justify-end gap-3 pt-4'>
                        <button
                          type='button'
                          onClick={() => setMode('drag')}
                          className='bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-full transition-colors'
                          disabled={importLoading}
                        >
                          Cancel
                        </button>
                        <Button
                          type='submit'
                          disabled={importLoading}
                          className='px-8'
                        >
                          {importLoading
                            ? 'Importing...'
                            : `Import from ${
                                importSource === 'ftp' ? 'FTP/SFTP' : 'Sentilo'
                              }`}
                        </Button>
                      </div>
                    </form>
                  )}
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
