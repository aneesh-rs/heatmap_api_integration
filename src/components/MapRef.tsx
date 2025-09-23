import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Map } from 'leaflet';

interface MapRefProps {
  onMapReady: (map: Map) => void;
}

export default function MapRef({ onMapReady }: MapRefProps) {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
}
