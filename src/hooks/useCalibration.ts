import { useDashboardStore } from '../store/dashboardStore';

export function useCalibration() {
  const calibration = useDashboardStore((state) => state.calibration);
  const calibrate = useDashboardStore((state) => state.calibrate);
  const orientation = useDashboardStore((state) => state.orientation);

  return { calibration, calibrate, orientation };
}
