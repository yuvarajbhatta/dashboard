import { useEffect, useMemo, useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

function directionFromDegrees(degrees: number | null) {
  if (degrees === null) return 'Waiting';
  const normalized = ((degrees % 360) + 360) % 360;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(normalized / 45) % directions.length];
}

export function useTelemetryView() {
  const [now, setNow] = useState(Date.now());
  const units = useDashboardStore((state) => state.units);
  const tripStatus = useDashboardStore((state) => state.tripStatus);
  const startedAt = useDashboardStore((state) => state.startedAt);
  const elapsedMs = useDashboardStore((state) => state.elapsedMs);
  const lastResumedAt = useDashboardStore((state) => state.lastResumedAt);
  const distanceMeters = useDashboardStore((state) => state.distanceMeters);
  const averageSpeedMps = useDashboardStore((state) => state.averageSpeedMps);
  const maxSpeedMps = useDashboardStore((state) => state.maxSpeedMps);
  const motion = useDashboardStore((state) => state.motion);
  const orientation = useDashboardStore((state) => state.orientation);
  const rawMotion = useDashboardStore((state) => state.rawMotion);
  const rawOrientation = useDashboardStore((state) => state.rawOrientation);
  const chartHistory = useDashboardStore((state) => state.chartHistory);
  const lastGeoSample = useDashboardStore((state) => state.lastGeoSample);
  const safetyScore = useDashboardStore((state) => state.safetyScore);
  const safetyCounters = useDashboardStore((state) => state.safetyCounters);
  const geolocationPermission = useDashboardStore((state) => state.geolocationPermission);
  const motionPermission = useDashboardStore((state) => state.motionPermission);
  const orientationPermission = useDashboardStore((state) => state.orientationPermission);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return useMemo(() => {
    const hasGpsFix = geolocationPermission === 'granted' && Boolean(lastGeoSample);
    const hasMotion = motionPermission === 'granted' && Boolean(rawMotion) && now - (rawMotion?.timestamp ?? 0) < 3000;
    const hasOrientation =
      orientationPermission === 'granted' && Boolean(rawOrientation) && now - (rawOrientation?.timestamp ?? 0) < 4000;
    const heading = lastGeoSample?.heading ?? rawOrientation?.webkitCompassHeading ?? (hasOrientation ? orientation.yaw : null);
    const liveElapsed = tripStatus === 'active' && lastResumedAt ? elapsedMs + now - lastResumedAt : elapsedMs;

    return {
      now,
      realSensorMode: hasGpsFix || hasMotion || hasOrientation,
      noRealSensorData: !hasGpsFix && !hasMotion && !hasOrientation,
      units,
      tripStatus,
      startedAt,
      speedMps: lastGeoSample?.speedMps ?? null,
      averageSpeedMps,
      maxSpeedMps,
      distanceMeters,
      elapsedMs: liveElapsed,
      motion: hasMotion ? motion : null,
      orientation: hasOrientation ? orientation : null,
      heading,
      headingLabel: directionFromDegrees(heading),
      history: chartHistory,
      safetyScore,
      safetyCounters,
      raw: {
        gps: lastGeoSample,
        motion: rawMotion,
        orientation: rawOrientation
      },
      live: {
        gps: hasGpsFix,
        motion: hasMotion,
        orientation: hasOrientation,
        compass: hasOrientation && (rawOrientation?.webkitCompassHeading !== null || rawOrientation?.alpha !== null),
        bluetooth: false
      }
    };
  }, [
    averageSpeedMps,
    chartHistory,
    distanceMeters,
    elapsedMs,
    geolocationPermission,
    lastGeoSample,
    lastResumedAt,
    maxSpeedMps,
    motion,
    motionPermission,
    now,
    orientation,
    orientationPermission,
    rawMotion,
    rawOrientation,
    safetyCounters,
    safetyScore,
    startedAt,
    tripStatus,
    units
  ]);
}
