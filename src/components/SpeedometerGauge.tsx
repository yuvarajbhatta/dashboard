import { motion } from 'framer-motion';
import { speedLabel, speedFromMps } from '../lib/format';
import type { UnitSystem } from '../types/telemetry';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function SpeedometerGauge({ speedMps, units }: { speedMps: number | null; units: UnitSystem }) {
  const hasSpeed = speedMps !== null;
  const speed = hasSpeed ? Math.round(speedFromMps(speedMps, units)) : 0;
  const maxSpeed = units === 'mph' ? 200 : 240;
  const progress = clamp((speed / maxSpeed) * 100, 0, 100);

  return (
    <section className="cockpit-panel speedometer-panel simple-speed-panel">
      <div className="tesla-speed-minimal">
        <motion.div
          key={hasSpeed ? speed : 'waiting'}
          initial={{ opacity: 0.4, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className="tesla-speed-number"
        >
          <span className="tesla-speed-digits">
            {hasSpeed ? speed : '0'}
          </span>
        </motion.div>

        <div className="tesla-speed-unit">
          {speedLabel(units)}
        </div>
      </div>
    </section>
  );
}
