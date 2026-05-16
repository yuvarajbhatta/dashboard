import { X, Play, Pause, Power, Target, Moon, Sun, RotateCcw, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { useCalibration } from '../hooks/useCalibration';
import { useTripTracker } from '../hooks/useTripTracker';
import { useDashboardStore } from '../store/dashboardStore';
import type { SensorStatus } from '../types/telemetry';

export function SettingsModal({
  open,
  onClose,
  onRequestSensors,
  motionStatus,
  orientationStatus,
  geoStatus
}: {
  open: boolean;
  onClose: () => void;
  onRequestSensors: () => Promise<void>;
  motionStatus: SensorStatus;
  orientationStatus: SensorStatus;
  geoStatus: SensorStatus;
}) {
  const units = useDashboardStore((state) => state.units);
  const setUnits = useDashboardStore((state) => state.setUnits);
  const themeMode = useDashboardStore((state) => state.themeMode);
  const setThemeMode = useDashboardStore((state) => state.setThemeMode);
  const { calibrate } = useCalibration();
  const { tripStatus, startTrip, pauseTrip, resumeTrip, endTrip } = useTripTracker();

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <section className="settings-modal cockpit-panel">
        <div className="flex items-center justify-between">
          <div className="panel-kicker">SETTINGS</div>
          <button className="status-icon-button" onClick={onClose} type="button" aria-label="Close settings">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="settings-grid">
          <button className="control-button primary" onClick={onRequestSensors} type="button">
            <ShieldCheck className="h-5 w-5" />
            Enable Sensors
          </button>
          <button className="control-button neutral" onClick={calibrate} type="button">
            <Target className="h-5 w-5" />
            Calibrate Mount
          </button>
          {tripStatus === 'idle' ? (
            <button className="control-button primary" onClick={startTrip} type="button">
              <Play className="h-5 w-5" />
              START TRIP
            </button>
          ) : null}
          {tripStatus === 'active' ? (
            <button className="control-button neutral" onClick={pauseTrip} type="button">
              <Pause className="h-5 w-5" />
              PAUSE
            </button>
          ) : null}
          {tripStatus === 'paused' ? (
            <button className="control-button primary" onClick={resumeTrip} type="button">
              <Play className="h-5 w-5" />
              RESUME
            </button>
          ) : null}
          {tripStatus !== 'idle' ? (
            <button className="control-button danger" onClick={() => void endTrip()} type="button">
              <Power className="h-5 w-5" />
              END TRIP
            </button>
          ) : null}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button className={clsx('segmented', units === 'mph' && 'active')} onClick={() => setUnits('mph')} type="button">MPH</button>
          <button className={clsx('segmented', units === 'kmh' && 'active')} onClick={() => setUnits('kmh')} type="button">KM/H</button>
          <button className="segmented" onClick={() => setThemeMode(themeMode === 'night' ? 'day' : themeMode === 'day' ? 'auto' : 'night')} type="button">
            {themeMode === 'night' ? <Moon className="h-4 w-4" /> : themeMode === 'day' ? <Sun className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            {themeMode}
          </button>
        </div>
        <div className="sensor-mini-grid">
          <span>GPS {geoStatus}</span>
          <span>Motion {motionStatus}</span>
          <span>Orientation {orientationStatus}</span>
        </div>
      </section>
    </div>
  );
}
