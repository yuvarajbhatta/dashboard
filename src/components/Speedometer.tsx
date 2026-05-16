import type { CSSProperties } from 'react';
import { Gauge, MapPinned, Timer, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { distanceFromMeters, distanceLabel, formatElapsed, round, speedFromMps, speedLabel } from '../lib/format';
import { useDashboardStore } from '../store/dashboardStore';
import { MetricCard } from './MetricCard';

export function Speedometer() {
  const units = useDashboardStore((state) => state.units);
  const currentSpeedMps = useDashboardStore((state) => state.currentSpeedMps);
  const maxSpeedMps = useDashboardStore((state) => state.maxSpeedMps);
  const averageSpeedMps = useDashboardStore((state) => state.averageSpeedMps);
  const elapsedMs = useDashboardStore((state) => state.elapsedMs);
  const lastResumedAt = useDashboardStore((state) => state.lastResumedAt);
  const tripStatus = useDashboardStore((state) => state.tripStatus);
  const distanceMeters = useDashboardStore((state) => state.distanceMeters);
  const liveElapsed = tripStatus === 'active' && lastResumedAt ? elapsedMs + Date.now() - lastResumedAt : elapsedMs;
  const speed = Math.round(speedFromMps(currentSpeedMps, units));
  const speedCap = units === 'mph' ? 160 : 260;
  const progress = Math.min(100, (speed / speedCap) * 100);

  return (
    <section className="hud-panel relative min-h-[19rem] overflow-hidden p-4 md:min-h-[24rem] md:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="speed-arc" style={{ '--speed-progress': `${progress}%` } as CSSProperties} />
      </div>
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-200">
            <Gauge className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Live GPS Speed</span>
          </div>
          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
            {speedLabel(units)}
          </span>
        </div>

        <motion.div
          key={speed}
          initial={{ opacity: 0.45, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 170, damping: 22 }}
          className="text-center"
        >
          <div className="font-mono text-[6.4rem] font-black leading-none text-white drop-shadow-[0_0_28px_rgba(34,211,238,0.45)] md:text-[9rem]">
            {speed.toString().padStart(2, '0')}
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-[0.34em] text-cyan-100/75">Performance Telemetry</div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Max" value={Math.round(speedFromMps(maxSpeedMps, units))} unit={speedLabel(units)} icon={<TrendingUp className="h-4 w-4" />} tone="rose" />
          <MetricCard label="Average" value={Math.round(speedFromMps(averageSpeedMps, units))} unit={speedLabel(units)} icon={<Gauge className="h-4 w-4" />} tone="cyan" />
          <MetricCard label="Distance" value={round(distanceFromMeters(distanceMeters, units), 2).toFixed(2)} unit={distanceLabel(units)} icon={<MapPinned className="h-4 w-4" />} tone="lime" />
          <MetricCard label="Duration" value={formatElapsed(liveElapsed)} icon={<Timer className="h-4 w-4" />} tone="amber" />
        </div>
      </div>
    </section>
  );
}
