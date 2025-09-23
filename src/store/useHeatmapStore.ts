import { AudioType } from "@/types";
import { normalizeFrequency } from "@/utils";
import { create } from "zustand";

export interface DataPoint {
  lat: number;
  lon: number;
  frequency: number;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  timestamp: string; // ISO string
  audioType: AudioType;
}

export type HeatmapPoint = [number, number, number]; // [lat, lon, intensity]

type FilterMode = "all" | "day" | "night" | "custom";

interface HeatmapFilter {
  mode: FilterMode;
  // Range filtering when mode === 'custom'
  customStart?: string; // ISO string
  customEnd?: string; // ISO string
  // Legacy fields kept for backwards compatibility (not used if range is set)
  customDate?: string; // "YYYY-MM-DD"
  customTime?: string; // "HH:mm"
  customWindowMinutes?: number; // optional ± minutes window for custom point-in-time
  audioTypes?: AudioType[]; // selected audio types
  decibelsRange: {
    min: number;
    max: number;
  };
}

interface HeatmapDataStore {
  data: DataPoint[];
  filter: HeatmapFilter;

  setData: (points: DataPoint[]) => void;
  clearData: () => void;

  setFilter: (filter: Partial<HeatmapFilter>) => void;

  getFilteredPoints: () => DataPoint[];
  getHeatmapPoints: (points?: DataPoint[]) => HeatmapPoint[];
}

export const useHeatmapStore = create<HeatmapDataStore>((set, get) => ({
  data: [],
  filter: {
    mode: "day",
    customWindowMinutes: 30,
    audioTypes: [],
    decibelsRange: { min: 0, max: 80 },
  },

  setData: (points) => set({ data: points }),
  clearData: () => set({ data: [] }),

  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),

  getFilteredPoints: () => {
    const { data, filter } = get();

    const normalizeTime = (p: DataPoint) => new Date(p.timestamp).getHours();

    let filtered = data;

    // Day/Night/Custom filter
    if (filter.mode === "day") {
      filtered = filtered.filter((p) => {
        const hour = normalizeTime(p);
        return hour >= 6 && hour < 18;
      });
    } else if (filter.mode === "night") {
      filtered = filtered.filter((p) => {
        const hour = normalizeTime(p);
        return hour < 6 || hour >= 18;
      });
    } else if (filter.mode === "custom") {
      // Prefer range filtering if both start and end provided
      if (filter.customStart && filter.customEnd) {
        const startTs = new Date(filter.customStart).getTime();
        const endTs = new Date(filter.customEnd).getTime();
        const [minTs, maxTs] =
          startTs <= endTs ? [startTs, endTs] : [endTs, startTs];

        filtered = filtered.filter((p) => {
          const pointTs = new Date(p.timestamp).getTime();
          return pointTs >= minTs && pointTs <= maxTs;
        });
      } else if (filter.customDate && filter.customTime) {
        // Fallback to legacy point-in-time window
        const selectedTs = new Date(
          `${filter.customDate}T${filter.customTime}`
        ).getTime();
        const windowMinutes = filter.customWindowMinutes || 30;

        filtered = filtered.filter((p) => {
          const pointTs = new Date(p.timestamp).getTime();
          const diffMinutes = Math.abs(pointTs - selectedTs) / (1000 * 60);
          return diffMinutes <= windowMinutes;
        });
      }
    }

    // Audio type filter
    if (filter.audioTypes && filter.audioTypes.length > 0) {
      filtered = filtered.filter((p) =>
        filter.audioTypes!.includes(p.audioType)
      );
    }

    return filtered;
  },

  getHeatmapPoints: (points) => {
    const source = points || get().getFilteredPoints();
    return source.map((p) => [p.lat, p.lon, normalizeFrequency(p.frequency)]);
  },
}));
