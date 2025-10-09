import { useState } from 'react';
import { Polygon } from 'react-leaflet';
import useFilterDistrictStore from '../store/useFilterDistrictStore';
import { polygons1, polygons2 } from '../constants';
import { PathOptions } from 'leaflet';
import { useMapModeStore } from '../store/useMapModeStore';

export default function PolygonOverlay({
  onSelectPolygon,
}: {
  onSelectPolygon?: (id: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const {
    selectedId,
    setSelectedId,
    interestZone,
    selectedDistricts,
    toggleDistrict,
  } = useFilterDistrictStore();
  const polygons =
    interestZone === 'Neighborhoods'
      ? polygons2
      : interestZone === 'Districts'
      ? polygons1
      : [];
  const { setMode } = useMapModeStore();

  return (
    <>
      {polygons.map(({ id, positions, backgroundColor }) => {
        const isHovered = hoveredId === id;
        const isSelected = selectedId === id;

        // Extract district number from polygon ID (e.g., "district-1" -> 1)
        const districtNumber = parseInt(id.replace('district-', ''));
        const isDistrictSelected = selectedDistricts.includes(districtNumber);

        const pathOptions: PathOptions = {
          color: backgroundColor,
          fillColor: backgroundColor,
          weight: 2,
          fillOpacity: isHovered ? 0.4 : isDistrictSelected ? 0.4 : 0,
          opacity: isSelected
            ? 1
            : isDistrictSelected
            ? 0.8
            : isHovered
            ? 0.5
            : 0.2,
        };

        return (
          <Polygon
            key={id}
            positions={positions}
            pathOptions={pathOptions}
            eventHandlers={{
              mouseover: () => setHoveredId(id),
              mouseout: () => setHoveredId(null),
              click: () => {
                setSelectedId(id);
                toggleDistrict(parseInt(id.replace('district-', '')));
                if (onSelectPolygon) {
                  onSelectPolygon(id);
                  setMode('filterDistrict');
                }
              },
            }}
          />
        );
      })}
    </>
  );
}
