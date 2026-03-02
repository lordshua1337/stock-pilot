"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Zap,
  BarChart3,
  PieChart,
  ArrowUpDown,
  Table2,
} from "lucide-react";
import {
  getSectorMetrics,
  getStocksBySector,
  type SectorMetrics,
  type Stock,
} from "@/lib/stock-data";

function SectorCard({ metrics }: { metrics: SectorMetrics }) {
  const isUp = metrics.avgChange >= 0;
  const sectorStocks = getStocksBySector(metrics.name);

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: `${metrics.color}18`,
                color: metrics.color,
              }}
            >
              {metrics.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-semibold">{metrics.name}</h3>
              <p className="text-xs text-text-muted">
                {metrics.stockCount} stock{metrics.stockCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div
            className={`text-sm font-mono font-medium flex items-center gap-1 ${
              isUp ? "text-green" : "text-red"
            }`}
          >
            {isUp ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {isUp ? "+" : ""}
            {metrics.avgChange}%
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">
              Avg AI Score
            </p>
            <p
              className={`text-sm font-mono font-semibold ${
                metrics.avgAiScore >= 80
                  ? "text-green"
                  : metrics.avgAiScore >= 60
                    ? "text-gold"
                    : "text-red"
              }`}
            >
              {metrics.avgAiScore}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">
              Avg P/E
            </p>
            <p className="text-sm font-mono font-semibold">{metrics.avgPE}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">
              Avg Dividend
            </p>
            <p className="text-sm font-mono font-semibold">
              {metrics.avgDividend}%
            </p>
          </div>
        </div>
      </div>

      {/* Stock list */}
      <div className="divide-y divide-border">
        {sectorStocks.map((stock) => {
          const stockUp = stock.changePercent >= 0;
          return (
            <Link
              key={stock.ticker}
              href={`/research/${stock.ticker.toLowerCase()}`}
              className="flex items-center justify-between p-3 px-5 card-hover"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-surface-alt flex items-center justify-center text-[10px] font-mono font-bold">
                  {stock.ticker.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-mono font-medium">
                    {stock.ticker}
                  </p>
                  <p className="text-xs text-text-muted truncate max-w-[140px]">
                    {stock.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-xs font-mono ${
                    stock.aiScore >= 80
                      ? "text-green"
                      : stock.aiScore >= 60
                        ? "text-gold"
                        : "text-red"
                  }`}
                >
                  AI: {stock.aiScore}
                </span>
                <span
                  className={`text-xs font-mono ${
                    stockUp ? "text-green" : "text-red"
                  }`}
                >
                  {stockUp ? "+" : ""}
                  {stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

type SortKey = "name" | "avgChange" | "avgAiScore" | "avgPE" | "avgDividend" | "stockCount";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "avgAiScore", label: "AI Score" },
  { key: "avgChange", label: "Performance" },
  { key: "avgDividend", label: "Dividend" },
  { key: "avgPE", label: "P/E Ratio" },
  { key: "stockCount", label: "# Stocks" },
];

export default function SectorsPage() {
  const sectorMetrics = useMemo(() => getSectorMetrics(), []);
  const [sortBy, setSortBy] = useState<SortKey>("avgAiScore");
  const [sortDesc, setSortDesc] = useState(true);

  const sortedMetrics = useMemo(() => {
    const sorted = [...sectorMetrics].sort((a, b) => {
      if (sortBy === "name") {
        return sortDesc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      return sortDesc ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });
    return sorted;
  }, [sectorMetrics, sortBy, sortDesc]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDesc((prev) => !prev);
    } else {
      setSortBy(key);
      setSortDesc(true);
    }
  };

  const overallAvgScore =
    sectorMetrics.reduce(
      (sum, s) => sum + s.avgAiScore * s.stockCount,
      0
    ) / sectorMetrics.reduce((sum, s) => sum + s.stockCount, 0);

  const totalStocks = sectorMetrics.reduce(
    (sum, s) => sum + s.stockCount,
    0
  );

  const bestSector = [...sectorMetrics].sort((a, b) => b.avgAiScore - a.avgAiScore)[0];
  const worstSector = [...sectorMetrics].sort((a, b) => a.avgAiScore - b.avgAiScore)[0];

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
            <PieChart className="w-4 h-4" />
            <p className="text-xs uppercase tracking-widest font-medium">
              Sector Analysis
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">
            Market Sectors
          </h1>
          <p className="text-text-secondary text-sm">
            Compare sector performance, AI scores, and valuations across{" "}
            {totalStocks} stocks in {sectorMetrics.length} sectors.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-green font-mono">
              {sectorMetrics.length}
            </p>
            <p className="text-xs text-text-muted mt-1">Sectors</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold font-mono">{totalStocks}</p>
            <p className="text-xs text-text-muted mt-1">Stocks</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-green font-mono">
              {Math.round(overallAvgScore)}
            </p>
            <p className="text-xs text-text-muted mt-1">Avg AI Score</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold font-mono">
              {(
                sectorMetrics.reduce((sum, s) => sum + s.avgDividend * s.stockCount, 0) /
                totalStocks
              ).toFixed(2)}
              %
            </p>
            <p className="text-xs text-text-muted mt-1">Avg Dividend</p>
          </div>
        </div>

        {/* Sector allocation bar */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-8">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green" />
            Market Composition
          </h3>
          <div className="flex h-4 rounded-full overflow-hidden mb-3">
            {sectorMetrics.map((s) => (
              <div
                key={s.name}
                className="h-full"
                style={{
                  width: `${(s.stockCount / totalStocks) * 100}%`,
                  backgroundColor: s.color,
                }}
                title={`${s.name}: ${s.stockCount} stocks`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {sectorMetrics.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-xs text-text-secondary">
                  {s.name} ({s.stockCount})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sector comparison table */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-8">
          <div className="p-5 border-b border-border">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Table2 className="w-4 h-4 text-green" />
              Sector Comparison
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Click any column to sort. Best sector by AI score:{" "}
              <span className="text-green font-medium">{bestSector.name}</span>
              {" -- "}Weakest:{" "}
              <span className="text-red font-medium">{worstSector.name}</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {SORT_OPTIONS.map((opt) => (
                    <th
                      key={opt.key}
                      className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-text-muted font-medium cursor-pointer hover:text-text-secondary transition-colors"
                      onClick={() => handleSort(opt.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {opt.label}
                        {sortBy === opt.key && (
                          <ArrowUpDown className="w-3 h-3 text-green" />
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-text-muted font-medium">
                    Top Stock
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedMetrics.map((s) => {
                  const isUp = s.avgChange >= 0;
                  return (
                    <tr key={s.name} className="hover:bg-surface-alt transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: s.color }}
                          />
                          <span className="font-medium text-sm">{s.name}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-mono text-sm ${
                        s.avgAiScore >= 80 ? "text-green" : s.avgAiScore >= 60 ? "text-gold" : "text-red"
                      }`}>
                        {s.avgAiScore}
                      </td>
                      <td className={`px-4 py-3 font-mono text-sm ${isUp ? "text-green" : "text-red"}`}>
                        {isUp ? "+" : ""}{s.avgChange}%
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {s.avgDividend}%
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {s.avgPE}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {s.stockCount}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/research/${s.topStock.ticker.toLowerCase()}`}
                          className="text-xs font-mono text-green hover:underline"
                        >
                          {s.topStock.ticker} (AI: {s.topStock.aiScore})
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sort controls for cards */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-text-muted">
            Sorted by {SORT_OPTIONS.find((o) => o.key === sortBy)?.label} ({sortDesc ? "high to low" : "low to high"})
          </p>
          <div className="flex gap-1">
            {SORT_OPTIONS.slice(0, 4).map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleSort(opt.key)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  sortBy === opt.key
                    ? "bg-green/15 text-green font-medium"
                    : "text-text-muted hover:text-text-secondary hover:bg-surface-alt"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sector cards */}
        <div className="space-y-4">
          {sortedMetrics.map((metrics) => (
            <SectorCard key={metrics.name} metrics={metrics} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center bg-surface border border-border rounded-xl p-8">
          <Zap className="w-6 h-6 text-green mx-auto mb-3" />
          <h3 className="text-xl font-semibold mb-2">
            Ready to Build a Portfolio?
          </h3>
          <p className="text-text-secondary text-sm mb-6">
            Use sector analysis to build a diversified portfolio with the right
            balance of growth and stability.
          </p>
          <Link
            href="/portfolio"
            className="bg-green text-black px-6 py-2.5 rounded-lg font-medium hover:bg-green-light transition-colors inline-flex items-center gap-2"
          >
            Build Portfolio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
