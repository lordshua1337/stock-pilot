// 24-month backtest chart: portfolio vs S&P 500
// Synthetic historical data derived from stock characteristics (beta, aiScore, change)

import { useMemo } from "react";
import type { Stock } from "@/lib/stock-data";
import type { PortfolioItem } from "../page";

interface BacktestChartProps {
  portfolio: PortfolioItem[];
  portfolioStocks: Stock[];
  totalInvestment: number;
}

const MONTHS = 24;
const WIDTH = 600;
const HEIGHT = 260;
const PAD = { top: 20, right: 50, bottom: 30, left: 10 };
const CHART_W = WIDTH - PAD.left - PAD.right;
const CHART_H = HEIGHT - PAD.top - PAD.bottom;

// S&P 500 synthetic monthly returns (based on ~8% annual average with variance)
const SP500_MONTHLY_RETURNS = [
  0.012, -0.008, 0.015, 0.003, -0.012, 0.018, 0.007, -0.003, 0.014, 0.005,
  -0.015, 0.022, 0.009, -0.006, 0.011, 0.008, -0.018, 0.025, 0.004, -0.002,
  0.016, 0.006, -0.009, 0.013,
];

export function BacktestChart({
  portfolio,
  portfolioStocks,
  totalInvestment,
}: BacktestChartProps) {
  const { portfolioValues, sp500Values } = useMemo(() => {
    const totalAlloc = portfolio.reduce((s, p) => s + p.allocation, 0);
    if (totalAlloc === 0) {
      return { portfolioValues: [totalInvestment], sp500Values: [totalInvestment] };
    }

    // Weighted portfolio characteristics
    const weightedBeta = portfolio.reduce((sum, item) => {
      const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
      return sum + (stock?.beta ?? 1) * (item.allocation / totalAlloc);
    }, 0);

    const weightedAiScore = portfolio.reduce((sum, item) => {
      const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
      return sum + (stock?.aiScore ?? 50) * (item.allocation / totalAlloc);
    }, 0);

    // Alpha from AI score: high aiScore stocks tend to outperform slightly
    const monthlyAlpha = ((weightedAiScore - 50) / 50) * 0.003; // max +/- 0.3% per month

    // Build portfolio returns: beta * market + alpha + noise
    const portfolioVals: number[] = [totalInvestment];
    const sp500Vals: number[] = [totalInvestment];

    for (let m = 0; m < MONTHS; m++) {
      const marketReturn = SP500_MONTHLY_RETURNS[m];
      const portfolioReturn = marketReturn * weightedBeta + monthlyAlpha;

      portfolioVals.push(portfolioVals[m] * (1 + portfolioReturn));
      sp500Vals.push(sp500Vals[m] * (1 + marketReturn));
    }

    return { portfolioValues: portfolioVals, sp500Values: sp500Vals };
  }, [portfolio, portfolioStocks, totalInvestment]);

  // Y-axis range
  const allValues = [...portfolioValues, ...sp500Values];
  const yMin = Math.min(...allValues) * 0.98;
  const yMax = Math.max(...allValues) * 1.02;

  const xScale = (month: number) => PAD.left + (month / MONTHS) * CHART_W;
  const yScale = (value: number) =>
    PAD.top + CHART_H - ((value - yMin) / (yMax - yMin)) * CHART_H;

  function buildLine(values: number[]): string {
    return values
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(v)}`)
      .join(" ");
  }

  // Calculate total returns
  const portfolioReturn =
    ((portfolioValues[MONTHS] - totalInvestment) / totalInvestment) * 100;
  const sp500Return =
    ((sp500Values[MONTHS] - totalInvestment) / totalInvestment) * 100;

  // Month labels (show every 6 months)
  const monthLabels = Array.from({ length: MONTHS + 1 }, (_, i) =>
    i === 0 ? "-24m" : i === 12 ? "-12m" : i === MONTHS ? "Now" : ""
  );

  return (
    <div>
      <h3 className="text-sm font-semibold mb-1">Historical Backtest</h3>
      <p className="text-xs text-text-muted mb-4">
        24-month simulated performance vs S&P 500
      </p>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = PAD.top + CHART_H * (1 - pct);
          const val = yMin + (yMax - yMin) * pct;
          return (
            <g key={pct}>
              <line x1={PAD.left} y1={y} x2={PAD.left + CHART_W} y2={y} stroke="#e5e5e7" strokeWidth="0.5" />
              <text x={PAD.left + CHART_W + 4} y={y + 3} fill="#aeaeb2" fontSize="9" fontFamily="JetBrains Mono">
                {(val / 1000).toFixed(1)}k
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {monthLabels.map((label, i) =>
          label ? (
            <text
              key={i}
              x={xScale(i)}
              y={HEIGHT - 6}
              textAnchor="middle"
              fill="#aeaeb2"
              fontSize="9"
            >
              {label}
            </text>
          ) : null
        )}

        {/* S&P 500 line */}
        <path d={buildLine(sp500Values)} fill="none" stroke="#aeaeb2" strokeWidth="1.5" strokeDasharray="4 2" />

        {/* Portfolio line */}
        <path d={buildLine(portfolioValues)} fill="none" stroke="#006DD8" strokeWidth="2" />

        {/* End dots */}
        <circle cx={xScale(MONTHS)} cy={yScale(sp500Values[MONTHS])} r="3" fill="#aeaeb2" />
        <circle cx={xScale(MONTHS)} cy={yScale(portfolioValues[MONTHS])} r="3" fill="#006DD8" />
      </svg>

      {/* Legend + returns */}
      <div className="flex justify-center gap-8 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green rounded" />
          <span className="text-[11px] text-text-secondary">
            Portfolio:{" "}
            <span className={`font-mono font-medium ${portfolioReturn >= 0 ? "text-green" : "text-red"}`}>
              {portfolioReturn >= 0 ? "+" : ""}{portfolioReturn.toFixed(1)}%
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-text-muted rounded" style={{ backgroundImage: "repeating-linear-gradient(90deg, #666 0 4px, transparent 4px 6px)" }} />
          <span className="text-[11px] text-text-secondary">
            S&P 500:{" "}
            <span className={`font-mono font-medium ${sp500Return >= 0 ? "text-green" : "text-red"}`}>
              {sp500Return >= 0 ? "+" : ""}{sp500Return.toFixed(1)}%
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
