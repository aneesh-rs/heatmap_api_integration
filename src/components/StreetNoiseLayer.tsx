import { useEffect, useMemo } from 'react';
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
    weight: 7,
    opacity: 0.95,
    lineCap: 'round',
    lineJoin: 'round',
  };
}

function bindFeature(feature: Feature, layer: Layer) {
  const streetName = feature.properties?.street_name ?? 'Street';
  const db = Number(feature.properties?.calculated_eq ?? 0);
  const label = `${streetName}: ${db.toFixed(1)} dB`;

  layer.bindTooltip(label, {
    sticky: true,
    direction: 'top',
    opacity: 0.95,
    className: 'street-noise-label',
  });

  layer.on({
    mouseover: (event) => {
      const path = event.target as L.Path;
      path.setStyle({ weight: 10, opacity: 1 });
      path.bringToFront();
    },
    mouseout: (event) => {
      const path = event.target as L.Path;
      path.setStyle(styleFeature(feature));
    },
  });
}

const StreetNoiseLayer = ({ visible }: StreetNoiseLayerProps) => {
  const map = useMap();
  const geojson = useCloudNoiseStore((state) => state.geojson);

  const layerKey = useMemo(() => {
    if (!geojson?.features?.length) return 'empty';
    const sample = geojson.features
      .slice(0, 8)
      .map(
        (feature) =>
          `${feature.properties?.street_name}:${feature.properties?.calculated_eq}:${feature.geometry.coordinates.length}`,
      )
      .join('|');
    return `${geojson.features.length}:${sample}`;
  }, [geojson]);

  useEffect(() => {
    if (!visible || !geojson?.features?.length) return;

    const layer = L.geoJSON(geojson as GeoJsonObject);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 17 });
    }
  }, [geojson, map, visible, layerKey]);

  if (!visible || !geojson) return null;

  return (
    <GeoJSON
      key={layerKey}
      data={geojson as GeoJsonObject}
      style={styleFeature}
      onEachFeature={bindFeature}
    />
  );
};

export default StreetNoiseLayer;
