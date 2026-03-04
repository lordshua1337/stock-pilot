"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Plus,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { stocks, sectors, type Stock } from "@/lib/stock-data";
import {
  screenStocks,
  getArchetypeFilters,
  DEFAULT_FILTERS,
  type ScreenerFilters,
  type SortField,
  type SortDir,
} from "@/lib/advanced-screener";
import { loadPortfolio, savePortfolio } from "@/lib/portfolio-storage";
import { loadDNAProfile } from "@/lib/dna-storage";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import type { ArchetypeKey } from "@/lib/financial-dna";

export default function ScreenerPage() {
  const [filters, setFilters] = useState<ScreenerFilters>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>("aiScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(true);
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);
  const [addedTickers, setAddedTickers] = useState<Set<string>>(new Set());
  const [archetype, setArchetype] = useState<ArchetypeKey | null>(null);

  useEffect(() => {
    const stored = loadPortfolio();
    if (stored) setAddedTickers(new Set(stored.items.map((i) => i.ticker)));
    const dna = loadDNAProfile();
    if (dna) setArchetype(dna.communicationArchetype);
  }, []);

  const results = useMemo(
    () => screenStocks(stocks, filters, sortField, sortDir),
    [filters, sortField, sortDir]
  );

  const allSectors = useMemo(
    () => ["all", ...sectors.map((s) => s.name)],
    []
  );

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function updateFilter(key: keyof ScreenerFilters, value: string | number) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function applyArchetypePreset() {
    if (!archetype) return;
    setFilters(getArchetypeFilters(archetype));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  function handleAdd(ticker: string) {
    const stored = loadPortfolio();
    const items = stored ? stored.items.map((i) => ({ ...i })) : [];
    const investment = stored?.investment ?? 10000;
    if (items.some((i) => i.ticker === ticker)) return;
    const totalAlloc = items.reduce((s, i) => s + i.allocation, 0);
    const remaining = 100 - totalAlloc;
    if (remaining < 1) return;
    items.push({ ticker, allocation: Math.min(remaining, 10) });
    savePortfolio(items, investment);
    setAddedTickers((prev) => new Set([...prev, ticker]));
  }

  const archetypeName = archetype
    ? ARCHETYPE_INFO[archetype]?.name
    : null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-green mb-2">
            <Search className="w-4 h-4" />
            <p className="text-xs uppercase tracking-widest font-medium">
              Stock Screener
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-1">
            Find Your Next Pick
          </h1>
          <p className="text-text-secondary text-sm">
            {results.length} of {stocks.length} stocks match your
            filters
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-xs bg-surface-alt border border-border px-3 py-1.5 rounded-lg hover:bg-surface-alt/80 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {archetype && (
            <button
              onClick={applyArchetypePreset}
              className="flex items-center gap-2 text-xs bg-green/10 text-green border border-green/20 px-3 py-1.5 rounded-lg hover:bg-green/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {archetypeName} Filter
            </button>
          )}

          <button
            onClick={resetFilters}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors px-2 py-1.5"
          >
            Reset
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="bg-surface-alt rounded-xl border border-border p-4 mb-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Sector */}
              <div>
                <label className="text-[10px] text-text-muted block mb-1">
                  Sector
                </label>
                <select
                  value={filters.sector}
                  onChange={(e) => updateFilter("sector", e.target.value)}
                  className="w-full bg-surface border border-border rounded-md px-2 py-1.5 text-xs text-text-secondary"
                >
                  {allSectors.map((s) => (
                    <option key={s} value={s}>
                      {s === "all" ? "All Sectors" : s}
                    </option>
                  ))}
                </select>
              </div>

              {/* PE Range */}
              <div>
                <label className="text-[10px] text-text-muted block mb-1">
                  P/E Ratio ({filters.peMin} - {filters.peMax})
                </label>
                <div className="flex gap-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={filters.peMin}
                    onChange={(e) =>
                      updateFilter("peMin", Number(e.target.value))
                    }
                    className="flex-1 accent-green"
                  />
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={filters.peMax}
                    onChange={(e) =>
                      updateFilter("peMax", Number(e.target.value))
                    }
                    className="flex-1 accent-green"
                  />
                </div>
              </div>

              {/* Yield Range */}
              <div>
                <label className="text-[10px] text-text-muted block mb-1">
                  Div Yield ({filters.yieldMin}% - {filters.yieldMax}%)
                </label>
                <div className="flex gap-1">
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.1}
                    value={filters.yieldMin}
                    onChange={(e) =>
                      updateFilter("yieldMin", Number(e.target.value))
                    }
                    className="flex-1 accent-green"
                  />
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={0.1}
                    value={filters.yieldMax}
                    onChange={(e) =>
                      updateFilter("yieldMax", Number(e.target.value))
                    }
                    className="flex-1 accent-green"
                  />
                </div>
              </div>

              {/* Beta Range */}
              <div>
                <label className="text-[10px] text-text-muted block mb-1">
                  Beta ({filters.betaMin.toFixed(1)} -{" "}
                  {filters.betaMax.toFixed(1)})
                </label>
                <div className="flex gap-1">
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.1}
                    value={filters.betaMin}
                    onChange={(e) =>
                      updateFilter("betaMin", Number(e.target.value))
                    }
                    className="flex-1 accent-green"
                  />
                  <input
                    type="range"
                    min={0}
                    max={3}
                    step={0.1}
                    value={filters.betaMax}
                    onChange={(e) =>
                      updateFilter("betaMax", Number(e.target.value))
                    }
                    className="flex-1 accent-green"
                  />
                </div>
              </div>

              {/* AI Score Range */}
              <div>
                <label className="text-[10px] text-text-muted block mb-1">
                  AI Score ({filters.aiScoreMin} - {filters.aiScoreMax})
                </label>
                <div className="flex gap-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={filters.aiScoreMin}
                    onChange={(e) =>
                      updateFilter("aiScoreMin", Number(e.target.value))
                    }
                    className="flex-1 accent-green"
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={filters.aiScoreMax}
                    onChange={(e) =>
                      updateFilter("aiScoreMax", Number(e.target.value))
                    }
                    className="flex-1 accent-green"
                  />
                </div>
              </div>

              {/* Analyst Rating */}
              <div>
                <label className="text-[10px] text-text-muted block mb-1">
                  Analyst Rating
                </label>
                <select
                  value={filters.analystRating}
                  onChange={(e) =>
                    updateFilter("analystRating", e.target.value)
                  }
                  className="w-full bg-surface border border-border rounded-md px-2 py-1.5 text-xs text-text-secondary"
                >
                  {["all", "Strong Buy", "Buy", "Hold", "Sell"].map(
                    (r) => (
                      <option key={r} value={r}>
                        {r === "all" ? "All Ratings" : r}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results table */}
        <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-text-muted border-b border-border">
                  <SortHeader
                    label="Ticker"
                    field="ticker"
                    current={sortField}
                    dir={sortDir}
                    onClick={handleSort}
                  />
                  <th className="text-left py-2.5 px-3 font-medium">
                    Name
                  </th>
                  <SortHeader
                    label="Price"
                    field="price"
                    current={sortField}
                    dir={sortDir}
                    onClick={handleSort}
                    align="right"
                  />
                  <SortHeader
                    label="Change"
                    field="change"
                    current={sortField}
                    dir={sortDir}
                    onClick={handleSort}
                    align="right"
                  />
                  <SortHeader
                    label="P/E"
                    field="pe"
                    current={sortField}
                    dir={sortDir}
                    onClick={handleSort}
                    align="right"
                  />
                  <SortHeader
                    label="Yield"
                    field="yield"
                    current={sortField}
                    dir={sortDir}
                    onClick={handleSort}
                    align="right"
                  />
                  <SortHeader
                    label="Beta"
                    field="beta"
                    current={sortField}
                    dir={sortDir}
                    onClick={handleSort}
                    align="right"
                  />
                  <SortHeader
                    label="AI"
                    field="aiScore"
                    current={sortField}
                    dir={sortDir}
                    onClick={handleSort}
                    align="right"
                  />
                  <th className="py-2.5 px-3 w-16" />
                </tr>
              </thead>
              <tbody>
                {results.map((stock) => (
                  <StockRow
                    key={stock.ticker}
                    stock={stock}
                    isExpanded={expandedTicker === stock.ticker}
                    isAdded={addedTickers.has(stock.ticker)}
                    onToggle={() =>
                      setExpandedTicker(
                        expandedTicker === stock.ticker
                          ? null
                          : stock.ticker
                      )
                    }
                    onAdd={handleAdd}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {results.length === 0 && (
            <div className="py-12 text-center text-sm text-text-muted">
              No stocks match your filters. Try widening your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sort Header ──────────────────────────────────────────────────────

function SortHeader({
  label,
  field,
  current,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: SortDir;
  onClick: (field: SortField) => void;
  align?: "left" | "right";
}) {
  const isActive = current === field;

  return (
    <th
      className={`py-2.5 px-3 font-medium cursor-pointer hover:text-text-secondary transition-colors ${
        align === "right" ? "text-right" : "text-left"
      }`}
      onClick={() => onClick(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && (
          <span className="text-green">
            {dir === "asc" ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </span>
        )}
      </span>
    </th>
  );
}

// ─── Stock Row ────────────────────────────────────────────────────────

function StockRow({
  stock,
  isExpanded,
  isAdded,
  onToggle,
  onAdd,
}: {
  stock: Stock;
  isExpanded: boolean;
  isAdded: boolean;
  onToggle: () => void;
  onAdd: (ticker: string) => void;
}) {
  return (
    <>
      <tr
        className="border-t border-border/30 hover:bg-surface/50 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="py-2.5 px-3">
          <span className="font-mono text-xs font-medium text-text-primary">
            {stock.ticker}
          </span>
        </td>
        <td className="py-2.5 px-3 text-xs text-text-secondary max-w-[150px] truncate">
          {stock.name}
        </td>
        <td className="py-2.5 px-3 text-xs text-right text-text-secondary">
          ${stock.price.toFixed(2)}
        </td>
        <td
          className={`py-2.5 px-3 text-xs text-right font-medium ${
            stock.changePercent >= 0 ? "text-green" : "text-red"
          }`}
        >
          {stock.changePercent >= 0 ? "+" : ""}
          {stock.changePercent.toFixed(2)}%
        </td>
        <td className="py-2.5 px-3 text-xs text-right text-text-secondary">
          {stock.peRatio.toFixed(1)}
        </td>
        <td className="py-2.5 px-3 text-xs text-right text-text-secondary">
          {stock.dividendYield.toFixed(2)}%
        </td>
        <td className="py-2.5 px-3 text-xs text-right text-text-secondary">
          {stock.beta.toFixed(2)}
        </td>
        <td className="py-2.5 px-3 text-xs text-right">
          <span
            className={`font-medium ${
              stock.aiScore >= 75
                ? "text-green"
                : stock.aiScore >= 50
                  ? "text-text-secondary"
                  : "text-red"
            }`}
          >
            {stock.aiScore}
          </span>
        </td>
        <td className="py-2.5 px-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(stock.ticker);
            }}
            disabled={isAdded}
            className={`text-[10px] flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
              isAdded
                ? "bg-green/10 text-green cursor-default"
                : "bg-surface text-text-muted hover:text-green hover:bg-green/10"
            }`}
          >
            {isAdded ? (
              <Check className="w-3 h-3" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
          </button>
        </td>
      </tr>

      {/* Expanded detail */}
      {isExpanded && (
        <tr className="bg-surface/30">
          <td colSpan={9} className="px-6 py-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-text-muted mb-1">
                  Description
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {stock.description}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted mb-1">
                  Thesis
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {stock.thesis}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted mb-1">
                  Key Metrics
                </p>
                <div className="space-y-1 text-xs">
                  <p className="text-text-secondary">
                    Market Cap: {stock.marketCap}
                  </p>
                  <p className="text-text-secondary">
                    52W Range: ${stock.fiftyTwoLow.toFixed(2)} - $
                    {stock.fiftyTwoHigh.toFixed(2)}
                  </p>
                  <p className="text-text-secondary">
                    Analyst: {stock.analystRating}
                  </p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
