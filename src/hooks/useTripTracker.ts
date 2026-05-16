import { useCallback, useEffect } from 'react';
import { saveTrip, loadTrips } from '../services/storage';
import { useDashboardStore } from '../store/dashboardStore';

export function useTripTracker() {
  const tripStatus = useDashboardStore((state) => state.tripStatus);
  const startTrip = useDashboardStore((state) => state.startTrip);
  const pauseTrip = useDashboardStore((state) => state.pauseTrip);
  const resumeTrip = useDashboardStore((state) => state.resumeTrip);
  const finishTripSnapshot = useDashboardStore((state) => state.finishTripSnapshot);
  const setTrips = useDashboardStore((state) => state.setTrips);
  const tick = useDashboardStore((state) => state.tick);

  useEffect(() => {
    let cancelled = false;
    loadTrips().then((trips) => {
      if (!cancelled) setTrips(trips);
    });
    return () => {
      cancelled = true;
    };
  }, [setTrips]);

  useEffect(() => {
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [tick]);

  const endTrip = useCallback(async () => {
    const record = finishTripSnapshot();
    if (!record) return null;
    const trips = await saveTrip(record);
    setTrips(trips);
    return record;
  }, [finishTripSnapshot, setTrips]);

  return {
    tripStatus,
    startTrip,
    pauseTrip,
    resumeTrip,
    endTrip
  };
}
