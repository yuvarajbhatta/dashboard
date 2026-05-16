import type { ReactNode } from 'react';
import clsx from 'clsx';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  tone?: 'cyan' | 'rose' | 'lime' | 'amber' | 'neutral';
}

const tones = {
  cyan: 'text-cyan-300 border-cyan-300/25',
  rose: 'text-rose-300 border-rose-300/25',
  lime: 'text-lime-300 border-lime-300/25',
  amber: 'text-amber-300 border-amber-300/25',
  neutral: 'text-slate-200 border-white/10'
};

export function MetricCard({ label, value, unit, icon, tone = 'neutral' }: MetricCardProps) {
  return (
    <div className={clsx('hud-panel min-h-24 justify-between p-3', tones[tone])}>
      <div className="flex items-center justify-between gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-current/80">
        <span>{label}</span>
        {icon}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-mono text-2xl font-bold leading-none md:text-3xl">{value}</span>
        {unit ? <span className="text-[0.7rem] font-bold uppercase text-current/70">{unit}</span> : null}
      </div>
    </div>
  );
}
