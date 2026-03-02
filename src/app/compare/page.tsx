"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Zap,
  BarChart3,
  Search,
} from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";

const MAX_COMPARE = 4;

function MetricRow({
  label,
  values,
  format,
  highlight,
}: {
  label: string;
  values: (string | number)[];
  format?: "percent" | "score" | "currency" | "rating";
  highlight?: "highest" | "lowest";
}) {
  const numericValues = values.map((v) =>
    typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.-]/g, ""))
  );
  const best =
    highlight === "highest"
      ? Math.max(...numericValues.filter((n) => !isNaN(n)))
      : highlight === "lowest"
        ? Math.min(...numericValues.filter((n) => !isNaN(n)))
        : null;

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `140px repeat(${values.length}, 1fr)` }}>
      <div className="text-xs text-text-muted py-3 flex items-center">
        {label}
      </div>
      {values.map((val, i) => {
        const isBest =
          best !== null && !isNaN(numericValues[i]) && numericValues[i] === best;
        let colorClass = "";
        if (format === "score") {
          const n = numericValues[i];
          colorClass = n >= 80 ? "text-green" : n >= 60 ? "text-gold" : "text-red";
        } else if (format === "percent") {
          colorClass = numericValues[i] >= 0 ? "text-green" : "text-red";
        } else if (format === "rating") {
          const s = String(val);
          colorClass =
            s.includes("Strong Buy") || s.includes("Buy")
              ? "text-green"
              : s.includes("Hold")
                ? "text-gold"
                : "text-red";
        }

        return (
          <div
            key={i}
            className={`py-3 text-sm font-mono font-medium text-center ${colorClass} ${
              isBest ? "bg-green-bg rounded-lg" : ""
            }`}
          >
            {format === "percent" && typeof val === "number"
              ? `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`
              : format === "currency" && typeof val === "number"
                ? `$${val.toFixed(2)}`
                : String(val)}
          </div>
        );
      })}
    </div>
  );
}

export default function ComparePage() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const selectedStocks = useMemo(
    () =>
      selectedTickers
        .map((t) => stocks.find((s) => s.ticker === t))
        .filter((s): s is Stock => s !== undefined),
    [selectedTickers]
  );

  const availableStocks = stocks
    .filter((s) => !selectedTickers.includes(s.ticker))
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q)
      );
    });

  const addStock = (ticker: string) => {
    if (selectedTickers.length >= MAX_COMPARE) return;
    setSelectedTickers([...selectedTickers, ticker]);
    setSearchQuery("");
    if (selectedTickers.length + 1 >= MAX_COMPARE) {
      setShowPicker(false);
    }
  };

  const removeStock = (ticker: string) => {
    setSelectedTickers(selectedTickers.filter((t) => t !== ticker));
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 text-green mb-2">
            <BarChart3 className="w-4 h-4" />
            <p className="text-xs uppercase tracking-widest font-medium">
              Compare
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">
            Compare Stocks
          </h1>
          <p className="text-text-secondary text-sm">
            Select up to {MAX_COMPARE} stocks to compare side by side. AI scores,
            fundamentals, and risk analysis at a glance.
          </p>
        </div>

        {/* Stock selector */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {selectedStocks.map((stock) => (
            <div
              key={stock.ticker}
              className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2"
            >
              <Link
                href={`/research/${stock.ticker.toLowerCase()}`}
                className="font-mono font-bold text-sm text-green hover:text-green-light transition-colors"
              >
                {stock.ticker}
              </Link>
              <span className="text-xs text-text-muted truncate max-w-[100px]">
                {stock.name}
              </span>
              <button
                onClick={() => removeStock(stock.ticker)}
                className="text-text-muted hover:text-red transition-colors ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {selectedTickers.length < MAX_COMPARE && (
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="flex items-center gap-1.5 text-sm text-green hover:text-green-light border border-green/20 hover:border-green/40 rounded-lg px-3 py-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </button>
          )}
        </div>

        {/* Stock picker dropdown */}
        {showPicker && (
          <div className="bg-surface border border-border rounded-xl mb-8 overflow-hidden animate-fade-in">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ticker, name, or sector..."
                  className="w-full bg-surface-alt border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/40 transition-colors"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-border">
              {availableStocks.slice(0, 10).map((stock) => (
                <button
                  key={stock.ticker}
                  onClick={() => addStock(stock.ticker)}
                  className="w-full p-3 flex items-center justify-between card-hover text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm">
                      {stock.ticker}
                    </span>
                    <span className="text-xs text-text-muted truncate">
                      {stock.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>{stock.sector}</span>
                    <span
                      className={
                        stock.aiScore >= 80
                          ? "text-green"
                          : stock.aiScore >= 60
                            ? "text-gold"
                            : "text-red"
                      }
                    >
                      AI: {stock.aiScore}
                    </span>
                  </div>
                </button>
              ))}
              {availableStocks.length === 0 && (
                <div className="p-4 text-center text-text-muted text-sm">
                  No matching stocks found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparison table */}
        {selectedStocks.length >= 2 ? (
          <div className="space-y-6">
            {/* Headers */}
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `140px repeat(${selectedStocks.length}, 1fr)`,
              }}
            >
              <div />
              {selectedStocks.map((stock) => {
                const isUp = stock.changePercent >= 0;
                return (
                  <div
                    key={stock.ticker}
                    className="bg-surface border border-border rounded-xl p-4 text-center"
                  >
                    <Link
                      href={`/research/${stock.ticker.toLowerCase()}`}
                      className="text-lg font-mono font-bold text-green hover:text-green-light transition-colors"
                    >
                      {stock.ticker}
                    </Link>
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      {stock.name}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className="text-sm font-mono font-medium">
                        ${stock.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs font-mono flex items-center gap-0.5 ${
                          isUp ? "text-green" : "text-red"
                        }`}
                      >
                        {isUp ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {isUp ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI & Rating */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-green" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  AI Analysis
                </h3>
              </div>
              <div className="space-y-1 divide-y divide-border">
                <MetricRow
                  label="AI Score"
                  values={selectedStocks.map((s) => s.aiScore)}
                  format="score"
                  highlight="highest"
                />
                <MetricRow
                  label="Analyst Rating"
                  values={selectedStocks.map((s) => s.analystRating)}
                  format="rating"
                />
              </div>
            </div>

            {/* Fundamentals */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Fundamentals
              </h3>
              <div className="space-y-1 divide-y divide-border">
                <MetricRow
                  label="Market Cap"
                  values={selectedStocks.map((s) => s.marketCap)}
                />
                <MetricRow
                  label="P/E Ratio"
                  values={selectedStocks.map((s) => s.peRatio.toFixed(1))}
                  highlight="lowest"
                />
                <MetricRow
                  label="Dividend Yield"
                  values={selectedStocks.map((s) => `${s.dividendYield.toFixed(2)}%`)}
                  highlight="highest"
                />
                <MetricRow
                  label="52-Week High"
                  values={selectedStocks.map((s) => s.fiftyTwoHigh)}
                  format="currency"
                />
                <MetricRow
                  label="52-Week Low"
                  values={selectedStocks.map((s) => s.fiftyTwoLow)}
                  format="currency"
                />
                <MetricRow
                  label="Day Change"
                  values={selectedStocks.map((s) => s.changePercent)}
                  format="percent"
                  highlight="highest"
                />
              </div>
            </div>

            {/* Thesis comparison */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-green" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Investment Thesis
                </h3>
              </div>
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${selectedStocks.length}, 1fr)`,
                }}
              >
                {selectedStocks.map((stock) => (
                  <div key={stock.ticker}>
                    <p className="text-xs font-mono font-bold text-green mb-2">
                      {stock.ticker}
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {stock.thesis}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Catalysts & Risks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-green" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">
                    Catalysts
                  </h3>
                </div>
                <div className="space-y-4">
                  {selectedStocks.map((stock) => (
                    <div key={stock.ticker}>
                      <p className="text-xs font-mono font-bold text-green mb-1.5">
                        {stock.ticker}
                      </p>
                      <ul className="space-y-1">
                        {stock.catalysts.map((c, i) => (
                          <li
                            key={i}
                            className="text-xs text-text-secondary flex items-start gap-1.5"
                          >
                            <span className="text-green mt-0.5">+</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-4 h-4 text-red" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">
                    Risks
                  </h3>
                </div>
                <div className="space-y-4">
                  {selectedStocks.map((stock) => (
                    <div key={stock.ticker}>
                      <p className="text-xs font-mono font-bold text-green mb-1.5">
                        {stock.ticker}
                      </p>
                      <ul className="space-y-1">
                        {stock.risks.map((r, i) => (
                          <li
                            key={i}
                            className="text-xs text-text-secondary flex items-start gap-1.5"
                          >
                            <span className="text-red mt-0.5">-</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : selectedStocks.length === 1 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="text-sm mb-2">Select at least one more stock to compare.</p>
            <button
              onClick={() => setShowPicker(true)}
              className="text-green text-sm hover:text-green-light transition-colors"
            >
              Add another stock
            </button>
          </div>
        ) : (
          <div className="text-center py-16">
            <BarChart3 className="w-10 h-10 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Select Stocks to Compare
            </h2>
            <p className="text-text-muted text-sm mb-6">
              Choose 2-{MAX_COMPARE} stocks from our research universe to see a
              detailed side-by-side breakdown.
            </p>
            <button
              onClick={() => setShowPicker(true)}
              className="bg-green text-black px-5 py-2.5 rounded-lg font-medium hover:bg-green-light transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Stock
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
