import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { MarkerCluster } from '../../utils';

interface ClusterMarkerProps {
  cluster: MarkerCluster;
  map: L.Map;
  onClick?: (cluster: MarkerCluster) => void;
}

export default function ClusterMarker({
  cluster,
  map,
  onClick,
}: ClusterMarkerProps) {
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    if (!map) return;
    const point = map.latLngToContainerPoint(cluster.position);
    setPos({ left: point.x, top: point.y });

    const update = () => {
      const pt = map.latLngToContainerPoint(cluster.position);
      setPos({ left: pt.x, top: pt.y });
    };

    map.on('move zoom', update);
    return () => {
      map.off('move zoom', update);
    };
  }, [map, cluster.position]);

  if (!pos) return null;

  // Determine cluster size and color based on count
  const getClusterStyle = (count: number) => {
    let size = 40;
    let bgColor = '#3B82F6'; // blue-500
    const textColor = 'white';

    if (count >= 100) {
      size = 70;
      bgColor = '#DC2626'; // red-600
    } else if (count >= 50) {
      size = 60;
      bgColor = '#EA580C'; // orange-600
    } else if (count >= 20) {
      size = 50;
      bgColor = '#D97706'; // amber-600
    } else if (count >= 10) {
      size = 45;
      bgColor = '#059669'; // emerald-600
    }

    return { size, bgColor, textColor };
  };

  const { size, bgColor, textColor } = getClusterStyle(cluster.count);

  return createPortal(
    <div
      style={{
        position: 'absolute',
        left: pos.left - size / 2,
        top: pos.top - size / 2,
        zIndex: 1000,
        cursor: 'pointer',
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (onClick) {
          onClick(cluster);
        }
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
          color: textColor,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: size > 50 ? '16px' : '14px',
          border: '3px solid white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          transition: 'transform 0.2s ease-in-out',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {cluster.count}
      </div>
    </div>,
    map.getContainer()
  );
}

