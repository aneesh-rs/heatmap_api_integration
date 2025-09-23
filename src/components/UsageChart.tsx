import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import type { UsageData } from '../types';

const data: UsageData[] = [
  { name: 'Figma', '2021': 36, '2022': 60, '2023': 69, '2024': 70 },
  { name: 'Sketch', '2021': 11, '2022': 13, '2023': 84, '2024': 60 },
  { name: 'XD', '2021': 58, '2022': 62, '2023': 57, '2024': 21 },
  { name: 'Photoshop', '2021': 10, '2022': 12, '2023': 61, '2024': 25 },
  { name: 'Illustrator', '2021': 30, '2022': 45, '2023': 36, '2024': 52 },
  { name: 'AfterEffect', '2021': 95, '2022': 67, '2023': 21, '2024': 35 },
  { name: 'InDesign', '2021': 14, '2022': 19, '2023': 85, '2024': 89 },
  { name: 'Maya', '2021': 57, '2022': 95, '2023': 38, '2024': 70 },
  { name: 'Premiere', '2021': 45, '2022': 14, '2023': 88, '2024': 40 },
  { name: 'Final Cut', '2021': 79, '2022': 88, '2023': 27, '2024': 52 },
];

const colors = {
  '2021': '#a7a8f5',
  '2022': '#92d4b7',
  '2023': '#f8b96e',
  '2024': '#5ee2f3',
};

const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className='flex justify-center items-center gap-6 mt-4'>
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className='flex items-center gap-2'>
          <span
            className='w-3 h-3'
            style={{ backgroundColor: entry.color }}
          ></span>
          <span className='text-gray-600 text-sm'>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white p-3 shadow-lg rounded-lg border border-gray-200'>
        <p className='font-bold text-gray-800'>{label}</p>
        {payload.map((pld: any, index: number) => (
          <div key={index} style={{ color: pld.fill }}>
            {`${pld.name}: ${pld.value}`}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const UsageChart: React.FC = () => {
  return (
    <div className='border-2 border-dashed border-blue-300 p-2'>
      <ResponsiveContainer width='100%' height={400}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 0,
            left: -20,
            bottom: 5,
          }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray='3 3' vertical={false} />
          <XAxis
            dataKey='name'
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}
          />
          <Legend content={renderLegend} />
          <Bar
            dataKey='2021'
            fill={colors['2021']}
            radius={[4, 4, 0, 0]}
            barSize={10}
          />
          <Bar
            dataKey='2022'
            fill={colors['2022']}
            radius={[4, 4, 0, 0]}
            barSize={10}
          />
          <Bar
            dataKey='2023'
            fill={colors['2023']}
            radius={[4, 4, 0, 0]}
            barSize={10}
          >
            <LabelList
              dataKey='2023'
              position='top'
              formatter={(value: number) => (value === 84 ? value : '')}
              fill='#6b7280'
              fontSize={12}
            />
          </Bar>
          <Bar
            dataKey='2024'
            fill={colors['2024']}
            radius={[4, 4, 0, 0]}
            barSize={10}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageChart;

// ResponsiveContainer: Makes chart auto - fit screen.

//BarChart: Base chart.

//CartesianGrid: Grid lines(only horizontal).

//XAxis: Tool names(Figma, Sketch…).

//YAxis: Usage values(0–100).

//Tooltip: Uses custom tooltip.

//Legend: Uses custom legend.
