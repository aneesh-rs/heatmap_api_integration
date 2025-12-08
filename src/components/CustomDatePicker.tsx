import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaChevronLeft, FaChevronRight, FaCalendar } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface CustomDatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  onClose?: () => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
}) => {
  const [currentDate, setCurrentDate] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState(value || new Date());
  const [isAM, setIsAM] = useState(selectedDate.getHours() < 12);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  const { t } = useTranslation();

  const months = [
    t('DatePicker.months.jan'),
    t('DatePicker.months.feb'),
    t('DatePicker.months.mar'),
    t('DatePicker.months.apr'),
    t('DatePicker.months.may'),
    t('DatePicker.months.jun'),
    t('DatePicker.months.jul'),
    t('DatePicker.months.aug'),
    t('DatePicker.months.sep'),
    t('DatePicker.months.oct'),
    t('DatePicker.months.nov'),
    t('DatePicker.months.dec'),
  ];

  const weekDays = [
    t('DatePicker.weekdays.sun'),
    t('DatePicker.weekdays.mon'),
    t('DatePicker.weekdays.tue'),
    t('DatePicker.weekdays.wed'),
    t('DatePicker.weekdays.thu'),
    t('DatePicker.weekdays.fri'),
    t('DatePicker.weekdays.sat'),
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setIsYearDropdownOpen(false);
  };

  const handleYearButtonKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsYearDropdownOpen(!isYearDropdownOpen);
    }
  };

  // Close year dropdown when clicking outside and handle keyboard navigation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const yearDropdown = document.querySelector('[data-year-dropdown]');
      const yearButton = document.querySelector('[data-year-button]');

      if (
        yearDropdown &&
        !yearDropdown.contains(target) &&
        yearButton &&
        !yearButton.contains(target)
      ) {
        setIsYearDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isYearDropdownOpen) return;

      if (event.key === 'Escape') {
        setIsYearDropdownOpen(false);
      }
    };

    if (isYearDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isYearDropdownOpen]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];

    // Previous month's days
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isPrevMonth: false,
        date: new Date(year, month, day),
      });
    }

    // Next month's days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPrevMonth: false,
        date: new Date(year, month + 1, day),
      });
    }

    return days;
  };

  const handleDateClick = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(selectedDate.getHours());
    newDate.setMinutes(selectedDate.getMinutes());
    setSelectedDate(newDate);
    onChange?.(newDate);
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setSelectedDate(newDate);
    onChange?.(newDate);
  };

  const adjustHour = (direction: 'up' | 'down') => {
    const currentDisplayHour =
      selectedDate.getHours() === 0
        ? 12
        : selectedDate.getHours() > 12
        ? selectedDate.getHours() - 12
        : selectedDate.getHours();

    let newDisplayHour =
      direction === 'up' ? currentDisplayHour + 1 : currentDisplayHour - 1;

    if (newDisplayHour > 12) newDisplayHour = 1;
    if (newDisplayHour < 1) newDisplayHour = 12;

    const actualHour = isAM
      ? newDisplayHour === 12
        ? 0
        : newDisplayHour
      : newDisplayHour === 12
      ? 12
      : newDisplayHour + 12;
    handleTimeChange(actualHour, selectedDate.getMinutes());
  };

  const adjustMinute = (direction: 'up' | 'down') => {
    let newMinute =
      direction === 'up'
        ? selectedDate.getMinutes() + 1
        : selectedDate.getMinutes() - 1;

    if (newMinute > 59) newMinute = 0;
    if (newMinute < 0) newMinute = 59;

    handleTimeChange(selectedDate.getHours(), newMinute);
  };

  const toggleAMPM = () => {
    setIsAM(!isAM);
    const currentHour = selectedDate.getHours();
    const newHour = isAM
      ? currentHour < 12
        ? currentHour + 12
        : currentHour
      : currentHour >= 12
      ? currentHour - 12
      : currentHour;
    handleTimeChange(newHour, selectedDate.getMinutes());
  };

  const days = getDaysInMonth(currentDate);
  const displayHour =
    selectedDate.getHours() === 0
      ? 12
      : selectedDate.getHours() > 12
      ? selectedDate.getHours() - 12
      : selectedDate.getHours();

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  return (
    <div className='w-80 bg-white rounded-2xl shadow-lg p-4 font-sans'>
      {/* Month Navigation */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-2'>
          <span className='text-blue-500 font-medium text-lg'>
            {months[currentDate.getMonth()]}
          </span>
          <div className='relative'>
            <button
              data-year-button
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              onKeyDown={handleYearButtonKeyDown}
              className='text-blue-500 font-medium text-lg hover:text-blue-600 transition-colors duration-200 flex items-center space-x-1'
              tabIndex={0}
              role='button'
              aria-expanded={isYearDropdownOpen}
              aria-haspopup='listbox'
            >
              <span>{currentDate.getFullYear()}</span>
              <FaChevronRight
                className={`w-3 h-3 transition-transform duration-200 ${
                  isYearDropdownOpen ? 'rotate-90' : ''
                }`}
              />
            </button>

            {/* Year Dropdown */}
            {isYearDropdownOpen && (
              <div
                data-year-dropdown
                className='absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto min-w-[80px]'
                role='listbox'
                aria-label='Select year'
                onWheel={(e) => e.stopPropagation()}
              >
                {Array.from(
                  { length: new Date().getFullYear() - 1960 + 1 },
                  (_, i) => new Date().getFullYear() - i
                ).map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors duration-200 ${
                      year === currentDate.getFullYear()
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700'
                    }`}
                    role='option'
                    aria-selected={year === currentDate.getFullYear()}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className='flex space-x-1'>
          <button
            onClick={() => navigateMonth('prev')}
            className='p-1 hover:bg-gray-100 rounded'
          >
            <FaChevronLeft className='w-4 h-4 text-gray-600' />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className='p-1 hover:bg-gray-100 rounded'
          >
            <FaChevronRight className='w-4 h-4 text-gray-600' />
          </button>
        </div>
      </div>

      {/* Week Days */}
      <div className='grid grid-cols-7 gap-1 mb-2'>
        {weekDays.map((day) => (
          <div
            key={day}
            className='text-center text-gray-400 text-xs font-medium py-2'
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className='grid grid-cols-7 gap-1 mb-6'>
        {days.map((dayObj, index) => {
          const isSelected = isSameDate(dayObj.date, selectedDate);
          const isTodayDate = isToday(dayObj.date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(dayObj.date)}
              className={`
                h-10 w-10 rounded-full text-sm font-medium transition-colors duration-200
                ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : dayObj.isCurrentMonth
                    ? 'text-gray-900 hover:bg-gray-100'
                    : 'text-gray-300 hover:bg-gray-50'
                }
                ${isTodayDate && !isSelected ? 'bg-gray-200' : ''}
                ${
                  dayObj.day === 27 && !dayObj.isCurrentMonth
                    ? 'bg-gray-200 text-gray-600'
                    : ''
                }
              `}
            >
              {dayObj.day}
            </button>
          );
        })}
      </div>

      {/* Time Picker */}
      <div className='flex items-center justify-between'>
        <span className='text-gray-600 font-medium'>
          {t('DatePicker.time')}
        </span>
        <div className='bg-gray-100 rounded-xl p-4'>
          <div className='flex items-center space-x-8'>
            {/* Hour Column */}
            <div className='flex flex-col items-center space-y-2'>
              <button
                onClick={() => adjustHour('up')}
                className='p-1 hover:bg-gray-200 rounded transition-colors duration-200'
              >
                <svg
                  className='w-4 h-4 text-gray-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 15l7-7 7 7'
                  />
                </svg>
              </button>
              <div className='text-2xl font-medium text-gray-900 w-8 text-center'>
                {displayHour.toString().padStart(2, '0')}
              </div>
              <button
                onClick={() => adjustHour('down')}
                className='p-1 hover:bg-gray-200 rounded transition-colors duration-200'
              >
                <svg
                  className='w-4 h-4 text-gray-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>
            </div>

            {/* Colon */}
            <div className='text-2xl font-medium text-gray-900'>:</div>

            {/* Minute Column */}
            <div className='flex flex-col items-center space-y-2'>
              <button
                onClick={() => adjustMinute('up')}
                className='p-1 hover:bg-gray-200 rounded transition-colors duration-200'
              >
                <svg
                  className='w-4 h-4 text-gray-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 15l7-7 7 7'
                  />
                </svg>
              </button>
              <div className='text-2xl font-medium text-gray-900 w-8 text-center'>
                {selectedDate.getMinutes().toString().padStart(2, '0')}
              </div>
              <button
                onClick={() => adjustMinute('down')}
                className='p-1 hover:bg-gray-200 rounded transition-colors duration-200'
              >
                <svg
                  className='w-4 h-4 text-gray-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>
            </div>

            {/* AM/PM Column */}
            <div className='flex flex-col items-center space-y-2'>
              <button
                onClick={() => toggleAMPM()}
                className='p-1 hover:bg-gray-200 rounded transition-colors duration-200'
              >
                <svg
                  className='w-4 h-4 text-gray-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 15l7-7 7 7'
                  />
                </svg>
              </button>
              <div className='text-2xl font-medium text-gray-900 w-8 text-center'>
                {isAM ? 'AM' : 'PM'}
              </div>
              <button
                onClick={() => toggleAMPM()}
                className='p-1 hover:bg-gray-200 rounded transition-colors duration-200'
              >
                <svg
                  className='w-4 h-4 text-gray-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// DatePickerInput Component
const DatePickerInput: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  // Update picker position when modal scrolls
  useEffect(() => {
    if (!isPickerOpen || !containerRef.current) return;

    const updatePosition = () => {
      if (containerRef.current) {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setPickerPosition({
              top: rect.bottom + 8,
              left: rect.left,
            });
          }
        });
      }
    };

    // Initial position
    updatePosition();

    // Update position on scroll and resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    // Find the modal container and listen to its scroll events
    const modalContainer = containerRef.current.closest(
      '.overflow-y-auto, .overflow-y-scroll, [class*="overflow"], .modal, [class*="modal"]'
    );
    if (modalContainer) {
      modalContainer.addEventListener('scroll', updatePosition, true);
    }

    // Also listen to any parent containers that might scroll
    let parent = containerRef.current?.parentElement || null;
    while (parent && parent !== document.body) {
      if (parent.scrollHeight > parent.clientHeight) {
        parent.addEventListener('scroll', updatePosition, true);
      }
      parent = parent.parentElement;
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      if (modalContainer) {
        modalContainer.removeEventListener('scroll', updatePosition, true);
      }

      // Clean up parent scroll listeners
      parent = containerRef.current?.parentElement || null;
      while (parent && parent !== document.body) {
        if (parent.scrollHeight > parent.clientHeight) {
          parent.removeEventListener('scroll', updatePosition, true);
        }
        parent = parent.parentElement;
      }
    };
  }, [isPickerOpen]);

  // Close picker when clicking outside (handled by backdrop now)
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPickerOpen(false);
      }
    };

    if (isPickerOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isPickerOpen]);

  // Close when clicking outside of the trigger and the floating picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!isPickerOpen) return;

      // Check if click is inside the date picker content
      const datePickerContent = document.querySelector(
        '[data-date-picker-content]'
      );
      if (datePickerContent && datePickerContent.contains(target)) return;

      // Check if click is inside the trigger button
      if (containerRef.current && containerRef.current.contains(target)) return;

      setIsPickerOpen(false);
    };

    // Allow scroll events to pass through when hovering over the date picker
    const handleWheel = (event: WheelEvent) => {
      const datePickerContent = document.querySelector(
        '[data-date-picker-content]'
      );
      if (
        datePickerContent &&
        datePickerContent.contains(event.target as Node)
      ) {
        // Find the modal container and trigger scroll on it
        const modalContainer = containerRef.current?.closest(
          '.overflow-y-auto, .overflow-y-scroll, [class*="overflow"], .modal, [class*="modal"]'
        );
        if (modalContainer) {
          modalContainer.scrollTop += event.deltaY;
          event.preventDefault();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [isPickerOpen]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className='relative flex justify-end' ref={containerRef}>
      {/* Input Button */}
      <button
        onClick={() => setIsPickerOpen(!isPickerOpen)}
        className='flex text-sm items-center outline-none space-x-2 p rounded-lg hover:border-gray-400 transition-colors duration-200'
      >
        <FaCalendar className='w-4 h-4 text-gray-500' />
        <span className='text-gray-500'>
          {selectedDate
            ? formatSelectedDate(selectedDate)
            : 'DatePicker.customDate'}
        </span>
      </button>

      {/* Date Picker Dropdown */}
      {isPickerOpen &&
        containerRef.current &&
        createPortal(
          <>
            {/* Date Picker */}
            <div
              className='fixed z-[9999] -translate-x-[200px]'
              ref={pickerRef}
              style={{
                top: pickerPosition.top,
                left: pickerPosition.left,
                pointerEvents: 'none',
              }}
            >
              <div
                data-date-picker-content
                className='pointer-events-auto'
                style={{
                  pointerEvents: 'auto',
                }}
              >
                <CustomDatePicker
                  value={selectedDate || undefined}
                  onChange={handleDateSelect}
                  onClose={() => setIsPickerOpen(false)}
                />
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};

export default DatePickerInput;
export { CustomDatePicker };
