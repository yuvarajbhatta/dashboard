import { motion } from 'framer-motion';
import type { OrientationSample } from '../types/telemetry';
import { round } from '../lib/format';

const waitingOrientation: OrientationSample = { timestamp: 0, pitch: 0, roll: 0, yaw: 0 };

export function VehicleGyroscope3D({ orientation }: { orientation: OrientationSample | null }) {
  const view = orientation ?? waitingOrientation;
  return (
    <section className="cockpit-panel gyro-panel">
      <div className="gyro-stage">
        <div className="axis axis-blue" />
        <div className="axis axis-red" />
        <div className="axis axis-orange" />
        <div className="roll-ring" />
        <motion.div
          className="car-3d"
          animate={{ rotateZ: view.roll, rotateX: -view.pitch, rotateY: view.yaw / 5 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        >
          <svg viewBox="0 0 220 120" role="img" aria-label="Vehicle attitude silhouette">
            <defs>
              <linearGradient id="carBody" x1="0" x2="1" y1="0" y2="1">
                <stop stopColor="#263447" />
                <stop offset="0.52" stopColor="#0f172a" />
                <stop offset="1" stopColor="#020617" />
              </linearGradient>
              <filter id="carGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d="M32 78c9-24 28-42 51-48h54c23 6 42 24 51 48l-13 22H45L32 78Z" fill="url(#carBody)" stroke="#38bdf8" strokeWidth="3" filter="url(#carGlow)" />
            <path d="M79 36h62l20 32H59l20-32Z" fill="#0b1220" stroke="#94a3b8" strokeWidth="2" />
            <path d="M49 91h122" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="62" cy="101" rx="19" ry="8" fill="#020617" stroke="#64748b" strokeWidth="3" />
            <ellipse cx="158" cy="101" rx="19" ry="8" fill="#020617" stroke="#64748b" strokeWidth="3" />
            <path d="M38 75h24M158 75h24" stroke="#f43f5e" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>
      <div className="gyro-readouts">
        <Readout label="PITCH" value={orientation?.pitch ?? null} />
        <Readout label="ROLL" value={orientation?.roll ?? null} />
        <Readout label="YAW" value={orientation?.yaw ?? null} />
      </div>
    </section>
  );
}

function Readout({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="gyro-readout">
      <span>{label}</span>
      <strong>{value === null ? '--' : `${round(value, 1)}°`}</strong>
    </div>
  );
}
