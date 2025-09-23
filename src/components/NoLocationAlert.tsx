import { motion, AnimatePresence } from 'motion/react';
import { FaMapMarkerAlt, FaTimes, FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { getPossibleLocations } from '../utils';

type LocationSelectorProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation?: () => void;
  onStreetSelected?: (location: { lat: number; lng: number; address: string }) => void;
};

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export default function NoLocationAlert({
  isOpen,
  onClose,
  onSelectLocation,
  onStreetSelected,
}: LocationSelectorProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length >= 3) {
        setIsSearching(true);
        try {
          const results = await getPossibleLocations(searchQuery);
          setSearchResults(results.slice(0, 8)); // Limit to 8 results
          setShowSuggestions(results.length > 0);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
          setShowSuggestions(false);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleStreetSelect = (location: LocationSuggestion) => {
    const selectedLocation = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      address: location.display_name,
    };
    
    setSearchQuery(location.display_name);
    setSearchResults([]);
    setShowSuggestions(false);
    
    // Call the callback to pass the selected location
    onStreetSelected?.(selectedLocation);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className='fixed inset-0 bg-black/60 bg-opacity-50 z-40'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-lg p-8'
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className='absolute right-4 top-4 text-gray-500 hover:text-gray-700'
            >
              <FaTimes size={20} />
            </button>

            {/* Location Pin Icon with Checkmark */}
            <div className='flex justify-center mb-6'>
              <div className='w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center relative'>
                <FaMapMarkerAlt className='text-white text-4xl' />
                <div className='absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border-4 border-blue-500'>
                  <span className='text-blue-500 font-bold'>✓</span>
                </div>
              </div>
            </div>

            {/* Heading */}
            <h2 className='text-2xl font-bold text-center text-gray-900 mb-4'>
              {t('NoLocationAlert.title')}
            </h2>

            {/* Instructions */}
            <p className='text-center text-gray-600 mb-6'>
              {t('NoLocationAlert.instructions')}{' '}
              
            </p>

            {/* Direction Text */}
            <p className='text-center text-gray-600 mb-2'>
              {t('NoLocationAlert.orTypeDirection')}
            </p>

            {/* Input Field with Search Results */}
            <div className='relative mb-6'>
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('NoLocationAlert.locationPlaceholder')}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg pr-12'
                onFocus={() => setShowSuggestions(searchResults.length > 0)}
                onBlur={() => {
                  // Delay hiding suggestions to allow clicking
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
              <div className='absolute right-4 top-1/2 -translate-y-1/2 flex items-center'>
                {isSearching ? (
                  <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                ) : (
                  <FaSearch className='text-gray-400' />
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSuggestions && searchResults.length > 0 && (
                <div className='absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className='px-4 py-3 text-black hover:bg-blue-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0'
                      onClick={() => handleStreetSelect(result)}
                    >
                      <div className='font-medium text-gray-900'>
                        {result.display_name.split(',')[0]}
                      </div>
                      <div className='text-xs text-gray-500 mt-1'>
                        {result.display_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Select in Map Button */}
            <button
              onClick={onSelectLocation}
              className='w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-full transition-colors'
            >
              {t('NoLocationAlert.selectInMap')}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
