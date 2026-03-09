"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Minus,
  DollarSign,
  PieChart,
  AlertTriangle,
  TrendingUp,
  Check,
} from "lucide-react";
import { stocks, sectors, type Stock } from "@/lib/stock-data";
import type { StockSignal } from "@/lib/portfolio-signals";
import type { PortfolioItem } from "../page";
import { formatCurrency } from "../page";
import { PresetPortfolios } from "./preset-portfolios";
import { DonutChart } from "./donut-chart";

// ─── Props ─────────────────────────────────────────────────────────────

interface BuildTabProps {
  portfolio: PortfolioItem[];
  totalInvestment: number;
  setTotalInvestment: (v: number) => void;
  totalAllocation: number;
  signals: Record<string, StockSignal>;
  onAddStock: (ticker: string) => void;
  onRemoveStock: (ticker: string) => void;
  onUpdateAllocation: (ticker: string, alloc: number) => void;
  onLoadPreset: (items: PortfolioItem[]) => void;
  investmentPills: number[];
  isEmpty?: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return "text-green";
  if (score >= 50) return "text-gold";
  return "text-red";
}

function scoreBg(score: number): string {
  if (score >= 70) return "bg-green-bg";
  if (score >= 50) return "bg-[rgba(255,215,64,0.1)]";
  return "bg-red-bg";
}

function signalTextColor(color: string): string {
  if (color === "green") return "text-green";
  if (color === "red") return "text-red";
  if (color === "gold") return "text-gold";
  return "text-text-muted";
}

// ─── Component ─────────────────────────────────────────────────────────

export function BuildTab({
  portfolio,
  totalInvestment,
  setTotalInvestment,
  totalAllocation,
  signals,
  onAddStock,
  onRemoveStock,
  onUpdateAllocation,
  onLoadPreset,
  investmentPills,
  isEmpty,
}: BuildTabProps) {
  const [stockSearch, setStockSearch] = useState("");

  // ── Metrics ──
  const metrics = useMemo(() => {
    if (portfolio.length === 0) {
      return {
        avgAiScore: 0,
        weightedPE: 0,
        avgDividend: 0,
        portfolioBeta: 0,
        estAnnualDividends: 0,
        sectorBreakdown: [] as { name: string; allocation: number; color: string }[],
        warnings: [] as string[],
      };
    }

    let weightedScore = 0;
    let weightedPE = 0;
    let weightedDiv = 0;
    let weightedBeta = 0;
    const sectorMap: Record<string, number> = {};
    const warnings: string[] = [];

    for (const item of portfolio) {
      const stock = stocks.find((s) => s.ticker === item.ticker);
      if (!stock) continue;

      const weight = item.allocation / 100;
      weightedScore += stock.aiScore * weight;
      weightedPE += stock.peRatio * weight;
      weightedDiv += stock.dividendYield * weight;
      weightedBeta += stock.beta * weight;

      sectorMap[stock.sector] = (sectorMap[stock.sector] || 0) + item.allocation;
    }

    // Normalize by actual allocation
    const norm = 100 / Math.max(totalAllocation, 1);

    if (totalAllocation > 100) warnings.push("Total allocation exceeds 100%");
    if (totalAllocation < 100 && portfolio.length > 0) {
      warnings.push(`${100 - totalAllocation}% unallocated`);
    }
    if (portfolio.length < 3) warnings.push("Low diversification: consider adding more stocks");

    for (const [sector, alloc] of Object.entries(sectorMap)) {
      if (alloc > 40) warnings.push(`High concentration: ${sector} at ${alloc}%`);
    }
    for (const item of portfolio) {
      if (item.allocation > 30) {
        warnings.push(`${item.ticker} at ${item.allocation}% -- high single-stock risk`);
      }
    }

    const sectorBreakdown = Object.entries(sectorMap)
      .map(([name, allocation]) => ({
        name,
        allocation,
        color: sectors.find((sec) => sec.name === name)?.color || "#666",
      }))
      .sort((a, b) => b.allocation - a.allocation);

    return {
      avgAiScore: weightedScore * norm,
      weightedPE: weightedPE * norm,
      avgDividend: weightedDiv * norm,
      portfolioBeta: weightedBeta * norm,
      estAnnualDividends: totalInvestment * (weightedDiv * norm) / 100,
      sectorBreakdown,
      warnings,
    };
  }, [portfolio, totalAllocation, totalInvestment]);

  // ── Stock search filtering ──
  const availableStocks = useMemo(() => {
    const inPortfolio = new Set(portfolio.map((p) => p.ticker));
    return stocks.filter((s) => {
      if (inPortfolio.has(s.ticker)) return false;
      if (!stockSearch.trim()) return true;
      const q = stockSearch.toLowerCase();
      return (
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q)
      );
    });
  }, [portfolio, stockSearch]);

  // Already-in-portfolio stocks matching search
  const addedStocksInSearch = useMemo(() => {
    if (!stockSearch.trim()) return [];
    const q = stockSearch.toLowerCase();
    return portfolio.flatMap((p) => {
      const stock = stocks.find((s) => s.ticker === p.ticker);
      if (!stock) return [];
      if (
        stock.ticker.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        stock.sector.toLowerCase().includes(q)
      ) {
        return [stock];
      }
      return [];
    });
  }, [portfolio, stockSearch]);

  // ── Donut segments ──
  const sectorDonutSegments = metrics.sectorBreakdown.map((s) => ({
    label: s.name,
    value: s.allocation,
    color: s.color,
  }));

  const positionColors = [
    "#2E8BEF", "#448AFF", "#FFD740", "#FF6E40", "#E040FB",
    "#40C4FF", "#FF5252", "#4DA3F0", "#FF80AB", "#B388FF",
  ];
  const positionDonutSegments = portfolio.map((item, i) => ({
    label: item.ticker,
    value: item.allocation,
    color: positionColors[i % positionColors.length],
  }));

  // ── Empty state (centered) ──
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center text-center max-w-lg mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-green mb-2 justify-center">
            <PieChart className="w-4 h-4" />
            <p className="text-xs uppercase tracking-widest font-medium">
              Portfolio Builder
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">
            Build Your Portfolio
          </h1>
          <p className="text-text-secondary text-sm">
            Select stocks, set allocations, and get AI-powered analysis for every position.
          </p>
        </div>

        {/* Presets */}
        <PresetPortfolios onLoadPreset={onLoadPreset} />

        {/* Investment pills */}
        <div className="mb-6 w-full">
          <label className="text-xs text-text-muted mb-2 block text-left">
            Investment Amount
          </label>
          <div className="flex flex-wrap gap-2">
            {investmentPills.map((amount) => (
              <button
                key={amount}
                onClick={() => setTotalInvestment(amount)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition-colors ${
                  totalInvestment === amount
                    ? "bg-green/10 border-green/40 text-green"
                    : "bg-surface border-border text-text-secondary hover:border-green/20"
                }`}
              >
                {formatCurrency(amount)}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="w-full bg-surface border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Search stocks by ticker, name, or sector..."
                className="w-full bg-surface-alt border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/40 transition-colors"
              />
            </div>
          </div>
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {availableStocks.slice(0, 20).map((stock) => (
              <button
                key={stock.ticker}
                onClick={() => onAddStock(stock.ticker)}
                className="w-full p-4 flex items-center justify-between card-hover text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-xs font-mono font-bold">
                    {stock.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{stock.ticker}</p>
                    <p className="text-xs text-text-muted">{stock.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono ${scoreColor(stock.aiScore)}`}>
                    AI: {stock.aiScore}
                  </span>
                  <Plus className="w-4 h-4 text-green" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Full build view ──
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Position list + search */}
      <div className="lg:col-span-2 space-y-6">
        {/* Investment pills */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <label className="text-xs text-text-muted mb-2 block">
            Investment Amount
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {investmentPills.map((amount) => (
              <button
                key={amount}
                onClick={() => setTotalInvestment(amount)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition-colors ${
                  totalInvestment === amount
                    ? "bg-green/10 border-green/40 text-green"
                    : "bg-surface-alt border-border text-text-secondary hover:border-green/20"
                }`}
              >
                {formatCurrency(amount)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green" />
            <input
              type="number"
              value={totalInvestment}
              onChange={(e) => setTotalInvestment(Math.max(0, Number(e.target.value)))}
              className="bg-transparent border-none text-xl font-mono font-bold focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Portfolio positions */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">Your Positions</h3>
            <span className="text-xs text-text-muted font-mono">{portfolio.length} stocks</span>
          </div>
          <div className="divide-y divide-border">
            {portfolio.map((item) => {
              const stock = stocks.find((s) => s.ticker === item.ticker);
              if (!stock) return null;
              const signal = signals[item.ticker];
              const dollarAmount = (item.allocation / 100) * totalInvestment;

              return (
                <div key={item.ticker} className="p-4 flex items-center gap-3">
                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveStock(item.ticker)}
                    className="w-7 h-7 rounded-full bg-red-bg flex items-center justify-center hover:bg-red/20 transition-colors flex-shrink-0"
                  >
                    <Minus className="w-3.5 h-3.5 text-red" />
                  </button>

                  {/* Stock info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/research/${stock.ticker.toLowerCase()}`}
                        className="font-mono font-medium text-sm text-green hover:text-green-light transition-colors"
                      >
                        {stock.ticker}
                      </Link>
                      {signal && (
                        <span
                          className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${scoreBg(signal.compositeScore)} ${scoreColor(signal.compositeScore)}`}
                        >
                          AI {signal.compositeScore}
                        </span>
                      )}
                      {signal && signal.signal.type !== "Neutral" && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded bg-surface-alt ${signalTextColor(signal.signal.color)}`}>
                          {signal.signal.type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted truncate">{stock.name}</p>
                  </div>

                  {/* Dollar amount */}
                  <span className="text-xs text-text-muted font-mono flex-shrink-0">
                    {formatCurrency(dollarAmount)}
                  </span>

                  {/* Allocation slider + input */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={item.allocation}
                      onChange={(e) => onUpdateAllocation(item.ticker, Number(e.target.value))}
                      className="w-20 h-1 accent-green cursor-pointer"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={item.allocation}
                        onChange={(e) => onUpdateAllocation(item.ticker, Number(e.target.value))}
                        className="w-12 bg-surface-alt border border-border rounded px-1.5 py-1 text-xs font-mono text-right focus:outline-none focus:border-green/40"
                      />
                      <span className="text-xs text-text-muted">%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Allocation bar */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-text-muted">Total Allocation</span>
              <span
                className={`font-mono font-medium ${
                  totalAllocation === 100
                    ? "text-green"
                    : totalAllocation > 100
                      ? "text-red"
                      : "text-gold"
                }`}
              >
                {totalAllocation}%
              </span>
            </div>
            <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  totalAllocation === 100
                    ? "bg-green"
                    : totalAllocation > 100
                      ? "bg-red"
                      : "bg-gold"
                }`}
                style={{ width: `${Math.min(totalAllocation, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Add stocks */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border space-y-3">
            <h3 className="text-sm font-semibold">Add Stocks</h3>
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Search by ticker, name, or sector..."
                className="w-full bg-surface-alt border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/40 transition-colors"
              />
            </div>
          </div>
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {/* Already-added stocks matching search */}
            {addedStocksInSearch.map((stock) => (
              <div
                key={stock.ticker}
                className="w-full p-4 flex items-center justify-between opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-xs font-mono font-bold">
                    {stock.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{stock.ticker}</p>
                    <p className="text-xs text-text-muted">{stock.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-green">
                  <Check className="w-3.5 h-3.5" />
                  Added
                </div>
              </div>
            ))}
            {/* Available stocks */}
            {availableStocks.slice(0, 20).map((stock) => (
              <button
                key={stock.ticker}
                onClick={() => onAddStock(stock.ticker)}
                className="w-full p-4 flex items-center justify-between card-hover text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-xs font-mono font-bold">
                    {stock.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{stock.ticker}</p>
                    <p className="text-xs text-text-muted">{stock.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono ${scoreColor(stock.aiScore)}`}>
                    AI: {stock.aiScore}
                  </span>
                  <Plus className="w-4 h-4 text-green" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Metrics sidebar */}
      <div className="space-y-4">
        {/* Portfolio metrics */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-green" />
            Portfolio Metrics
          </h3>
          <div className="space-y-3">
            {[
              { label: "Positions", value: String(portfolio.length) },
              {
                label: "Avg AI Score",
                value: metrics.avgAiScore.toFixed(0),
                color: scoreColor(metrics.avgAiScore),
              },
              { label: "Weighted P/E", value: metrics.weightedPE.toFixed(1) },
              { label: "Avg Dividend", value: `${metrics.avgDividend.toFixed(2)}%` },
              { label: "Portfolio Beta", value: metrics.portfolioBeta.toFixed(2) },
              {
                label: "Est. Annual Dividends",
                value: formatCurrency(metrics.estAnnualDividends),
                color: "text-green",
              },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-text-muted">{row.label}</span>
                <span className={`font-mono font-medium ${row.color || ""}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sector donut */}
        {sectorDonutSegments.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Sector Exposure</h3>
            <DonutChart
              segments={sectorDonutSegments}
              centerLabel="sectors"
              centerValue={String(sectorDonutSegments.length)}
              size={160}
            />
          </div>
        )}

        {/* Position donut */}
        {positionDonutSegments.length > 1 && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">Position Breakdown</h3>
            <DonutChart
              segments={positionDonutSegments}
              centerLabel="positions"
              centerValue={String(portfolio.length)}
              size={160}
            />
          </div>
        )}

        {/* Warnings */}
        {metrics.warnings.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gold" />
              Warnings
            </h3>
            <ul className="space-y-2">
              {metrics.warnings.map((w, i) => (
                <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                  <span className="text-gold mt-0.5">!</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pro tips */}
        <div className="bg-green-bg border border-green/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green" />
            <h3 className="text-sm font-semibold text-green">Pro Tips</h3>
          </div>
          <ul className="space-y-2 text-xs text-text-secondary">
            <li>Aim for 10-20 positions for diversification</li>
            <li>Keep any single stock under 10% of portfolio</li>
            <li>Balance high-growth (tech) with stable dividend payers</li>
            <li>Rebalance quarterly to maintain target allocations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
