import type { ReactNode } from 'react';
import type { GeoSample, RawMotionSample, RawOrientationSample } from '../types/telemetry';

function fmt(value: number | null | undefined, digits = 3) {
  return value === null || value === undefined ? '--' : value.toFixed(digits);
}

export function SensorDebugView({
  gps,
  motion,
  orientation,
  onEnableSensors,
  onCalibrate
}: {
  gps: GeoSample | null;
  motion: RawMotionSample | null;
  orientation: RawOrientationSample | null;
  onEnableSensors: () => Promise<void>;
  onCalibrate: () => void;
}) {
  return (
    <section className="sensor-debug-view">
      <div className="cockpit-panel debug-actions">
        <div>
          <div className="panel-kicker">RAW SENSOR STREAM</div>
          <div className="debug-subtitle">No real sensor data displays as "--" until iPhone Safari sends events.</div>
        </div>
        <div className="debug-buttons">
          <button className="control-button primary" onClick={onEnableSensors} type="button">Enable Sensors</button>
          <button className="control-button neutral" onClick={onCalibrate} type="button">Calibrate Mount</button>
        </div>
      </div>
      <DebugPanel title="GPS">
        <Row label="speed" value={fmt(gps?.speedMps, 2)} unit="m/s" />
        <Row label="heading" value={fmt(gps?.heading, 1)} unit="deg" />
        <Row label="accuracy" value={fmt(gps?.accuracy, 1)} unit="m" />
        <Row label="lat" value={fmt(gps?.latitude, 6)} />
        <Row label="lng" value={fmt(gps?.longitude, 6)} />
      </DebugPanel>
      <DebugPanel title="devicemotion">
        <Row label="accel x" value={fmt(motion?.acceleration.x)} />
        <Row label="accel y" value={fmt(motion?.acceleration.y)} />
        <Row label="accel z" value={fmt(motion?.acceleration.z)} />
        <Row label="gravity x" value={fmt(motion?.accelerationIncludingGravity.x)} />
        <Row label="gravity y" value={fmt(motion?.accelerationIncludingGravity.y)} />
        <Row label="gravity z" value={fmt(motion?.accelerationIncludingGravity.z)} />
      </DebugPanel>
      <DebugPanel title="rotationRate">
        <Row label="alpha" value={fmt(motion?.rotationRate.alpha)} />
        <Row label="beta" value={fmt(motion?.rotationRate.beta)} />
        <Row label="gamma" value={fmt(motion?.rotationRate.gamma)} />
        <Row label="interval" value={fmt(motion?.interval, 1)} unit="ms" />
      </DebugPanel>
      <DebugPanel title="deviceorientation">
        <Row label="alpha" value={fmt(orientation?.alpha)} />
        <Row label="beta" value={fmt(orientation?.beta)} />
        <Row label="gamma" value={fmt(orientation?.gamma)} />
        <Row label="webkitCompassHeading" value={fmt(orientation?.webkitCompassHeading, 1)} />
      </DebugPanel>
    </section>
  );
}

function DebugPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="cockpit-panel debug-panel">
      <div className="panel-kicker">{title}</div>
      <div className="debug-rows">{children}</div>
    </div>
  );
}

function Row({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="debug-row">
      <span>{label}</span>
      <strong>{value}{unit ? ` ${unit}` : ''}</strong>
    </div>
  );
}
