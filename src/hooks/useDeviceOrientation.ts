import { useCallback, useEffect, useRef } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import type { OrientationSample, RawOrientationSample, SensorStatus } from '../types/telemetry';

function getOrientationPermissionApi() {
  return typeof DeviceOrientationEvent !== 'undefined'
    ? (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<PermissionState> })
    : null;
}

export function useDeviceOrientation() {
  const status = useDashboardStore((state) => state.orientationPermission);
  const setPermission = useDashboardStore((state) => state.setPermission);
  const updateOrientation = useDashboardStore((state) => state.updateOrientation);
  const frame = useRef<number | null>(null);
  const pendingSample = useRef<OrientationSample | null>(null);
  const pendingRaw = useRef<RawOrientationSample | null>(null);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setPermission('orientationPermission', 'unsupported');
      return 'unsupported' as SensorStatus;
    }

    const api = getOrientationPermissionApi();
    if (api?.requestPermission) {
      setPermission('orientationPermission', 'prompt');
      // iPhone Safari requires HTTPS or localhost and a user tap before this permission API is allowed.
      const result = await api.requestPermission();
      const nextStatus = result === 'granted' ? 'granted' : 'denied';
      setPermission('orientationPermission', nextStatus);
      return nextStatus;
    }

    setPermission('orientationPermission', 'granted');
    return 'granted' as SensorStatus;
  }, [setPermission]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setPermission('orientationPermission', 'unsupported');
    } else if (status === 'idle') {
      setPermission('orientationPermission', 'prompt');
    }
  }, [setPermission, status]);

  useEffect(() => {
    if (status !== 'granted') return undefined;

    const onOrientation = (event: DeviceOrientationEvent) => {
      const webkitCompassHeading = event.webkitCompassHeading ?? null;
      const screenAngle =
        typeof window !== 'undefined'
          ? (window.screen.orientation?.angle ?? window.orientation ?? 0)
          : 0;
      const alphaHeading =
        event.alpha === null
          ? 0
          : ((360 - event.alpha + Number(screenAngle)) % 360 + 360) % 360;
      const yaw = webkitCompassHeading ?? alphaHeading;
      pendingSample.current = {
        timestamp: Date.now(),
        pitch: event.beta ?? 0,
        roll: event.gamma ?? 0,
        yaw
      };
      pendingRaw.current = {
        timestamp: Date.now(),
        alpha: event.alpha ?? null,
        beta: event.beta ?? null,
        gamma: event.gamma ?? null,
        webkitCompassHeading
      };

      if (frame.current === null) {
        frame.current = window.requestAnimationFrame(() => {
          frame.current = null;
          if (pendingSample.current && pendingRaw.current) {
            updateOrientation(pendingSample.current, pendingRaw.current);
          }
        });
      }
    };

    window.addEventListener('deviceorientation', onOrientation, { passive: true });
    return () => {
      window.removeEventListener('deviceorientation', onOrientation);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, [status, updateOrientation]);

  return { status, requestPermission };
}
