import { Suspense, lazy, useEffect, useState } from 'react';
import { Activity, ArrowDown, ArrowLeftRight, ArrowUp, Clock3, Gauge, MapPinned, Route } from 'lucide-react';
import { motion } from 'framer-motion';
import { AccelerationPanel } from '../components/AccelerationPanel';
import { BottomNav, type NavTab } from '../components/BottomNav';
import { CompassGauge } from '../components/CompassGauge';
import { MiniMetricCard } from '../components/MiniMetricCard';
import { SafetyScoreGauge } from '../components/SafetyScoreGauge';
import { SensorDebugView } from '../components/SensorDebugView';
import { SensorStatusPanel } from '../components/SensorStatusPanel';
import { SettingsModal } from '../components/SettingsModal';
import { SpeedometerGauge } from '../components/SpeedometerGauge';
import { StartupAnimation } from '../components/StartupAnimation';
import { TireRoadFeedback } from '../components/TireRoadFeedback';
import { TopStatusBar } from '../components/TopStatusBar';
import { VehicleGyroscope3D } from '../components/VehicleGyroscope3D';
import { useDeviceMotion } from '../hooks/useDeviceMotion';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import { useGeolocation } from '../hooks/useGeolocation';
import { useCalibration } from '../hooks/useCalibration';
import { useTelemetryView } from '../hooks/useTelemetryView';
import { useThemeMode } from '../hooks/useThemeMode';
import { distanceFromMeters, distanceLabel, formatElapsed, round, speedFromMps, speedLabel } from '../lib/format';
import { useDashboardStore } from '../store/dashboardStore';

const SpeedGraphLive = lazy(() => import('../components/TelemetryGraphPanel').then((module) => ({ default: module.SpeedGraphLive })));
const AccelerationGraph = lazy(() => import('../components/TelemetryGraphPanel').then((module) => ({ default: module.AccelerationGraph })));

function spark(history: Array<{ totalG: number; acceleration: number; braking: number; cornering: number }>, key: 'totalG' | 'acceleration' | 'braking' | 'cornering') {
  return history.slice(-22).map((point) => point[key]);
}

export function Dashboard() {
  useThemeMode();
  const geoSensor = useGeolocation();
  const motionSensor = useDeviceMotion();
  const orientationSensor = useDeviceOrientation();
  const { calibrate } = useCalibration();
  const telemetry = useTelemetryView();
  const setDriveMode = useDashboardStore((state) => state.setDriveMode);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setDriveMode(true);
    const params = new URLSearchParams(window.location.search);
    if (params.get('drive') === '1') setDriveMode(true);
  }, [setDriveMode]);

  const requestSensors = async () => {
    await Promise.allSettled([geoSensor.requestPermission(), motionSensor.requestPermission(), orientationSensor.requestPermission()]);
    if ('vibrate' in navigator) navigator.vibrate([28, 22, 28]);
  };

  const minimize = async () => {
    setDriveMode(false);
    if (document.fullscreenElement) await document.exitFullscreen?.();
  };

  const handleNav = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'settings') setSettingsOpen(true);
  };

  const braking = telemetry.motion === null ? null : Math.abs(Math.min(0, telemetry.motion.longitudinal));
  const acceleration = telemetry.motion === null ? null : Math.max(0, telemetry.motion.longitudinal);
  const cornering = telemetry.motion === null ? null : Math.abs(telemetry.motion.lateral);
  const shock = telemetry.motion === null ? null : Math.max(0, telemetry.motion.total - 0.95);
  const hasGpsSpeed = telemetry.speedMps !== null;
  const valueOrDash = (value: number | null, digits = 2) => (value === null ? '--' : round(value, digits).toFixed(digits));

  return (
    <main className="app-shell cockpit-shell">
      <StartupAnimation />
      <div className="scanline" />
      <TopStatusBar now={telemetry.now} realSensorMode={telemetry.realSensorMode} onMinimize={minimize} />
      {activeTab === 'sensors' ? (
        <SensorDebugView
          gps={telemetry.raw.gps}
          motion={telemetry.raw.motion}
          orientation={telemetry.raw.orientation}
          onEnableSensors={requestSensors}
          onCalibrate={calibrate}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="cockpit-layout"
        >
        <div className="speed-zone">
          <SpeedometerGauge speedMps={telemetry.speedMps} units={telemetry.units} />
        </div>

        <div className="compass-zone">
          <CompassGauge heading={telemetry.heading} label={telemetry.headingLabel} />
        </div>

        <div className="gyro-zone">
          <VehicleGyroscope3D orientation={telemetry.orientation} />
        </div>

        <div className="trip-strip">
          <MiniMetricCard label="Trip Distance" value={round(distanceFromMeters(telemetry.distanceMeters, telemetry.units), 2).toFixed(2)} unit={distanceLabel(telemetry.units)} icon={<Route className="h-4 w-4" />} accent="blue" progress={62} />
          <MiniMetricCard label="Duration" value={formatElapsed(telemetry.elapsedMs)} icon={<Clock3 className="h-4 w-4" />} accent="orange" progress={48} />
          <MiniMetricCard label="Avg Speed" value={hasGpsSpeed ? Math.round(speedFromMps(telemetry.averageSpeedMps, telemetry.units)).toString() : '--'} unit={speedLabel(telemetry.units)} icon={<Gauge className="h-4 w-4" />} accent="green" progress={hasGpsSpeed ? 56 : 0} />
          <MiniMetricCard label="Max Speed" value={hasGpsSpeed ? Math.round(speedFromMps(telemetry.maxSpeedMps, telemetry.units)).toString() : '--'} unit={speedLabel(telemetry.units)} icon={<MapPinned className="h-4 w-4" />} accent="red" progress={hasGpsSpeed ? 72 : 0} />
        </div>

        <div className="accel-zone">
          <AccelerationPanel motion={telemetry.motion} history={telemetry.history} />
        </div>

        <div className="speed-graph-zone">
          <Suspense fallback={<div className="cockpit-panel graph-panel"><div className="panel-kicker">SPEED GRAPH LIVE</div></div>}>
            <SpeedGraphLive history={telemetry.history} units={telemetry.units} />
          </Suspense>
        </div>

        <div className="accel-graph-zone">
          <Suspense fallback={<div className="cockpit-panel graph-panel"><div className="panel-kicker">ACCELERATION GRAPH</div></div>}>
            <AccelerationGraph history={telemetry.history} />
          </Suspense>
        </div>

        <div className="safety-zone">
          <SafetyScoreGauge score={telemetry.safetyScore} counters={telemetry.safetyCounters} />
        </div>

        <div className="feedback-zone">
          <TireRoadFeedback motion={telemetry.motion} />
          <SensorStatusPanel {...telemetry.live} />
        </div>

        <div className="bottom-metrics">
          <MiniMetricCard label="Braking" value={valueOrDash(braking)} unit="G" icon={<ArrowDown className="h-4 w-4" />} accent="red" progress={(braking ?? 0) * 180} sparkline={spark(telemetry.history, 'braking')} />
          <MiniMetricCard label="Acceleration" value={valueOrDash(acceleration)} unit="G" icon={<ArrowUp className="h-4 w-4" />} accent="green" progress={(acceleration ?? 0) * 180} sparkline={spark(telemetry.history, 'acceleration')} />
          <MiniMetricCard label="Cornering" value={valueOrDash(cornering)} unit="G" icon={<ArrowLeftRight className="h-4 w-4" />} accent="orange" progress={(cornering ?? 0) * 170} sparkline={spark(telemetry.history, 'cornering')} />
          <MiniMetricCard label="Shock / Vibration" value={valueOrDash(shock)} unit="G" icon={<Activity className="h-4 w-4" />} accent="blue" progress={(shock ?? 0) * 180} sparkline={spark(telemetry.history, 'totalG')} />
        </div>
        </motion.div>
      )}
      <BottomNav active={activeTab} onSelect={handleNav} onMinimize={minimize} />
      <SettingsModal
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          setActiveTab('dashboard');
        }}
        onRequestSensors={requestSensors}
        motionStatus={motionSensor.status}
        orientationStatus={orientationSensor.status}
        geoStatus={geoSensor.status}
      />
      <div className="rotate-phone-overlay">Rotate iPhone horizontally</div>
    </main>
  );
}
