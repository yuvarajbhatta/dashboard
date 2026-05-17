import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { speedLabel, speedFromMps } from '../lib/format';
import type { UnitSystem } from '../types/telemetry';

const mphLabels = [0, 20, 60, 80, 100, 120, 140, 160, 180, 200];
const kmhLabels = [0, 40, 80, 120, 160, 200, 240];
const startAngle = 225;
const sweep = 270;

function polar(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: 180 + radius * Math.cos(rad), y: 180 + radius * Math.sin(rad) };
}

function gaugeAngle(speed: number, maxSpeed: number) {
  return startAngle + Math.min(maxSpeed, Math.max(0, speed)) * (sweep / maxSpeed);
}

export function SpeedometerGauge({ speedMps, units }: { speedMps: number | null; units: UnitSystem }) {
  const hasSpeed = speedMps !== null;
  const speed = hasSpeed ? Math.round(speedFromMps(speedMps, units)) : 0;
  const maxSpeed = units === 'mph' ? 200 : 240;
  const labels = units === 'mph' ? mphLabels : kmhLabels;
  const progress = Math.min(100, Math.max(0, (speed / maxSpeed) * 100));
  const needleAngle = gaugeAngle(speed, maxSpeed);

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
            <linearGradient id="speedArcGradient" x1="56" y1="280" x2="304" y2="74">
              <stop stopColor="#7ddc3a" />
              <stop offset="0.28" stopColor="#74d84a" />
              <stop offset="0.58" stopColor="#f5d238" />
              <stop offset="0.82" stopColor="#f97316" />
              <stop offset="1" stopColor="#fb345c" />
            </linearGradient>
          </defs>
          <path d="M78 284 A143 143 0 1 1 282 284" fill="none" stroke="rgba(148,163,184,0.16)" strokeWidth="17" strokeLinecap="round" />
          <path d="M78 284 A143 143 0 1 1 282 284" fill="none" stroke="url(#speedArcGradient)" strokeWidth="17" pathLength="100" strokeDasharray={`${progress} 100`} strokeLinecap="round" filter="url(#speedGlow)" />
          {Array.from({ length: 37 }, (_, index) => {
            const angle = startAngle + (index / 36) * sweep;
            const outer = polar(angle, 158);
            const inner = polar(angle, index % 6 === 0 ? 137 : 146);
            return <line key={index} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={index % 6 === 0 ? '#e2e8f0' : 'rgba(148,163,184,0.42)'} strokeWidth={index % 6 === 0 ? 3 : 1.5} strokeLinecap="round" />;
          })}
          {labels.map((label) => {
            const point = polar(gaugeAngle(label, maxSpeed), 113);
            return (
              <text key={label} x={point.x} y={point.y} fill="#f8fafc" fontSize="16" fontWeight="800" textAnchor="middle" dominantBaseline="middle">
                {label}
              </text>
            );
          })}
          <motion.g animate={{ rotate: needleAngle }} transition={{ type: 'spring', stiffness: 95, damping: 18 }} style={{ transformOrigin: '180px 180px' }}>
            <path d="M180 178 L180 54" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" filter="url(#speedGlow)" />
            <path d="M180 178 L180 92" stroke="#38bdf8" strokeWidth="10" strokeLinecap="round" opacity="0.32" />
          </motion.g>
          <circle cx="180" cy="180" r="12" fill="#e2e8f0" />
          <circle cx="180" cy="180" r="6" fill="#22d3ee" />
        </svg>
        <div className="speedometer-readout">
          <motion.div key={hasSpeed ? speed : 'waiting'} initial={{ opacity: 0.4, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="speed-number">
            {hasSpeed ? speed : '--'}
          </motion.div>
          <div className="speed-unit">{speedLabel(units)}</div>
        </div>
      </div>
    </section>
  );
}
