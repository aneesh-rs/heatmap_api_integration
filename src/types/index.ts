import { LatLngExpression, LatLngTuple } from 'leaflet';

export type Roles = 'Admin' | 'User';

export type MapMode =
  | 'drag'
  | 'chart'
  | 'settings'
  | 'import'
  | 'filter'
  | 'filterDistrict';

export type Feeling =
  | 'happy'
  | 'neutral'
  | 'confused'
  | 'sad'
  | 'angry'
  | 'surprised';

export type Category =
  | 'rubbish'
  | 'vandalism'
  | 'hazard'
  | 'traffic'
  | 'others';

export type ReportStatus = 'Pending' | 'New' | 'Closed';

export type City = {
  label: string;
  value: string;
  center: LatLngTuple;
  zoom: number;
};

export interface User {
  id: string;
  role: Roles;
  email: string;
  birthday: string;
  name: string;
  firstSurname: string;
  secondSurname: string;
  photoURL?: string;
}

export interface ReportFormData {
  feeling: Feeling;
  category: Category;
  reportText: string;
  firstName: string;
  lastName: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface ReportData extends ReportFormData {
  id: string;
  userId: string;
  createdAt: Date;
  reportStatus: ReportStatus;
}

export interface PolygonData {
  id: string;
  positions: LatLngExpression[];
  population: number;
  areaKm2: number;
  backgroundColor?: string;
}

// Define the type for a coordinate pair
export type Position = [number, number];

// Define the type for a polygon's coordinates
export type PolygonCoordinates = Position[][];

// Define the type for the geometry part of the feature
export type PolygonGeometry = {
  type: string;
  coordinates: number[][][];
};

// Define the type for the properties part of the feature
// Adjust the properties according to your actual data structure
export type FeatureProperties = {
  // Example properties; replace with actual properties from your JSON
  fid: number;
  AREA: number;
  PERIMETER: number;
  PT_BARRI_: number;
  PT_BARRI_I: number;
  BARRI: string;
  NOM_BARRI: string;
  NOM_BARRI_: string;
};

// Define the type for a single feature
export type Feature = {
  type: string;
  properties: FeatureProperties;
  geometry: PolygonGeometry;
};

// Define the type for the entire GeoJSON structure
export type GeoJSONFeatureCollection = {
  type: 'FeatureCollection';
  features: Feature[];
};

export type UsageData = {
  name: string;
  '2021': number;
  '2022': number;
  '2023': number;
  '2024': number;
};

export interface DataPoint {
  lat: number;
  lon: number;
  frequency: number;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  timestamp: string; // ISO string
  audioType: AudioType;
}
export type FilterMode = 'all' | 'day' | 'night' | 'custom';

export type AudioType =
  | 'plane'
  | 'bicycle'
  | 'wind'
  | 'car'
  | 'alarm'
  | 'pets'
  | 'rain'
  | 'bells'
  | 'humans'
  | 'music'
  | 'bird'
  | 'motorcycle'
  | 'tools'
  | 'sirens'
  | 'truck'
  | 'trains'
  | 'boat'
  | 'thunderstorm'
  | 'fireworks'
  | 'gunshots'
  | 'water'
  | 'All';
