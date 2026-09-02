import { StreetNoiseGeoJson } from '@/store/useCloudNoiseStore';
import { parseCsvRecords } from '@/utils/csvParse';

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function lineFeature(
  streetName: string,
  calculatedEq: number,
  coordinates: [number, number][],
): StreetNoiseGeoJson['features'][number] {
  return {
    type: 'Feature',
    properties: {
      street_name: streetName,
      calculated_eq: calculatedEq,
    },
    geometry: {
      type: 'LineString',
      coordinates,
    },
  };
}

export function isStreetGeoJson(value: unknown): value is StreetNoiseGeoJson {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as StreetNoiseGeoJson;
  if (candidate.type !== 'FeatureCollection' || !Array.isArray(candidate.features)) {
    return false;
  }

  return candidate.features.some(
    (feature) =>
      feature?.geometry?.type === 'LineString' &&
      Array.isArray(feature.geometry.coordinates) &&
      feature.geometry.coordinates.length >= 2,
  );
}

export function normalizeStreetGeoJson(value: unknown): StreetNoiseGeoJson {
  if (!isStreetGeoJson(value)) {
    throw new Error(
      'Invalid street GeoJSON. Expected FeatureCollection with LineString features.',
    );
  }

  const features = value.features
    .filter((feature) => feature.geometry?.type === 'LineString')
    .map((feature) => {
      const props = feature.properties ?? {};
      return {
        ...feature,
        properties: {
          ...props,
          street_name: String(
            props.street_name ?? props.streetName ?? 'Street',
          ),
          calculated_eq: Number(
            props.calculated_eq ?? props.noiseValue ?? props.frequency ?? 0,
          ),
        },
      };
    }) as StreetNoiseGeoJson['features'];

  if (!features.length) {
    throw new Error('No LineString street features found in GeoJSON.');
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function parseStreetGeoJsonText(text: string): StreetNoiseGeoJson {
  return normalizeStreetGeoJson(JSON.parse(text));
}

export function parseStreetCsvText(text: string): StreetNoiseGeoJson {
  const records = parseCsvRecords(text);
  const features: StreetNoiseGeoJson['features'] = [];

  for (const record of records) {
    const streetName =
      record.street_name || record.streetname || record.street || 'Street';
    const calculatedEq = parseNumber(
      record.calculated_eq ?? record.noisevalue ?? record.frequency ?? record.db,
    );

    const lon1 = parseNumber(record.lon1 ?? record.start_lon ?? record.lon);
    const lat1 = parseNumber(record.lat1 ?? record.start_lat ?? record.lat);
    const lon2 = parseNumber(record.lon2 ?? record.end_lon);
    const lat2 = parseNumber(record.lat2 ?? record.end_lat);

    if (
      calculatedEq === null ||
      lon1 === null ||
      lat1 === null ||
      lon2 === null ||
      lat2 === null
    ) {
      continue;
    }

    features.push(
      lineFeature(streetName, calculatedEq, [
        [lon1, lat1],
        [lon2, lat2],
      ]),
    );
  }

  if (!features.length) {
    throw new Error(
      'Could not parse street CSV. Use columns: street_name, calculated_eq, lat1, lon1, lat2, lon2',
    );
  }

  return { type: 'FeatureCollection', features } as StreetNoiseGeoJson;
}

export function parseStreetWorkbookRows(
  rows: Record<string, string | number>[],
): StreetNoiseGeoJson {
  const features: StreetNoiseGeoJson['features'] = [];

  for (const row of rows) {
    const normalized = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]),
    );

    const streetName = String(
      normalized.street_name ?? normalized.streetname ?? normalized.street ?? 'Street',
    );
    const calculatedEq = parseNumber(
      normalized.calculated_eq ?? normalized.noisevalue ?? normalized.frequency,
    );
    const lon1 = parseNumber(normalized.lon1 ?? normalized.start_lon);
    const lat1 = parseNumber(normalized.lat1 ?? normalized.start_lat);
    const lon2 = parseNumber(normalized.lon2 ?? normalized.end_lon);
    const lat2 = parseNumber(normalized.lat2 ?? normalized.end_lat);

    if (
      calculatedEq === null ||
      lon1 === null ||
      lat1 === null ||
      lon2 === null ||
      lat2 === null
    ) {
      continue;
    }

    features.push(
      lineFeature(streetName, calculatedEq, [
        [lon1, lat1],
        [lon2, lat2],
      ]),
    );
  }

  if (!features.length) {
    throw new Error(
      'Spreadsheet has no street rows. For line heatmap use: street_name, calculated_eq, lat1, lon1, lat2, lon2',
    );
  }

  return { type: 'FeatureCollection', features } as StreetNoiseGeoJson;
}

export function workbookLooksLikeStreetLines(
  rows: Record<string, string | number>[],
): boolean {
  if (!rows.length) return false;
  const keys = Object.keys(rows[0]).map((key) => key.toLowerCase());
  return (
    keys.includes('street_name') &&
    keys.includes('calculated_eq') &&
    keys.includes('lat1') &&
    keys.includes('lon1') &&
    keys.includes('lat2') &&
    keys.includes('lon2')
  );
}
