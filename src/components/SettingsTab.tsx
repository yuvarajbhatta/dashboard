import { Moon, Pause, Play, Power, RotateCcw, ShieldCheck, Smartphone, Sun, Target } from 'lucide-react';
import clsx from 'clsx';
import { useCalibration } from '../hooks/useCalibration';
import { useTripTracker } from '../hooks/useTripTracker';
import { useDashboardStore } from '../store/dashboardStore';
import type { SensorStatus } from '../types/telemetry';

export function SettingsTab({
  onRequestSensors,
  motionStatus,
  orientationStatus,
  geoStatus,
  fullscreenMessage
}: {
  onRequestSensors: () => Promise<void>;
  motionStatus: SensorStatus;
  orientationStatus: SensorStatus;
  geoStatus: SensorStatus;
  fullscreenMessage: string | null;
}) {
  const units = useDashboardStore((state) => state.units);
  const setUnits = useDashboardStore((state) => state.setUnits);
  const themeMode = useDashboardStore((state) => state.themeMode);
  const setThemeMode = useDashboardStore((state) => state.setThemeMode);
  const { calibrate, calibration } = useCalibration();
  const { tripStatus, startTrip, pauseTrip, resumeTrip, endTrip } = useTripTracker();

  return (
    <section className="settings-tab-grid">
      <div className="cockpit-panel settings-section">
        <div className="panel-kicker">Sensor Setup</div>
        <div className="settings-actions">
          <button className="control-button primary" onClick={onRequestSensors} type="button">
            <ShieldCheck className="h-5 w-5" />
            Enable Sensors
          </button>
          <button className="control-button neutral" onClick={calibrate} type="button">
            <Target className="h-5 w-5" />
            Calibrate Mount
          </button>
        </div>
        <div className="sensor-mini-grid">
          <span>GPS {geoStatus}</span>
          <span>Motion {motionStatus}</span>
          <span>Orientation {orientationStatus}</span>
        </div>
        <div className="settings-note">
          Calibrate after the iPhone is mounted landscape and upright. iPhone Safari requires HTTPS or localhost and a user tap before sensors can start.
        </div>
      </div>

      <div className="cockpit-panel settings-section">
        <div className="panel-kicker">Trip Controls</div>
        <div className="settings-actions">
          {tripStatus === 'idle' ? (
            <button className="control-button primary" onClick={startTrip} type="button"><Play className="h-5 w-5" />Start Trip</button>
          ) : null}
          {tripStatus === 'active' ? (
            <button className="control-button neutral" onClick={pauseTrip} type="button"><Pause className="h-5 w-5" />Pause</button>
          ) : null}
          {tripStatus === 'paused' ? (
            <button className="control-button primary" onClick={resumeTrip} type="button"><Play className="h-5 w-5" />Resume</button>
          ) : null}
          {tripStatus !== 'idle' ? (
            <button className="control-button danger" onClick={() => void endTrip()} type="button"><Power className="h-5 w-5" />End Trip</button>
          ) : null}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button className={clsx('segmented', units === 'mph' && 'active')} onClick={() => setUnits('mph')} type="button">MPH</button>
          <button className={clsx('segmented', units === 'kmh' && 'active')} onClick={() => setUnits('kmh')} type="button">KM/H</button>
          <button className="segmented" onClick={() => setThemeMode(themeMode === 'night' ? 'day' : themeMode === 'day' ? 'auto' : 'night')} type="button">
            {themeMode === 'night' ? <Moon className="h-4 w-4" /> : themeMode === 'day' ? <Sun className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            {themeMode}
          </button>
        </div>
      </div>

      <div className="cockpit-panel settings-section">
        <div className="panel-kicker"><Smartphone className="h-4 w-4" />Add to Home Screen</div>
        <ol className="home-steps">
          <li>Open this dashboard in Safari on iPhone.</li>
          <li>Tap the Share button.</li>
          <li>Tap Add to Home Screen.</li>
          <li>Launch from the Home Screen, then enable sensors.</li>
        </ol>
        <div className="settings-note">iPhone Safari cannot programmatically add a PWA to the Home Screen.</div>
        {fullscreenMessage ? <div className="settings-warning">{fullscreenMessage}</div> : null}
      </div>

      <div className="cockpit-panel settings-section">
        <div className="panel-kicker">Calibration Baseline</div>
        <div className="debug-rows">
          <Row label="Pitch" value={`${calibration.pitch.toFixed(1)}°`} />
          <Row label="Roll" value={`${calibration.roll.toFixed(1)}°`} />
          <Row label="Yaw" value={`${calibration.yaw.toFixed(1)}°`} />
          <Row label="G Lateral" value={`${calibration.gLateral.toFixed(2)}G`} />
          <Row label="G Longitudinal" value={`${calibration.gLongitudinal.toFixed(2)}G`} />
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="debug-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
