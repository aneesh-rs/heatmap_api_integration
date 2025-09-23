import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { IMAGES } from '../../assets/images/ImageConstants';

export default function CustomMapMarker({
  lat,
  lng,
  map,
  onClick,
}: {
  lat: number;
  lng: number;
  map: L.Map;
  onClick?: () => void;
}) {
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    if (!map) return;
    const point = map.latLngToContainerPoint([lat, lng]);
    setPos({ left: point.x, top: point.y });
    const update = () => {
      const pt = map.latLngToContainerPoint([lat, lng]);
      setPos({ left: pt.x, top: pt.y });
    };
    map.on('move zoom', update);
    return () => {
      map.off('move zoom', update);
    };
  }, [map, lat, lng]);

  if (!pos) return null;
  return createPortal(
    <div
      style={{
        position: 'absolute',
        left: pos.left - 30,
        top: pos.top - 48,
        zIndex: 1000,
        cursor: 'pointer',
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (onClick) {
          onClick();
        }
      }}
    >
      <img src={IMAGES.CustomMarkerImg} alt='marker' width={60} height={97} />
    </div>,
    map.getContainer()
  );
}
