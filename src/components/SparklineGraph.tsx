interface SparklineGraphProps {
  data: number[];
  color?: string;
}

export function SparklineGraph({ data, color = '#22d3ee' }: SparklineGraphProps) {
  const width = 120;
  const height = 32;
  const values = data.length > 1 ? data : [0, 0.1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 5) - 2.5;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible" role="img" aria-label="Sparkline">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
