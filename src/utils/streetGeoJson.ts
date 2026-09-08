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
  extra: Record<string, unknown> = {},
): StreetNoiseGeoJson['features'][number] {
  return {
    type: 'Feature',
    properties: {
      street_name: streetName,
      calculated_eq: calculatedEq,
      ...extra,
    },
    geometry: {
      type: 'LineString',
      coordinates,
    },
  };
}

/** Parse coordinates cell: JSON [[lon,lat],...] or WKT LINESTRING(lon lat, ...) */
export function parseCoordinatesCell(raw: unknown): [number, number][] | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const text = String(raw).trim();
  if (!text) return null;

  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (!Array.isArray(parsed) || parsed.length < 2) return null;
      const coords: [number, number][] = [];
      for (const pair of parsed) {
        if (!Array.isArray(pair) || pair.length < 2) return null;
        const lon = Number(pair[0]);
        const lat = Number(pair[1]);
        if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
        coords.push([lon, lat]);
      }
      return coords.length >= 2 ? coords : null;
    } catch {
      return null;
    }
  }

  const wkt = text.match(/^LINESTRING\s*\((.+)\)$/i);
  if (wkt) {
    const coords: [number, number][] = [];
    for (const part of wkt[1].split(',')) {
      const [lonRaw, latRaw] = part.trim().split(/\s+/);
      const lon = parseNumber(lonRaw);
      const lat = parseNumber(latRaw);
      if (lon === null || lat === null) return null;
      coords.push([lon, lat]);
    }
    return coords.length >= 2 ? coords : null;
  }

  return null;
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
      'Invalid street GeoJSON. Expected FeatureCollection with LineString features (street_name, calculated_eq).',
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

function rowToStreetFeature(
  record: Record<string, string | number>,
): StreetNoiseGeoJson['features'][number] | null {
  const normalized = Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key.toLowerCase(), value]),
  );

  const streetName = String(
    normalized.street_name ??
      normalized.streetname ??
      normalized.street ??
      'Street',
  );
  const calculatedEq = parseNumber(
    normalized.calculated_eq ??
      normalized.noisevalue ??
      normalized.frequency ??
      normalized.db,
  );
  if (calculatedEq === null) return null;

  const fromCoordinates = parseCoordinatesCell(
    normalized.coordinates ?? normalized.geometry ?? normalized.wkt,
  );
  if (fromCoordinates) {
    return lineFeature(streetName, calculatedEq, fromCoordinates, {
      segment_index: parseNumber(normalized.segment_index) ?? undefined,
    });
  }

  const lon1 = parseNumber(normalized.lon1 ?? normalized.start_lon ?? normalized.lon);
  const lat1 = parseNumber(normalized.lat1 ?? normalized.start_lat ?? normalized.lat);
  const lon2 = parseNumber(normalized.lon2 ?? normalized.end_lon);
  const lat2 = parseNumber(normalized.lat2 ?? normalized.end_lat);

  if (lon1 === null || lat1 === null || lon2 === null || lat2 === null) {
    return null;
  }

  return lineFeature(streetName, calculatedEq, [
    [lon1, lat1],
    [lon2, lat2],
  ]);
}

export function parseStreetCsvText(text: string): StreetNoiseGeoJson {
  const records = parseCsvRecords(text);
  const features = records
    .map((record) => rowToStreetFeature(record))
    .filter(
      (feature): feature is StreetNoiseGeoJson['features'][number] =>
        feature !== null,
    );

  if (!features.length) {
    throw new Error(
      'Could not parse street CSV. Prefer GeoJSON, or CSV with street_name, calculated_eq, coordinates (JSON [[lon,lat],...]). Legacy: lat1,lon1,lat2,lon2.',
    );
  }

  return { type: 'FeatureCollection', features };
}

export function parseStreetWorkbookRows(
  rows: Record<string, string | number>[],
): StreetNoiseGeoJson {
  const features = rows
    .map((row) => rowToStreetFeature(row))
    .filter(
      (feature): feature is StreetNoiseGeoJson['features'][number] =>
        feature !== null,
    );

  if (!features.length) {
    throw new Error(
      'Spreadsheet has no street rows. Use street_name, calculated_eq, coordinates — or lat1,lon1,lat2,lon2.',
    );
  }

  return { type: 'FeatureCollection', features };
}

export function workbookLooksLikeStreetLines(
  rows: Record<string, string | number>[],
): boolean {
  if (!rows.length) return false;
  const keys = Object.keys(rows[0]).map((key) => key.toLowerCase());
  const hasIdentity =
    keys.includes('street_name') && keys.includes('calculated_eq');
  const hasCoords =
    keys.includes('coordinates') ||
    keys.includes('geometry') ||
    keys.includes('wkt') ||
    (keys.includes('lat1') &&
      keys.includes('lon1') &&
      keys.includes('lat2') &&
      keys.includes('lon2'));
  return hasIdentity && hasCoords;
}
