import { Suspense, lazy, useEffect, useState } from 'react';
import { ArrowDown, ArrowLeftRight, ArrowUp, Clock3, Gauge, Rotate3D, Route } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { AccelerationPanel } from '../components/AccelerationPanel';
import { BottomNav, type NavTab } from '../components/BottomNav';
import { HeadingCard, WeatherCard } from '../components/DashboardInfoCards';
import { ForceGraphCard } from '../components/ForceGraphCard';
import { MiniMetricCard } from '../components/MiniMetricCard';
import { SafetyScoreGauge } from '../components/SafetyScoreGauge';
import { SensorDebugView } from '../components/SensorDebugView';
import { SettingsTab } from '../components/SettingsTab';
import { SpeedometerGauge } from '../components/SpeedometerGauge';
import { StartupAnimation } from '../components/StartupAnimation';
import { TopStatusBar } from '../components/TopStatusBar';
import { VehicleGyroscope3D } from '../components/VehicleGyroscope3D';
import { useCalibration } from '../hooks/useCalibration';
import { useDeviceMotion } from '../hooks/useDeviceMotion';
import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import { useGeolocation } from '../hooks/useGeolocation';
import { useTelemetryView } from '../hooks/useTelemetryView';
import { useThemeMode } from '../hooks/useThemeMode';
import { useWeather } from '../hooks/useWeather';
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
  const telemetry = useTelemetryView();
  const { calibrate } = useCalibration();
  const weather = useWeather(telemetry.raw.gps);
  const setDriveMode = useDashboardStore((state) => state.setDriveMode);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [fullscreenMessage, setFullscreenMessage] = useState<string | null>(null);

  useEffect(() => {
    setDriveMode(true);
    const params = new URLSearchParams(window.location.search);
    if (params.get('drive') === '1') setDriveMode(true);
  }, [setDriveMode]);

  const requestSensors = async () => {
    await Promise.allSettled([geoSensor.requestPermission(), motionSensor.requestPermission(), orientationSensor.requestPermission()]);
    if ('vibrate' in navigator) navigator.vibrate([28, 22, 28]);
  };

  const maximize = async () => {
    setDriveMode(true);
    setFullscreenMessage(null);
    if (!document.documentElement.requestFullscreen) {
      setFullscreenMessage('Fullscreen is not available in this Safari context. Add the app to Home Screen for standalone display.');
      setActiveTab('settings');
      return;
    }
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setFullscreenMessage('Fullscreen was blocked. On iPhone, use Share -> Add to Home Screen for the best full-screen dashboard.');
      setActiveTab('settings');
    }
  };

  const handleNav = (tab: NavTab) => {
    setActiveTab(tab);
  };

  const braking = telemetry.motion === null ? null : Math.abs(Math.min(0, telemetry.motion.longitudinal));
  const acceleration = telemetry.motion === null ? null : Math.max(0, telemetry.motion.longitudinal);
  const cornering = telemetry.motion === null ? null : Math.abs(telemetry.motion.lateral);
  const hasGpsSpeed = telemetry.speedMps !== null;
  const valueOrDash = (value: number | null, digits = 2) => (value === null ? '--' : round(value, digits).toFixed(digits));
  const tripStart = telemetry.startedAt === null ? '--' : format(telemetry.startedAt, 'h:mm a');
  const tripDate = telemetry.startedAt === null ? 'Waiting for trip' : format(telemetry.startedAt, 'MMM d, yyyy');
  const orientation = telemetry.orientation;

  return (
    <main className="app-shell cockpit-shell">
      <StartupAnimation />
      <div className="scanline" />
      <TopStatusBar now={telemetry.now} realSensorMode={telemetry.realSensorMode} gpsActive={telemetry.live.gps} onMaximize={maximize} />
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className={activeTab === 'dashboard' ? 'cockpit-layout dashboard-tab-layout' : 'cockpit-layout tab-page-layout'}
      >
        {activeTab === 'dashboard' ? (
          <>
            <div className="force-graphs-zone">
              <ForceGraphCard title="Acceleration" value={valueOrDash(acceleration)} dataKey="acceleration" history={telemetry.history} color="#a3e635" icon={<ArrowUp className="h-4 w-4" />} />
              <ForceGraphCard title="Braking" value={valueOrDash(braking)} dataKey="braking" history={telemetry.history} color="#fb345c" icon={<ArrowDown className="h-4 w-4" />} />
              {/*<MiniMetricCard label="Trip Duration" value={formatElapsed(telemetry.elapsedMs)} unit="hh : mm : ss" icon={<Clock3 className="h-4 w-4" />} accent="orange" progress={telemetry.tripStatus === 'active' ? 100 : 0} />*/}
              {/*<MiniMetricCard label="Trip Start" value={tripStart} unit={tripDate} icon={<Route className="h-4 w-4" />} accent="blue" progress={telemetry.startedAt === null ? 0 : 100} />*/}
            </div>
            <div className="speed-zone">
              <SpeedometerGauge speedMps={telemetry.speedMps} units={telemetry.units} />
            </div>
            <div className="right-info-zone">
              <HeadingCard heading={telemetry.heading} label={telemetry.headingLabel} />
              <WeatherCard weather={weather.weather} status={weather.status} />
              {/*<PhoneTemperatureCard />*/}
            </div>
          </>
        ) : null}

        {activeTab === 'performance' ? (
          <>
            <div className="performance-metrics">
              <MiniMetricCard label="Acceleration G" value={valueOrDash(acceleration)} unit="G" icon={<ArrowUp className="h-4 w-4" />} accent="green" progress={(acceleration ?? 0) * 180} sparkline={spark(telemetry.history, 'acceleration')} />
              <MiniMetricCard label="Pitch" value={orientation === null ? '--' : round(orientation.pitch, 1).toFixed(1)} unit="deg" icon={<Rotate3D className="h-4 w-4" />} accent="blue" progress={Math.abs(orientation?.pitch ?? 0)} />
              <MiniMetricCard label="Roll" value={orientation === null ? '--' : round(orientation.roll, 1).toFixed(1)} unit="deg" icon={<ArrowLeftRight className="h-4 w-4" />} accent="orange" progress={Math.abs(orientation?.roll ?? 0)} />
              <MiniMetricCard label="Yaw" value={orientation === null ? '--' : round(orientation.yaw, 0).toFixed(0)} unit="deg" icon={<Gauge className="h-4 w-4" />} accent="red" progress={orientation === null ? 0 : (orientation.yaw / 360) * 100} />
            </div>
            <div className="performance-g-panel">
              <AccelerationPanel motion={telemetry.motion} history={telemetry.history} />
            </div>
            <div className="performance-gyro-panel">
              <VehicleGyroscope3D orientation={telemetry.orientation} />
            </div>
            <div className="performance-speed-graph">
              <Suspense fallback={<div className="cockpit-panel graph-panel"><div className="panel-kicker">SPEED GRAPH LIVE</div></div>}>
                <SpeedGraphLive history={telemetry.history} units={telemetry.units} />
              </Suspense>
            </div>
            <div className="performance-accel-graph">
              <Suspense fallback={<div className="cockpit-panel graph-panel"><div className="panel-kicker">ACCELERATION GRAPH</div></div>}>
                <AccelerationGraph history={telemetry.history} />
              </Suspense>
            </div>
          </>
        ) : null}

        {activeTab === 'safety' ? (
          <div className="safety-page-zone">
            <SafetyScoreGauge score={telemetry.safetyScore} counters={telemetry.safetyCounters} />
            <div className="safety-trip-metrics">
              <MiniMetricCard label="Trip Distance" value={round(distanceFromMeters(telemetry.distanceMeters, telemetry.units), 2).toFixed(2)} unit={distanceLabel(telemetry.units)} icon={<Route className="h-4 w-4" />} accent="blue" progress={62} />
              <MiniMetricCard label="Avg Speed" value={hasGpsSpeed ? Math.round(speedFromMps(telemetry.averageSpeedMps, telemetry.units)).toString() : '--'} unit={speedLabel(telemetry.units)} icon={<Gauge className="h-4 w-4" />} accent="green" progress={hasGpsSpeed ? 56 : 0} />
              <MiniMetricCard label="Cornering" value={valueOrDash(cornering)} unit="G" icon={<ArrowLeftRight className="h-4 w-4" />} accent="orange" progress={(cornering ?? 0) * 170} sparkline={spark(telemetry.history, 'cornering')} />
            </div>
          </div>
        ) : null}

        {activeTab === 'settings' ? (
          <div className="settings-page-zone">
            <SettingsTab
              onRequestSensors={requestSensors}
              motionStatus={motionSensor.status}
              orientationStatus={orientationSensor.status}
              geoStatus={geoSensor.status}
              fullscreenMessage={fullscreenMessage}
            />
            <SensorDebugView
              gps={telemetry.raw.gps}
              motion={telemetry.raw.motion}
              orientation={telemetry.raw.orientation}
              onEnableSensors={requestSensors}
              onCalibrate={calibrate}
            />
          </div>
        ) : null}
        </motion.div>
      <BottomNav active={activeTab} onSelect={handleNav} onMaximize={maximize} />
      <div className="rotate-phone-overlay">Rotate iPhone horizontally</div>
    </main>
  );
}
