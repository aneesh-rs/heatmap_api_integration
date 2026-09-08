import type { FeatureCollection, LineString } from 'geojson';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StreetNoiseGeoJson = FeatureCollection<LineString, {
  street_name?: string;
  calculated_eq?: number;
  [key: string]: unknown;
}>;

interface CloudNoiseStore {
  geojson: StreetNoiseGeoJson | null;
  active: boolean;
  setGeojson: (geojson: StreetNoiseGeoJson) => void;
  clear: () => void;
  setActive: (active: boolean) => void;
}

export const useCloudNoiseStore = create<CloudNoiseStore>()(
  persist(
    (set) => ({
      geojson: null,
      active: false,
      setGeojson: (geojson) => set({ geojson, active: true }),
      clear: () => set({ geojson: null, active: false }),
      setActive: (active) => set({ active }),
    }),
    {
      name: 'street-heatmap-store-v2',
      partialize: (state) => ({
        geojson: state.geojson,
        active: state.active,
      }),
    },
  ),
);
