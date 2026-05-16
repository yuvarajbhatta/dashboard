import type { CSSProperties } from 'react';
import type { SafetyCounters } from '../types/telemetry';

export function SafetyScoreGauge({ score, counters }: { score: number; counters: SafetyCounters }) {
  const label = score >= 90 ? 'Excellent' : score >= 80 ? 'Stable' : score >= 70 ? 'Assertive' : 'Aggressive';
  return (
    <section className="cockpit-panel safety-gauge-panel">
      <div className="safety-dial" style={{ '--score': `${score}%` } as CSSProperties}>
        <div className="font-mono text-5xl font-black text-white">{score}</div>
        <div className="text-sm font-black uppercase tracking-[0.18em] text-lime-200">{label}</div>
      </div>
      <div className="safety-counters">
        <Counter label="Hard Brakes" value={counters.hardBrakes} />
        <Counter label="Aggressive Turns" value={counters.hardCorners} />
        <Counter label="Hard Accels" value={counters.aggressiveAccelerations} />
        <Counter label="Shock Spikes" value={counters.shockSpikes + counters.suddenSwerves + counters.instability} />
      </div>
    </section>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="safety-counter">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
