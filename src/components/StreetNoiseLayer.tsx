import { useEffect } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import type { Layer, PathOptions } from 'leaflet';
import type { Feature, GeoJsonObject } from 'geojson';
import { useCloudNoiseStore } from '@/store/useCloudNoiseStore';
import { colorForDecibels } from '@/utils/noiseColors';

interface StreetNoiseLayerProps {
  visible: boolean;
}

function styleFeature(feature?: Feature): PathOptions {
  const db = Number(feature?.properties?.calculated_eq ?? 0);
  return {
    color: colorForDecibels(db),
    weight: 5,
    opacity: 0.9,
    lineCap: 'round',
    lineJoin: 'round',
  };
}

function bindFeature(feature: Feature, layer: Layer) {
  const streetName = feature.properties?.street_name ?? 'Street';
  const db = Number(feature.properties?.calculated_eq ?? 0);
  layer.bindTooltip(`${streetName}: ${db.toFixed(1)} dB`, {
    permanent: true,
    direction: 'center',
    className: 'street-noise-label',
  });
}

const StreetNoiseLayer = ({ visible }: StreetNoiseLayerProps) => {
  const map = useMap();
  const geojson = useCloudNoiseStore((state) => state.geojson);

  useEffect(() => {
    if (!visible || !geojson?.features?.length) return;

    const layer = L.geoJSON(geojson as GeoJsonObject);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [geojson, map, visible]);

  if (!visible || !geojson) return null;

  return (
    <GeoJSON
      key={JSON.stringify(geojson.features.length)}
      data={geojson as GeoJsonObject}
      style={styleFeature}
      onEachFeature={bindFeature}
    />
  );
};

export default StreetNoiseLayer;
