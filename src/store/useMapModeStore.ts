import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MapMode } from '../types';

interface MapModeStore {
  mode: MapMode;
  setMode: (mode: MapMode) => void;
  heatmapActive: boolean;
  setHeatmapActive: (active: boolean) => void;
  activateHeatmap: () => void;
  deactivateHeatmap: () => void;
}

export const useMapModeStore = create<MapModeStore>()(
  persist(
    (set) => ({
      mode: 'drag', // default
      setMode: (mode: MapMode) => set({ mode }),
      heatmapActive: false,
      setHeatmapActive: (active: boolean) => set({ heatmapActive: active }),
      activateHeatmap: () => set({ heatmapActive: true }),
      deactivateHeatmap: () => set({ heatmapActive: false }),
    }),
    {
      name: 'map-mode-store', // key in localStorage
    }
  )
);
