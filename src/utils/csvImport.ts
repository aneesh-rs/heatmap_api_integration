import { AudioType, DataPoint } from '@/types';
import { StreetNoiseGeoJson } from '@/store/useCloudNoiseStore';
import { parseCsvRecords } from '@/utils/csvParse';
import { parseStreetCsvText } from '@/utils/streetGeoJson';

export type CsvImportResult =
  | { type: 'street'; geojson: StreetNoiseGeoJson }
  | { type: 'point'; dataPoints: DataPoint[] };

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function csvLooksLikeStreetLines(headers: string[]): boolean {
  const keys = headers.map((header) => header.toLowerCase());
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

/** If street_name present, never treat as point heatmap (avoids accidental circles). */
export function csvLooksLikeStreetHint(headers: string[]): boolean {
  const keys = headers.map((header) => header.toLowerCase());
  return keys.includes('street_name') || keys.includes('calculated_eq');
}

export function csvLooksLikePointData(headers: string[]): boolean {
  const keys = headers.map((header) => header.toLowerCase());
  return (
    keys.includes('lat') &&
    keys.includes('lon') &&
    keys.includes('frequency') &&
    keys.includes('date') &&
    keys.includes('time')
  );
}

export function parsePointRows(
  rows: Record<string, string | number>[],
): DataPoint[] {
  const dataPoints: DataPoint[] = [];

  for (const row of rows) {
    const normalized = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]),
    );

    const lat = parseNumber(normalized.lat);
    const lon = parseNumber(normalized.lon);
    const frequency = parseNumber(normalized.frequency);
    const date = String(normalized.date ?? '');
    const time = String(normalized.time ?? '');
    const audioType = String(normalized.audiotype ?? normalized.audio_type ?? 'All');

    if (lat === null || lon === null || frequency === null || !date || !time) {
      continue;
    }

    dataPoints.push({
      lat,
      lon,
      frequency,
      date,
      time,
      timestamp: new Date(`${date}T${time}`).toISOString(),
      audioType: (audioType || 'All') as AudioType,
    });
  }

  if (!dataPoints.length) {
    throw new Error(
      'No valid point rows found. Use columns: lat, lon, frequency, date, time, audioType',
    );
  }

  return dataPoints;
}

export function parsePointCsvText(text: string): DataPoint[] {
  return parsePointRows(parseCsvRecords(text));
}

const STREET_ONLY_HINT =
  'Manual upload is street-line only (no circles). Use sample_street_heatmap.geojson, or CSV with street_name, calculated_eq, coordinates (JSON [[lon,lat],...]). Point CSV (lat,lon,frequency) draws dots and is blocked here.';

export function parseImportCsv(text: string): CsvImportResult {
  const records = parseCsvRecords(text);
  const headers = Object.keys(records[0] ?? {});

  if (csvLooksLikeStreetLines(headers)) {
    return { type: 'street', geojson: parseStreetCsvText(text) };
  }

  if (csvLooksLikeStreetHint(headers)) {
    throw new Error(
      'Street CSV detected but missing geometry. Use sample_street_heatmap.geojson, or CSV columns street_name, calculated_eq, coordinates (JSON [[lon,lat],...]).',
    );
  }

  if (csvLooksLikePointData(headers)) {
    throw new Error(STREET_ONLY_HINT);
  }

  throw new Error(STREET_ONLY_HINT);
}
