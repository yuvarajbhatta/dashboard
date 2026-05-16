import { Compass, LocateFixed, Shield, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatusPill } from './StatusPill';
import type { SensorStatus } from '../types/telemetry';

interface PermissionPanelProps {
  motionStatus: SensorStatus;
  orientationStatus: SensorStatus;
  geoStatus: SensorStatus;
  onRequestSensors: () => Promise<void>;
}

export function PermissionPanel({ motionStatus, orientationStatus, geoStatus, onRequestSensors }: PermissionPanelProps) {
  const ready = motionStatus === 'granted' && orientationStatus === 'granted';

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="hud-panel border-cyan-300/25 p-4"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-cyan-100">
            <Smartphone className="h-5 w-5" />
            <h2 className="panel-title">Sensor Arming</h2>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-slate-300">
            iPhone Safari requires a touch before motion and orientation sensors can run. GPS also requires HTTPS or
            localhost. Mount the phone horizontally, then arm sensors and calibrate the dashboard.
          </p>
        </div>
        <button className="control-button primary min-w-48" onClick={onRequestSensors} type="button">
          <Shield className="h-5 w-5" />
          <span>{ready ? 'Sensors Armed' : 'Arm Sensors'}</span>
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusPill label="Motion" status={motionStatus} active={motionStatus === 'granted'} />
        <StatusPill label="Orientation" status={orientationStatus} active={orientationStatus === 'granted'} />
        <StatusPill label="GPS" status={geoStatus} active={geoStatus === 'granted'} />
        <StatusPill label="Compass" status={orientationStatus} active={orientationStatus === 'granted'} />
        <StatusPill label="Location" status={geoStatus} active={geoStatus === 'granted'} />
        <span className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-slate-300">
          <LocateFixed className="h-4 w-4" />
          HTTPS Required
        </span>
        <span className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-slate-300">
          <Compass className="h-4 w-4" />
          Landscape Mount
        </span>
      </div>
    </motion.section>
  );
}
