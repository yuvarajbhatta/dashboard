import { BatteryFull, Bluetooth, LocateFixed, Minimize2, Signal, Wifi } from 'lucide-react';
import { format } from 'date-fns';

export function TopStatusBar({ now, realSensorMode, onMinimize }: { now: number; realSensorMode: boolean; onMinimize: () => void }) {
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
        <LocateFixed className="h-4 w-4" />
        <Signal className="h-4 w-4" />
        <Wifi className="h-4 w-4" />
        <Bluetooth className="h-4 w-4" />
        <BatteryFull className="h-4 w-4" />
        <button aria-label="Minimize" className="status-icon-button" onClick={onMinimize} type="button">
          <Minimize2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
