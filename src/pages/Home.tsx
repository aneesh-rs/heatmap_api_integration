import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { LatLngTuple, Map } from 'leaflet';
import { useAuth } from '../context/AuthContext';
import CreateReport from '../components/CreateReport';
import Settings from '../components/Settings';
import { AudioType, User } from '../types';
import CountrySelector from '../components/CountrySelector';
import { cities } from '../constants';
import ToolTip from '../components/ToolTip';
import OptionsMenu from '../components/OptionsMenu';
import NoLocationAlert from '../components/NoLocationAlert';
import { Navigate } from 'react-router-dom';
import UnauthorizedAccess from './UnauthorizedAcessPage';
import {
  formatAddress,
  getFilteredPoints,
  MarkerCluster,
  normalizeFrequency,
  reverseGeocodeWithNumber,
} from '../utils';
import LocationDetailsModal from '../components/LocationDetailsModal';
import {
  useAdminMarkersStore,
  AdminMarker,
} from '../store/useAdminMarkersStore';
import { useUserMarkersStore, UserMarker } from '../store/useUserMarkersStore';
import MarkerClusterOverlay from '../components/MarkerClusterOverlay';
import ImportDataModal from '../components/ImportDataModal';
import Filters from '../components/Filters';
import { useMapModeStore } from '../store/useMapModeStore';
import FilterDistrict from '../components/FliterDistrict';
import StreetSearchMarker from '../components/StreeSearchMarker';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import PolygonOverlay from '../components/PolygonOverlay';
import { useCityStore } from '../store/useCityStore';
import MapViewUpdater from '../components/MapViewUpdater';
import UploadedDataPoints from '../components/UploadedDataPoints';
import ZoomController from '../components/ZoomController';
import MapRef from '../components/MapRef';
import { useModalStore } from '../store/useModalStore';
import HeatmapLayer from '../components/HeatmapLayer';
import { useHeatmapStore } from '@/store/useHeatmapStore';
import useFilterDistrictStore from '@/store/useFilterDistrictStore';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface HomeProps {
  role?: User['role'];
}

type LocationReport = (AdminMarker | UserMarker) & {
  reportStatus: 'Pending' | 'New' | 'Closed';
};

export default function Home({ role = 'User' }: HomeProps) {
  const zoomInRef = useRef<() => void>(() => {});
  const zoomOutRef = useRef<() => void>(() => {});
  const mapRef = useRef<Map | null>(null);

  const { user } = useAuth();
  const { markers: adminMarkers, fetchMarkers } = useAdminMarkersStore();
  const { markers: userMarkers, fetchUserMarkers } = useUserMarkersStore();
  const {
    createReportModalOpen,
    locationDetailsModalOpen,
    setCreateReportModalOpen,
    setLocationDetailsModalOpen,
    fabOpen,
    setFabOpen,
  } = useModalStore();
  const { selectedCity, setSelectedCity } = useCityStore();
  const { selectedAudioTypes } = useFilterDistrictStore();
  const {
    mode: selectedMode,
    setMode: setSelectedMode,
    heatmapActive,
  } = useMapModeStore();
  const [tempUserMarker, setTempUserMarker] = useState<{
    position: LatLngTuple;
  } | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    lat: 0,
    lng: 0,
    address: '',
  });

  const handleStreetSelected = (location: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    // Create a temporary marker at the selected street location
    const newMarker = {
      position: [location.lat, location.lng] as LatLngTuple,
    };
    setTempUserMarker(newMarker);
    setSelectedLocation(location);
    setShowAlert(false);

    // Pan the map to the selected location
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      const targetZoom = Math.max(currentZoom, 16); // Ensure we're zoomed in enough to see the location
      mapRef.current.setView([location.lat, location.lng], targetZoom, {
        animate: true,
        duration: 0.8,
      });
    }

    // Automatically open the create report modal
    setSelectedMode('drag');
    setCreateReportModalOpen(true);
  };

  const [activeMarker, setActiveMarker] = useState<
    AdminMarker | UserMarker | null
  >(null);
  const [locationReports, setLocationReports] = useState<LocationReport[]>([]);

  const [isAddingMarker, setIsAddingMarker] = useState(true);

  const [coordinates, setCoordinates] = useState<number[][]>([]);
  const { data: heatmapDataPoints, filter } = useHeatmapStore();

  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        if (isAddingMarker && user?.role !== 'Admin' && createReportModalOpen) {
          const { lat, lng } = e.latlng;

          const newMarker = {
            position: [lat, lng] as LatLngTuple,
          };
          setTempUserMarker(newMarker);
          try {
            const data = await reverseGeocodeWithNumber(lat, lng);
            setSelectedLocation({
              lat,
              lng,
              address: formatAddress(data.address),
            });
          } catch (err) {
            console.error('Reverse geocoding failed:', err);
          }
        }
        setIsAddingMarker(true);
      },
    });
    return null;
  };

  const handleMarkerClick = (id: string) => {
    if (user?.role === 'Admin') {
      const marker = adminMarkers.find((m) => m.id === id);
      if (marker) {
        const reportsAtLocation = adminMarkers
          .filter(
            (m) =>
              m.location.lat === marker.location.lat &&
              m.location.lng === marker.location.lng
          )
          .filter((m) => m.reportStatus !== 'Closed');

        setLocationReports(reportsAtLocation);
        setActiveMarker(marker);
        setLocationDetailsModalOpen(true);
      }
    } else {
      const marker = userMarkers.find((m) => m.id === id);
      if (marker) {
        const reportsAtLocation = userMarkers
          .filter(
            (m) =>
              m.location.lat === marker.location.lat &&
              m.location.lng === marker.location.lng
          )
          .filter((m) => m.reportStatus !== 'Closed');

        setLocationReports(reportsAtLocation);
        setActiveMarker(marker);
        setLocationDetailsModalOpen(true);
      } else {
        setIsAddingMarker(false);
        setTempUserMarker(null);
      }
    }
  };

  const handleClusterClick = (cluster: MarkerCluster) => {
    if (user?.role === 'Admin') {
      // Use the first marker in the cluster as the active marker
      const firstMarker = cluster.markers[0];
      if (firstMarker) {
        // Set all markers in the cluster as location reports
        setLocationReports(cluster.markers);
        setActiveMarker(firstMarker);
        setLocationDetailsModalOpen(true);
      }
    } else {
      // For users, handle cluster clicks with their own markers
      const firstMarker = cluster.markers[0];
      if (firstMarker) {
        setLocationReports(cluster.markers);
        setActiveMarker(firstMarker);
        setLocationDetailsModalOpen(true);
      }
    }
  };

  const handleCreateModalToggle = () => {
    setSelectedMode('drag');
    setCreateReportModalOpen(true);
    setShowAlert(false);
    setFabOpen(false);
  };

  useEffect(() => {
    if (selectedMode != 'drag') {
      setFabOpen(false);
      setCreateReportModalOpen(false);
    } else {
      setCoordinates([]);
    }
  }, [selectedMode]);

  useEffect(() => {
    if (user?.role === 'Admin') {
      console.log('fetching markers');
      fetchMarkers();
    } else if (user?.id) {
      fetchUserMarkers(user.id);
    }
  }, [user?.role, user?.id]);

  if (user?.role === 'User' && role === 'Admin') {
    return <UnauthorizedAccess isOpen={true} />;
  }

  const markersToShow: (AdminMarker | UserMarker)[] =
    user?.role === 'Admin'
      ? adminMarkers
      : [
          ...userMarkers,
          ...(tempUserMarker
            ? [
                {
                  id: 'temp',
                  reportStatus: 'New' as const,
                  position: tempUserMarker.position,
                  feeling: 'happy' as const,
                  category: 'rubbish' as const,
                  reportText: '',
                  firstName: '',
                  lastName: '',
                  location: {
                    lat: tempUserMarker.position[0],
                    lng: tempUserMarker.position[1],
                    address: '',
                  },
                },
              ]
            : []),
        ];

  // Convert to [lat, lng, intensity]
  const heatmapPoints: [number, number, number][] = getFilteredPoints(
    heatmapDataPoints,
    filter.mode,
    selectedAudioTypes as AudioType[],
    { max: filter.decibelsRange.max, min: filter.decibelsRange.min }
  ).map((data) => [
    data.lat,
    data.lon,
    normalizeFrequency(data.frequency) * 100,
  ]);
  console.log('markersToShow : ', markersToShow);

  if (!user) {
    return <Navigate to={'/login'} />;
  }

  return (
    <div className='relative w-screen h-screen overflow-hidden'>
      <MapContainer
        center={selectedCity.center}
        zoom={selectedCity.zoom}
        scrollWheelZoom
        zoomControl={false}
        className='w-full h-full z-0'
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          attribution='&copy; OpenStreetMap contributors'
        />
        <HeatmapLayer points={heatmapPoints} visible={heatmapActive} />
        <MapViewUpdater center={selectedCity.center} zoom={selectedCity.zoom} />
        <MapRef onMapReady={(map) => (mapRef.current = map)} />
        {(selectedMode === 'filterDistrict' || selectedMode === 'filter') &&
          selectedCity.value === 'terrassa' && (
            <PolygonOverlay
              onSelectPolygon={(id) => console.log('Selected polygon:', id)}
            />
          )}
        {selectedMode === 'import' && (
          <UploadedDataPoints points={coordinates as LatLngTuple[]} />
        )}

        <MapClickHandler />
        <MarkerClusterOverlay
          markers={markersToShow}
          onMarkerClick={handleMarkerClick}
          onClusterClick={handleClusterClick}
        />

        {/* Street Search Marker */}
        <StreetSearchMarker />

        <ZoomController
          onZoomReady={(inFn, outFn) => {
            zoomInRef.current = inFn;
            zoomOutRef.current = outFn;
          }}
        />
      </MapContainer>

      <OptionsMenu
        fabOpen={fabOpen}
        handleCreateModalToggle={handleCreateModalToggle}
        setFabOpen={setFabOpen as Dispatch<SetStateAction<boolean>>}
      />

      <ToolTip
        zoomIn={() => zoomInRef.current()}
        zoomOut={() => zoomOutRef.current()}
      />
      <CountrySelector
        cities={cities}
        selectedCity={selectedCity}
        setSelectedCity={(city) => {
          if (city) {
            setSelectedCity(city);
          }
        }}
      />
      <NoLocationAlert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        onSelectLocation={() => setShowAlert(false)}
        onStreetSelected={handleStreetSelected}
      />
      <CreateReport
        isOpen={createReportModalOpen}
        setIsOpen={setCreateReportModalOpen}
        initialLocation={selectedLocation}
        onReportCreated={() => {
          if (user?.id && user?.role !== 'Admin') {
            fetchUserMarkers(user.id);
          }
          setTempUserMarker(null);
        }}
      />
      {activeMarker && (
        <LocationDetailsModal
          isOpen={locationDetailsModalOpen}
          onClose={() => setLocationDetailsModalOpen(false)}
          marker={activeMarker}
          locationReports={locationReports}
        />
      )}
      <Settings />
      <ImportDataModal />
      <Filters />
      <FilterDistrict />
    </div>
  );
}
