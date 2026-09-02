import { StreetNoiseGeoJson } from '@/store/useCloudNoiseStore';

const terrassaDemoStreets: StreetNoiseGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { street_name: 'Carrer Major', calculated_eq: 74.7 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.0168, 41.5595],
          [2.0215, 41.5598],
          [2.0262, 41.5601],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { street_name: "Rambla d'Egara", calculated_eq: 71.3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.0182, 41.5612],
          [2.0185, 41.5588],
          [2.0188, 41.5564],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { street_name: 'Carrer de la Font', calculated_eq: 63.6 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.0201, 41.5615],
          [2.0248, 41.5615],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { street_name: 'Carrer de Sant Pere', calculated_eq: 69.9 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.0225, 41.562],
          [2.0228, 41.559],
          [2.0231, 41.556],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { street_name: 'Carrer de Barcelona', calculated_eq: 67.2 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.0145, 41.5578],
          [2.0192, 41.5581],
          [2.024, 41.5584],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { street_name: 'Carrer de la Rasa', calculated_eq: 64.8 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.0255, 41.5575],
          [2.0258, 41.5605],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { street_name: 'Carrer de Montserrat', calculated_eq: 58.5 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.017, 41.5628],
          [2.0218, 41.563],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { street_name: 'Carrer de la Creu', calculated_eq: 56.3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.0198, 41.5558],
          [2.0245, 41.5561],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { street_name: 'Carrer del Nord', calculated_eq: 54.1 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.0138, 41.5608],
          [2.0135, 41.5582],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { street_name: 'Carrer de Vallparadís', calculated_eq: 70.8 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.0268, 41.5592],
          [2.0272, 41.5618],
          [2.0275, 41.5642],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { street_name: "Carrer de l'Abat Marcet", calculated_eq: 65.3 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.021, 41.5555],
          [2.0213, 41.558],
          [2.0216, 41.5605],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { street_name: 'Carrer de la Palla', calculated_eq: 61.4 },
      geometry: {
        type: 'LineString',
        coordinates: [
          [2.0155, 41.561],
          [2.0202, 41.5613],
        ],
      },
    },
  ],
};

export default terrassaDemoStreets;
