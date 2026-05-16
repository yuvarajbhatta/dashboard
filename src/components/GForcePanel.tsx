import { Activity, ArrowDown, ArrowLeftRight, ArrowUp } from 'lucide-react';
import { round } from '../lib/format';
import { useDashboardStore } from '../store/dashboardStore';
import { MetricCard } from './MetricCard';

export function GForcePanel() {
  const motion = useDashboardStore((state) => state.motion);
  const chartHistory = useDashboardStore((state) => state.chartHistory);
  const peak = Math.max(...chartHistory.map((point) => point.totalG), motion.total);
  const lateralSide = motion.lateral > 0.03 ? 'Right' : motion.lateral < -0.03 ? 'Left' : 'Center';
  const longitudinal = motion.longitudinal > 0.03 ? 'Accel' : motion.longitudinal < -0.03 ? 'Brake' : 'Neutral';

  return (
    <section className="hud-panel p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-200">
          <Activity className="h-5 w-5" />
          <h2 className="panel-title">G-Force Vector</h2>
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Peak {round(peak, 2)}G</span>
      </div>
      <div className="relative mx-auto mb-4 aspect-square max-h-56 rounded-full border border-cyan-300/25 bg-slate-950/60 shadow-glow">
        <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-300/15" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-cyan-300/15" />
        <div className="absolute inset-[14%] rounded-full border border-white/10" />
        <div className="absolute inset-[28%] rounded-full border border-white/10" />
        <div
          className="absolute left-1/2 top-1/2 h-5 w-5 rounded-full bg-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.95)] transition-transform duration-150"
          style={{
            transform: `translate(calc(-50% + ${motion.lateral * 70}px), calc(-50% + ${-motion.longitudinal * 70}px))`
          }}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-bold uppercase text-slate-500">L</span>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-bold uppercase text-slate-500">R</span>
        <span className="absolute left-1/2 top-3 -translate-x-1/2 text-[0.65rem] font-bold uppercase text-slate-500">Accel</span>
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.65rem] font-bold uppercase text-slate-500">Brake</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label={longitudinal} value={round(Math.abs(motion.longitudinal), 2).toFixed(2)} unit="G" icon={motion.longitudinal >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />} tone={motion.longitudinal >= 0 ? 'lime' : 'rose'} />
        <MetricCard label={lateralSide} value={round(Math.abs(motion.lateral), 2).toFixed(2)} unit="G" icon={<ArrowLeftRight className="h-4 w-4" />} tone="cyan" />
        <MetricCard label="Vertical" value={round(Math.abs(motion.vertical), 2).toFixed(2)} unit="G" tone="amber" />
        <MetricCard label="Combined" value={round(motion.total, 2).toFixed(2)} unit="G" tone="neutral" />
      </div>
    </section>
  );
}
