import { CircleGauge } from 'lucide-react';
import { round } from '../lib/format';
import type { ChartPoint, GForceSample } from '../types/telemetry';
import { SparklineGraph } from './SparklineGraph';

const zeroMotion: GForceSample = { timestamp: 0, lateral: 0, longitudinal: 0, vertical: 0, total: 0 };

export function AccelerationPanel({ motion, history }: { motion: GForceSample | null; history: ChartPoint[] }) {
  const view = motion ?? zeroMotion;
  const xData = history.map((point) => point.cornering);
  const yData = history.map((point) => point.acceleration - point.braking);
  const zData = history.map((point) => point.totalG);
  const dotX = Math.max(-46, Math.min(46, view.lateral * 92));
  const dotY = Math.max(-46, Math.min(46, -view.longitudinal * 92));

  return (
    <section className="cockpit-panel acceleration-panel">
      <div className="panel-kicker">
        <CircleGauge className="h-4 w-4 text-cyan-200" />
        ACCELERATION G
      </div>
      <div className="accel-grid">
        <div className="g-meter">
          <div className="g-cross horizontal" />
          <div className="g-cross vertical" />
          <div className="g-ring one" />
          <div className="g-ring two" />
          <div className="g-dot" style={{ transform: `translate(calc(-50% + ${dotX}px), calc(-50% + ${dotY}px))` }} />
          <span className="g-label top">ACCEL</span>
          <span className="g-label bottom">BRAKE</span>
          <span className="g-label left">LEFT</span>
          <span className="g-label right">RIGHT</span>
        </div>
        <div className="axis-list">
          <AxisRow label="X left/right" value={motion?.lateral ?? null} data={xData} color="#22d3ee" />
          <AxisRow label="Y brake/accel" value={motion?.longitudinal ?? null} data={yData} color="#a3e635" />
          <AxisRow label="Z gravity" value={motion?.vertical ?? null} data={zData} color="#f59e0b" />
        </div>
      </div>
    </section>
  );
}

function AxisRow({ label, value, data, color }: { label: string; value: number | null; data: number[]; color: string }) {
  return (
    <div className="axis-row">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <strong>{value === null ? '--' : `${round(value, 2)}G`}</strong>
      </div>
      <div className="h-8">
        <SparklineGraph data={data} color={color} />
      </div>
    </div>
  );
}
