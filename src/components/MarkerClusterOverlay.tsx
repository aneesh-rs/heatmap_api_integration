import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { AdminMarker } from '../store/useAdminMarkersStore';
import { clusterMarkers, MarkerCluster, isCluster } from '../utils';
import CustomMapMarker from './ui/Marker';
import ClusterMarker from './ui/ClusterMarker';
import useFilterDistrictStore from '../store/useFilterDistrictStore';
import { polygons1, polygons2 } from '../constants';
import { getDistrictForCoordinate } from '../utils';
import { PolygonData } from '../types';

interface MarkerClusterOverlayProps {
  markers: AdminMarker[];
  onMarkerClick: (id: string) => void;
  onClusterClick: (cluster: MarkerCluster) => void;
}

export default function MarkerClusterOverlay({
  markers,
  onMarkerClick,
  onClusterClick,
}: MarkerClusterOverlayProps) {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());
  const [clusteredItems, setClusteredItems] = useState<(AdminMarker | MarkerCluster)[]>([]);
  const { selectedDistricts, interestZone } = useFilterDistrictStore();
  const polygons: PolygonData[] = interestZone === 'City' ? polygons2 : polygons1;

  // Update zoom level when map zoom changes
  useEffect(() => {
    const handleZoomEnd = () => {
      setCurrentZoom(map.getZoom());
    };

    map.on('zoomend', handleZoomEnd);
    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map]);

  // Recalculate clusters when markers, zoom level, or selected districts change
  useEffect(() => {
    let filteredMarkers = markers.filter((m) => m.reportStatus !== 'Closed');
    
    // Filter markers based on selected districts only if districts are selected
    if (selectedDistricts.length > 0) {
      filteredMarkers = filteredMarkers.filter((marker) => {
        const districtNumber = getDistrictForCoordinate(
          marker.position[0],
          marker.position[1],
          polygons
        );
        return districtNumber !== null && selectedDistricts.includes(districtNumber);
      });
    }
    // If no districts are selected, show all markers (filteredMarkers remains unchanged)
    
    const clustered = clusterMarkers(filteredMarkers, currentZoom);
    setClusteredItems(clustered);
  }, [markers, currentZoom, selectedDistricts, interestZone, polygons]);

  return (
    <>
      {clusteredItems.map((item) => {
        if (isCluster(item)) {
          // Render cluster marker
          return (
            <ClusterMarker
              key={item.id}
              cluster={item}
              map={map}
              onClick={onClusterClick}
            />
          );
        } else {
          // Render individual marker
          return (
            <CustomMapMarker
              key={item.id}
              lat={item.position[0]}
              lng={item.position[1]}
              map={map}
              onClick={() => onMarkerClick(item.id)}
            />
          );
        }
      })}
    </>
  );
}
