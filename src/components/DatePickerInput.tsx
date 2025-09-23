import 'react-datepicker/dist/react-datepicker.css';
import { CustomDatePicker } from './CustomDatePicker';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaCalendar } from 'react-icons/fa';
import { useHeatmapStore } from '@/store/useHeatmapStore';

export default function DatePickerInput() {
  const { filter, setFilter } = useHeatmapStore();

  const initialStart = filter.customStart ? new Date(filter.customStart) : null;
  const initialEnd = filter.customEnd ? new Date(filter.customEnd) : null;

  const [startDate, setStartDate] = useState<Date | null>(initialStart);
  const [endDate, setEndDate] = useState<Date | null>(initialEnd);

  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [startPos, setStartPos] = useState({ top: 0, left: 0 });
  const [endPos, setEndPos] = useState({ top: 0, left: 0 });

  // Sync local state if store changes elsewhere
  useEffect(() => {
    if (filter.customStart) setStartDate(new Date(filter.customStart));
    if (filter.customEnd) setEndDate(new Date(filter.customEnd));
  }, [filter.customStart, filter.customEnd]);

  const updatePosition = (
    ref: React.RefObject<HTMLDivElement>,
    setter: React.Dispatch<React.SetStateAction<{ top: number; left: number }>>
  ) => {
    if (!ref.current) return;
    requestAnimationFrame(() => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setter({ top: rect.bottom + 8, left: rect.left });
    });
  };

  useEffect(() => {
    if (isStartOpen)
      updatePosition(startRef as React.RefObject<HTMLDivElement>, setStartPos);
  }, [isStartOpen]);
  useEffect(() => {
    if (isEndOpen)
      updatePosition(endRef as React.RefObject<HTMLDivElement>, setEndPos);
  }, [isEndOpen]);

  useEffect(() => {
    const handleResizeScroll = () => {
      if (isStartOpen)
        updatePosition(
          startRef as React.RefObject<HTMLDivElement>,
          setStartPos
        );
      if (isEndOpen)
        updatePosition(endRef as React.RefObject<HTMLDivElement>, setEndPos);
    };
    window.addEventListener('scroll', handleResizeScroll, true);
    window.addEventListener('resize', handleResizeScroll);
    return () => {
      window.removeEventListener('scroll', handleResizeScroll, true);
      window.removeEventListener('resize', handleResizeScroll);
    };
  }, [isStartOpen, isEndOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const datePickerContent = document.querySelector(
        '[data-date-picker-content]'
      );
      if (datePickerContent && datePickerContent.contains(target)) return;
      if (startRef.current && startRef.current.contains(target)) return;
      if (endRef.current && endRef.current.contains(target)) return;
      setIsStartOpen(false);
      setIsEndOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartChange = (date: Date) => {
    const now = new Date();
    const safeStart = date > now ? now : date;
    setStartDate(safeStart);
    // If end exists and is before new start, clamp end to start
    if (endDate && endDate < safeStart) {
      setEndDate(safeStart);
      setFilter({
        mode: 'custom',
        customStart: safeStart.toISOString(),
        customEnd: safeStart.toISOString(),
      });
    } else {
      setFilter({ mode: 'custom', customStart: safeStart.toISOString() });
    }
  };
  const handleEndChange = (date: Date) => {
    const now = new Date();
    const safeEnd = date > now ? now : date;
    // If start exists and end is before start, clamp end to start
    if (startDate && safeEnd < startDate) {
      setEndDate(startDate);
      setFilter({ mode: 'custom', customEnd: startDate.toISOString() });
    } else {
      setEndDate(safeEnd);
      setFilter({ mode: 'custom', customEnd: safeEnd.toISOString() });
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className='flex items-center gap-1.5'>
      {/* Start */}
      <div className='relative' ref={startRef}>
        <button
          onClick={() => {
            setIsStartOpen(!isStartOpen);
            setIsEndOpen(false);
          }}
          className='flex items-center outline-none space-x-1.5 px-2 py-1 rounded-full text-xs bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700'
        >
          <FaCalendar className='w-3.5 h-3.5 text-gray-500' />
          <span className='text-gray-700 max-w-[120px] truncate'>
            {startDate ? formatDate(startDate) : 'Start'}
          </span>
        </button>
        {isStartOpen &&
          startRef.current &&
          createPortal(
            <div
              className='fixed z-[9999] -translate-x-[200px]'
              style={{
                top: startPos.top,
                left: startPos.left,
                pointerEvents: 'none',
              }}
            >
              <div data-date-picker-content className='pointer-events-auto'>
                <CustomDatePicker
                  value={startDate || undefined}
                  onChange={handleStartChange}
                />
              </div>
            </div>,
            document.body
          )}
      </div>

      <span className='text-gray-300 text-sm'>—</span>

      {/* End */}
      <div className='relative' ref={endRef}>
        <button
          onClick={() => {
            setIsEndOpen(!isEndOpen);
            setIsStartOpen(false);
          }}
          className='flex items-center outline-none space-x-1.5 px-2 py-1 rounded-full text-xs bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700'
        >
          <FaCalendar className='w-3.5 h-3.5 text-gray-500' />
          <span className='text-gray-700 max-w-[120px] truncate'>
            {endDate ? formatDate(endDate) : 'End'}
          </span>
        </button>
        {isEndOpen &&
          endRef.current &&
          createPortal(
            <div
              className='fixed z-[9999] -translate-x-[200px]'
              style={{
                top: endPos.top,
                left: endPos.left,
                pointerEvents: 'none',
              }}
            >
              <div data-date-picker-content className='pointer-events-auto'>
                <CustomDatePicker
                  value={endDate || undefined}
                  onChange={handleEndChange}
                />
              </div>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}
