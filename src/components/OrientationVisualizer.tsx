import { Compass, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';
import { round } from '../lib/format';
import { useCalibration } from '../hooks/useCalibration';

export function OrientationVisualizer() {
  const { orientation } = useCalibration();

  return (
    <section className="hud-panel overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-200">
          <Compass className="h-5 w-5" />
          <h2 className="panel-title">Vehicle Attitude</h2>
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{Math.round(orientation.yaw)}° yaw</span>
      </div>
      <div className="relative h-48 overflow-hidden rounded-md border border-white/10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.16),transparent_58%),linear-gradient(180deg,rgba(15,23,42,0.7),rgba(2,6,23,0.92))]">
        <div className="absolute inset-0 hud-grid opacity-45" />
        <motion.div
          className="absolute left-1/2 top-1/2 h-20 w-40 -translate-x-1/2 -translate-y-1/2"
          animate={{
            rotateZ: orientation.roll,
            rotateX: -orientation.pitch,
            rotateY: orientation.yaw / 8
          }}
          transition={{ type: 'spring', stiffness: 95, damping: 18 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="vehicle-model">
            <div className="vehicle-cabin" />
            <div className="vehicle-light left" />
            <div className="vehicle-light right" />
          </div>
        </motion.div>
        <Crosshair className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-amber-200/45" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Readout label="Pitch" value={orientation.pitch} />
        <Readout label="Roll" value={orientation.roll} />
        <Readout label="Yaw" value={orientation.yaw} />
      </div>
    </section>
  );
}

function Readout({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] p-2 text-center">
      <div className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-1 font-mono text-lg font-bold text-white">{round(value, 1)}°</div>
    </div>
  );
}
