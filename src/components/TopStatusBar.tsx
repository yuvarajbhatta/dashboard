import { BatteryCharging, BatteryFull, Bluetooth, Expand, LocateFixed, Signal, WifiOff } from 'lucide-react';
import { format } from 'date-fns';
import { useBatteryStatus } from '../hooks/useBatteryStatus';

export function TopStatusBar({
  now,
  realSensorMode,
  gpsActive,
  onMaximize
}: {
  now: number;
  realSensorMode: boolean;
  gpsActive: boolean;
  onMaximize: () => void;
}) {
  const battery = useBatteryStatus();
  const batteryPercent = battery.level === null ? '--' : `${Math.round(battery.level * 100)}%`;
  const connection = navigator.connection?.effectiveType ?? navigator.connection?.type ?? 'unknown';
  return (
    <header className="top-status-bar">
      <div className="drive-mode-indicator">
        <span />
        DRIVE MODE
        <strong className={realSensorMode ? 'real-sensor-mode' : 'no-sensor-mode'}>
          {realSensorMode ? 'REAL SENSOR MODE' : 'NO REAL SENSOR DATA'}
        </strong>
      </div>
      <div className="status-time">{format(now, 'h:mm a')}</div>
      <div className="status-icons">
        <span className={gpsActive ? 'status-supported' : 'status-unknown'}><LocateFixed className="h-4 w-4" />GPS</span>
        <span className="status-unknown"><Signal className="h-4 w-4" />{connection}</span>
        <span className="status-unknown"><WifiOff className="h-4 w-4" />WiFi --</span>
        <span className="status-unknown"><Bluetooth className="h-4 w-4" />BT --</span>
        <span className={battery.supported ? 'status-supported' : 'status-unknown'}>
          {battery.charging ? <BatteryCharging className="h-4 w-4" /> : <BatteryFull className="h-4 w-4" />}
          {batteryPercent}
        </span>
        <button aria-label="Maximize" className="status-icon-button" onClick={onMaximize} type="button">
          <Expand className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
