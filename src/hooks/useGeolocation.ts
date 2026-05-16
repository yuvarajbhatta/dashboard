import { useCallback, useEffect, useRef } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import type { GeoSample, SensorStatus } from '../types/telemetry';

export function useGeolocation() {
  const status = useDashboardStore((state) => state.geolocationPermission);
  const setPermission = useDashboardStore((state) => state.setPermission);
  const updateGeolocation = useDashboardStore((state) => state.updateGeolocation);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setPermission('geolocationPermission', 'unsupported');
      return;
    }
    if (status === 'idle') setPermission('geolocationPermission', 'prompt');
  }, [setPermission, status]);

  const requestPermission = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setPermission('geolocationPermission', 'unsupported');
      return 'unsupported' as SensorStatus;
    }

    if (watchId.current !== null) {
      return 'granted' as SensorStatus;
    }

    setPermission('geolocationPermission', 'prompt');

    // iPhone Safari requires HTTPS or localhost for geolocation, and the permission prompt must be
    // started from a user tap. The dashboard calls this from the Enable Sensors button.
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords = position.coords;
        const sample: GeoSample = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          heading: coords.heading,
          speedMps: coords.speed === null ? null : Math.max(0, coords.speed),
          nativeSpeedMps: coords.speed === null ? null : Math.max(0, coords.speed),
          derivedSpeedMps: null,
          timestamp: position.timestamp || Date.now()
        };
        setPermission('geolocationPermission', 'granted');
        updateGeolocation(sample);
      },
      () => {
        setPermission('geolocationPermission', 'denied');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 500,
        timeout: 12000
      }
    );

    return 'granted' as SensorStatus;
  }, [setPermission, updateGeolocation]);

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return { status, requestPermission };
}
