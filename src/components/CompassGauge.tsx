import type { CSSProperties } from 'react';
import { Navigation } from 'lucide-react';

export function CompassGauge({ heading, label }: { heading: number | null; label: string }) {
  const normalized = heading === null ? null : Math.round(((heading % 360) + 360) % 360);
  return (
    <section className="cockpit-panel compass-panel">
      <div className="compass-ring" style={{ '--heading': `${normalized ?? 0}deg` } as CSSProperties}>
        <div className="compass-cardinal north">N</div>
        <div className="compass-cardinal east">E</div>
        <div className="compass-cardinal south">S</div>
        <div className="compass-cardinal west">W</div>
        <Navigation className="compass-arrow h-10 w-10" />
        <div className="compass-center">
          <div className="text-4xl font-black text-white">{normalized === null ? '--' : label}</div>
          <div className="font-mono text-2xl font-bold text-lime-200">{normalized === null ? 'Waiting' : `${normalized}°`}</div>
        </div>
      </div>
      <div className="heading-strip">{normalized === null ? 'NO REAL SENSOR DATA' : `HEADING ${normalized}° ${label}`}</div>
    </section>
  );
}
