import React from 'react';

export default function LineChart({ data, dataKey, strokeColor = '#8884d8', height = 200 }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d[dataKey] || 0));
  const minValue = Math.min(...data.map(d => d[dataKey] || 0));
  const range = maxValue - minValue || 1;

  const width = 100; // abstract width unit for path, not %
  const padding = 10;

  const getX = (i) => (i / (data.length - 1)) * width;
  const getY = (val) => ((maxValue - val) / range) * (height - padding * 2) + padding;

  // Create the main line path (NO % HERE)
  const linePath = data
    .map((point, i) => {
      const x = getX(i);
      const y = getY(point[dataKey] || 0);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Area path
  const areaPath =
    linePath +
    ` L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width="100%" height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${dataKey}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>

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

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />

      {/* Area fill */}
      <path
        d={areaPath}
        fill={`url(#gradient-${dataKey})`}
        opacity="0.6"
      />

      {/* Data points */}
      {data.map((point, i) => {
        const x = getX(i);
        const y = getY(point[dataKey] || 0);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill={strokeColor}
            className="transition-all hover:r-5"
          />
        );
      })}
    </svg>
  );
}
