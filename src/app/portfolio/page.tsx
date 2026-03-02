"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Minus,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  PieChart,
  Search,
} from "lucide-react";
import { stocks, sectors, type Stock } from "@/lib/stock-data";

interface PortfolioItem {
  ticker: string;
  allocation: number; // percentage
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [totalInvestment, setTotalInvestment] = useState(10000);
  const [stockSearch, setStockSearch] = useState("");

  const addStock = (ticker: string) => {
    if (portfolio.some((p) => p.ticker === ticker)) return;
    const remaining =
      100 - portfolio.reduce((sum, p) => sum + p.allocation, 0);
    const defaultAlloc = Math.min(remaining, 10);
    if (defaultAlloc <= 0) return;

    setPortfolio([...portfolio, { ticker, allocation: defaultAlloc }]);
  };

  const removeStock = (ticker: string) => {
    setPortfolio(portfolio.filter((p) => p.ticker !== ticker));
  };

  const updateAllocation = (ticker: string, newAlloc: number) => {
    const clamped = Math.max(0, Math.min(100, newAlloc));
    setPortfolio(
      portfolio.map((p) =>
        p.ticker === ticker ? { ...p, allocation: clamped } : p
      )
    );
  };

  const totalAllocation = portfolio.reduce((sum, p) => sum + p.allocation, 0);

  const portfolioMetrics = useMemo(() => {
    if (portfolio.length === 0) {
      return {
        avgAiScore: 0,
        avgPE: 0,
        avgDividend: 0,
        sectorBreakdown: [] as { name: string; allocation: number }[],
        warnings: [] as string[],
      };
    }

    let weightedScore = 0;
    let weightedPE = 0;
    let weightedDiv = 0;
    const sectorMap: Record<string, number> = {};
    const warnings: string[] = [];

    for (const item of portfolio) {
      const stock = stocks.find((s) => s.ticker === item.ticker);
      if (!stock) continue;

      const weight = item.allocation / 100;
      weightedScore += stock.aiScore * weight;
      weightedPE += stock.peRatio * weight;
      weightedDiv += stock.dividendYield * weight;

      sectorMap[stock.sector] =
        (sectorMap[stock.sector] || 0) + item.allocation;
    }

    // Warnings
    if (totalAllocation > 100) {
      warnings.push("Total allocation exceeds 100%");
    }
    if (totalAllocation < 100 && portfolio.length > 0) {
      warnings.push(`${100 - totalAllocation}% unallocated`);
    }
    if (portfolio.length < 3) {
      warnings.push("Low diversification: consider adding more stocks");
    }

    for (const [sector, alloc] of Object.entries(sectorMap)) {
      if (alloc > 40) {
        warnings.push(`High concentration: ${sector} at ${alloc}%`);
      }
    }

    for (const item of portfolio) {
      if (item.allocation > 30) {
        warnings.push(`${item.ticker} at ${item.allocation}% -- high single-stock risk`);
      }
    }

    const sectorBreakdown = Object.entries(sectorMap)
      .map(([name, allocation]) => ({ name, allocation }))
      .sort((a, b) => b.allocation - a.allocation);

    return {
      avgAiScore: weightedScore * (100 / Math.max(totalAllocation, 1)),
      avgPE: weightedPE * (100 / Math.max(totalAllocation, 1)),
      avgDividend: weightedDiv * (100 / Math.max(totalAllocation, 1)),
      sectorBreakdown,
      warnings,
    };
  }, [portfolio, totalAllocation]);

  const availableStocks = stocks
    .filter((s) => !portfolio.some((p) => p.ticker === s.ticker))
    .filter((s) => {
      if (!stockSearch.trim()) return true;
      const q = stockSearch.toLowerCase();
      return (
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q)
      );
    });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 text-green mb-2">
            <Briefcase className="w-4 h-4" />
            <p className="text-xs uppercase tracking-widest font-medium">
              Portfolio Builder
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">
            Build Your Portfolio
          </h1>
          <p className="text-text-secondary text-sm">
            Select stocks, set allocations, and see real-time portfolio metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Stock picker + portfolio */}
          <div className="lg:col-span-2 space-y-6">
            {/* Investment amount */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <label className="text-xs text-text-muted mb-1 block">
                Total Investment Amount
              </label>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green" />
                <input
                  type="number"
                  value={totalInvestment}
                  onChange={(e) =>
                    setTotalInvestment(Math.max(0, Number(e.target.value)))
                  }
                  className="bg-transparent border-none text-xl font-mono font-bold focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Current portfolio */}
            {portfolio.length > 0 && (
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-semibold">Your Portfolio</h3>
                </div>
                <div className="divide-y divide-border">
                  {portfolio.map((item) => {
                    const stock = stocks.find(
                      (s) => s.ticker === item.ticker
                    );
                    if (!stock) return null;
                    const dollarAmount =
                      (item.allocation / 100) * totalInvestment;

                    return (
                      <div
                        key={item.ticker}
                        className="p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => removeStock(item.ticker)}
                            className="w-7 h-7 rounded-full bg-red-bg flex items-center justify-center hover:bg-red/20 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5 text-red" />
                          </button>
                          <div>
                            <Link
                              href={`/research/${stock.ticker.toLowerCase()}`}
                              className="font-mono font-medium text-sm text-green hover:text-green-light transition-colors"
                            >
                              {stock.ticker}
                            </Link>
                            <p className="text-xs text-text-muted">
                              {stock.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-text-muted font-mono">
                            {formatCurrency(dollarAmount)}
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={item.allocation}
                              onChange={(e) =>
                                updateAllocation(
                                  item.ticker,
                                  Number(e.target.value)
                                )
                              }
                              className="w-14 bg-surface-alt border border-border rounded px-2 py-1 text-sm font-mono text-right focus:outline-none focus:border-green/40"
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
                      style={{
                        width: `${Math.min(totalAllocation, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

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
              <div className="divide-y divide-border">
                {availableStocks.map((stock) => (
                  <button
                    key={stock.ticker}
                    onClick={() => addStock(stock.ticker)}
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
                      <span className="text-xs text-text-muted">
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
            {/* Portfolio stats */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-green" />
                Portfolio Metrics
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Positions</span>
                  <span className="font-mono font-medium">
                    {portfolio.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Avg AI Score</span>
                  <span
                    className={`font-mono font-medium ${
                      portfolioMetrics.avgAiScore >= 80
                        ? "text-green"
                        : portfolioMetrics.avgAiScore >= 60
                          ? "text-gold"
                          : "text-red"
                    }`}
                  >
                    {portfolioMetrics.avgAiScore.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Weighted P/E</span>
                  <span className="font-mono font-medium">
                    {portfolioMetrics.avgPE.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Avg Dividend</span>
                  <span className="font-mono font-medium">
                    {portfolioMetrics.avgDividend.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Est. Annual Dividends</span>
                  <span className="font-mono font-medium text-green">
                    {formatCurrency(
                      totalInvestment * (portfolioMetrics.avgDividend / 100)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Sector breakdown */}
            {portfolioMetrics.sectorBreakdown.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-3">Sector Exposure</h3>
                <div className="space-y-2">
                  {portfolioMetrics.sectorBreakdown.map((s) => {
                    const sectorColor =
                      sectors.find((sec) => sec.name === s.name)?.color ||
                      "#666";
                    return (
                      <div key={s.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-secondary">{s.name}</span>
                          <span className="font-mono text-text-muted">
                            {s.allocation}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-alt rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.allocation}%`,
                              backgroundColor: sectorColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Warnings */}
            {portfolioMetrics.warnings.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-gold" />
                  Warnings
                </h3>
                <ul className="space-y-2">
                  {portfolioMetrics.warnings.map((w, i) => (
                    <li
                      key={i}
                      className="text-xs text-text-secondary flex items-start gap-2"
                    >
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
      </div>
    </div>
  );
}
