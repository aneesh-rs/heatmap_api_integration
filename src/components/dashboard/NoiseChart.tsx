import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useHeatmapStore } from "@/store/useHeatmapStore";
import { FiBarChart } from "react-icons/fi";

const NoiseChart: React.FC = () => {
  const { data: heatMapData } = useHeatmapStore();

  // Process data to group by year and category
  const chartData = useMemo(() => {
    if (!heatMapData || heatMapData.length === 0) return [];

    // Group data by year and category
    const yearCategoryMap = new Map<
      string,
      Map<string, { count: number; totalFrequency: number }>
    >();

    heatMapData.forEach((item) => {
      const year = new Date(item.date).getFullYear().toString();
      const category = item.audioType.toLowerCase();

      if (!yearCategoryMap.has(year)) {
        yearCategoryMap.set(year, new Map());
      }

      const yearData = yearCategoryMap.get(year)!;
      if (!yearData.has(category)) {
        yearData.set(category, { count: 0, totalFrequency: 0 });
      }

      const categoryData = yearData.get(category)!;
      categoryData.count += 1;
      categoryData.totalFrequency += item.frequency;
    });

    // Get all unique categories
    const allCategories = new Set<string>();
    yearCategoryMap.forEach((yearData) => {
      yearData.forEach((_, category) => {
        allCategories.add(category);
      });
    });

    // Get all years
    const years = Array.from(yearCategoryMap.keys()).sort();

    // Create chart data structure
    const result = years.map((year) => {
      const yearData = yearCategoryMap.get(year)!;
      const dataPoint: any = { year };

      allCategories.forEach((category) => {
        const categoryData = yearData.get(category);
        if (categoryData) {
          // Use average frequency for the bar height
          dataPoint[category] = Math.round(
            categoryData.totalFrequency / categoryData.count
          );
        } else {
          dataPoint[category] = 0;
        }
      });

      return dataPoint;
    });

    return result;
  }, [heatMapData]);

  // Generate colors for categories
  const colors = useMemo(() => {
    if (!heatMapData || heatMapData.length === 0) return {};

    const categories = Array.from(
      new Set(heatMapData.map((item) => item.audioType.toLowerCase()))
    );
    const colorPalette = [
      "#3b82f6",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#06b6d4",
      "#84cc16",
      "#f97316",
      "#ec4899",
      "#6366f1",
      "#14b8a6",
      "#f43f5e",
      "#8b5cf6",
      "#06b6d4",
      "#84cc16",
    ];

    const colorMap: Record<string, string> = {};
    categories.forEach((category, index) => {
      colorMap[category] = colorPalette[index % colorPalette.length];
    });

    return colorMap;
  }, [heatMapData]);

  const categories = useMemo(() => {
    if (!heatMapData || heatMapData.length === 0) return [];
    return Array.from(
      new Set(heatMapData.map((item) => item.audioType.toLowerCase()))
    );
  }, [heatMapData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-bold text-gray-800">Year: {label}</p>
          {payload.map((pld: any, index: number) => (
            <div
              key={index}
              style={{ color: pld.fill }}
              className="flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: pld.fill }}
              ></div>
              <span className="capitalize">
                {pld.dataKey}: {pld.value} dB
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center items-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-gray-600 text-sm capitalize">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // Empty state
  if (!heatMapData || heatMapData.length === 0) {
    return (
      <div className="w-full flex flex-col p-5 gap-5">
        <div className="w-full flex flex-col gap-4">
          <div className="flex gap-4 items-center relative">
            <h2 className="text-gray-400 font-bold text-2xl">
              Noise Data by Year and Category
            </h2>
          </div>
          <p className="text-sm text-gray-600">
            Average noise levels (dB) grouped by year and audio category
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 px-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FiBarChart className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Data Available
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            Upload some noise data to see the bar chart analysis here. Data will
            appear once you import audio files or reports.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Data will appear automatically when available</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col p-5 gap-5">
      <div className="w-full flex flex-col gap-4">
        <div className="flex gap-4 items-center relative">
          <h2 className="text-gray-400 font-bold text-2xl">
            Noise Data by Year and Category
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          Average noise levels (dB) grouped by year and audio category
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              label={{
                value: "Average dB",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(239, 246, 255, 0.5)" }}
            />
            <Legend content={renderLegend} />
            {categories.map((category) => (
              <Bar
                key={category}
                dataKey={category}
                fill={colors[category]}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NoiseChart;
