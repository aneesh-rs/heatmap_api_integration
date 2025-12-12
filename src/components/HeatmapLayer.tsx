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
        0.0: '#0B3C5D', // <40
        0.125: '#1D70A2', // 40–45
        0.25: '#5BC0EB', // 45–50
        0.375: '#2ECC71', // 50–55
        0.5: '#F1C40F', // 55–60
        0.625: '#F39C12', // 60–65
        0.75: '#E67E22', // 65–70
        0.875: '#E74C3C', // 70–75
        1.0: '#8B0000', // 75–80 (top)
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
