"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  ArrowUpDown,
  Filter,
  Check,
} from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import { ARCHETYPE_COLORS } from "@/components/dna/archetype-colors";
import {
  getTopStocksForArchetype,
  type ScoredStock,
} from "@/lib/archetype-stock-scores";
import { slugToArchetype } from "@/lib/archetype-slugs";
import {
  loadPortfolio,
  savePortfolio,
} from "@/lib/portfolio-storage";
import type { ArchetypeKey } from "@/lib/financial-dna";

type SortKey = "score" | "yield" | "beta" | "pe" | "aiScore";

export default function ArchetypeInvestPage() {
  const params = useParams();
  const slug = params.archetype as string;
  const archetypeKey = slugToArchetype(slug);

  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [filterSector, setFilterSector] = useState<string>("all");
  const [addedTickers, setAddedTickers] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Load existing portfolio tickers
  useEffect(() => {
    const stored = loadPortfolio();
    if (stored) {
      setAddedTickers(new Set(stored.items.map((i) => i.ticker)));
    }
  }, []);

  const scored = useMemo(() => {
    if (!archetypeKey) return [];
    return getTopStocksForArchetype(stocks, archetypeKey, showAll ? 85 : 15);
  }, [archetypeKey, showAll]);

  const sectors = useMemo(() => {
    const s = new Set(scored.map((sc) => sc.stock.sector));
    return ["all", ...Array.from(s).sort()];
  }, [scored]);

  const filtered = useMemo(() => {
    let items = [...scored];
    if (filterSector !== "all") {
      items = items.filter((s) => s.stock.sector === filterSector);
    }
    switch (sortBy) {
      case "yield":
        items.sort((a, b) => b.stock.dividendYield - a.stock.dividendYield);
        break;
      case "beta":
        items.sort((a, b) => a.stock.beta - b.stock.beta);
        break;
      case "pe":
        items.sort((a, b) => a.stock.peRatio - b.stock.peRatio);
        break;
      case "aiScore":
        items.sort((a, b) => b.stock.aiScore - a.stock.aiScore);
        break;
      default:
        // already sorted by score
        break;
    }
    return items;
  }, [scored, filterSector, sortBy]);

  if (!archetypeKey) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-semibold mb-4">Archetype Not Found</h1>
          <Link href="/invest" className="text-green hover:underline text-sm">
            Back to Invest Hub
          </Link>
        </div>
      </div>
    );
  }

  const info = ARCHETYPE_INFO[archetypeKey];
  const color = ARCHETYPE_COLORS[archetypeKey];

  function handleAddToPortfolio(ticker: string) {
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

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/invest"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Archetypes
        </Link>

        {/* Hero */}
        <div
          className="rounded-xl border p-6 mb-8"
          style={{
            borderColor: `${color}33`,
            background: `linear-gradient(135deg, ${color}08 0%, transparent 60%)`,
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              {info.name}
            </h1>
          </div>
          <p
            className="text-sm italic mb-3"
            style={{ color }}
          >
            {info.tagline}
          </p>
          <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
            {info.description}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Sort */}
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
            {(
              [
                ["score", "Best Match"],
                ["yield", "Yield"],
                ["beta", "Beta"],
                ["pe", "P/E"],
                ["aiScore", "AI Score"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  sortBy === key
                    ? "bg-green/10 text-green border border-green/20"
                    : "text-text-muted hover:text-text-secondary bg-surface-alt"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sector filter */}
          <div className="flex items-center gap-2 text-xs ml-auto">
            <Filter className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="bg-surface-alt border border-border rounded-md px-2 py-1 text-xs text-text-secondary"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Sectors" : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item, i) => (
            <StockCard
              key={item.stock.ticker}
              scored={item}
              color={color}
              index={i}
              isInPortfolio={addedTickers.has(item.stock.ticker)}
              onAdd={handleAddToPortfolio}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted text-sm">
            No stocks match the current filters.
          </div>
        )}

        {/* Show more */}
        {!showAll && scored.length >= 15 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(true)}
              className="text-xs text-green hover:text-green/80 transition-colors"
            >
              Show all stocks ranked for {info.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stock Card ───────────────────────────────────────────────────────

function StockCard({
  scored,
  color,
  index,
  isInPortfolio,
  onAdd,
}: {
  scored: ScoredStock;
  color: string;
  index: number;
  isInPortfolio: boolean;
  onAdd: (ticker: string) => void;
}) {
  const { stock, score, reasons } = scored;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-surface-alt rounded-xl border border-border p-4 hover:border-border/80 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-text-primary">
              {stock.ticker}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${color}15`,
                color,
              }}
            >
              {score}/100
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
            {stock.name}
          </p>
        </div>

        <button
          onClick={() => onAdd(stock.ticker)}
          disabled={isInPortfolio}
          className={`flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-lg transition-colors ${
            isInPortfolio
              ? "bg-green/10 text-green cursor-default"
              : "bg-surface text-text-muted hover:text-green hover:bg-green/10"
          }`}
        >
          {isInPortfolio ? (
            <>
              <Check className="w-3 h-3" />
              Added
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              Add
            </>
          )}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2 mb-3 text-center">
        <MetricPill label="P/E" value={stock.peRatio.toFixed(1)} />
        <MetricPill
          label="Yield"
          value={`${stock.dividendYield.toFixed(1)}%`}
        />
        <MetricPill label="Beta" value={stock.beta.toFixed(2)} />
        <MetricPill label="AI" value={String(stock.aiScore)} />
      </div>

      {/* Reasons */}
      <div className="space-y-1">
        {reasons.map((r, i) => (
          <p key={i} className="text-[10px] text-text-muted leading-tight">
            <span style={{ color }} className="mr-1">
              +
            </span>
            {r}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-md py-1">
      <p className="text-[9px] text-text-muted">{label}</p>
      <p className="text-xs font-medium text-text-secondary">{value}</p>
    </div>
  );
}
