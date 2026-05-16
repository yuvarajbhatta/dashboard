import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clamp, haversineMeters } from '../lib/format';
import { classifySafetyEvents, emptySafetyCounters } from '../services/safety';
import type {
  Calibration,
  ChartPoint,
  GForceSample,
  GeoSample,
  OrientationSample,
  RawMotionSample,
  RawOrientationSample,
  SafetyCounters,
  SafetyEvent,
  SensorStatus,
  ThemeMode,
  TripRecord,
  TripStatus,
  UnitSystem
} from '../types/telemetry';

const HISTORY_LIMIT = 90;

interface DashboardState {
  units: UnitSystem;
  themeMode: ThemeMode;
  driveMode: boolean;
  motionPermission: SensorStatus;
  orientationPermission: SensorStatus;
  geolocationPermission: SensorStatus;
  tripStatus: TripStatus;
  startedAt: number | null;
  lastResumedAt: number | null;
  elapsedMs: number;
  distanceMeters: number;
  currentSpeedMps: number;
  averageSpeedMps: number;
  maxSpeedMps: number;
  lastGeoSample: GeoSample | null;
  motion: GForceSample;
  previousMotion: GForceSample | null;
  orientation: OrientationSample;
  rawMotion: RawMotionSample | null;
  rawOrientation: RawOrientationSample | null;
  calibration: Calibration;
  chartHistory: ChartPoint[];
  safetyScore: number;
  safetyCounters: SafetyCounters;
  safetyEvents: SafetyEvent[];
  lastSafetyEventAt: Partial<Record<keyof SafetyCounters, number>>;
  trips: TripRecord[];
  setUnits: (units: UnitSystem) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDriveMode: (enabled: boolean) => void;
  setPermission: (key: 'motionPermission' | 'orientationPermission' | 'geolocationPermission', status: SensorStatus) => void;
  startTrip: () => void;
  pauseTrip: () => void;
  resumeTrip: () => void;
  tick: () => void;
  finishTripSnapshot: () => TripRecord | null;
  setTrips: (trips: TripRecord[]) => void;
  updateGeolocation: (sample: GeoSample) => void;
  updateMotion: (sample: GForceSample, raw: RawMotionSample) => void;
  updateOrientation: (sample: OrientationSample, raw: RawOrientationSample) => void;
  calibrate: () => void;
}

const emptyMotion: GForceSample = {
  timestamp: Date.now(),
  longitudinal: 0,
  lateral: 0,
  vertical: 0,
  total: 0
};

const emptyOrientation: OrientationSample = {
  timestamp: Date.now(),
  pitch: 0,
  roll: 0,
  yaw: 0
};

const emptyCalibration: Calibration = {
  pitch: 0,
  roll: 0,
  yaw: 0,
  gLateral: 0,
  gLongitudinal: 0,
  gVertical: 0,
  calibratedAt: null
};

function tripElapsed(state: DashboardState, now = Date.now()) {
  if (state.tripStatus === 'active' && state.lastResumedAt) {
    return state.elapsedMs + (now - state.lastResumedAt);
  }
  return state.elapsedMs;
}

function makeChartPoint(state: DashboardState, sample: GForceSample): ChartPoint {
  const elapsed = Math.floor(tripElapsed(state, sample.timestamp) / 1000);
  return {
    time: `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`,
    timestamp: sample.timestamp,
    speed: state.currentSpeedMps,
    acceleration: Math.max(0, sample.longitudinal),
    braking: Math.abs(Math.min(0, sample.longitudinal)),
    cornering: Math.abs(sample.lateral),
    totalG: sample.total
  };
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      units: 'mph',
      themeMode: 'auto',
      driveMode: false,
      motionPermission: 'idle',
      orientationPermission: 'idle',
      geolocationPermission: 'idle',
      tripStatus: 'idle',
      startedAt: null,
      lastResumedAt: null,
      elapsedMs: 0,
      distanceMeters: 0,
      currentSpeedMps: 0,
      averageSpeedMps: 0,
      maxSpeedMps: 0,
      lastGeoSample: null,
      motion: emptyMotion,
      previousMotion: null,
      orientation: emptyOrientation,
      rawMotion: null,
      rawOrientation: null,
      calibration: emptyCalibration,
      chartHistory: [],
      safetyScore: 100,
      safetyCounters: emptySafetyCounters(),
      safetyEvents: [],
      lastSafetyEventAt: {},
      trips: [],
      setUnits: (units) => set({ units }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setDriveMode: (driveMode) => set({ driveMode }),
      setPermission: (key, status) => set({ [key]: status }),
      startTrip: () =>
        set({
          tripStatus: 'active',
          startedAt: Date.now(),
          lastResumedAt: Date.now(),
          elapsedMs: 0,
          distanceMeters: 0,
          averageSpeedMps: 0,
          maxSpeedMps: 0,
          chartHistory: [],
          safetyScore: 100,
          safetyCounters: emptySafetyCounters(),
          safetyEvents: [],
          lastSafetyEventAt: {},
          previousMotion: null
        }),
      pauseTrip: () => {
        const state = get();
        if (state.tripStatus !== 'active') return;
        set({ tripStatus: 'paused', elapsedMs: tripElapsed(state), lastResumedAt: null });
      },
      resumeTrip: () => {
        if (get().tripStatus !== 'paused') return;
        set({ tripStatus: 'active', lastResumedAt: Date.now() });
      },
      tick: () => {
        const state = get();
        const elapsed = tripElapsed(state);
        const averageSpeedMps = elapsed > 0 ? state.distanceMeters / (elapsed / 1000) : 0;
        set({ averageSpeedMps });
      },
      finishTripSnapshot: () => {
        const state = get();
        if (state.tripStatus === 'idle' || !state.startedAt) return null;
        const durationMs = tripElapsed(state);
        const maxGForce = Math.max(...state.chartHistory.map((point) => point.totalG), state.motion.total);
        const record: TripRecord = {
          id: crypto.randomUUID?.() ?? `${state.startedAt}-${Date.now()}`,
          date: new Date(state.startedAt).toISOString(),
          durationMs,
          distanceMeters: state.distanceMeters,
          averageSpeedMps: durationMs > 0 ? state.distanceMeters / (durationMs / 1000) : 0,
          maxSpeedMps: state.maxSpeedMps,
          maxGForce,
          safetyScore: state.safetyScore,
          hardBrakeCount: state.safetyCounters.hardBrakes,
          aggressiveTurnCount: state.safetyCounters.hardCorners,
          aggressiveAccelerationCount: state.safetyCounters.aggressiveAccelerations
        };
        set({
          tripStatus: 'idle',
          startedAt: null,
          lastResumedAt: null,
          elapsedMs: durationMs
        });
        return record;
      },
      setTrips: (trips) => set({ trips }),
      updateGeolocation: (sample) => {
        const state = get();
        let distanceMeters = state.distanceMeters;
        if (state.tripStatus === 'active' && state.lastGeoSample) {
          const meters = haversineMeters(state.lastGeoSample, sample);
          if (meters >= 0.5 && meters <= 220 && sample.accuracy <= 80) {
            distanceMeters += meters;
          }
        }
        const speedMps = sample.speedMps ?? 0;
        const maxSpeedMps = Math.max(state.maxSpeedMps, speedMps);
        const elapsed = tripElapsed(state, sample.timestamp);
        set({
          geolocationPermission: 'granted',
          lastGeoSample: sample,
          currentSpeedMps: speedMps,
          distanceMeters,
          maxSpeedMps,
          averageSpeedMps: elapsed > 0 ? distanceMeters / (elapsed / 1000) : 0
        });
      },
      updateMotion: (sample, raw) => {
        const state = get();
        const calibration = state.calibration ?? emptyCalibration;
        const calibratedSample = {
          ...sample,
          lateral: sample.lateral - (calibration.gLateral ?? 0),
          longitudinal: sample.longitudinal - (calibration.gLongitudinal ?? 0),
          vertical: sample.vertical - (calibration.gVertical ?? 0)
        };
        calibratedSample.total = Math.sqrt(
          calibratedSample.lateral * calibratedSample.lateral +
            calibratedSample.longitudinal * calibratedSample.longitudinal +
            calibratedSample.vertical * calibratedSample.vertical
        );
        const detected =
          state.tripStatus === 'active' ? classifySafetyEvents(calibratedSample, state.previousMotion, state.lastSafetyEventAt) : [];
        const safetyCounters = { ...state.safetyCounters };
        const lastSafetyEventAt = { ...state.lastSafetyEventAt };
        let safetyScore = state.safetyScore;

        detected.forEach((event) => {
          safetyCounters[event.type] += 1;
          lastSafetyEventAt[event.type] = event.timestamp;
          safetyScore = clamp(safetyScore - event.penalty, 0, 100);
        });

        const chartHistory =
          [...state.chartHistory, makeChartPoint(state, calibratedSample)].slice(-HISTORY_LIMIT);

        set({
          previousMotion: state.motion,
          motion: calibratedSample,
          rawMotion: raw,
          chartHistory,
          safetyCounters,
          lastSafetyEventAt,
          safetyScore,
          safetyEvents: [...detected, ...state.safetyEvents].slice(0, 24)
        });
      },
      updateOrientation: (sample, raw) => {
        const { calibration } = get();
        set({
          rawOrientation: raw,
          orientation: {
            ...sample,
            pitch: sample.pitch - (calibration?.pitch ?? 0),
            roll: sample.roll - (calibration?.roll ?? 0),
            yaw: sample.yaw - (calibration?.yaw ?? 0)
          }
        });
      },
      calibrate: () => {
        const state = get();
        const calibration = state.calibration ?? emptyCalibration;
        const raw = {
          pitch: state.orientation.pitch + (calibration.pitch ?? 0),
          roll: state.orientation.roll + (calibration.roll ?? 0),
          yaw: state.orientation.yaw + (calibration.yaw ?? 0),
          gLateral: state.motion.lateral + (calibration.gLateral ?? 0),
          gLongitudinal: state.motion.longitudinal + (calibration.gLongitudinal ?? 0),
          gVertical: state.motion.vertical + (calibration.gVertical ?? 0)
        };
        set({
          calibration: {
            pitch: raw.pitch,
            roll: raw.roll,
            yaw: raw.yaw,
            gLateral: raw.gLateral,
            gLongitudinal: raw.gLongitudinal,
            gVertical: raw.gVertical,
            calibratedAt: new Date().toISOString()
          }
        });
      }
    }),
    {
      name: 'tesla-sensor-dash-settings',
      partialize: (state) => ({
        units: state.units,
        themeMode: state.themeMode,
        driveMode: state.driveMode,
        calibration: state.calibration
      })
    }
  )
);
