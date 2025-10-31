import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet.heat';

interface HeatmapProps {
  points: [number, number, number?][]; // [lat, lng, intensity]
  visible: boolean;
  gradient?: Record<number, string>; // keys 0..1
  max?: number; // default based on points
}

const HeatmapLayer: React.FC<HeatmapProps> = ({
  points,
  visible,
  gradient,
  max,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heatLayer = (L as any).heatLayer(points, {
      radius: 22,
      blur: 18,
      maxZoom: 17,
      minOpacity: 0.35,
      gradient,
      max,
    });

    if (visible) {
      heatLayer.addTo(map);
    }

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, visible, gradient, max]);

  return null;
};

export default HeatmapLayer;
