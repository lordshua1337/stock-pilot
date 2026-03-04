"use client";

import { useMemo } from "react";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  PieChart,
  BarChart3,
} from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";
import type { PortfolioItem } from "../page";
import {
  comparePortfolioToBenchmark,
  type MetricComparison,
  type SectorComparison,
  type BenchmarkAnalysis,
} from "@/lib/benchmark-calculator";

interface BenchmarkTabProps {
  portfolio: PortfolioItem[];
  portfolioStocks: Stock[];
  totalInvestment: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function buildStockMap(allStocks: Stock[]): Map<string, Stock> {
  const map = new Map<string, Stock>();
  for (const s of allStocks) {
    map.set(s.ticker, s);
  }
  return map;
}

function fmt(n: number, suffix = ""): string {
  return `${n.toFixed(2)}${suffix}`;
}

// ─── Sub-components ───────────────────────────────────────────────────

function MetricCard({ metric }: { metric: MetricComparison }) {
  const isHigher = metric.direction === "higher";
  const isLower = metric.direction === "lower";

  return (
    <div className="bg-surface-alt rounded-xl border border-border p-4">
      <p className="text-xs text-text-muted mb-3">{metric.label}</p>

      <div className="flex items-end justify-between mb-2">
        {/* Portfolio value */}
        <div>
          <p className="text-xs text-text-muted">You</p>
          <p className="text-lg font-semibold text-text-primary">
            {fmt(metric.portfolio)}
          </p>
        </div>

        {/* Delta */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface text-xs font-medium">
          {isHigher && <ArrowUp className="w-3 h-3 text-green" />}
          {isLower && <ArrowDown className="w-3 h-3 text-red" />}
          {metric.direction === "even" && (
            <Minus className="w-3 h-3 text-text-muted" />
          )}
          <span
            className={
              isHigher
                ? "text-green"
                : isLower
                  ? "text-red"
                  : "text-text-muted"
            }
          >
            {metric.delta > 0 ? "+" : ""}
            {fmt(metric.delta)} ({metric.deltaPercent > 0 ? "+" : ""}
            {metric.deltaPercent.toFixed(1)}%)
          </span>
        </div>

        {/* Benchmark value */}
        <div className="text-right">
          <p className="text-xs text-text-muted">S&P 500</p>
          <p className="text-lg font-semibold text-text-secondary">
            {fmt(metric.benchmark)}
          </p>
        </div>
      </div>

      {/* Visual bar comparison */}
      <div className="flex gap-1 mb-2">
        <div className="flex-1">
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-green rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (metric.portfolio / Math.max(metric.portfolio, metric.benchmark)) * 100)}%`,
              }}
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-text-muted/40 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (metric.benchmark / Math.max(metric.portfolio, metric.benchmark)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-text-muted">{metric.interpretation}</p>
    </div>
  );
}

function SectorRow({ sector }: { sector: SectorComparison }) {
  const maxWeight = Math.max(sector.portfolioWeight, sector.benchmarkWeight, 1);

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xs text-text-secondary w-24 shrink-0">
        {sector.sector}
      </span>

      <div className="flex-1 space-y-1">
        {/* Portfolio bar */}
        <div className="flex items-center gap-2">
          <div className="h-3 bg-surface rounded-full flex-1 overflow-hidden">
            <div
              className="h-full bg-green/70 rounded-full transition-all duration-500"
              style={{
                width: `${(sector.portfolioWeight / maxWeight) * 100}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-text-primary w-10 text-right font-mono">
            {sector.portfolioWeight.toFixed(1)}%
          </span>
        </div>
        {/* Benchmark bar */}
        <div className="flex items-center gap-2">
          <div className="h-3 bg-surface rounded-full flex-1 overflow-hidden">
            <div
              className="h-full bg-text-muted/30 rounded-full transition-all duration-500"
              style={{
                width: `${(sector.benchmarkWeight / maxWeight) * 100}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-text-muted w-10 text-right font-mono">
            {sector.benchmarkWeight.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Delta badge */}
      <span
        className={`text-[10px] font-medium w-14 text-right ${
          sector.overUnder === "over"
            ? "text-green"
            : sector.overUnder === "under"
              ? "text-red"
              : "text-text-muted"
        }`}
      >
        {sector.delta > 0 ? "+" : ""}
        {sector.delta.toFixed(1)}%
      </span>
    </div>
  );
}

function DiversificationMeter({ score }: { score: number }) {
  const color =
    score >= 75
      ? "text-green"
      : score >= 50
        ? "text-gold"
        : "text-red";

  const label =
    score >= 75
      ? "Well Diversified"
      : score >= 50
        ? "Moderately Diversified"
        : "Concentrated";

  return (
    <div className="bg-surface-alt rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 text-text-muted text-xs mb-3">
        <Target className="w-3.5 h-3.5" />
        Diversification Score
      </div>
      <div className="flex items-end gap-3 mb-2">
        <span className={`text-3xl font-bold ${color}`}>{score}</span>
        <span className="text-sm text-text-muted pb-1">/ 100</span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            score >= 75
              ? "bg-green"
              : score >= 50
                ? "bg-gold"
                : "bg-red"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className={`text-xs font-medium ${color}`}>{label}</p>
      <p className="text-xs text-text-muted mt-1">
        Measures how closely your sector allocation matches the S&P 500
      </p>
    </div>
  );
}

// ─── Radar Chart ──────────────────────────────────────────────────────

function ComparisonRadar({ metrics }: { metrics: MetricComparison[] }) {
  if (metrics.length < 4) return null;

  const size = 200;
  const center = size / 2;
  const radius = 70;
  const labels = metrics.map((m) => m.label);

  // Normalize values to 0-1 scale for rendering
  const normalize = (val: number, idx: number): number => {
    const maxVal = Math.max(
      metrics[idx].portfolio,
      metrics[idx].benchmark,
      1
    );
    return Math.min(1, val / maxVal);
  };

  const getPoint = (
    angle: number,
    r: number
  ): { x: number; y: number } => ({
    x: center + r * Math.cos(angle - Math.PI / 2),
    y: center + r * Math.sin(angle - Math.PI / 2),
  });

  const angles = metrics.map(
    (_, i) => (2 * Math.PI * i) / metrics.length
  );

  // Build polygon paths
  const portfolioPoints = metrics
    .map((m, i) => {
      const r = normalize(m.portfolio, i) * radius;
      const pt = getPoint(angles[i], r);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

  const benchmarkPoints = metrics
    .map((m, i) => {
      const r = normalize(m.benchmark, i) * radius;
      const pt = getPoint(angles[i], r);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

  return (
    <div className="bg-surface-alt rounded-xl border border-border p-4">
      <h3 className="text-sm font-medium text-text-primary mb-3">
        Portfolio Shape vs S&P 500
      </h3>
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[200px]"
        >
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <polygon
              key={scale}
              points={angles
                .map((a) => {
                  const pt = getPoint(a, radius * scale);
                  return `${pt.x},${pt.y}`;
                })
                .join(" ")}
              fill="none"
              stroke="currentColor"
              className="text-border"
              strokeWidth="0.5"
            />
          ))}

          {/* Axis lines */}
          {angles.map((a, i) => {
            const pt = getPoint(a, radius);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={pt.x}
                y2={pt.y}
                stroke="currentColor"
                className="text-border"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Benchmark polygon */}
          <polygon
            points={benchmarkPoints}
            fill="rgba(156,163,175,0.15)"
            stroke="rgba(156,163,175,0.5)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Portfolio polygon */}
          <polygon
            points={portfolioPoints}
            fill="rgba(74,222,128,0.15)"
            stroke="rgba(74,222,128,0.8)"
            strokeWidth="2"
          />

          {/* Labels */}
          {labels.map((label, i) => {
            const pt = getPoint(angles[i], radius + 18);
            return (
              <text
                key={i}
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-text-muted text-[9px]"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="flex justify-center gap-6 mt-3">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-0.5 bg-green rounded" />
          <span className="text-text-secondary">You</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-0.5 bg-text-muted/50 rounded border border-dashed" />
          <span className="text-text-secondary">S&P 500</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

export function BenchmarkTab({
  portfolio,
  portfolioStocks,
  totalInvestment,
}: BenchmarkTabProps) {
  const stockMap = useMemo(() => buildStockMap(stocks), []);

  const analysis = useMemo(
    () =>
      comparePortfolioToBenchmark(portfolio, stockMap, totalInvestment),
    [portfolio, stockMap, totalInvestment]
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-surface-alt rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 text-text-muted text-xs mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          Benchmark Comparison
        </div>
        <p className="text-sm text-text-primary">{analysis.summary}</p>
      </div>

      {/* Metric comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {analysis.metrics.map((m) => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>

      {/* Two column: Radar + Diversification */}
      <div className="grid md:grid-cols-2 gap-4">
        <ComparisonRadar metrics={analysis.metrics} />
        <DiversificationMeter score={analysis.diversificationScore} />
      </div>

      {/* Sector comparison */}
      <div className="bg-surface-alt rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-3.5 h-3.5 text-text-muted" />
          <h3 className="text-sm font-medium text-text-primary">
            Sector Allocation vs S&P 500
          </h3>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-text-muted mb-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-green/70" /> Your
            Portfolio
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-text-muted/30" /> S&P
            500
          </div>
        </div>
        <div className="divide-y divide-border/30">
          {analysis.sectors.map((s) => (
            <SectorRow key={s.sector} sector={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
