import { LineChart, Line, XAxis, Tooltip } from 'recharts';

type SparklineProps = {
  data: { time: string; frequency: number }[];
  category: string;
};

export default function Sparkline({ data, category }: SparklineProps) {
  return (
    <LineChart width={100} height={50} data={data}>
      <XAxis dataKey='time' hide />
      <Tooltip />
      <Line
        type='monotone'
        dataKey={category}
        stroke='#3b82f6'
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  );
}
