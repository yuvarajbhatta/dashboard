import type { ReactNode } from 'react';
import { Bluetooth, Compass, MapPin, RadioTower, Rotate3D, Smartphone } from 'lucide-react';

export function SensorStatusPanel({
  gps,
  motion,
  orientation,
  compass,
  bluetooth
}: {
  gps: boolean;
  motion: boolean;
  orientation: boolean;
  compass: boolean;
  bluetooth: boolean;
}) {
  return (
    <section className="cockpit-panel sensor-status-panel">
      <Status label="GPS Active" active={gps} icon={<MapPin className="h-4 w-4" />} />
      <Status label="Motion Active" active={motion} icon={<Smartphone className="h-4 w-4" />} />
      <Status label="Orientation Active" active={orientation} icon={<Rotate3D className="h-4 w-4" />} />
      <Status label="Compass Active" active={compass} icon={<Compass className="h-4 w-4" />} />
      <Status label="Bluetooth Connected" active={bluetooth} icon={bluetooth ? <Bluetooth className="h-4 w-4" /> : <RadioTower className="h-4 w-4" />} />
    </section>
  );
}

function Status({ label, active, icon }: { label: string; active: boolean; icon: ReactNode }) {
  return (
    <div className="sensor-row">
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className={active ? 'status-active' : 'status-waiting'}>{active ? 'ACTIVE' : 'WAITING'}</span>
    </div>
  );
}
