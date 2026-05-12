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
      gradient: {
        0.0: '#6ED4E6', // 40
        0.125: '#A3E37C', // 45
        0.25: '#E8E85B', // 50
        0.375: '#F5DD3B', // 55
        0.5: '#F7B821', // 60
        0.625: '#EF7E1A', // 65
        0.75: '#E52A1A', // 70
        0.875: '#FF2EEA', // 75
        1.0: '#3C3CFF', // ≥80
      },
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
