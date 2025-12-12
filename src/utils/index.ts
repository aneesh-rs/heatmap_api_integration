import { LatLngTuple } from 'leaflet';
import { AdminMarker } from '../store/useAdminMarkersStore';
import { AudioType, DataPoint, FilterMode } from '@/types';

export const reverseGeocode = async (lat: number, lon: number) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
  );
  if (!response.ok) throw new Error('Failed to reverse geocode');
  const data = await response.json();
  return data;
};

export const reverseGeocodeWithNumber = async (lat: number, lon: number) => {
  const nominatim = await reverseGeocode(lat, lon);
  let houseNumber = nominatim?.address?.house_number || null;

  if (!houseNumber) {
    houseNumber = await getNearestHouseNumber(lat, lon);
  }

  return {
    address: {
      displayName: nominatim.display_name,
      road: nominatim.address?.road,
      houseNumber,
      city: nominatim.address?.city,
      postcode: nominatim.address?.postcode,
      country: nominatim.address?.country,
    },
  };
};

export const getNearestHouseNumber = async (lat: number, lon: number) => {
  const query = `
    [out:json];
    (
      way(around:50,${lat},${lon})["addr:housenumber"]["addr:interpolation"];
      node(around:50,${lat},${lon})["addr:housenumber"]["addr:interpolation"];
    );
    out center 1;
  `;
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  if (!response.ok) throw new Error('Failed to query Overpass');
  const data = await response.json();

  if (data.elements.length > 0) {
    return data.elements[0].tags['addr:housenumber'];
  }
  return null;
};

export const getPossibleLocations = async (address: string) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${address}&format=json`
  );
  if (!response.ok) throw new Error('Failed to get possible locations');
  const data = await response.json();
  return data;
};

type Address = {
  amenity?: string;
  road?: string;
  neighbourhood?: string;
  postcode?: string;
  town?: string;
  municipality?: string;
  county?: string;
  country?: string;
  houseNumber?: string;
};

export const formatAddress = (data: Address): string => {
  const {
    amenity,
    road,
    neighbourhood,
    postcode,
    town,
    municipality,
    county,
    country,
    houseNumber,
  } = data;

  return [
    houseNumber,
    amenity,
    road,
    neighbourhood,
    [postcode, town || municipality].filter(Boolean).join(' '),
    county,
    country,
  ]
    .filter(Boolean)
    .join(', ');
};

export interface MarkerCluster {
  id: string;
  position: LatLngTuple;
  markers: AdminMarker[];
  count: number;
}

/**
 * Calculate the distance between two points in meters using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Get clustering distance threshold based on zoom level
 */
export const getClusterDistance = (zoom: number): number => {
  if (zoom <= 10) return 5000;
  if (zoom <= 12) return 2000;
  if (zoom <= 14) return 1000;
  if (zoom <= 16) return 500;
  return 100;
};

/**
 * Group markers into clusters based on proximity and zoom level
 */
export const clusterMarkers = (
  markers: AdminMarker[],
  zoom: number
): (AdminMarker | MarkerCluster)[] => {
  if (markers.length === 0) return [];

  const clusterDistance = getClusterDistance(zoom);
  const clusters: MarkerCluster[] = [];
  const processedMarkers = new Set<string>();
  const result: (AdminMarker | MarkerCluster)[] = [];

  markers.forEach((marker) => {
    if (processedMarkers.has(marker.id)) return;

    const nearbyMarkers = markers.filter((otherMarker) => {
      if (
        processedMarkers.has(otherMarker.id) ||
        marker.id === otherMarker.id
      ) {
        return false;
      }

      const distance = calculateDistance(
        marker.position[0],
        marker.position[1],
        otherMarker.position[0],
        otherMarker.position[1]
      );

      return distance <= clusterDistance;
    });

    if (nearbyMarkers.length > 0) {
      const clusterMarkers = [marker, ...nearbyMarkers];

      const centerLat =
        clusterMarkers.reduce((sum, m) => sum + m.position[0], 0) /
        clusterMarkers.length;
      const centerLng =
        clusterMarkers.reduce((sum, m) => sum + m.position[1], 0) /
        clusterMarkers.length;

      const cluster: MarkerCluster = {
        id: `cluster-${marker.id}`,
        position: [centerLat, centerLng],
        markers: clusterMarkers,
        count: clusterMarkers.length,
      };

      clusters.push(cluster);
      result.push(cluster);

      clusterMarkers.forEach((m) => processedMarkers.add(m.id));
    } else {
      result.push(marker);
      processedMarkers.add(marker.id);
    }
  });

  return result;
};

/**
 * Check if an item is a cluster
 */
export const isCluster = (
  item: AdminMarker | MarkerCluster
): item is MarkerCluster => {
  return 'count' in item && 'markers' in item;
};

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export const isPointInPolygon = (
  point: [number, number],
  polygon: [number, number][]
): boolean => {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
};

/**
 * Get the district number for a given coordinate
 */
export const getDistrictForCoordinate = (
  lat: number,
  lng: number,
  polygons: { id: string; positions: any[] }[]
): number | null => {
  for (const polygon of polygons) {
    const positions = polygon.positions.map((pos: any) => {
      if (Array.isArray(pos)) {
        return [pos[1], pos[0]];
      }
      return [pos.lng, pos.lat];
    }) as [number, number][];

    if (isPointInPolygon([lng, lat], positions)) {
      const districtNumber = parseInt(polygon.id.replace('district-', ''));
      return districtNumber;
    }
  }
  return null;
};

export const normalizeFrequency = (freq: number, min = 40, max = 120) =>
  Math.min(1, Math.max(0, (freq - min) / (max - min)));

export const getFilteredPoints = (
  data: DataPoint[],
  filterMode: FilterMode,
  audioTypes: AudioType[],
  decibelsRange: {
    min: number;
    max: number;
  }
) => {
  const normalizeTime = (p: DataPoint) => new Date(p.timestamp).getHours();

  let filtered = data;

  if (filterMode === 'day') {
    filtered = filtered.filter((p) => {
      const hour = normalizeTime(p);
      return hour >= 6 && hour < 18;
    });
  } else if (filterMode === 'night') {
    filtered = filtered.filter((p) => {
      const hour = normalizeTime(p);
      return hour < 6 || hour >= 18;
    });
  }

  filtered = filtered.filter(
    (noise) =>
      noise.frequency > decibelsRange.min && noise.frequency < decibelsRange.max
  );

  if (audioTypes.includes('All')) {
    return filtered;
  } else if (audioTypes && audioTypes.length > 0) {
    filtered = filtered.filter((p) => audioTypes!.includes(p.audioType));
  }

  return filtered;
};

export function cleanGradient(
  rawGrad: Record<string | number, string> | undefined
) {
  if (!rawGrad)
    return {
      0: '#1D70A2',
      0.3: '#5BC0EB',
      0.6: '#F1C40F',
      0.85: '#E67E22',
      1: '#8B0000',
    };

  // Convert keys to numbers and sort ascending
  const entries = Object.entries(rawGrad)
    .map(([k, v]) => [Number(k), v] as [number, string])
    .filter(([k]) => !Number.isNaN(k))
    .sort((a, b) => a[0] - b[0]);

  if (entries.length === 0)
    return {
      0: '#1D70A2',
      0.3: '#5BC0EB',
      0.6: '#F1C40F',
      0.85: '#E67E22',
      1: '#8B0000',
    };

  // Ensure first key is 0
  if (entries[0][0] > 0) entries.unshift([0, entries[0][1]]);

  // Ensure last key is 1 (if not, duplicate last color at 1)
  const last = entries[entries.length - 1];
  if (last[0] < 1) entries.push([1, last[1]]);

  // Build object with numeric-ish keys (leaflet.heat accepts object)
  const cleaned: Record<number, string> = {};
  for (const [k, v] of entries) cleaned[Number(k.toFixed(6))] = v;
  return cleaned;
}
