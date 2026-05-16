import { useMemo } from 'react';
import { smoothnessLabel } from '../services/safety';
import { useDashboardStore } from '../store/dashboardStore';

export function useSafetyScore() {
  const score = useDashboardStore((state) => state.safetyScore);
  const counters = useDashboardStore((state) => state.safetyCounters);
  const events = useDashboardStore((state) => state.safetyEvents);

  const smoothness = useMemo(() => smoothnessLabel(score), [score]);

  return { score, counters, events, smoothness };
}
