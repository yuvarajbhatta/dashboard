import type { GForceSample } from '../types/telemetry';
import { round } from '../lib/format';

export function TireRoadFeedback({ motion }: { motion: GForceSample | null }) {
  const frontLeft = motion === null ? null : Math.abs(motion.lateral * 0.65 + motion.longitudinal * 0.45);
  const frontRight = motion === null ? null : Math.abs(-motion.lateral * 0.65 + motion.longitudinal * 0.45);
  const rearLeft = motion === null ? null : Math.abs(motion.lateral * 0.45 - motion.longitudinal * 0.38);
  const rearRight = motion === null ? null : Math.abs(-motion.lateral * 0.45 - motion.longitudinal * 0.38);

  return (
    <section className="cockpit-panel tire-panel">
      <div className="panel-kicker">TIRE / ROAD</div>
      <div className="tire-stage">
        <Wheel label="FL" value={frontLeft} className="fl" />
        <Wheel label="FR" value={frontRight} className="fr" />
        <Wheel label="RL" value={rearLeft} className="rl" />
        <Wheel label="RR" value={rearRight} className="rr" />
        <svg className="top-car" viewBox="0 0 130 240" aria-label="Top-down car">
          <defs>
            <linearGradient id="topCarBody" x1="0" x2="1" y1="0" y2="1">
              <stop stopColor="#1f2937" />
              <stop offset="1" stopColor="#020617" />
            </linearGradient>
          </defs>
          <path d="M36 38c7-18 17-28 29-28s22 10 29 28l14 78-10 92c-9 13-22 20-33 20s-24-7-33-20l-10-92 14-78Z" fill="url(#topCarBody)" stroke="#38bdf8" strokeWidth="3" />
          <path d="M45 64h40l10 46H35l10-46Z" fill="#0b1220" stroke="#94a3b8" strokeWidth="2" />
          <path d="M38 170h54" stroke="#a3e635" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  );
}

function Wheel({ label, value, className }: { label: string; value: number | null; className: string }) {
  return (
    <div className={`wheel-readout ${className}`}>
      <span>{label}</span>
      <strong>{value === null ? '--' : `${round(value, 2)}G`}</strong>
    </div>
  );
}
