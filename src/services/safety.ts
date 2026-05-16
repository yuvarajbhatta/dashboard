import type { GForceSample, SafetyCounters, SafetyEvent } from '../types/telemetry';

export const safetyThresholds = {
  hardBrakeG: -0.42,
  aggressiveAccelerationG: 0.36,
  hardCornerG: 0.4,
  swerveDeltaG: 0.5,
  shockTotalG: 1.55,
  instabilityTotalG: 0.85,
  cooldownMs: 1400
};

const eventMeta: Record<keyof SafetyCounters, { label: string; penalty: number }> = {
  hardBrakes: { label: 'Hard brake', penalty: 6 },
  aggressiveAccelerations: { label: 'Aggressive acceleration', penalty: 4 },
  hardCorners: { label: 'Aggressive turn', penalty: 5 },
  suddenSwerves: { label: 'Sudden swerve', penalty: 4 },
  shockSpikes: { label: 'Shock spike', penalty: 3 },
  instability: { label: 'Excessive instability', penalty: 2 }
};

export function classifySafetyEvents(
  sample: GForceSample,
  previous: GForceSample | null,
  lastEvents: Partial<Record<keyof SafetyCounters, number>>
) {
  const detections: Array<{ type: keyof SafetyCounters; value: number }> = [];

  if (sample.longitudinal <= safetyThresholds.hardBrakeG) {
    detections.push({ type: 'hardBrakes', value: sample.longitudinal });
  }
  if (sample.longitudinal >= safetyThresholds.aggressiveAccelerationG) {
    detections.push({ type: 'aggressiveAccelerations', value: sample.longitudinal });
  }
  if (Math.abs(sample.lateral) >= safetyThresholds.hardCornerG) {
    detections.push({ type: 'hardCorners', value: sample.lateral });
  }
  if (previous && Math.abs(sample.lateral - previous.lateral) >= safetyThresholds.swerveDeltaG) {
    detections.push({ type: 'suddenSwerves', value: sample.lateral - previous.lateral });
  }
  if (sample.total >= safetyThresholds.shockTotalG) {
    detections.push({ type: 'shockSpikes', value: sample.total });
  }
  if (sample.total >= safetyThresholds.instabilityTotalG && sample.total < safetyThresholds.shockTotalG) {
    detections.push({ type: 'instability', value: sample.total });
  }

  return detections
    .filter(({ type }) => sample.timestamp - (lastEvents[type] ?? 0) >= safetyThresholds.cooldownMs)
    .map(({ type, value }) => {
      const meta = eventMeta[type];
      return {
        id: `${type}-${sample.timestamp}`,
        type,
        label: meta.label,
        penalty: meta.penalty,
        value,
        timestamp: sample.timestamp
      } satisfies SafetyEvent;
    });
}

export function emptySafetyCounters(): SafetyCounters {
  return {
    hardBrakes: 0,
    aggressiveAccelerations: 0,
    hardCorners: 0,
    suddenSwerves: 0,
    shockSpikes: 0,
    instability: 0
  };
}

export function smoothnessLabel(score: number) {
  if (score >= 94) return 'Excellent';
  if (score >= 86) return 'Stable';
  if (score >= 76) return 'Assertive';
  if (score >= 64) return 'Aggressive';
  return 'Critical';
}
