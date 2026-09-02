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
  return (
    keys.includes('street_name') &&
    keys.includes('calculated_eq') &&
    keys.includes('lat1') &&
    keys.includes('lon1') &&
    keys.includes('lat2') &&
    keys.includes('lon2')
  );
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

export function parseImportCsv(text: string): CsvImportResult {
  const records = parseCsvRecords(text);
  const headers = Object.keys(records[0] ?? {});

  if (csvLooksLikeStreetLines(headers)) {
    return { type: 'street', geojson: parseStreetCsvText(text) };
  }

  if (csvLooksLikePointData(headers)) {
    return { type: 'point', dataPoints: parsePointRows(records) };
  }

  throw new Error(
    'Unsupported CSV format. Use street columns (street_name, calculated_eq, lat1, lon1, lat2, lon2) or point columns (lat, lon, frequency, date, time).',
  );
}
