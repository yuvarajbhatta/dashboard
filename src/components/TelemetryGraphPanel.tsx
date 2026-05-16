import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { speedFromMps } from '../lib/format';
import type { ChartPoint, UnitSystem } from '../types/telemetry';

export function SpeedGraphLive({ history, units }: { history: ChartPoint[]; units: UnitSystem }) {
  const data = history.map((point) => ({ ...point, speed: Math.round(speedFromMps(point.speed, units)) }));
  return (
    <section className="cockpit-panel graph-panel">
      <div className="panel-kicker">SPEED GRAPH LIVE</div>
      {data.length === 0 ? <div className="no-data-label">No real sensor data</div> : null}
      <ResponsiveContainer width="100%" height="82%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="speedFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip content={<ChartTooltip unit={units === 'mph' ? 'MPH' : 'KM/H'} />} />
          <Area type="monotone" dataKey="speed" stroke="#22d3ee" strokeWidth={3} fill="url(#speedFill)" dot={false} isAnimationActive />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}

export function AccelerationGraph({ history }: { history: ChartPoint[] }) {
  return (
    <section className="cockpit-panel graph-panel">
      <div className="panel-kicker">ACCELERATION GRAPH</div>
      {history.length === 0 ? <div className="no-data-label">No real sensor data</div> : null}
      <ResponsiveContainer width="100%" height="82%">
        <LineChart data={history}>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip content={<ChartTooltip unit="G" />} />
          <Line type="monotone" dataKey="acceleration" stroke="#a3e635" strokeWidth={2.6} dot={false} isAnimationActive />
          <Line type="monotone" dataKey="braking" stroke="#fb7185" strokeWidth={2.2} dot={false} isAnimationActive />
          <Line type="monotone" dataKey="cornering" stroke="#f59e0b" strokeWidth={2.2} dot={false} isAnimationActive />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}

function ChartTooltip({ active, payload, unit }: { active?: boolean; payload?: Array<{ value?: number; dataKey?: string }>; unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {payload.slice(0, 3).map((item) => (
        <div key={item.dataKey} className="flex items-center justify-between gap-4">
          <span>{item.dataKey}</span>
          <strong>{Number(item.value ?? 0).toFixed(2)} {unit}</strong>
        </div>
      ))}
    </div>
  );
}
