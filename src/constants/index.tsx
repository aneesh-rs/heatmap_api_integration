import { LatLngTuple } from 'leaflet';
import { City, PolygonData, Position } from '../types';
import {
  FaTrash,
  FaExclamationCircle,
  FaCar,
  FaRegSmile,
  FaRegMeh,
} from 'react-icons/fa';
import { ImConfused } from 'react-icons/im';
import { PiSmileyAngry, PiSmileySadBold } from 'react-icons/pi';
import { BiDizzy } from 'react-icons/bi';
import { LuSprayCan } from 'react-icons/lu';
import districtData from './polygons_districts.json';
import citiesData from './polygons_cities.json';
import heatmapDummy from './heatmap_dummy.json';

export const cities: City[] = [
  {
    value: 'terrassa',
    label: 'Terrassa',
    center: [41.55813768079716, 2.0222417316047085] as LatLngTuple,
    zoom: 13,
  },
  {
    value: 'barcelona',
    label: 'Barcelona',
    center: [41.390205, 2.154007] as LatLngTuple,
    zoom: 13,
  },
  {
    value: 'paris',
    label: 'Paris',
    center: [48.8566, 2.3522] as LatLngTuple,
    zoom: 13,
  },
  {
    value: 'berlin',
    label: 'Berlin',
    center: [52.52, 13.405] as LatLngTuple,
    zoom: 13,
  },
  {
    value: 'london',
    label: 'London',
    center: [51.5074, -0.1278] as LatLngTuple,
    zoom: 13,
  },
];

export const categories = [
  {
    id: 'rubbish',
    icon: <FaTrash size={16} />,
    label: 'Categories.rubbish',
  },
  {
    id: 'vandalism',
    icon: <LuSprayCan size={16} />,
    label: 'Categories.vandalism',
  },
  {
    id: 'hazard',
    icon: <FaExclamationCircle size={16} />,
    label: 'Categories.hazard',
  },
  {
    id: 'traffic',
    icon: <FaCar size={16} />,
    label: 'Categories.traffic',
  },
  {
    id: 'others',
    icon: <FaExclamationCircle size={16} />,
    label: 'Categories.others',
  },
];

export const feelings = [
  { id: 'happy', icon: <FaRegSmile size={24} strokeWidth={5} /> },
  { id: 'neutral', icon: <FaRegMeh size={24} strokeWidth={5} /> },
  { id: 'confused', icon: <ImConfused size={24} strokeWidth={0.3} /> },
  { id: 'sad', icon: <PiSmileySadBold size={28} strokeWidth={0.6} /> },
  { id: 'angry', icon: <PiSmileyAngry size={28} strokeWidth={5} /> },
  { id: 'surprised', icon: <BiDizzy size={28} strokeWidth={0.3} /> },
];

export const polygons1: PolygonData[] = districtData.features.map(
  (feature, index: number) => {
    // Extract the coordinates
    const positions = feature.geometry.coordinates[0][0].map(
      (position: number[]): Position => {
        return [position[1], position[0]]; // Reverse the coordinate pair
      }
    );
    // Return the transformed data
    return {
      id: `district-${index + 1}`,
      positions,
      population: feature.properties.POPULATION, // Random population
      areaKm2: parseFloat((Math.random() * 9 + 1).toFixed(2)), // Random area
      backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
    };
  }
);

export const polygons2: PolygonData[] = citiesData.features.map(
  (feature, index: number) => {
    // Extract the coordinates
    const positions = feature.geometry.coordinates[0].map(
      (position: number[]): Position => {
        return [position[1], position[0]]; // Reverse the coordinate pair
      }
    );
    // Return the transformed data
    return {
      id: `district-${index + 1}`,
      positions,
      population: Math.floor(Math.random() * 30000) + 20000, // Random population
      areaKm2: parseFloat((Math.random() * 9 + 1).toFixed(2)), // Random area
      backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
    };
  }
);

export const heatmapDummyData = heatmapDummy.coordinates;
