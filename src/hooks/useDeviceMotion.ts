import { useCallback, useEffect, useRef } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import type { GForceSample, RawMotionSample, SensorStatus, Vector3 } from '../types/telemetry';

const GRAVITY = 9.80665;

function getMotionPermissionApi() {
  return typeof DeviceMotionEvent !== 'undefined'
    ? (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<PermissionState> })
    : null;
}

export function useDeviceMotion() {
  const status = useDashboardStore((state) => state.motionPermission);
  const setPermission = useDashboardStore((state) => state.setPermission);
  const updateMotion = useDashboardStore((state) => state.updateMotion);
  const frame = useRef<number | null>(null);
  const pendingSample = useRef<GForceSample | null>(null);
  const pendingRaw = useRef<RawMotionSample | null>(null);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      setPermission('motionPermission', 'unsupported');
      return 'unsupported' as SensorStatus;
    }

    const api = getMotionPermissionApi();
    if (api?.requestPermission) {
      setPermission('motionPermission', 'prompt');
      // iPhone Safari requires HTTPS or localhost and a user tap before this permission API is allowed.
      const result = await api.requestPermission();
      const nextStatus = result === 'granted' ? 'granted' : 'denied';
      setPermission('motionPermission', nextStatus);
      return nextStatus;
    }

    setPermission('motionPermission', 'granted');
    return 'granted' as SensorStatus;
  }, [setPermission]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      setPermission('motionPermission', 'unsupported');
    } else if (status === 'idle') {
      setPermission('motionPermission', 'prompt');
    }
  }, [setPermission, status]);

  useEffect(() => {
    if (status !== 'granted') return undefined;

    const onMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.acceleration;
      const accelerationIncludingGravity = event.accelerationIncludingGravity;
      const source = acceleration ?? accelerationIncludingGravity;
      if (!source) return;

      const lateral = (source.x ?? 0) / GRAVITY;
      const longitudinal = (source.y ?? 0) / GRAVITY;
      const vertical = (source.z ?? 0) / GRAVITY;
      const total = Math.sqrt(lateral * lateral + longitudinal * longitudinal + vertical * vertical);
      const vector = (value: DeviceMotionEventAcceleration | null): Vector3 => ({
        x: value?.x ?? null,
        y: value?.y ?? null,
        z: value?.z ?? null
      });

      pendingSample.current = {
        timestamp: Date.now(),
        lateral,
        longitudinal,
        vertical,
        total
      };
      pendingRaw.current = {
        timestamp: Date.now(),
        acceleration: vector(acceleration),
        accelerationIncludingGravity: vector(accelerationIncludingGravity),
        rotationRate: {
          alpha: event.rotationRate?.alpha ?? null,
          beta: event.rotationRate?.beta ?? null,
          gamma: event.rotationRate?.gamma ?? null
        },
        interval: event.interval ?? null
      };

      if (frame.current === null) {
        frame.current = window.requestAnimationFrame(() => {
          frame.current = null;
          if (pendingSample.current && pendingRaw.current) {
            updateMotion(pendingSample.current, pendingRaw.current);
          }
        });
      }
    };

    window.addEventListener('devicemotion', onMotion, { passive: true });
    return () => {
      window.removeEventListener('devicemotion', onMotion);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, [status, updateMotion]);

  return { status, requestPermission };
}
