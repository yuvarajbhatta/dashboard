import type { ReactNode } from 'react';
import clsx from 'clsx';
import { SparklineGraph } from './SparklineGraph';

interface MiniMetricCardProps {
  label: string;
  value: string;
  unit?: string;
  icon?: ReactNode;
  accent?: 'blue' | 'green' | 'red' | 'orange';
  progress?: number;
  sparkline?: number[];
}

const accents = {
  blue: { text: 'text-cyan-200', bar: 'bg-cyan-300', stroke: '#22d3ee' },
  green: { text: 'text-lime-200', bar: 'bg-lime-300', stroke: '#a3e635' },
  red: { text: 'text-rose-200', bar: 'bg-rose-400', stroke: '#fb7185' },
  orange: { text: 'text-amber-200', bar: 'bg-amber-400', stroke: '#f59e0b' }
};

export function MiniMetricCard({ label, value, unit, icon, accent = 'blue', progress = 0, sparkline = [] }: MiniMetricCardProps) {
  const tone = accents[accent];
  return (
    <div className="cockpit-panel mini-metric">
      <div className="flex items-center justify-between gap-2">
        <span className="metric-label">{label}</span>
        <span className={clsx('opacity-90', tone.text)}>{icon}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={clsx('font-mono text-2xl font-black leading-none', tone.text)}>{value}</span>
        {unit ? <span className="metric-unit">{unit}</span> : null}
      </div>
      {sparkline.length > 0 ? (
        <div className="mt-2 h-8">
          <SparklineGraph data={sparkline} color={tone.stroke} />
        </div>
      ) : null}
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
        <div className={clsx('h-full rounded-full transition-all duration-300', tone.bar)} style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
      </div>
    </div>
  );
}
