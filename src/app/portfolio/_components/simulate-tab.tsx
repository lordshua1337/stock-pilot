"use client";

import { useMemo } from "react";
import type { Stock } from "@/lib/stock-data";
import type { StockSignal } from "@/lib/portfolio-signals";
import type { PortfolioItem } from "../page";
import { formatCurrency } from "../page";
import { MonteCarloChart } from "./monte-carlo-chart";
import { BacktestChart } from "./backtest-chart";
import { PortfolioRadar } from "./portfolio-radar";

interface SimulateTabProps {
  portfolio: PortfolioItem[];
  portfolioStocks: Stock[];
  totalInvestment: number;
  signals: StockSignal[];
}

export function SimulateTab({
  portfolio,
  portfolioStocks,
  totalInvestment,
  signals,
}: SimulateTabProps) {
  // Compute summary metrics for text callouts
  const summary = useMemo(() => {
    const totalAlloc = portfolio.reduce((s, p) => s + p.allocation, 0);
    if (totalAlloc === 0) return { beta: 1, avgScore: 50, divYield: 0 };

    const beta = portfolio.reduce((sum, item) => {
      const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
      return sum + (stock?.beta ?? 1) * (item.allocation / totalAlloc);
    }, 0);

    const avgScore = portfolio.reduce((sum, item) => {
      const sig = signals.find((s) => s.ticker === item.ticker);
      return sum + (sig?.compositeScore ?? 50) * (item.allocation / totalAlloc);
    }, 0);

    const divYield = portfolio.reduce((sum, item) => {
      const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
      return sum + (stock?.dividendYield ?? 0) * (item.allocation / totalAlloc);
    }, 0);

    return { beta, avgScore, divYield };
  }, [portfolio, portfolioStocks, signals]);

  return (
    <div className="space-y-6">
      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Portfolio Beta", value: summary.beta.toFixed(2) },
          { label: "Avg AI Score", value: Math.round(summary.avgScore).toString() },
          { label: "Est. Div Yield", value: `${summary.divYield.toFixed(2)}%` },
          {
            label: "Annual Dividends",
            value: formatCurrency(totalInvestment * summary.divYield / 100),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-border rounded-xl p-4 text-center"
          >
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p className="text-lg font-mono font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Monte Carlo + Backtest side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-5">
          <MonteCarloChart
            portfolio={portfolio}
            portfolioStocks={portfolioStocks}
            totalInvestment={totalInvestment}
          />
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <BacktestChart
            portfolio={portfolio}
            portfolioStocks={portfolioStocks}
            totalInvestment={totalInvestment}
          />
        </div>
      </div>

      {/* Radar chart */}
      <div className="bg-surface border border-border rounded-xl p-5 max-w-lg mx-auto">
        <PortfolioRadar
          portfolio={portfolio}
          portfolioStocks={portfolioStocks}
          signals={signals}
        />
      </div>

      {/* Simulation disclaimer */}
      <p className="text-[10px] text-text-muted text-center px-4">
        Simulations use beta-adjusted returns derived from stock characteristics. They do not
        predict actual future performance. Past results, whether real or simulated, are not
        indicative of future returns.
      </p>
    </div>
  );
}
