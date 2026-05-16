import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { speedLabel, speedFromMps } from '../lib/format';
import type { UnitSystem } from '../types/telemetry';

const labels = [0, 40, 80, 120, 160, 200, 240];
const startAngle = 225;
const sweep = 270;

function polar(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: 180 + radius * Math.cos(rad), y: 180 + radius * Math.sin(rad) };
}

function gaugeAngle(speed: number) {
  return startAngle + Math.min(240, Math.max(0, speed)) * (sweep / 240);
}

export function SpeedometerGauge({ speedMps, units }: { speedMps: number | null; units: UnitSystem }) {
  const hasSpeed = speedMps !== null;
  const speed = hasSpeed ? Math.round(speedFromMps(speedMps, units)) : 0;
  const kmhEquivalent = units === 'mph' ? speed * 1.60934 : speed;
  const progress = Math.min(100, Math.max(0, (kmhEquivalent / 240) * 100));
  const needleAngle = gaugeAngle(kmhEquivalent);

  return (
    <section className="cockpit-panel speedometer-panel">
      <div className="speedometer-shell" style={{ '--speed-progress': `${progress}%` } as CSSProperties}>
        <svg className="speedometer-svg" viewBox="0 0 360 360" aria-label="Speedometer gauge">
          <defs>
            <filter id="speedGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="speedArcGradient" x1="40" y1="60" x2="320" y2="320">
              <stop stopColor="#22d3ee" />
              <stop offset="0.64" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#fb345c" />
            </linearGradient>
          </defs>
          <circle cx="180" cy="180" r="143" fill="none" stroke="rgba(148,163,184,0.16)" strokeWidth="16" pathLength="100" strokeDasharray="75 100" strokeDashoffset="-62.5" transform="rotate(-45 180 180)" />
          <circle cx="180" cy="180" r="143" fill="none" stroke="url(#speedArcGradient)" strokeWidth="16" pathLength="100" strokeDasharray={`${progress * 0.75} 100`} strokeDashoffset="-62.5" strokeLinecap="round" transform="rotate(-45 180 180)" filter="url(#speedGlow)" />
          {Array.from({ length: 37 }, (_, index) => {
            const angle = startAngle + (index / 36) * sweep;
            const outer = polar(angle, 158);
            const inner = polar(angle, index % 6 === 0 ? 137 : 146);
            return <line key={index} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={index % 6 === 0 ? '#e2e8f0' : 'rgba(148,163,184,0.42)'} strokeWidth={index % 6 === 0 ? 3 : 1.5} strokeLinecap="round" />;
          })}
          {labels.map((label) => {
            const point = polar(gaugeAngle(label), 113);
            return (
              <text key={label} x={point.x} y={point.y} fill="#94a3b8" fontSize="16" fontWeight="800" textAnchor="middle" dominantBaseline="middle">
                {label}
              </text>
            );
          })}
          <motion.g animate={{ rotate: needleAngle }} transition={{ type: 'spring', stiffness: 95, damping: 18 }} style={{ transformOrigin: '180px 180px' }}>
            <path d="M180 178 L180 72" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" filter="url(#speedGlow)" />
            <path d="M180 178 L180 102" stroke="#22d3ee" strokeWidth="9" strokeLinecap="round" opacity="0.42" />
          </motion.g>
          <circle cx="180" cy="180" r="12" fill="#e2e8f0" />
          <circle cx="180" cy="180" r="6" fill="#22d3ee" />
        </svg>
        <div className="speedometer-readout">
          <motion.div key={hasSpeed ? speed : 'waiting'} initial={{ opacity: 0.4, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="speed-number">
            {hasSpeed ? speed : '--'}
          </motion.div>
          <div className="speed-unit">{speedLabel(units)}</div>
          <div className="drive-badge">D SPORT</div>
        </div>
      </div>
    </section>
  );
}
