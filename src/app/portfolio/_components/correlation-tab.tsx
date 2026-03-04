"use client";

import { useMemo } from "react";
import { GitBranch, Target } from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";
import type { PortfolioItem } from "../page";
import {
  buildCorrelationMatrix,
  type CorrelationMatrix,
} from "@/lib/correlation-calculator";

interface CorrelationTabProps {
  portfolio: PortfolioItem[];
  portfolioStocks: Stock[];
  totalInvestment: number;
}

function buildStockMap(allStocks: Stock[]): Map<string, Stock> {
  const map = new Map<string, Stock>();
  for (const s of allStocks) map.set(s.ticker, s);
  return map;
}

function getCorrColor(corr: number): string {
  if (corr >= 0.7) return "bg-red/40";
  if (corr >= 0.5) return "bg-red/20";
  if (corr >= 0.3) return "bg-gold/15";
  if (corr >= 0.1) return "bg-surface";
  return "bg-blue-400/15"; // low/negative = good diversification
}

function getCorrTextColor(corr: number): string {
  if (corr >= 0.7) return "text-red";
  if (corr >= 0.5) return "text-red/70";
  if (corr >= 0.3) return "text-gold";
  return "text-text-muted";
}

// ─── Main Component ───────────────────────────────────────────────────

export function CorrelationTab({
  portfolio,
  portfolioStocks,
  totalInvestment,
}: CorrelationTabProps) {
  const stockMap = useMemo(() => buildStockMap(stocks), []);

  const matrix = useMemo(
    () => buildCorrelationMatrix(portfolio, stockMap),
    [portfolio, stockMap]
  );

  if (matrix.tickers.length < 2) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        Add at least 2 stocks to see correlation analysis.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SummaryCard
          label="Diversification Score"
          value={`${matrix.diversificationScore}/100`}
          sub={
            matrix.diversificationScore >= 70
              ? "Well diversified"
              : matrix.diversificationScore >= 45
                ? "Moderately diversified"
                : "Highly correlated -- consider diversifying"
          }
          color={
            matrix.diversificationScore >= 70
              ? "text-green"
              : matrix.diversificationScore >= 45
                ? "text-gold"
                : "text-red"
          }
          icon={<Target className="w-3.5 h-3.5" />}
        />
        {matrix.mostCorrelated && (
          <SummaryCard
            label="Most Correlated Pair"
            value={`${matrix.mostCorrelated.tickerA} / ${matrix.mostCorrelated.tickerB}`}
            sub={`Correlation: ${matrix.mostCorrelated.correlation.toFixed(2)}`}
            color="text-red"
            icon={<GitBranch className="w-3.5 h-3.5" />}
          />
        )}
        {matrix.leastCorrelated && (
          <SummaryCard
            label="Most Diversified Pair"
            value={`${matrix.leastCorrelated.tickerA} / ${matrix.leastCorrelated.tickerB}`}
            sub={`Correlation: ${matrix.leastCorrelated.correlation.toFixed(2)}`}
            color="text-green"
            icon={<GitBranch className="w-3.5 h-3.5" />}
          />
        )}
      </div>

      {/* Correlation Grid */}
      <div className="bg-surface-alt rounded-xl border border-border p-4">
        <h3 className="text-sm font-medium text-text-primary mb-1">
          Correlation Matrix
        </h3>
        <p className="text-xs text-text-muted mb-4">
          Approximated from sector, beta, and market cap similarity.
          Red = high correlation, blue = low/negative.
        </p>

        <div className="overflow-x-auto">
          <table className="w-auto">
            <thead>
              <tr>
                <th className="w-16" />
                {matrix.tickers.map((t) => (
                  <th
                    key={t}
                    className="text-[10px] font-mono font-medium text-text-muted px-1 py-1 text-center w-14"
                  >
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.tickers.map((rowTicker, i) => (
                <tr key={rowTicker}>
                  <td className="text-[10px] font-mono font-medium text-text-muted pr-2 py-1">
                    {rowTicker}
                  </td>
                  {matrix.grid[i].map((corr, j) => {
                    const isDiagonal = i === j;
                    return (
                      <td
                        key={j}
                        className={`text-center py-1 px-1 ${
                          isDiagonal
                            ? "bg-surface"
                            : getCorrColor(corr)
                        } rounded-sm`}
                      >
                        <span
                          className={`text-[10px] font-mono ${
                            isDiagonal
                              ? "text-text-muted/50"
                              : getCorrTextColor(corr)
                          }`}
                        >
                          {corr.toFixed(2)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-text-muted">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-blue-400/15" />
          Low
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-surface" />
          Moderate
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gold/15" />
          Medium
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-red/20" />
          High
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-red/40" />
          Very High
        </div>
      </div>
    </div>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-surface-alt rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 text-text-muted text-xs mb-2">
        {icon}
        {label}
      </div>
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
      <p className="text-xs text-text-muted mt-1">{sub}</p>
    </div>
  );
}
