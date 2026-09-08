import { StreetNoiseGeoJson } from '@/store/useCloudNoiseStore';

/**
 * Tiny fallback if /sample_street_heatmap.geojson is unavailable.
 * Full demo lives in public/sample_street_heatmap.geojson (OSM centerlines).
 */
const terrassaDemoStreets: StreetNoiseGeoJson = {
  type: 'FeatureCollection',
  features: [],
};

export default terrassaDemoStreets;
