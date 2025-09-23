import { motion, AnimatePresence } from 'motion/react';
import { useRef, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { useMapModeStore } from '../store/useMapModeStore';
import { useStreetSearchStore } from '../store/useStreetSearchStore';

import 'react-datepicker/dist/react-datepicker.css';
import DatePickerInput from './DatePickerInput';
import { useTranslation } from 'react-i18next';
import useFilterDistrictStore from '../store/useFilterDistrictStore';
import SocialReportAudioFilter from './SocialReportAudioFilter';
import { useHeatmapStore } from '@/store/useHeatmapStore';

const districts = [
  {
    id: 1,
    name: 'Districts.district1',
  },
  {
    id: 2,
    name: 'Districts.district2',
  },
  {
    id: 3,
    name: 'Districts.district3',
  },
  {
    id: 4,
    name: 'Districts.district4',
  },
  {
    id: 5,
    name: 'Districts.district5',
  },
  {
    id: 6,
    name: 'Districts.district6',
  },
  { id: 7, name: 'Districts.district7' },
];

const colors = [
  { id: 1, hex: '#91E1F6', interval: 40 },
  { id: 2, hex: '#CEFE99', interval: 45 },
  { id: 3, hex: '#6AC700', interval: 50 },
  { id: 4, hex: '#FEFE00', interval: 55 },
  { id: 5, hex: '#FCCD01', interval: 60 },
  { id: 6, hex: '#FD8002', interval: 65 },
  { id: 7, hex: '#FF0103', interval: 70 },
  { id: 8, hex: '#FF00FE', interval: 75 },
  { id: 9, hex: '#4647FA', interval: 80 },
];

export default function Filters() {
  const { t } = useTranslation();
  const { filter, setFilter } = useHeatmapStore();
  const { mode: mapMode, setMode } = useMapModeStore();

  // Street search state and methods
  const {
    searchQuery,
    searchResults,
    selectedStreet,
    isSearching,
    showSuggestions,
    setSearchQuery,
    setSelectedStreet,
    setShowSuggestions,
    clearSearch,
    searchStreets,
  } = useStreetSearchStore();

  const {
    interestZone,
    setInterestZone,
    selectedDistricts,
    toggleDistrict,
    setSelectedDistricts,
  } = useFilterDistrictStore();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchStreets(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchStreets]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowSuggestions]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: unknown) => {
    type StreetResult = NonNullable<Parameters<typeof setSelectedStreet>[0]>;
    const s = suggestion as StreetResult;
    setSelectedStreet(s);
    setSearchQuery(s?.display_name || '');
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    clearSearch();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const clearAllFilters = () => {
    setFilter({ mode: 'all', decibelsRange: { min: 0, max: 80 } });
    setInterestZone('Districts');
    setSelectedDistricts([]);
    setSearchQuery('');
  };

  return (
    <AnimatePresence>
      {mapMode === 'filter' && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className='fixed inset-y-0 right-0 z-50 flex items-start justify-center max-w-sm bg-white'
        >
          <div className='w-full max-w-md bg-white p-6 rounded-lg shadow-sm overflow-y-scroll max-h-full'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-medium text-gray-700'>
                {t('Filters.title')}
              </h2>
              <div className='flex items-center'>
                <button
                  className='text-blue-500 mr-4 text-sm'
                  onClick={clearAllFilters}
                >
                  {t('Filters.clearAll')}
                </button>
                <button
                  className='cursor-pointer text-gray-500 duration-300 hover:text-gray-700'
                  onClick={() => setMode('drag')}
                >
                  <IoMdClose size={20} />
                </button>
              </div>
            </div>

            {/* Decibel Intervals */}
            <div className='flex flex-col gap-3'>
              <p className='text-gray-500'>{t('Filters.decibelIntervals')}</p>
              <div className='w-full flex flex-col items-center justify-center gap-2'>
                <div className='h-2 w-full rounded-full flex items-center bg-gray-200 overflow-hidden'>
                  {colors.map((color) => (
                    <div
                      className='flex-1 h-full'
                      style={{ background: color.hex }}
                      key={color.id}
                    />
                  ))}
                </div>
                <div className='w-full rounded-full flex items-center overflow-hidden'>
                  {colors.map((value, index) => (
                    <span key={index} className='flex-1 text-sm'>
                      {index === colors.length - 1 && <span>&ge;</span>}
                      {value.interval}
                    </span>
                  ))}
                </div>
              </div>
              <div className='mt-4 relative'>
                <p
                  className='font-medium absolute -top-6 left-0'
                  style={{
                    color: colors.find(
                      (c) => c.interval >= filter.decibelsRange.max
                    )?.hex,
                  }}
                >
                  &lt;{filter.decibelsRange.max}
                </p>
                <input
                  type='range'
                  min='40'
                  max='80'
                  value={filter.decibelsRange.max}
                  onChange={(e) =>
                    setFilter({
                      decibelsRange: { min: 0, max: parseInt(e.target.value) },
                    })
                  }
                  className='w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer'
                  style={{
                    accentColor: colors.find(
                      (c) => c.interval >= filter.decibelsRange.max
                    )?.hex,
                  }}
                />
              </div>
            </div>

            <div className='my-6 w-full '>
              <div className='flex items-center justify-between mb-3'>
                <label className='block text-gray-500 mb-2'>
                  {t('Filters.timeRanges')}
                </label>
                <DatePickerInput />
              </div>
              <div
                className={`relative flex w-full rounded-full p-1 ${
                  filter.mode === 'custom'
                    ? 'bg-gray-200 opacity-70'
                    : 'bg-gray-100'
                }`}
              >
                <div
                  className={`absolute top-1 bottom-1 w-[33%] rounded-full transition-all duration-300 ${
                    filter.mode === 'custom' ? 'bg-gray-300' : 'bg-blue-500'
                  } ${
                    filter.mode === 'all'
                      ? 'left-1'
                      : filter.mode === 'night'
                      ? 'left-[66%]'
                      : 'left-1/3'
                  }`}
                ></div>

                <button
                  className={`flex-1 z-10 py-2 text-center rounded-full transition-colors duration-300 ${
                    filter.mode === 'custom'
                      ? 'text-gray-600'
                      : filter.mode === 'all'
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}
                  onClick={() => setFilter({ mode: 'all' })}
                >
                  {t('Filters.all')}
                </button>
                <button
                  className={`flex-1 z-10 py-2 text-center rounded-full transition-colors duration-300 ${
                    filter.mode === 'custom'
                      ? 'text-gray-600'
                      : filter.mode === 'day'
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}
                  onClick={() => setFilter({ mode: 'day' })}
                >
                  {t('Filters.day')}
                </button>
                <button
                  className={`flex-1 z-10 py-2 text-center rounded-full transition-colors duration-300 ${
                    filter.mode === 'custom'
                      ? 'text-gray-600'
                      : filter.mode === 'night'
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}
                  onClick={() => setFilter({ mode: 'night' })}
                >
                  {t('Filters.night')}
                </button>
              </div>
            </div>

            {/* Interest zone */}
            <div className='mb-6 w-full'>
              <label className='block text-gray-500 mb-2'>
                {t('Filters.interestZone')}
              </label>
              <div className='relative flex w-full bg-gray-100 rounded-full p-1'>
                <div
                  className={`absolute top-1 bottom-1 w-[33%] rounded-full bg-blue-500 transition-all duration-300 ${
                    interestZone === 'City'
                      ? 'left-1'
                      : interestZone === 'Neighborhoods'
                      ? 'left-[66%]'
                      : 'left-1/3'
                  }`}
                ></div>

                <button
                  className={`flex-1 z-10 py-2 text-center rounded-full transition-colors duration-300 ${
                    interestZone === 'City' ? 'text-white' : 'text-gray-600'
                  }`}
                  onClick={() => setInterestZone('City')}
                >
                  {t('Filters.city')}
                </button>
                <button
                  className={`flex-1 z-10 py-2 text-center rounded-full transition-colors duration-300 ${
                    interestZone === 'Districts'
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}
                  onClick={() => setInterestZone('Districts')}
                >
                  {t('Filters.district')}
                </button>
                <button
                  className={`flex-1 z-10 py-2 text-center rounded-full transition-colors duration-300 ${
                    interestZone === 'Neighborhoods'
                      ? 'text-white'
                      : 'text-gray-600'
                  }`}
                  onClick={() => setInterestZone('Neighborhoods')}
                >
                  {t('Filters.neighborhood')}
                </button>
              </div>
            </div>

            {/* Districts */}
            {interestZone === 'Districts' && (
              <div className='mb-6'>
                {districts.map((district) => (
                  <div key={district.id} className='flex items-center mb-2'>
                    <input
                      type='checkbox'
                      id={`district-${district.id}`}
                      checked={selectedDistricts.includes(district.id)}
                      onChange={() => toggleDistrict(district.id)}
                      className='h-3 w-3 text-blue-600 rounded border-gray-300 accent-blue-600'
                    />
                    <label
                      htmlFor={`district-${district.id}`}
                      className='ml-2 block text-sm text-gray-700'
                    >
                      {t(district.name)}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Street Search */}
            <div className='mb-6 relative'>
              <label className='block text-gray-500 mb-2'>
                {t('Filters.streetSearch')}
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  {isSearching ? (
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
                  ) : (
                    <FaSearch className='h-4 w-4 text-gray-400' />
                  )}
                </div>
                <input
                  ref={searchInputRef}
                  type='text'
                  placeholder={t('Filters.streetSearchPlaceholder')}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className='w-full pl-10 pr-10 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                {(searchQuery || selectedStreet) && (
                  <button
                    onClick={handleClearSearch}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  >
                    <IoMdClose className='h-4 w-4 text-gray-400 hover:text-gray-600' />
                  </button>
                )}
              </div>

              {/* Search Suggestions */}
              {showSuggestions && searchResults.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className='absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1'
                >
                  {searchResults.map((result, index) => {
                    // Extract street info from display_name
                    const parts = result.display_name.split(', ');
                    const firstPart = parts[0] || '';
                    const houseNumberMatch = firstPart.match(/(\d+)/);
                    const houseNumber = houseNumberMatch
                      ? houseNumberMatch[1]
                      : null;

                    let streetName = '';
                    if (parts.length > 1) {
                      if (houseNumber) {
                        streetName =
                          parts[1] ||
                          parts[0].replace(/\d+\s*,?\s*/, '').trim();
                      } else {
                        streetName = parts[0];
                      }
                    } else {
                      streetName = firstPart;
                    }

                    return (
                      <button
                        key={result.place_id || index}
                        onClick={() => handleSuggestionClick(result)}
                        className='w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start gap-3'
                      >
                        <FaMapMarkerAlt className='h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0' />
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='font-medium text-gray-900 truncate'>
                              {streetName.trim() ||
                                result.name ||
                                t('Filters.unknownStreet')}
                            </span>
                            {houseNumber && (
                              <span className='text-blue-600 font-medium'>
                                #{houseNumber}
                              </span>
                            )}
                            <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                              {result.type || result.class}
                            </span>
                          </div>
                          <p className='text-sm text-gray-600 truncate'>
                            {result.display_name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selected Street Display */}
              {selectedStreet && (
                <div className='mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md'>
                  <div className='flex items-center gap-2'>
                    <FaMapMarkerAlt className='h-4 w-4 text-blue-600' />
                    <div>
                      {(() => {
                        // Extract street info for selected street
                        const parts = selectedStreet.display_name.split(', ');
                        const firstPart = parts[0] || '';
                        const houseNumberMatch = firstPart.match(/(\d+)/);
                        const houseNumber = houseNumberMatch
                          ? houseNumberMatch[1]
                          : null;

                        let streetName = '';
                        if (parts.length > 1) {
                          if (houseNumber) {
                            streetName =
                              parts[1] ||
                              parts[0].replace(/\d+\s*,?\s*/, '').trim();
                          } else {
                            streetName = parts[0];
                          }
                        } else {
                          streetName = firstPart;
                        }

                        const city =
                          parts.find(
                            (part) =>
                              part.toLowerCase().includes('terrassa') ||
                              part.toLowerCase().includes('barcelona')
                          ) || '';

                        const postalCodeMatch =
                          selectedStreet.display_name.match(/\b\d{5}\b/);
                        const postalCode = postalCodeMatch
                          ? postalCodeMatch[0]
                          : '';

                        return (
                          <>
                            <p className='font-medium text-blue-900'>
                              {streetName.trim() || selectedStreet.name}
                              {houseNumber && ` #${houseNumber}`}
                            </p>
                            <p className='text-sm text-blue-700'>
                              {city && `${city}`}
                              {postalCode && `, ${postalCode}`}
                              {!city &&
                                !postalCode &&
                                selectedStreet.type &&
                                ` (${selectedStreet.type})`}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {showSuggestions &&
                searchQuery.length >= 3 &&
                searchResults.length === 0 &&
                !isSearching && (
                  <div className='absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 p-4 text-center text-gray-500'>
                    {t('Filters.noStreetsFound')} "{searchQuery}"
                  </div>
                )}
            </div>

            {/* Number of social reports */}
            <SocialReportAudioFilter />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
