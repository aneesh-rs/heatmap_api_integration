import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
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

    const heatLayer = (window as any).L.heatLayer(points, {
      radius: 25,
      blur: 20,
      maxZoom: 17,
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
