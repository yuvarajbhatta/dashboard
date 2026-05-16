import type { CSSProperties } from 'react';
import { ShieldCheck, Siren } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSafetyScore } from '../hooks/useSafetyScore';

export function SafetyScorePanel() {
  const { score, counters, events, smoothness } = useSafetyScore();

  return (
    <section className="hud-panel p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-lime-200">
          <ShieldCheck className="h-5 w-5" />
          <h2 className="panel-title">Safety Score</h2>
        </div>
        <span className="rounded-full border border-lime-300/25 bg-lime-300/10 px-3 py-1 text-xs font-bold text-lime-100">{smoothness}</span>
      </div>
      <div className="flex items-center gap-5">
        <div className="score-ring" style={{ '--score': `${score}%` } as CSSProperties}>
          <div>
            <div className="font-mono text-5xl font-black leading-none text-white">{score}</div>
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-lime-100/75">Trip</div>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2 text-sm">
          <Counter label="Hard Brakes" value={counters.hardBrakes} />
          <Counter label="Aggressive Turns" value={counters.hardCorners} />
          <Counter label="Hard Launches" value={counters.aggressiveAccelerations} />
          <Counter label="Shock Spikes" value={counters.shockSpikes + counters.suddenSwerves + counters.instability} />
        </div>
      </div>
      <div className="mt-4 min-h-16 space-y-2 overflow-hidden">
        <AnimatePresence initial={false}>
          {events.slice(0, 3).map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="flex items-center justify-between rounded-md border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-100"
            >
              <span className="flex items-center gap-2 font-bold">
                <Siren className="h-3.5 w-3.5" />
                {event.label}
              </span>
              <span className="font-mono">-{event.penalty}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] p-2">
      <div className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-1 font-mono text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
