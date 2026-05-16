import { formatDuration, intervalToDuration } from 'date-fns';
import type { UnitSystem } from '../types/telemetry';

const MPS_TO_MPH = 2.2369362921;
const MPS_TO_KMH = 3.6;
const METERS_TO_MILES = 0.000621371192;
const METERS_TO_KM = 0.001;

export function speedFromMps(speedMps: number, units: UnitSystem) {
  return speedMps * (units === 'mph' ? MPS_TO_MPH : MPS_TO_KMH);
}

export function distanceFromMeters(distanceMeters: number, units: UnitSystem) {
  return distanceMeters * (units === 'mph' ? METERS_TO_MILES : METERS_TO_KM);
}

export function speedLabel(units: UnitSystem) {
  return units === 'mph' ? 'MPH' : 'KM/H';
}

export function distanceLabel(units: UnitSystem) {
  return units === 'mph' ? 'MI' : 'KM';
}

export function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

export function formatLongDuration(ms: number) {
  const duration = intervalToDuration({ start: 0, end: Math.max(0, ms) });
  return (
    formatDuration(duration, {
      format: ['hours', 'minutes'],
      zero: false,
      delimiter: ' '
    }) || 'under 1 minute'
  );
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 1) {
  const power = 10 ** digits;
  return Math.round(value * power) / power;
}

export function haversineMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const radius = 6371000;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const deltaLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const deltaLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinLat = Math.sin(deltaLat / 2);
  const sinLon = Math.sin(deltaLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
