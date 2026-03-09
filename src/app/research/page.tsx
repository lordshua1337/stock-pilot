"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { stocks as staticStocks, sectors, type Stock, type InstrumentType } from "@/lib/stock-data";
import ScreenerPanel from "@/components/screener-panel";
import {
  type ScreenerFilters,
  EMPTY_FILTERS,
  applyScreenerFilters,
} from "@/lib/screener-utils";
import { loadDNAProfile } from "@/lib/dna-storage";
import { loadV2Profile } from "@/lib/dna-v2/storage";
import { getPersonalityCopy } from "@/lib/personality-copy";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import { ARCHETYPE_COLORS } from "@/components/dna/archetype-colors";
import { matchStocksToDNA, topStocksForProfile } from "@/lib/dna-stock-matcher";
import type { ArchetypeKey, CoreDimensions } from "@/lib/financial-dna";
import { v2ToDimensions } from "@/lib/dna-v2/compat";
import {
  computeLensScore,
  loadSelectedPersonas,
  saveSelectedPersonas,
  type PersonaKey,
  type LensResult,
} from "@/lib/lens-scoring";
import { LensSelector } from "@/components/lens-selector";

function StockDetail({
  stock,
  isExpanded,
  onToggle,
  fitLabel,
  fitColor,
  lensResult,
}: {
  stock: Stock;
  isExpanded: boolean;
  onToggle: () => void;
  fitLabel?: string;
  fitColor?: string;
  lensResult?: LensResult;
}) {
  const isUp = stock.change >= 0;
  const scoreColor =
    stock.aiScore >= 80
      ? "text-green"
      : stock.aiScore >= 60
        ? "text-gold"
        : "text-red";

  return (
    <div
      id={stock.ticker}
      className="bg-surface border border-border rounded-xl overflow-hidden scroll-mt-24"
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full text-left p-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-surface-alt flex items-center justify-center text-sm font-mono font-bold">
            {stock.ticker}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{stock.name}</span>
              <span className="text-xs text-text-muted px-2 py-0.5 bg-surface-alt rounded">
                {stock.sector}
              </span>
              {fitLabel && fitColor && (
                <span
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                  style={{ color: fitColor, backgroundColor: `${fitColor}15` }}
                >
                  {fitLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-sm">
                ${stock.price.toFixed(2)}
              </span>
              <span
                className={`font-mono text-xs flex items-center gap-0.5 ${isUp ? "text-green" : "text-red"}`}
              >
                {isUp ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {isUp ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  stock.analystRating === "Strong Buy" || stock.analystRating === "Buy"
                    ? "bg-green-bg text-green"
                    : stock.analystRating === "Hold"
                      ? "bg-blue-bg text-blue"
                      : "bg-red-bg text-red"
                }`}
              >
                {stock.analystRating}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lensResult && lensResult.personas.length > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-text-muted">Lens</p>
              <p className={`text-xl font-mono font-bold ${
                lensResult.lensScore >= 80
                  ? "text-green"
                  : lensResult.lensScore >= 60
                    ? "text-gold"
                    : "text-red"
              }`}>
                {lensResult.lensScore}
              </p>
            </div>
          )}
          <div className="text-right mr-2">
            <p className="text-[10px] text-text-muted">AI Score</p>
            <p className={`text-xl font-mono font-bold ${scoreColor}`}>
              {stock.aiScore}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-text-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-muted" />
          )}
        </div>
      </button>

      {/* Expanded */}
      {isExpanded && (
        <div className="border-t border-border p-5 animate-fade-in">
          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-surface-alt rounded-lg p-3">
              <p className="text-xs text-text-muted">{stock.type === "stock" ? "Market Cap" : "AUM"}</p>
              <p className="text-sm font-mono font-medium">{stock.aum ?? stock.marketCap}</p>
            </div>
            {stock.expenseRatio != null ? (
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="text-xs text-text-muted">Expense Ratio</p>
                <p className="text-sm font-mono font-medium">{stock.expenseRatio}%</p>
              </div>
            ) : (
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="text-xs text-text-muted">P/E Ratio</p>
                <p className="text-sm font-mono font-medium">{stock.peRatio}</p>
              </div>
            )}
            <div className="bg-surface-alt rounded-lg p-3">
              <p className="text-xs text-text-muted">{stock.holdings ? "Holdings" : "Dividend Yield"}</p>
              <p className="text-sm font-mono font-medium">
                {stock.holdings ?? `${stock.dividendYield}%`}
              </p>
            </div>
            <div className="bg-surface-alt rounded-lg p-3">
              <p className="text-xs text-text-muted">52-Week Range</p>
              <p className="text-sm font-mono font-medium">
                ${stock.fiftyTwoLow} - ${stock.fiftyTwoHigh}
              </p>
            </div>
          </div>

          {/* Thesis */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green" />
              <h4 className="text-sm font-semibold text-green">AI Thesis</h4>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {stock.thesis}
            </p>
          </div>

          {/* Catalysts */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green" />
              <h4 className="text-sm font-semibold">Catalysts</h4>
            </div>
            <ul className="space-y-1.5">
              {stock.catalysts.map((c, i) => (
                <li
                  key={i}
                  className="text-sm text-text-secondary flex items-start gap-2"
                >
                  <span className="text-green mt-1 text-xs">+</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red" />
              <h4 className="text-sm font-semibold">Risks</h4>
            </div>
            <ul className="space-y-1.5">
              {stock.risks.map((r, i) => (
                <li
                  key={i}
                  className="text-sm text-text-secondary flex items-start gap-2"
                >
                  <span className="text-red mt-1 text-xs">-</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Full analysis link */}
          <Link
            href={`/research/${stock.ticker.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-sm text-green hover:text-green-light transition-colors font-medium"
          >
            View Full Analysis
            <TrendingUp className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResearchPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"aiScore" | "lensScore" | "changePercent" | "peRatio">(
    "aiScore"
  );
  const [typeFilter, setTypeFilter] = useState<InstrumentType | "all">("all");
  const [screenerFilters, setScreenerFilters] = useState<ScreenerFilters>({
    ...EMPTY_FILTERS,
    analystRatings: new Set(),
  });
  const [archetype, setArchetype] = useState<ArchetypeKey | null>(null);
  const [dimensions, setDimensions] = useState<CoreDimensions | null>(null);
  const [selectedLenses, setSelectedLenses] = useState<PersonaKey[]>([]);

  // Load saved lens selection
  useEffect(() => {
    setSelectedLenses(loadSelectedPersonas());
  }, []);
  const [livePrices, setLivePrices] = useState<Record<string, {
    price: number;
    change_amount: number;
    change_percent: number;
    last_refreshed: string;
  }>>({});
  const [priceAge, setPriceAge] = useState<string>("");

  // Fetch live prices from Yahoo Finance via our API
  useEffect(() => {
    let mounted = true;
    async function fetchPrices() {
      try {
        const res = await fetch("/api/market/prices");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data.prices) {
          setLivePrices(data.prices);
          // Find the most recent refresh time
          const times = Object.values(data.prices as Record<string, { last_refreshed: string }>)
            .map((p) => new Date(p.last_refreshed).getTime());
          if (times.length > 0) {
            const newest = Math.max(...times);
            const ago = Math.round((Date.now() - newest) / 60000);
            setPriceAge(ago <= 1 ? "just now" : `${ago}m ago`);
          }
        }
      } catch {
        // Silently fall back to static prices
      }
    }
    fetchPrices();
    // Re-fetch every 5 minutes during active use
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // Merge live prices into static stock data
  const stocks = useMemo(() => {
    if (Object.keys(livePrices).length === 0) return staticStocks;
    return staticStocks.map((s) => {
      const live = livePrices[s.ticker];
      if (!live) return s;
      return {
        ...s,
        price: live.price,
        change: live.change_amount,
        changePercent: live.change_percent,
      };
    });
  }, [livePrices]);

  useEffect(() => {
    const v2 = loadV2Profile();
    if (v2) {
      setArchetype(v2.archetype.primary as ArchetypeKey);
      setDimensions(v2ToDimensions(v2));
      return;
    }
    const v1 = loadDNAProfile();
    if (v1) {
      setArchetype(v1.communicationArchetype as ArchetypeKey);
      setDimensions(v1.dimensions);
    }
  }, []);

  const handleScreenerChange = useCallback((f: ScreenerFilters) => {
    setScreenerFilters(f);
  }, []);

  const handleLensChange = useCallback((keys: PersonaKey[]) => {
    setSelectedLenses(keys);
    saveSelectedPersonas(keys);
    // Auto-switch sort when lens is activated/deactivated
    if (keys.length > 0) {
      setSortBy("lensScore");
    } else {
      setSortBy("aiScore");
    }
  }, []);

  // Compute lens scores for all stocks
  const lensScores = useMemo(() => {
    if (selectedLenses.length === 0) return new Map<string, LensResult>();
    const results = new Map<string, LensResult>();
    for (const stock of stocks) {
      results.set(stock.ticker, computeLensScore(stock, selectedLenses));
    }
    return results;
  }, [stocks, selectedLenses]);

  const matchedTickers = useMemo(() => {
    if (!dimensions) return new Set<string>();
    return new Set(matchStocksToDNA(dimensions).map((m) => m.stock.ticker));
  }, [dimensions]);

  const typeFiltered = useMemo(() => {
    if (typeFilter === "all") return stocks;
    return stocks.filter((s) => s.type === typeFilter);
  }, [typeFilter]);

  const sectorNames = [...new Set(typeFiltered.map((s) => s.sector))].sort();

  const stockCount = stocks.filter((s) => s.type === "stock").length;
  const etfCount = stocks.filter((s) => s.type === "etf").length;
  const fundCount = stocks.filter((s) => s.type === "fund").length;

  const avgScore = Math.round(
    typeFiltered.reduce((sum, s) => sum + s.aiScore, 0) / typeFiltered.length
  );
  const strongBuys = typeFiltered.filter(
    (s) => s.analystRating === "Strong Buy"
  ).length;

  const filtered = useMemo(() => {
    const screened = applyScreenerFilters(typeFiltered, screenerFilters);
    return screened
      .filter((s) => {
        if (sectorFilter !== "all" && s.sector !== sectorFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "lensScore" && lensScores.size > 0) {
          const aLens = lensScores.get(a.ticker)?.lensScore ?? a.aiScore;
          const bLens = lensScores.get(b.ticker)?.lensScore ?? b.aiScore;
          return bLens - aLens;
        }
        if (sortBy === "aiScore") return b.aiScore - a.aiScore;
        if (sortBy === "changePercent")
          return Math.abs(b.changePercent) - Math.abs(a.changePercent);
        return a.peRatio - b.peRatio;
      });
  }, [screenerFilters, typeFiltered, sectorFilter, searchQuery, sortBy, lensScores]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        <div className="mb-8">
          <p
            className="text-xs uppercase tracking-widest font-medium mb-2"
            style={{ color: archetype ? (ARCHETYPE_COLORS[archetype] ?? "#006DD8") : "#006DD8" }}
          >
            Research
          </p>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">
            {typeFilter === "etf" ? "ETF Analysis" : typeFilter === "fund" ? "Fund Analysis" : typeFilter === "stock" ? "Stock Analysis" : "Market Research"}
          </h1>
          <p className="text-text-secondary text-sm">
            {archetype
              ? getPersonalityCopy(archetype)?.researchIntro ??
                "AI-generated research for each stock. Thesis, catalysts, risks, and a score from 1-100."
              : "AI-generated research for each stock. Thesis, catalysts, risks, and a score from 1-100."}
          </p>
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-2 mb-5">
          {([
            { key: "all" as const, label: "All", count: stocks.length },
            { key: "stock" as const, label: "Stocks", count: stockCount },
            { key: "etf" as const, label: "ETFs", count: etfCount },
            { key: "fund" as const, label: "Funds", count: fundCount },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setTypeFilter(tab.key); setSectorFilter("all"); }}
              className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors ${
                typeFilter === tab.key
                  ? "bg-green text-white"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 font-mono">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Live price indicator */}
        {priceAge && (
          <div className="flex items-center gap-2 mb-4 text-xs text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            Live prices updated {priceAge}
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-surface border border-border rounded-lg p-3 text-center">
            <p className="text-lg font-mono font-bold">{typeFiltered.length}</p>
            <p className="text-xs text-text-muted">{typeFilter === "etf" ? "ETFs" : typeFilter === "fund" ? "Funds" : typeFilter === "stock" ? "Stocks" : "Instruments"}</p>
          </div>
          <div className="bg-surface border border-border rounded-lg p-3 text-center">
            <p className={`text-lg font-mono font-bold ${avgScore >= 70 ? "text-green" : "text-gold"}`}>
              {avgScore}
            </p>
            <p className="text-xs text-text-muted">Avg AI Score</p>
          </div>
          <div className="bg-surface border border-border rounded-lg p-3 text-center">
            <p className="text-lg font-mono font-bold text-green">{strongBuys}</p>
            <p className="text-xs text-text-muted">Strong Buys</p>
          </div>
          <div className="bg-surface border border-border rounded-lg p-3 text-center">
            <p className="text-lg font-mono font-bold">{sectorNames.length}</p>
            <p className="text-xs text-text-muted">{typeFilter === "all" ? "Sectors" : "Categories"}</p>
          </div>
        </div>

        {/* Top 10 stocks for your archetype */}
        {archetype && dimensions && (() => {
          const accentColor = ARCHETYPE_COLORS[archetype] ?? "#006DD8";
          const archetypeName = ARCHETYPE_INFO[archetype]?.name ?? archetype;
          const top10 = topStocksForProfile(dimensions, 10);
          const copy = getPersonalityCopy(archetype);
          return (
            <div
              className="rounded-xl p-5 mb-6 border"
              style={{ borderColor: `${accentColor}30`, backgroundColor: `${accentColor}08` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                <h2 className="text-sm font-semibold" style={{ color: accentColor }}>
                  Top 10 for {archetypeName}
                </h2>
              </div>
              {copy && (
                <p className="text-xs text-text-secondary mb-4">{copy.researchIntro}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {top10.map((match, idx) => {
                  const fitColor = match.score >= 75 ? "#006DD8" : match.score >= 50 ? "#FFD740" : "#FF5252";
                  return (
                    <Link
                      key={match.stock.ticker}
                      href={`/research/${match.stock.ticker.toLowerCase()}`}
                      className="flex items-center gap-3 bg-surface border border-border rounded-lg p-3 hover:border-opacity-60 transition-colors group"
                    >
                      <span className="text-[10px] text-text-muted font-mono w-4 text-right shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono">{match.stock.ticker}</span>
                          <span className="text-[11px] text-text-muted truncate">{match.stock.name}</span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-0.5">{match.reason}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold font-mono" style={{ color: fitColor }}>
                          {match.score}
                        </span>
                        <p className="text-[9px] text-text-muted">FIT</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Sector filter */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setSectorFilter("all")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              sectorFilter === "all"
                ? "bg-green-bg text-green font-medium"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            All ({typeFiltered.length})
          </button>
          {sectorNames.map((name) => {
            const count = typeFiltered.filter((s) => s.sector === name).length;
            const sector = sectors.find((s) => s.name === name);
            return (
              <button
                key={name}
                onClick={() => setSectorFilter(name)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  sectorFilter === name
                    ? "font-medium"
                    : "text-text-muted hover:text-text-secondary"
                }`}
                style={
                  sectorFilter === name && sector
                    ? { backgroundColor: `${sector.color}15`, color: sector.color }
                    : undefined
                }
              >
                {name} ({count})
              </button>
            );
          })}
        </div>

        {/* Screener + Lens */}
        <div className="flex items-start gap-3 flex-wrap mb-1">
          <ScreenerPanel
            filters={screenerFilters}
            onChange={handleScreenerChange}
          />
          <LensSelector
            selected={selectedLenses}
            onSelect={handleLensChange}
          />
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticker, name, or sector..."
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/40 transition-colors"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "aiScore" | "lensScore" | "changePercent" | "peRatio")
            }
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-green/40"
          >
            <option value="aiScore">Sort: AI Score</option>
            {selectedLenses.length > 0 && (
              <option value="lensScore">Sort: Lens Score</option>
            )}
            <option value="changePercent">Sort: Most Active</option>
            <option value="peRatio">Sort: P/E Ratio</option>
          </select>
        </div>

        {/* Results count */}
        {filtered.length > 0 && filtered.length < stocks.length && (
          <div className="text-xs text-text-muted mb-3">
            Showing {filtered.length} of {stocks.length} stocks
          </div>
        )}

        {/* Stock list */}
        <div className="space-y-3">
          {filtered.map((stock) => {
            const copy = archetype ? getPersonalityCopy(archetype) : null;
            const accentColor = archetype ? (ARCHETYPE_COLORS[archetype] ?? "#006DD8") : undefined;
            const isMatch = matchedTickers.has(stock.ticker);
            return (
              <StockDetail
                key={stock.ticker}
                stock={stock}
                isExpanded={expanded === stock.ticker}
                onToggle={() =>
                  setExpanded((prev) =>
                    prev === stock.ticker ? null : stock.ticker
                  )
                }
                fitLabel={isMatch && copy ? copy.stockFitLabel : undefined}
                fitColor={isMatch ? accentColor : undefined}
                lensResult={lensScores.get(stock.ticker)}
              />
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            No stocks match your filters. Try adjusting your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
