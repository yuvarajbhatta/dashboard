export type UnitSystem = 'mph' | 'kmh';
export type ThemeMode = 'auto' | 'day' | 'night';
export type SensorStatus = 'idle' | 'prompt' | 'granted' | 'denied' | 'unsupported';
export type TripStatus = 'idle' | 'active' | 'paused';

export interface GeoSample {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speedMps: number | null;
  nativeSpeedMps: number | null;
  derivedSpeedMps: number | null;
  timestamp: number;
}

export interface GForceSample {
  timestamp: number;
  longitudinal: number;
  lateral: number;
  vertical: number;
  total: number;
}

export interface OrientationSample {
  timestamp: number;
  pitch: number;
  roll: number;
  yaw: number;
}

export interface Vector3 {
  x: number | null;
  y: number | null;
  z: number | null;
}

export interface RotationRateSample {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

export interface RawMotionSample {
  timestamp: number;
  acceleration: Vector3;
  accelerationIncludingGravity: Vector3;
  rotationRate: RotationRateSample;
  interval: number | null;
  screenAngle: number;
}

export interface RawOrientationSample {
  timestamp: number;
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  webkitCompassHeading: number | null;
}

export interface SafetyCounters {
  hardBrakes: number;
  aggressiveAccelerations: number;
  hardCorners: number;
  suddenSwerves: number;
  shockSpikes: number;
  instability: number;
}

export interface SafetyEvent {
  id: string;
  type: keyof SafetyCounters;
  label: string;
  penalty: number;
  value: number;
  timestamp: number;
}

export interface TripRecord {
  id: string;
  date: string;
  durationMs: number;
  distanceMeters: number;
  averageSpeedMps: number;
  maxSpeedMps: number;
  maxGForce: number;
  safetyScore: number;
  hardBrakeCount: number;
  aggressiveTurnCount: number;
  aggressiveAccelerationCount: number;
}

export interface Calibration {
  pitch: number;
  roll: number;
  yaw: number;
  gLateral: number;
  gLongitudinal: number;
  gVertical: number;
  calibratedAt: string | null;
}

export interface ChartPoint {
  time: string;
  timestamp: number;
  speed: number;
  acceleration: number;
  braking: number;
  cornering: number;
  totalG: number;
}
