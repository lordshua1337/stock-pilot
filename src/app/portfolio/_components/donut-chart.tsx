// Reusable SVG donut chart for sector exposure and position breakdown

interface Segment {
  label: string;
  value: number; // percentage
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
  size = 180,
}: DonutChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 8;
  const innerRadius = outerRadius * 0.6;

  // Filter out zero-value segments and compute paths
  const validSegments = segments.filter((s) => s.value > 0);
  const total = validSegments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-2">
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          <circle
            cx={cx}
            cy={cy}
            r={outerRadius}
            fill="none"
            stroke="#e5e5e7"
            strokeWidth={outerRadius - innerRadius}
          />
        </svg>
        <p className="text-xs text-text-muted">No data</p>
      </div>
    );
  }

  // Build arc paths
  let startAngle = -90; // start at top
  const arcs = validSegments.map((seg) => {
    const sweep = (seg.value / total) * 360;
    const endAngle = startAngle + sweep;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1Outer = cx + outerRadius * Math.cos(startRad);
    const y1Outer = cy + outerRadius * Math.sin(startRad);
    const x2Outer = cx + outerRadius * Math.cos(endRad);
    const y2Outer = cy + outerRadius * Math.sin(endRad);
    const x1Inner = cx + innerRadius * Math.cos(endRad);
    const y1Inner = cy + innerRadius * Math.sin(endRad);
    const x2Inner = cx + innerRadius * Math.cos(startRad);
    const y2Inner = cy + innerRadius * Math.sin(startRad);

    const largeArc = sweep > 180 ? 1 : 0;

    const path = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}`,
      "Z",
    ].join(" ");

    startAngle = endAngle;

    return { ...seg, path };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {/* Gap ring */}
        <circle cx={cx} cy={cy} r={outerRadius} fill="none" stroke="#e5e5e7" strokeWidth="1" />

        {arcs.map((arc, i) => (
          <path
            key={i}
            d={arc.path}
            fill={arc.color}
            stroke="#f5f5f7"
            strokeWidth="1.5"
            className="transition-opacity hover:opacity-80"
          />
        ))}

        {/* Center text */}
        {centerValue && (
          <>
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#1d1d1f"
              fontSize="18"
              fontWeight="700"
              fontFamily="JetBrains Mono, monospace"
            >
              {centerValue}
            </text>
            {centerLabel && (
              <text
                x={cx}
                y={cy + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#aeaeb2"
                fontSize="10"
              >
                {centerLabel}
              </text>
            )}
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
        {validSegments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[10px] text-text-muted">
              {seg.label} {Math.round(seg.value)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
