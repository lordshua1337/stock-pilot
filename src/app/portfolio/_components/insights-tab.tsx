"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Zap,
  Award,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
} from "lucide-react";
import { sectors, type Stock } from "@/lib/stock-data";
import type { StockSignal } from "@/lib/portfolio-signals";
import type { PortfolioItem } from "../page";
import { FactorChart } from "./factor-chart";

interface InsightsTabProps {
  portfolio: PortfolioItem[];
  portfolioStocks: Stock[];
  totalInvestment: number;
  signals: StockSignal[];
  signalMap: Record<string, StockSignal>;
}

// ─── Intelligence card types ───────────────────────────────────────────

interface IntelCard {
  title: string;
  description: string;
  type: "positive" | "warning" | "neutral";
  icon: React.ReactNode;
}

function buildIntelligenceCards(
  portfolio: PortfolioItem[],
  portfolioStocks: Stock[],
  signals: StockSignal[],
  totalInvestment: number,
): IntelCard[] {
  const cards: IntelCard[] = [];
  const totalAlloc = portfolio.reduce((s, p) => s + p.allocation, 0);
  if (totalAlloc === 0) return cards;

  // Sector analysis
  const sectorMap: Record<string, number> = {};
  for (const item of portfolio) {
    const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
    if (stock) {
      sectorMap[stock.sector] = (sectorMap[stock.sector] || 0) + item.allocation;
    }
  }
  const uniqueSectors = Object.keys(sectorMap);
  const maxSectorAlloc = Math.max(...Object.values(sectorMap));
  const maxSector = Object.entries(sectorMap).find(([, v]) => v === maxSectorAlloc)?.[0] || "";

  // Weighted metrics
  const weightedBeta = portfolio.reduce((sum, item) => {
    const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
    return sum + (stock?.beta ?? 1) * (item.allocation / totalAlloc);
  }, 0);

  const weightedDiv = portfolio.reduce((sum, item) => {
    const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
    return sum + (stock?.dividendYield ?? 0) * (item.allocation / totalAlloc);
  }, 0);

  const avgComposite = signals.reduce((sum, sig) => {
    const item = portfolio.find((p) => p.ticker === sig.ticker);
    return sum + sig.compositeScore * ((item?.allocation ?? 0) / totalAlloc);
  }, 0);

  // Cash drag: if total allocation < 90%
  if (totalAlloc < 90) {
    cards.push({
      title: "Cash Drag",
      description: `${100 - totalAlloc}% of your portfolio is unallocated. Idle cash earns nothing and reduces overall returns.`,
      type: "warning",
      icon: <DollarSign className="w-4 h-4" />,
    });
  }

  // Sector concentration
  if (maxSectorAlloc > 40) {
    cards.push({
      title: "Sector Concentration",
      description: `${maxSector} represents ${maxSectorAlloc}% of your portfolio. Consider diversifying to reduce sector-specific risk.`,
      type: "warning",
      icon: <PieChart className="w-4 h-4" />,
    });
  }

  // Solid diversification
  if (uniqueSectors.length >= 4 && portfolio.length >= 5) {
    cards.push({
      title: "Solid Diversification",
      description: `${portfolio.length} positions across ${uniqueSectors.length} sectors provides good risk distribution.`,
      type: "positive",
      icon: <Shield className="w-4 h-4" />,
    });
  }

  // High beta warning
  if (weightedBeta > 1.3) {
    cards.push({
      title: "High Beta Portfolio",
      description: `Portfolio beta of ${weightedBeta.toFixed(2)} means your portfolio will amplify market swings by ${Math.round((weightedBeta - 1) * 100)}%.`,
      type: "warning",
      icon: <Zap className="w-4 h-4" />,
    });
  }

  // Low beta (defensive)
  if (weightedBeta < 0.8) {
    cards.push({
      title: "Defensive Positioning",
      description: `Low beta of ${weightedBeta.toFixed(2)} provides downside protection but may underperform in strong bull markets.`,
      type: "neutral",
      icon: <Shield className="w-4 h-4" />,
    });
  }

  // Income generation
  if (weightedDiv >= 2.0) {
    const annualIncome = totalInvestment * weightedDiv / 100;
    cards.push({
      title: "Income Generation",
      description: `${weightedDiv.toFixed(1)}% weighted yield generates ~$${Math.round(annualIncome)} annually in dividends.`,
      type: "positive",
      icon: <DollarSign className="w-4 h-4" />,
    });
  }

  // Position count warnings
  if (portfolio.length < 3) {
    cards.push({
      title: "Under-Diversified",
      description: `Only ${portfolio.length} position${portfolio.length !== 1 ? "s" : ""}. Consider adding more stocks to reduce single-name risk.`,
      type: "warning",
      icon: <AlertTriangle className="w-4 h-4" />,
    });
  }

  if (portfolio.length >= 10) {
    cards.push({
      title: "Well-Built Portfolio",
      description: `${portfolio.length} positions with a ${Math.round(avgComposite)} average AI score shows strong construction.`,
      type: "positive",
      icon: <Award className="w-4 h-4" />,
    });
  }

  // High conviction portfolio
  if (avgComposite >= 70) {
    cards.push({
      title: "High Conviction",
      description: `Weighted AI score of ${Math.round(avgComposite)} indicates strong overall quality across your positions.`,
      type: "positive",
      icon: <Target className="w-4 h-4" />,
    });
  }

  return cards;
}

// ─── Helpers ───────────────────────────────────────────────────────────

function signalTextColor(color: string): string {
  if (color === "green") return "text-green";
  if (color === "red") return "text-red";
  if (color === "gold") return "text-gold";
  return "text-text-muted";
}

function SignalIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "trending-up": return <TrendingUp className="w-3.5 h-3.5" />;
    case "trending-down": return <TrendingDown className="w-3.5 h-3.5" />;
    case "alert-triangle": return <AlertTriangle className="w-3.5 h-3.5" />;
    default: return <Minus className="w-3.5 h-3.5" />;
  }
}

// ─── Component ─────────────────────────────────────────────────────────

export function InsightsTab({
  portfolio,
  portfolioStocks,
  totalInvestment,
  signals,
  signalMap,
}: InsightsTabProps) {
  const intelCards = useMemo(
    () => buildIntelligenceCards(portfolio, portfolioStocks, signals, totalInvestment),
    [portfolio, portfolioStocks, signals, totalInvestment]
  );

  const typeStyles = {
    positive: "border-green/20 bg-green-bg",
    warning: "border-gold/20 bg-[rgba(255,215,64,0.05)]",
    neutral: "border-border bg-surface",
  };

  const typeIconColors = {
    positive: "text-green",
    warning: "text-gold",
    neutral: "text-text-muted",
  };

  return (
    <div className="space-y-6">
      {/* Intelligence cards */}
      {intelCards.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green" />
            Portfolio Intelligence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {intelCards.map((card, i) => (
              <div
                key={i}
                className={`border rounded-xl p-4 ${typeStyles[card.type]}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={typeIconColors[card.type]}>{card.icon}</span>
                  <h3 className="text-sm font-semibold">{card.title}</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-position signal cards */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Position Signals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {portfolio.map((item) => {
            const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
            const sig = signalMap[item.ticker];
            if (!stock || !sig) return null;

            const scoreColor =
              sig.compositeScore >= 70
                ? "text-green"
                : sig.compositeScore >= 50
                  ? "text-gold"
                  : "text-red";

            return (
              <div
                key={item.ticker}
                className="bg-surface border border-border rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-mono font-medium text-sm text-green">
                      {stock.ticker}
                    </span>
                    <p className="text-[10px] text-text-muted truncate max-w-[140px]">
                      {stock.name}
                    </p>
                  </div>
                  <span className={`text-lg font-mono font-bold ${scoreColor}`}>
                    {sig.compositeScore}
                  </span>
                </div>

                {/* Signal badge */}
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium mb-3 bg-surface-alt ${signalTextColor(sig.signal.color)}`}>
                  <SignalIcon icon={sig.signal.icon} />
                  {sig.signal.type}
                </div>

                {/* Sub-scores bar */}
                <div className="space-y-1.5">
                  {(
                    [
                      { key: "momentum" as const, label: "Mom" },
                      { key: "value" as const, label: "Val" },
                      { key: "growth" as const, label: "Gro" },
                      { key: "stability" as const, label: "Stb" },
                    ] as const
                  ).map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[9px] text-text-muted w-6">{label}</span>
                      <div className="flex-1 h-1.5 bg-surface-alt rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green transition-all"
                          style={{
                            width: `${sig.subScores[key]}%`,
                            opacity: sig.subScores[key] >= 60 ? 1 : 0.5,
                          }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-text-muted w-5 text-right">
                        {sig.subScores[key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Factor chart */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <FactorChart signals={signals} />
      </div>
    </div>
  );
}
