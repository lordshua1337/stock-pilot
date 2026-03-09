// Grouped horizontal bar chart: Momentum / Value / Stability per ticker
// SVG-only, no external chart library

import type { StockSignal } from "@/lib/portfolio-signals";

interface FactorChartProps {
  signals: StockSignal[];
}

const FACTORS: { key: "momentum" | "value" | "stability"; label: string; color: string }[] = [
  { key: "momentum", label: "Momentum", color: "#006DD8" },
  { key: "value", label: "Value", color: "#448AFF" },
  { key: "stability", label: "Stability", color: "#FFD740" },
];

const BAR_HEIGHT = 6;
const GROUP_GAP = 28;
const BAR_GAP = 3;
const LEFT_PAD = 60;
const RIGHT_PAD = 30;
const TOP_PAD = 10;
const WIDTH = 500;

export function FactorChart({ signals }: FactorChartProps) {
  if (signals.length === 0) return null;

  const groupHeight = FACTORS.length * (BAR_HEIGHT + BAR_GAP) - BAR_GAP;
  const totalHeight =
    TOP_PAD + signals.length * (groupHeight + GROUP_GAP) - GROUP_GAP + 10;

  const barMaxWidth = WIDTH - LEFT_PAD - RIGHT_PAD;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-1">Factor Comparison</h3>
      <p className="text-xs text-text-muted mb-4">
        Momentum, Value, and Stability scores by position
      </p>

      <svg viewBox={`0 0 ${WIDTH} ${totalHeight}`} className="w-full">
        {/* Scale markers */}
        {[0, 25, 50, 75, 100].map((v) => {
          const x = LEFT_PAD + (v / 100) * barMaxWidth;
          return (
            <g key={v}>
              <line
                x1={x} y1={TOP_PAD - 5}
                x2={x} y2={totalHeight}
                stroke="#2A2A2A"
                strokeWidth="0.5"
              />
              <text
                x={x} y={TOP_PAD - 8}
                textAnchor="middle"
                fill="#666"
                fontSize="8"
                fontFamily="JetBrains Mono"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* Groups */}
        {signals.map((sig, gIdx) => {
          const groupY = TOP_PAD + gIdx * (groupHeight + GROUP_GAP);

          return (
            <g key={sig.ticker}>
              {/* Ticker label */}
              <text
                x={LEFT_PAD - 8}
                y={groupY + groupHeight / 2 + 1}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#F5F5F5"
                fontSize="11"
                fontWeight="600"
                fontFamily="JetBrains Mono"
              >
                {sig.ticker}
              </text>

              {/* Bars */}
              {FACTORS.map((factor, bIdx) => {
                const score = sig.subScores[factor.key];
                const barY = groupY + bIdx * (BAR_HEIGHT + BAR_GAP);
                const barWidth = (score / 100) * barMaxWidth;

                return (
                  <g key={factor.key}>
                    {/* Background track */}
                    <rect
                      x={LEFT_PAD}
                      y={barY}
                      width={barMaxWidth}
                      height={BAR_HEIGHT}
                      rx={3}
                      fill="#1A1A1A"
                    />
                    {/* Filled bar */}
                    <rect
                      x={LEFT_PAD}
                      y={barY}
                      width={Math.max(barWidth, 2)}
                      height={BAR_HEIGHT}
                      rx={3}
                      fill={factor.color}
                      opacity={0.85}
                    />
                    {/* Score label */}
                    <text
                      x={LEFT_PAD + barWidth + 4}
                      y={barY + BAR_HEIGHT / 2 + 1}
                      dominantBaseline="middle"
                      fill="#A0A0A0"
                      fontSize="8"
                      fontFamily="JetBrains Mono"
                    >
                      {score}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-5 mt-3">
        {FACTORS.map((f) => (
          <div key={f.key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: f.color }} />
            <span className="text-[10px] text-text-muted">{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
