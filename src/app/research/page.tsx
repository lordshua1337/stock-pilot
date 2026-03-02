"use client";

import { useState } from "react";
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
} from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";

function StockDetail({
  stock,
  isExpanded,
  onToggle,
}: {
  stock: Stock;
  isExpanded: boolean;
  onToggle: () => void;
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
          <div className="text-right mr-2">
            <p className="text-xs text-text-muted">AI Score</p>
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
              <p className="text-xs text-text-muted">Market Cap</p>
              <p className="text-sm font-mono font-medium">{stock.marketCap}</p>
            </div>
            <div className="bg-surface-alt rounded-lg p-3">
              <p className="text-xs text-text-muted">P/E Ratio</p>
              <p className="text-sm font-mono font-medium">{stock.peRatio}</p>
            </div>
            <div className="bg-surface-alt rounded-lg p-3">
              <p className="text-xs text-text-muted">Dividend Yield</p>
              <p className="text-sm font-mono font-medium">
                {stock.dividendYield}%
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
  const [sortBy, setSortBy] = useState<"aiScore" | "changePercent" | "peRatio">(
    "aiScore"
  );

  const filtered = stocks
    .filter(
      (s) =>
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sector.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "aiScore") return b.aiScore - a.aiScore;
      if (sortBy === "changePercent")
        return Math.abs(b.changePercent) - Math.abs(a.changePercent);
      return a.peRatio - b.peRatio;
    });

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
          <p className="text-xs text-green uppercase tracking-widest font-medium mb-2">
            Research
          </p>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">
            Stock Analysis
          </h1>
          <p className="text-text-secondary text-sm">
            AI-generated research for each stock. Thesis, catalysts, risks,
            and a score from 1-100.
          </p>
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
              setSortBy(e.target.value as "aiScore" | "changePercent" | "peRatio")
            }
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-green/40"
          >
            <option value="aiScore">Sort: AI Score</option>
            <option value="changePercent">Sort: Most Active</option>
            <option value="peRatio">Sort: P/E Ratio</option>
          </select>
        </div>

        {/* Stock list */}
        <div className="space-y-3">
          {filtered.map((stock) => (
            <StockDetail
              key={stock.ticker}
              stock={stock}
              isExpanded={expanded === stock.ticker}
              onToggle={() =>
                setExpanded((prev) =>
                  prev === stock.ticker ? null : stock.ticker
                )
              }
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            No stocks match your search.
          </div>
        )}
      </div>
    </div>
  );
}
