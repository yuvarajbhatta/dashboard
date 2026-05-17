import type { ReactNode } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import type { ChartPoint } from '../types/telemetry';

export function ForceGraphCard({
  title,
  value,
  unit = 'G',
  dataKey,
  history,
  color,
  icon
}: {
  title: string;
  value: string;
  unit?: string;
  dataKey: 'braking' | 'acceleration';
  history: ChartPoint[];
  color: string;
  icon: ReactNode;
}) {
  const data = history.slice(-56).map((point) => ({
    ...point,
    signed: dataKey === 'braking' ? -point.braking : point.acceleration
  }));
  const positiveLimit = Math.max(1.5, ...data.map((point) => Math.abs(point.signed)));
  const domain: [number, number] = [-positiveLimit, positiveLimit];

  return (
    <section className="cockpit-panel force-graph-card">
      <div className="force-card-head">
        <div className="panel-kicker">
          <span className="force-card-icon" style={{ color }}>{icon}</span>
          {title}
        </div>
        <div className="force-card-value">
          {value} <span>{unit}</span>
        </div>
      </div>
      {data.length === 0 ? <div className="no-data-label">No real sensor data</div> : null}
      <ResponsiveContainer width="100%" height="74%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`${dataKey}Fill`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.38} />
              <stop offset="100%" stopColor={color} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical horizontal />
          <YAxis hide domain={domain} />
          <ReferenceLine y={0} stroke="rgba(226,232,240,0.32)" strokeWidth={1} />
          <Tooltip content={<ForceTooltip unit={unit} label={title} />} />
          <Area
            type="monotone"
            dataKey="signed"
            stroke={color}
            strokeWidth={2.2}
            fill={`url(#${dataKey}Fill)`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="force-live-label">LIVE</div>
    </section>
  );
}

function ForceTooltip({
  active,
  payload,
  unit,
  label
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  unit: string;
  label: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="flex items-center justify-between gap-4">
        <span>{label}</span>
        <strong>
          {Number(payload[0].value ?? 0).toFixed(2)} {unit}
        </strong>
      </div>
    </div>
  );
}
