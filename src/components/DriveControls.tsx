import type { ReactNode } from 'react';
import { Moon, Pause, Play, Power, RotateCcw, Route, Sun, Target, Zap } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useCalibration } from '../hooks/useCalibration';
import { useTripTracker } from '../hooks/useTripTracker';
import { useDashboardStore } from '../store/dashboardStore';

function vibrate(pattern: number | number[]) {
  if ('vibrate' in navigator) navigator.vibrate(pattern);
}

export function DriveControls() {
  const units = useDashboardStore((state) => state.units);
  const setUnits = useDashboardStore((state) => state.setUnits);
  const themeMode = useDashboardStore((state) => state.themeMode);
  const setThemeMode = useDashboardStore((state) => state.setThemeMode);
  const driveMode = useDashboardStore((state) => state.driveMode);
  const setDriveMode = useDashboardStore((state) => state.setDriveMode);
  const { calibration, calibrate } = useCalibration();
  const { tripStatus, startTrip, pauseTrip, resumeTrip, endTrip } = useTripTracker();

  const start = () => {
    vibrate([35, 30, 35]);
    startTrip();
  };

  const stop = async () => {
    vibrate(45);
    await endTrip();
  };

  const calibrateMount = () => {
    vibrate(25);
    calibrate();
  };

  const toggleFullscreen = async () => {
    setDriveMode(!driveMode);
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    } catch {
      // iPhone Safari may ignore fullscreen requests for PWAs; drive mode still uses the full viewport.
    }
  };

  return (
    <section className="hud-panel p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-200">
          <Power className="h-5 w-5" />
          <h2 className="panel-title">Drive Command</h2>
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{tripStatus}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tripStatus === 'idle' ? (
          <ControlButton label="Start Trip" icon={<Play className="h-5 w-5" />} onClick={start} tone="primary" />
        ) : null}
        {tripStatus === 'active' ? (
          <ControlButton label="Pause" icon={<Pause className="h-5 w-5" />} onClick={pauseTrip} tone="neutral" />
        ) : null}
        {tripStatus === 'paused' ? (
          <ControlButton label="Resume" icon={<Play className="h-5 w-5" />} onClick={resumeTrip} tone="primary" />
        ) : null}
        {tripStatus !== 'idle' ? <ControlButton label="End" icon={<Power className="h-5 w-5" />} onClick={stop} tone="danger" /> : null}
        <ControlButton label="Drive Mode" icon={<Zap className="h-5 w-5" />} onClick={toggleFullscreen} tone={driveMode ? 'primary' : 'neutral'} />
        <ControlButton label="Calibrate" icon={<Target className="h-5 w-5" />} onClick={calibrateMount} tone="neutral" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button className={clsx('segmented', units === 'mph' && 'active')} onClick={() => setUnits('mph')} type="button">
          MPH
        </button>
        <button className={clsx('segmented', units === 'kmh' && 'active')} onClick={() => setUnits('kmh')} type="button">
          KM/H
        </button>
        <button className="segmented" onClick={() => setThemeMode(themeMode === 'night' ? 'day' : themeMode === 'day' ? 'auto' : 'night')} type="button">
          {themeMode === 'night' ? <Moon className="h-4 w-4" /> : themeMode === 'day' ? <Sun className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
          {themeMode}
        </button>
      </div>

      <div className="mt-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
        <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-400">
          <Route className="h-4 w-4" />
          Mount Calibration
        </div>
        <div className="mt-2 text-sm text-slate-200">
          {calibration.calibratedAt ? `Locked ${format(new Date(calibration.calibratedAt), 'MMM d, h:mm a')}` : 'Not calibrated'}
        </div>
      </div>
    </section>
  );
}

function ControlButton({
  label,
  icon,
  tone,
  onClick
}: {
  label: string;
  icon: ReactNode;
  tone: 'primary' | 'danger' | 'neutral';
  onClick: () => void;
}) {
  return (
    <button className={clsx('control-button', tone)} onClick={onClick} type="button">
      {icon}
      <span>{label}</span>
    </button>
  );
}
