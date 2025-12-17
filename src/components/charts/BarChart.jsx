import React from 'react';

export default function BarChart({ data, dataKey, fill = '#8884d8', height = 200 }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d[dataKey] || 0));

  return (
    <svg width="100%" height={height} className="overflow-visible">
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(percent => {
        const y = (height - 20) * (1 - percent / 100) + 10;
        return (
          <line
            key={percent}
            x1="0"
            y1={y}
            x2="100%"
            y2={y}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="1"
          />
        );
      })}

      {/* Bars */}
      {data.map((point, i) => {
        const barWidth = 100 / data.length * 0.8;
        const x = (i / data.length) * 100 + (100 / data.length * 0.1);
        const barHeight = ((point[dataKey] || 0) / maxValue) * (height - 20);
        const y = height - barHeight - 10;

        return (
          <g key={i}>
            <rect
              x={`${x}%`}
              y={y}
              width={`${barWidth}%`}
              height={barHeight}
              fill={fill}
              className="transition-all hover:opacity-80"
              rx="4"
            />
          </g>
        );
      })}
    </svg>
  );
}