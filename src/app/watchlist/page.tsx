"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  X,
  Eye,
  TrendingUp,
  TrendingDown,
  Search,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";

type SortKey = "ticker" | "price" | "change" | "aiScore";
type SortDir = "asc" | "desc";

function WatchlistRow({
  stock,
  onRemove,
}: {
  stock: Stock;
  onRemove: (ticker: string) => void;
}) {
  const isUp = stock.changePercent >= 0;
  const scoreColor =
    stock.aiScore >= 80
      ? "text-green"
      : stock.aiScore >= 60
        ? "text-gold"
        : "text-red";
  const nearHigh = stock.price >= stock.fiftyTwoHigh * 0.95;
  const nearLow = stock.price <= stock.fiftyTwoLow * 1.05;

  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-border last:border-b-0 group">
      <Link
        href={`/research/${stock.ticker.toLowerCase()}`}
        className="flex-1 flex items-center gap-4 hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 rounded-lg bg-surface-alt flex items-center justify-center text-xs font-mono font-bold flex-shrink-0">
          {stock.ticker.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm">{stock.ticker}</span>
            <span className="text-xs text-text-muted truncate">
              {stock.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span>{stock.sector}</span>
            <span
              className={`font-mono px-1.5 py-0.5 rounded ${
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

        {/* Price & change */}
        <div className="text-right w-24 flex-shrink-0">
          <p className="text-sm font-mono font-medium">
            ${stock.price.toFixed(2)}
          </p>
          <p
            className={`text-xs font-mono flex items-center justify-end gap-0.5 ${
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
          </p>
        </div>

        {/* AI Score */}
        <div className="w-14 text-center flex-shrink-0">
          <p className={`text-lg font-mono font-bold ${scoreColor}`}>
            {stock.aiScore}
          </p>
          <p className="text-[10px] text-text-muted">AI</p>
        </div>

        {/* Alerts */}
        <div className="w-8 flex-shrink-0">
          {nearHigh && (
            <span title="Near 52-week high" className="text-green">
              <TrendingUp className="w-4 h-4" />
            </span>
          )}
          {nearLow && (
            <span title="Near 52-week low" className="text-gold">
              <AlertTriangle className="w-4 h-4" />
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={() => onRemove(stock.ticker)}
        className="text-text-muted hover:text-red transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
        title="Remove from watchlist"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function WatchlistPage() {
  const [watchlistTickers, setWatchlistTickers] = useState<string[]>([
    "AAPL",
    "NVDA",
    "GOOGL",
    "AMZN",
    "MSFT",
  ]);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("aiScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const watchlistStocks = useMemo(
    () =>
      watchlistTickers
        .map((t) => stocks.find((s) => s.ticker === t))
        .filter((s): s is Stock => s !== undefined),
    [watchlistTickers]
  );

  const sortedStocks = useMemo(() => {
    const sorted = [...watchlistStocks].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;
      switch (sortKey) {
        case "ticker":
          aVal = a.ticker;
          bVal = b.ticker;
          return sortDir === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        case "price":
          aVal = a.price;
          bVal = b.price;
          break;
        case "change":
          aVal = a.changePercent;
          bVal = b.changePercent;
          break;
        case "aiScore":
          aVal = a.aiScore;
          bVal = b.aiScore;
          break;
        default:
          return 0;
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [watchlistStocks, sortKey, sortDir]);

  const availableStocks = stocks
    .filter((s) => !watchlistTickers.includes(s.ticker))
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
    setWatchlistTickers([...watchlistTickers, ticker]);
    setSearchQuery("");
  };

  const removeStock = (ticker: string) => {
    setWatchlistTickers(watchlistTickers.filter((t) => t !== ticker));
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  // Summary stats
  const avgScore = watchlistStocks.length > 0
    ? Math.round(watchlistStocks.reduce((sum, s) => sum + s.aiScore, 0) / watchlistStocks.length)
    : 0;
  const avgChange = watchlistStocks.length > 0
    ? watchlistStocks.reduce((sum, s) => sum + s.changePercent, 0) / watchlistStocks.length
    : 0;
  const strongBuys = watchlistStocks.filter((s) => s.analystRating === "Strong Buy").length;

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
            <Eye className="w-4 h-4" />
            <p className="text-xs uppercase tracking-widest font-medium">
              Watchlist
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">
            Your Watchlist
          </h1>
          <p className="text-text-secondary text-sm">
            Track stocks you&apos;re interested in. Sort by AI score, price action, or
            alphabetically. Add up to {stocks.length} stocks.
          </p>
        </div>

        {/* Summary stats */}
        {watchlistStocks.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-surface border border-border rounded-lg p-3 text-center">
              <p className="text-lg font-mono font-bold">{watchlistStocks.length}</p>
              <p className="text-xs text-text-muted">Watching</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-3 text-center">
              <p className={`text-lg font-mono font-bold ${avgScore >= 75 ? "text-green" : avgScore >= 60 ? "text-gold" : "text-red"}`}>
                {avgScore}
              </p>
              <p className="text-xs text-text-muted">Avg AI Score</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-3 text-center">
              <p className={`text-lg font-mono font-bold ${avgChange >= 0 ? "text-green" : "text-red"}`}>
                {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
              </p>
              <p className="text-xs text-text-muted">Avg Day Change</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-3 text-center">
              <p className="text-lg font-mono font-bold text-green">{strongBuys}</p>
              <p className="text-xs text-text-muted">Strong Buys</p>
            </div>
          </div>
        )}

        {/* Add & Sort controls */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-1.5 text-sm text-green hover:text-green-light border border-green/20 hover:border-green/40 rounded-lg px-3 py-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </button>

          {watchlistStocks.length > 1 && (
            <div className="flex items-center gap-1">
              {(["aiScore", "change", "price", "ticker"] as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => toggleSort(key)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                    sortKey === key
                      ? "bg-green-bg text-green"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {key === "aiScore"
                    ? "AI Score"
                    : key === "change"
                      ? "Change"
                      : key === "price"
                        ? "Price"
                        : "Name"}
                  {sortKey === key && (sortDir === "desc" ? " ^" : " v")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stock picker */}
        {showPicker && (
          <div className="bg-surface border border-border rounded-xl mb-6 overflow-hidden animate-fade-in">
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
                  {watchlistTickers.length === stocks.length
                    ? "All stocks are in your watchlist."
                    : "No matching stocks found."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Watchlist table */}
        {sortedStocks.length > 0 ? (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            {sortedStocks.map((stock) => (
              <WatchlistRow
                key={stock.ticker}
                stock={stock}
                onRemove={removeStock}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Eye className="w-10 h-10 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Start Your Watchlist
            </h2>
            <p className="text-text-muted text-sm mb-6">
              Add stocks to track their AI scores, price movements, and analyst ratings.
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

        {/* Quick actions */}
        {watchlistStocks.length >= 2 && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/compare"
              className="text-sm text-green hover:text-green-light transition-colors inline-flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" />
              Compare these stocks
            </Link>
            <Link
              href="/portfolio"
              className="text-sm text-text-muted hover:text-text-secondary transition-colors inline-flex items-center gap-1"
            >
              Build portfolio from watchlist
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
