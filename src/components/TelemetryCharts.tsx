import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { speedFromMps } from '../lib/format';
import { useDashboardStore } from '../store/dashboardStore';

export function TelemetryCharts() {
  const units = useDashboardStore((state) => state.units);
  const chartHistory = useDashboardStore((state) => state.chartHistory);
  const data = chartHistory.map((point) => ({
    ...point,
    speed: Math.round(speedFromMps(point.speed, units))
  }));

  return (
    <section className="hud-panel min-h-64 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="panel-title text-cyan-100">Telemetry Graphs</h2>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Live rolling window</span>
      </div>
      <div className="grid h-56 grid-cols-1 gap-3 md:grid-cols-2">
        <Chart title="Speed" data={data} lines={[{ key: 'speed', color: '#22d3ee' }]} unit={units === 'mph' ? 'mph' : 'km/h'} />
        <Chart
          title="G Analysis"
          data={data}
          lines={[
            { key: 'braking', color: '#f43f5e' },
            { key: 'acceleration', color: '#a3e635' },
            { key: 'cornering', color: '#f59e0b' },
            { key: 'totalG', color: '#38bdf8' }
          ]}
          unit="G"
        />
      </div>
    </section>
  );
}

interface ChartProps {
  title: string;
  data: Array<Record<string, string | number>>;
  lines: Array<{ key: string; color: string }>;
  unit: string;
}

function Chart({ title, data, lines, unit }: ChartProps) {
  return (
    <div className="min-h-0 rounded-md border border-white/10 bg-slate-950/50 p-3">
      <div className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-300">{title}</div>
      <ResponsiveContainer width="100%" height="86%">
        <LineChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{
              background: 'rgba(2, 6, 23, 0.92)',
              border: '1px solid rgba(148, 163, 184, 0.22)',
              borderRadius: 8,
              color: '#e2e8f0'
            }}
            formatter={(value) => [`${Number(value).toFixed(2)} ${unit}`, title]}
            labelStyle={{ color: '#94a3b8' }}
          />
          {lines.map((line) => (
            <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color} dot={false} strokeWidth={2} isAnimationActive />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
