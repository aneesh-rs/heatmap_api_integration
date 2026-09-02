import { StreetNoiseGeoJson, useCloudNoiseStore } from '@/store/useCloudNoiseStore';
import { useHeatmapStore } from '@/store/useHeatmapStore';
import { useMapModeStore } from '@/store/useMapModeStore';

export function applyStreetHeatmap(geojson: StreetNoiseGeoJson) {
  useHeatmapStore.getState().clearData();
  useCloudNoiseStore.getState().setGeojson(geojson);
  useMapModeStore.getState().activateHeatmap();
}
