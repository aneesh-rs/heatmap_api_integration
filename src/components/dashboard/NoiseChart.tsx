import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useHeatmapStore } from '@/store/useHeatmapStore';
import { FiBarChart } from 'react-icons/fi';

const NoiseChart: React.FC = () => {
  const { data: heatMapData } = useHeatmapStore();

  // Process data to group by noise type (category)
  const pieData = useMemo(() => {
    if (!heatMapData || heatMapData.length === 0) return [];

    const categoryMap = new Map<
      string,
      { count: number; totalFrequency: number }
    >();

    heatMapData.forEach((item) => {
      const category = item.audioType.toLowerCase();
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { count: 0, totalFrequency: 0 });
      }
      const data = categoryMap.get(category)!;
      data.count += 1;
      data.totalFrequency += item.frequency;
    });

    // Use average frequency as the value to remain consistent with previous chart
    return Array.from(categoryMap.entries()).map(
      ([name, { count, totalFrequency }]) => ({
        name,
        value: Math.round(totalFrequency / count),
      })
    );
  }, [heatMapData]);

  // Generate colors for categories
  const colors = useMemo(() => {
    if (!heatMapData || heatMapData.length === 0) return {};

    const categories = Array.from(
      new Set(heatMapData.map((item) => item.audioType.toLowerCase()))
    );
    const colorPalette = [
      '#3b82f6',
      '#ef4444',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#06b6d4',
      '#84cc16',
      '#f97316',
      '#ec4899',
      '#6366f1',
      '#14b8a6',
      '#f43f5e',
      '#8b5cf6',
      '#06b6d4',
      '#84cc16',
    ];

    const colorMap: Record<string, string> = {};
    categories.forEach((category, index) => {
      colorMap[category] = colorPalette[index % colorPalette.length];
    });

    return colorMap;
  }, [heatMapData]);

  // Categories are derived from pieData when rendering; no separate memo needed

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; fill: string }>;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 shadow-lg rounded-lg border border-gray-200'>
          {payload.map((pld, index: number) => (
            <div key={index} className='flex items-center gap-2'>
              <div
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: pld.fill }}
              ></div>
              <span className='capitalize text-gray-800 font-semibold'>
                {pld.name}: {pld.value} dB
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Use default legend rendering

  // Empty state
  if (!heatMapData || heatMapData.length === 0) {
    return (
      <div className='w-full flex flex-col p-5 gap-5'>
        <div className='w-full flex flex-col gap-4'>
          <div className='flex gap-4 items-center relative'>
            <h2 className='text-gray-400 font-bold text-2xl'>
              Noise Levels by Noise Type
            </h2>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center py-12 px-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200'>
          <div className='flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4'>
            <FiBarChart className='w-8 h-8 text-blue-600' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            No Data Available
          </h3>
          <p className='text-sm text-gray-500 text-center max-w-sm'>
            Upload some noise data to see the pie chart analysis here. Data will
            appear once you import audio files or reports.
          </p>
          <div className='mt-4 flex items-center gap-2 text-xs text-gray-400'>
            <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
            <span>Data will appear automatically when available</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full flex flex-col p-5 gap-5'>
      <div className='w-full flex flex-col gap-4'>
        <div className='flex gap-4 items-center relative'>
          <h2 className='text-gray-400 font-bold text-2xl'>
            Noise Levels by Noise Type
          </h2>
        </div>
        <p className='text-sm text-gray-600'>
          Average noise levels (dB) grouped by audio category
        </p>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-4'>
        <ResponsiveContainer width='100%' height={400}>
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Pie
              data={pieData}
              dataKey='value'
              nameKey='name'
              cx='50%'
              cy='50%'
              outerRadius={140}
              label={({ name, value }) => `${name}: ${value} dB`}
            >
              {pieData.map((entry: { name: string; value: number }) => (
                <Cell key={entry.name} fill={colors[entry.name]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NoiseChart;
