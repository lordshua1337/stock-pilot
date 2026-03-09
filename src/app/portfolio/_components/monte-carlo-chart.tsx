// 12-month Monte Carlo simulation with 3-line area chart (bull/base/bear)
// Monthly compounding with beta-adjusted returns. All SVG.

import { useMemo } from "react";
import type { Stock } from "@/lib/stock-data";
import type { PortfolioItem } from "../page";
import { formatCurrency } from "../page";

interface MonteCarloChartProps {
  portfolio: PortfolioItem[];
  portfolioStocks: Stock[];
  totalInvestment: number;
}

interface Scenario {
  label: string;
  color: string;
  annualReturn: number; // base annual return before beta adjustment
}

const SCENARIOS: Scenario[] = [
  { label: "Bull", color: "#006DD8", annualReturn: 0.18 },
  { label: "Base", color: "#448AFF", annualReturn: 0.08 },
  { label: "Bear", color: "#FF5252", annualReturn: -0.12 },
];

const MONTHS = 12;
const WIDTH = 600;
const HEIGHT = 260;
const PAD = { top: 20, right: 60, bottom: 30, left: 10 };
const CHART_W = WIDTH - PAD.left - PAD.right;
const CHART_H = HEIGHT - PAD.top - PAD.bottom;

export function MonteCarloChart({
  portfolio,
  portfolioStocks,
  totalInvestment,
}: MonteCarloChartProps) {
  // Weighted portfolio beta
  const portfolioBeta = useMemo(() => {
    const totalAlloc = portfolio.reduce((s, p) => s + p.allocation, 0);
    if (totalAlloc === 0) return 1;
    return portfolio.reduce((sum, item) => {
      const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
      return sum + (stock?.beta ?? 1) * (item.allocation / totalAlloc);
    }, 0);
  }, [portfolio, portfolioStocks]);

  // Generate monthly values for each scenario
  const scenarioData = useMemo(() => {
    return SCENARIOS.map((scenario) => {
      const monthlyReturn = Math.pow(1 + scenario.annualReturn * portfolioBeta, 1 / 12) - 1;
      const points: number[] = [totalInvestment];
      for (let m = 1; m <= MONTHS; m++) {
        points.push(points[m - 1] * (1 + monthlyReturn));
      }
      return { ...scenario, points };
    });
  }, [portfolioBeta, totalInvestment]);

  // Y-axis range
  const allValues = scenarioData.flatMap((s) => s.points);
  const yMin = Math.min(...allValues) * 0.95;
  const yMax = Math.max(...allValues) * 1.05;

  // Coordinate helpers
  const xScale = (month: number) => PAD.left + (month / MONTHS) * CHART_W;
  const yScale = (value: number) =>
    PAD.top + CHART_H - ((value - yMin) / (yMax - yMin)) * CHART_H;

  // Build SVG path + area
  function buildPath(points: number[]): { line: string; area: string } {
    const coords = points.map((v, i) => ({ x: xScale(i), y: yScale(v) }));
    const line = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
    const areaBottom = yScale(yMin);
    const area =
      line +
      ` L ${coords[coords.length - 1].x} ${areaBottom}` +
      ` L ${coords[0].x} ${areaBottom} Z`;
    return { line, area };
  }

  // Month labels
  const monthLabels = Array.from({ length: MONTHS + 1 }, (_, i) =>
    i === 0 ? "Now" : `M${i}`
  );

  return (
    <div>
      <h3 className="text-sm font-semibold mb-1">Monte Carlo Projection</h3>
      <p className="text-xs text-text-muted mb-4">
        12-month simulation with beta-adjusted returns (portfolio beta: {portfolioBeta.toFixed(2)})
      </p>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = PAD.top + CHART_H * (1 - pct);
          const val = yMin + (yMax - yMin) * pct;
          return (
            <g key={pct}>
              <line x1={PAD.left} y1={y} x2={PAD.left + CHART_W} y2={y} stroke="#e5e5e7" strokeWidth="0.5" />
              <text x={PAD.left + CHART_W + 6} y={y + 3} fill="#aeaeb2" fontSize="9" fontFamily="JetBrains Mono">
                {formatCurrency(val)}
              </text>
            </g>
          );
        })}

        {/* Month labels */}
        {monthLabels.filter((_, i) => i % 3 === 0).map((label, idx) => {
          const month = idx * 3;
          return (
            <text
              key={month}
              x={xScale(month)}
              y={HEIGHT - 6}
              textAnchor="middle"
              fill="#aeaeb2"
              fontSize="9"
              fontFamily="Inter"
            >
              {label}
            </text>
          );
        })}

        {/* Scenario areas + lines (bear first so bull renders on top) */}
        {[...scenarioData].reverse().map((scenario) => {
          const { line, area } = buildPath(scenario.points);
          return (
            <g key={scenario.label}>
              <path d={area} fill={scenario.color} opacity={0.08} />
              <path d={line} fill="none" stroke={scenario.color} strokeWidth="2" />
              {/* End dot */}
              <circle
                cx={xScale(MONTHS)}
                cy={yScale(scenario.points[MONTHS])}
                r="3"
                fill={scenario.color}
              />
            </g>
          );
        })}

        {/* Start line */}
        <line
          x1={PAD.left}
          y1={yScale(totalInvestment)}
          x2={PAD.left + CHART_W}
          y2={yScale(totalInvestment)}
          stroke="#aeaeb2"
          strokeWidth="0.5"
          strokeDasharray="4 2"
        />
      </svg>

      {/* Legend + end values */}
      <div className="flex justify-center gap-6 mt-3">
        {scenarioData.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: s.color }} />
            <span className="text-[11px] text-text-secondary">
              {s.label}: <span className="font-mono font-medium">{formatCurrency(s.points[MONTHS])}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
