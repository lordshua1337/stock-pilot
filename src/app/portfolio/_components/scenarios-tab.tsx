"use client";

import { useMemo } from "react";
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Flame,
  Snowflake,
  Zap,
  BarChart3,
} from "lucide-react";
import { type Stock } from "@/lib/stock-data";
import type { PortfolioItem } from "../page";
import { formatCurrency } from "../page";

interface ScenariosTabProps {
  portfolio: PortfolioItem[];
  portfolioStocks: Stock[];
  totalInvestment: number;
}

// ─── Macro Scenario Definitions ────────────────────────────────────────

interface MacroScenario {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  // Sector impact percentages (negative = loss, positive = gain)
  sectorImpacts: Record<string, number>;
}

const MACRO_SCENARIOS: MacroScenario[] = [
  {
    name: "Rates +50bps",
    description:
      "Federal Reserve raises rates by 50 basis points unexpectedly. Growth stocks suffer as future earnings get discounted more heavily. Banks benefit from wider net interest margins.",
    icon: <TrendingDown className="w-5 h-5" />,
    color: "#FF5252",
    sectorImpacts: {
      Technology: -8,
      Healthcare: -3,
      Finance: 4,
      Consumer: -5,
      Energy: -2,
      Industrial: -4,
      "Real Estate": -10,
      Utilities: -7,
    },
  },
  {
    name: "Mild Recession",
    description:
      "GDP contracts for two quarters. Consumer spending pulls back, unemployment rises modestly. Defensive sectors and dividend payers hold up better.",
    icon: <Snowflake className="w-5 h-5" />,
    color: "#448AFF",
    sectorImpacts: {
      Technology: -15,
      Healthcare: -5,
      Finance: -12,
      Consumer: -18,
      Energy: -20,
      Industrial: -16,
      "Real Estate": -10,
      Utilities: -3,
    },
  },
  {
    name: "Bull Market",
    description:
      "Strong economic expansion with AI adoption driving productivity gains. Risk-on environment lifts growth stocks. Cyclical sectors outperform.",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "#00C853",
    sectorImpacts: {
      Technology: 22,
      Healthcare: 10,
      Finance: 15,
      Consumer: 18,
      Energy: 12,
      Industrial: 16,
      "Real Estate": 8,
      Utilities: 4,
    },
  },
  {
    name: "Inflation Spike",
    description:
      "CPI surges above 6% on commodity shocks and supply disruptions. Real assets and energy benefit while growth and REITs struggle.",
    icon: <Flame className="w-5 h-5" />,
    color: "#FFD740",
    sectorImpacts: {
      Technology: -12,
      Healthcare: -4,
      Finance: 2,
      Consumer: -8,
      Energy: 15,
      Industrial: -3,
      "Real Estate": -14,
      Utilities: -6,
    },
  },
];

// ─── Historical Drawdowns ──────────────────────────────────────────────

interface HistoricalDrawdown {
  name: string;
  period: string;
  marketDrop: number; // S&P 500 peak-to-trough %
  description: string;
}

const HISTORICAL_DRAWDOWNS: HistoricalDrawdown[] = [
  {
    name: "COVID Crash",
    period: "Feb-Mar 2020",
    marketDrop: -34,
    description:
      "Fastest bear market in history. S&P 500 fell 34% in 23 trading days before massive Fed intervention triggered a V-shaped recovery.",
  },
  {
    name: "2022 Rate Hike",
    period: "Jan-Oct 2022",
    marketDrop: -25,
    description:
      "Fed hiked rates from 0% to 4%+ in the fastest tightening cycle in decades. Growth stocks fell 30-50% while value held up relatively better.",
  },
  {
    name: "2018 Q4 Selloff",
    period: "Oct-Dec 2018",
    marketDrop: -20,
    description:
      "Trade war fears and Fed tightening triggered a near-bear market. Market recovered quickly after the Fed signaled a pause in rate hikes.",
  },
];

// ─── Component ─────────────────────────────────────────────────────────

export function ScenariosTab({
  portfolio,
  portfolioStocks,
  totalInvestment,
}: ScenariosTabProps) {
  // Portfolio beta and sector weights
  const analysis = useMemo(() => {
    const totalAlloc = portfolio.reduce((s, p) => s + p.allocation, 0);
    if (totalAlloc === 0) return { beta: 1, sectorWeights: {} as Record<string, number> };

    const beta = portfolio.reduce((sum, item) => {
      const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
      return sum + (stock?.beta ?? 1) * (item.allocation / totalAlloc);
    }, 0);

    const sectorWeights: Record<string, number> = {};
    for (const item of portfolio) {
      const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
      if (stock) {
        sectorWeights[stock.sector] =
          (sectorWeights[stock.sector] || 0) + item.allocation / totalAlloc;
      }
    }

    return { beta, sectorWeights };
  }, [portfolio, portfolioStocks]);

  // Calculate portfolio impact for each macro scenario
  const scenarioResults = useMemo(() => {
    return MACRO_SCENARIOS.map((scenario) => {
      // Weighted sector impact
      let portfolioImpact = 0;
      for (const [sector, weight] of Object.entries(analysis.sectorWeights)) {
        const sectorImpact = scenario.sectorImpacts[sector] ?? 0;
        portfolioImpact += sectorImpact * weight;
      }

      const dollarChange = totalInvestment * (portfolioImpact / 100);

      return {
        ...scenario,
        portfolioImpact,
        dollarChange,
        endValue: totalInvestment + dollarChange,
      };
    });
  }, [analysis.sectorWeights, totalInvestment]);

  // Calculate drawdown impacts (beta-adjusted)
  const drawdownResults = useMemo(() => {
    return HISTORICAL_DRAWDOWNS.map((dd) => {
      const portfolioDrop = dd.marketDrop * analysis.beta;
      const dollarLoss = totalInvestment * (portfolioDrop / 100);
      return {
        ...dd,
        portfolioDrop,
        dollarLoss,
        endValue: totalInvestment + dollarLoss,
      };
    });
  }, [analysis.beta, totalInvestment]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold mb-1">Scenario Stress Tests</h2>
        <p className="text-sm text-text-secondary">
          See how your portfolio would perform under different market conditions.
          Portfolio beta: <span className="font-mono font-medium">{analysis.beta.toFixed(2)}</span>
        </p>
      </div>

      {/* Macro scenarios */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-green" />
          Macro Scenarios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarioResults.map((scenario) => {
            const isPositive = scenario.portfolioImpact >= 0;

            return (
              <div
                key={scenario.name}
                className="bg-surface border border-border rounded-xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: scenario.color + "1A" }}
                  >
                    <span style={{ color: scenario.color }}>{scenario.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{scenario.name}</h4>
                  </div>
                </div>

                <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                  {scenario.description}
                </p>

                {/* Impact metrics */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-surface-alt rounded-lg p-3">
                    <p className="text-[10px] text-text-muted mb-0.5">Portfolio Impact</p>
                    <p
                      className={`text-lg font-mono font-bold ${
                        isPositive ? "text-green" : "text-red"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {scenario.portfolioImpact.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-surface-alt rounded-lg p-3">
                    <p className="text-[10px] text-text-muted mb-0.5">Dollar Change</p>
                    <p
                      className={`text-lg font-mono font-bold ${
                        isPositive ? "text-green" : "text-red"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {formatCurrency(scenario.dollarChange)}
                    </p>
                  </div>
                </div>

                {/* Sector breakdown */}
                <div className="space-y-1">
                  {Object.entries(analysis.sectorWeights)
                    .sort(([, a], [, b]) => b - a)
                    .map(([sector, weight]) => {
                      const impact = scenario.sectorImpacts[sector] ?? 0;
                      const contribution = impact * weight;
                      const isPos = contribution >= 0;
                      return (
                        <div
                          key={sector}
                          className="flex items-center justify-between text-[10px]"
                        >
                          <span className="text-text-muted">
                            {sector} ({(weight * 100).toFixed(0)}%)
                          </span>
                          <span
                            className={`font-mono ${isPos ? "text-green" : "text-red"}`}
                          >
                            {isPos ? "+" : ""}
                            {contribution.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical drawdowns */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-red" />
          Historical Drawdowns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {drawdownResults.map((dd) => (
            <div
              key={dd.name}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <h4 className="text-sm font-semibold mb-1">{dd.name}</h4>
              <p className="text-[10px] text-text-muted mb-3">{dd.period}</p>

              <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                {dd.description}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">S&P 500</span>
                  <span className="text-sm font-mono font-medium text-red">
                    {dd.marketDrop}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Your Portfolio</span>
                  <span className="text-sm font-mono font-bold text-red">
                    {dd.portfolioDrop.toFixed(1)}%
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Est. Loss</span>
                  <span className="text-sm font-mono font-bold text-red">
                    {formatCurrency(dd.dollarLoss)}
                  </span>
                </div>

                {/* Visual bar */}
                <div className="relative h-3 bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className="absolute right-0 top-0 h-full bg-red/30 rounded-full"
                    style={{ width: `${Math.abs(dd.portfolioDrop)}%` }}
                  />
                  <div
                    className="absolute right-0 top-0 h-full bg-red/60 rounded-full"
                    style={{ width: `${Math.abs(dd.marketDrop)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-text-muted">
                  <span>0%</span>
                  <span>-50%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brokerage placeholder */}
      <div className="bg-surface border border-border rounded-xl p-5 text-center">
        <AlertTriangle className="w-5 h-5 text-gold mx-auto mb-2" />
        <p className="text-sm font-semibold mb-1">Want to act on these insights?</p>
        <p className="text-xs text-text-secondary mb-3">
          Connect your brokerage account to rebalance with one click.
        </p>
        <button
          disabled
          className="px-4 py-2 rounded-lg bg-surface-alt text-text-muted text-sm cursor-not-allowed"
        >
          Coming Soon
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-text-muted text-center px-4">
        Scenario analysis uses predefined sector impact assumptions and historical market data.
        Actual portfolio performance may vary significantly from these estimates.
      </p>
    </div>
  );
}
