import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet.heat';

interface HeatmapProps {
  points: [number, number, number?][]; // lat, lng, intensity(optional)
  visible: boolean;
}

const HeatmapLayer: React.FC<HeatmapProps> = ({ points, visible }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const heatLayer = (window as any).L.heatLayer(points, {
      radius: 15,
      blur: 15,
      maxZoom: 17,
    });

    if (visible) {
      heatLayer.addTo(map);
    }

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, visible]);

  return null;
};

export default HeatmapLayer;
