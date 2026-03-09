// 6-axis radar chart: Momentum, Value, Growth, Stability, Income, Diversification
// Adapted from the 5-axis personality RadarChart pattern

import { useMemo } from "react";
import type { PortfolioItem } from "../page";
import type { StockSignal } from "@/lib/portfolio-signals";
import type { Stock } from "@/lib/stock-data";

interface PortfolioRadarProps {
  portfolio: PortfolioItem[];
  portfolioStocks: Stock[];
  signals: StockSignal[];
}

const SIZE = 260;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RADIUS = 100;
const AXES = 6;

const LABELS = ["Momentum", "Value", "Growth", "Stability", "Income", "Diversification"];

export function PortfolioRadar({ portfolio, portfolioStocks, signals }: PortfolioRadarProps) {
  const scores = useMemo(() => {
    const totalAlloc = portfolio.reduce((s, p) => s + p.allocation, 0);
    if (totalAlloc === 0 || signals.length === 0) {
      return [50, 50, 50, 50, 50, 50];
    }

    // Weighted average of sub-scores
    let momentum = 0;
    let value = 0;
    let growth = 0;
    let stability = 0;

    for (const item of portfolio) {
      const sig = signals.find((s) => s.ticker === item.ticker);
      if (!sig) continue;
      const w = item.allocation / totalAlloc;
      momentum += sig.subScores.momentum * w;
      value += sig.subScores.value * w;
      growth += sig.subScores.growth * w;
      stability += sig.subScores.stability * w;
    }

    // Income: derived from weighted dividend yield (map 0-6% to 0-100)
    const weightedDiv = portfolio.reduce((sum, item) => {
      const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
      return sum + (stock?.dividendYield ?? 0) * (item.allocation / totalAlloc);
    }, 0);
    const income = Math.min(100, Math.round(weightedDiv * 16.7)); // 6% yield = 100

    // Diversification: based on unique sectors and position count
    const sectorSet = new Set(portfolioStocks.map((s) => s.sector));
    const sectorScore = Math.min(50, sectorSet.size * 10); // 5+ sectors = 50
    const countScore = Math.min(50, portfolio.length * 5); // 10+ positions = 50
    const diversification = sectorScore + countScore;

    return [
      Math.round(momentum),
      Math.round(value),
      Math.round(growth),
      Math.round(stability),
      income,
      diversification,
    ];
  }, [portfolio, portfolioStocks, signals]);

  // Calculate polygon points for a given scale (0-1)
  function getPoints(scale: number): string {
    return Array.from({ length: AXES }, (_, i) => {
      const angle = (Math.PI * 2 * i) / AXES - Math.PI / 2;
      const x = CX + RADIUS * scale * Math.cos(angle);
      const y = CY + RADIUS * scale * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  }

  // Data points
  const dataPoints = scores.map((score, i) => {
    const scale = score / 100;
    const angle = (Math.PI * 2 * i) / AXES - Math.PI / 2;
    return {
      x: CX + RADIUS * scale * Math.cos(angle),
      y: CY + RADIUS * scale * Math.sin(angle),
      value: score,
    };
  });

  // Label positions (pushed further out)
  const labelPositions = Array.from({ length: AXES }, (_, i) => {
    const angle = (Math.PI * 2 * i) / AXES - Math.PI / 2;
    return {
      x: CX + (RADIUS + 28) * Math.cos(angle),
      y: CY + (RADIUS + 28) * Math.sin(angle),
    };
  });

  return (
    <div>
      <h3 className="text-sm font-semibold mb-1">Portfolio Radar</h3>
      <p className="text-xs text-text-muted mb-4">
        Multi-factor portfolio profile across 6 dimensions
      </p>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[260px] mx-auto">
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1.0].map((scale) => (
          <polygon
            key={scale}
            points={getPoints(scale)}
            fill="none"
            stroke="#2A2A2A"
            strokeWidth="0.5"
          />
        ))}

        {/* Axis lines */}
        {Array.from({ length: AXES }, (_, i) => {
          const angle = (Math.PI * 2 * i) / AXES - Math.PI / 2;
          const x2 = CX + RADIUS * Math.cos(angle);
          const y2 = CY + RADIUS * Math.sin(angle);
          return (
            <line key={i} x1={CX} y1={CY} x2={x2} y2={y2} stroke="#2A2A2A" strokeWidth="0.5" />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="rgba(0, 109, 216, 0.15)"
          stroke="#006DD8"
          strokeWidth="2"
        />

        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#006DD8" />
        ))}

        {/* Labels */}
        {labelPositions.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#A0A0A0"
            fontSize="10"
            fontFamily="Inter, sans-serif"
          >
            {LABELS[i]}
          </text>
        ))}

        {/* Score values next to dots */}
        {dataPoints.map((p, i) => (
          <text
            key={`val-${i}`}
            x={p.x}
            y={p.y - 10}
            textAnchor="middle"
            fill="#F5F5F5"
            fontSize="9"
            fontWeight="600"
            fontFamily="JetBrains Mono"
          >
            {p.value}
          </text>
        ))}
      </svg>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {LABELS.map((label, i) => (
          <div key={label} className="text-center">
            <p className="text-[10px] text-text-muted">{label}</p>
            <p
              className={`text-sm font-mono font-medium ${
                scores[i] >= 70 ? "text-green" : scores[i] >= 45 ? "text-gold" : "text-red"
              }`}
            >
              {scores[i]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
