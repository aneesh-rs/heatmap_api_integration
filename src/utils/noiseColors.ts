const DB_STOPS = [
  { max: 40, color: '#6ED4E6' },
  { max: 45, color: '#A3E37C' },
  { max: 50, color: '#E8E85B' },
  { max: 55, color: '#F5DD3B' },
  { max: 60, color: '#F7B821' },
  { max: 65, color: '#EF7E1A' },
  { max: 70, color: '#E52A1A' },
  { max: 75, color: '#FF2EEA' },
  { max: Infinity, color: '#3C3CFF' },
];

export function colorForDecibels(value: number): string {
  for (const stop of DB_STOPS) {
    if (value < stop.max) return stop.color;
  }
  return DB_STOPS[DB_STOPS.length - 1].color;
}
