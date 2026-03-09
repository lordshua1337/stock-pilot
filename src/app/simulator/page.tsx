"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Search,
  X,
  ShoppingCart,
  Minus,
  Plus,
  BarChart3,
  Wallet,
  Activity,
  MessageSquare,
} from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";
import {
  type SimPortfolio,
  type SimPosition,
  createSimPortfolio,
  buyStock,
  sellStock,
  getPortfolioValue,
  getPositionValue,
  getTotalReturn,
  saveSimPortfolio,
  loadSimPortfolio,
  resetSimPortfolio,
  STARTING_CASH,
} from "@/lib/simulator-data";
import { loadDNAProfile, type StoredDNAProfile } from "@/lib/dna-storage";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import { AIInsightCard } from "@/components/copilot/ai-insight-card";
import { PreTradeModal } from "@/components/copilot/pre-trade-modal";
import type { TradeCheckRequest } from "@/lib/ai/trade-advisor";

// ---------------------------------------------------------------------------
// Price map (static from stock data)
// ---------------------------------------------------------------------------

function buildPriceMap(): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of stocks) {
    map.set(s.ticker, s.price);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Coaching text
// ---------------------------------------------------------------------------

function getSimCoaching(profile: StoredDNAProfile | null): string {
  if (!profile) {
    return "Practice trading with $100k in virtual money. No risk, all learning.";
  }

  const arch = profile.communicationArchetype;
  const info = ARCHETYPE_INFO[arch];
  const name = info?.name ?? arch;

  const map: Partial<Record<typeof arch, string>> = {
    action_first_decider: `As a ${name}, your instinct is to trade fast. Use this simulator to see what happens when you slow down and wait for your thesis to play out.`,
    systems_builder: `As a ${name}, build your trading rules here where mistakes are free. Test your system before deploying real capital.`,
    analytical_skeptic: `As a ${name}, you'll want to research before every trade -- good. Use this sandbox to test whether your analysis actually converts to returns.`,
    trend_sensitive_explorer: `As a ${name}, you spot momentum early. Practice here to learn the difference between a trend and a trap.`,
    avoider_under_stress: `As a ${name}, this is a safe space to practice making decisions. No real money at risk, no consequences for mistakes.`,
    big_picture_optimist: `As a ${name}, use this simulator to test your buy-and-hold conviction. Can you ride out the volatility?`,
    reassurance_seeker: `As a ${name}, lean on the AI scores here. Practice building confidence in your own decisions.`,
    diy_controller: `As a ${name}, this is your personal trading lab. Test strategies on your terms with zero external pressure.`,
    collaborative_partner: `As a ${name}, try different approaches here and bring what you learn to discussions with your advisor.`,
    values_anchored_steward: `As a ${name}, practice aligning your portfolio with your values. Does your mock portfolio reflect what matters to you?`,
  };

  return map[arch] ?? `Practice trading with $100k in virtual money.`;
}

// ---------------------------------------------------------------------------
// Trade Modal
// ---------------------------------------------------------------------------

function TradeModal({
  stock,
  action,
  maxShares,
  onTrade,
  onClose,
}: {
  readonly stock: Stock;
  readonly action: "buy" | "sell";
  readonly maxShares: number;
  readonly onTrade: (shares: number) => void;
  readonly onClose: () => void;
}) {
  const [shares, setShares] = useState(1);

  const total = shares * stock.price;
  const isValid = shares > 0 && shares <= maxShares;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-surface border border-border rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold">
            {action === "buy" ? "Buy" : "Sell"} {stock.ticker}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="text-center mb-4">
            <p className="text-xs text-text-muted">{stock.name}</p>
            <p className="text-2xl font-bold font-mono">
              ${stock.price.toFixed(2)}
            </p>
          </div>

          {/* Shares input */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setShares((s) => Math.max(1, s - 1))}
              className="w-10 h-10 rounded-xl bg-surface-alt flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="text-center">
              <input
                type="number"
                value={shares}
                onChange={(e) =>
                  setShares(Math.max(1, Math.min(maxShares, parseInt(e.target.value) || 1)))
                }
                className="w-20 text-center text-2xl font-bold font-mono bg-transparent outline-none"
                min={1}
                max={maxShares}
              />
              <p className="text-[10px] text-text-muted">shares</p>
            </div>
            <button
              onClick={() => setShares((s) => Math.min(maxShares, s + 1))}
              className="w-10 h-10 rounded-xl bg-surface-alt flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2 justify-center mb-4">
            {[5, 10, 25].map((n) => (
              <button
                key={n}
                onClick={() => setShares(Math.min(n, maxShares))}
                className="px-3 py-1 text-[10px] font-medium rounded-lg bg-surface-alt text-text-muted hover:text-text-secondary transition-colors"
              >
                {n} shares
              </button>
            ))}
            <button
              onClick={() => setShares(maxShares)}
              className="px-3 py-1 text-[10px] font-medium rounded-lg bg-surface-alt text-text-muted hover:text-text-secondary transition-colors"
            >
              Max
            </button>
          </div>

          {/* Total */}
          <div className="bg-background rounded-xl p-3 mb-4 text-center">
            <p className="text-xs text-text-muted">Total</p>
            <p className="text-lg font-bold font-mono">
              ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Max info */}
          <p className="text-[10px] text-text-muted text-center mb-4">
            Max: {maxShares} shares
          </p>

          {/* Action button */}
          <button
            onClick={() => isValid && onTrade(shares)}
            disabled={!isValid}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 ${
              action === "buy"
                ? "bg-green text-white hover:brightness-110"
                : "bg-red text-white hover:brightness-110"
            }`}
          >
            {action === "buy" ? "Buy" : "Sell"} {shares} Share
            {shares !== 1 ? "s" : ""}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stock Search + Buy Panel
// ---------------------------------------------------------------------------

function BuyPanel({
  portfolio,
  onBuy,
  priceMap,
}: {
  readonly portfolio: SimPortfolio;
  readonly onBuy: (ticker: string, shares: number) => void;
  readonly priceMap: ReadonlyMap<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [tradeStock, setTradeStock] = useState<Stock | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return stocks.slice(0, 12);
    return stocks
      .filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [query]);

  return (
    <>
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
          <ShoppingCart className="w-3.5 h-3.5 text-green" />
          Buy Stocks
        </h3>

        <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-border mb-3">
          <Search className="w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker or name..."
            className="flex-1 bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>

        <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
          {filtered.map((stock) => {
            const maxShares = Math.floor(portfolio.cash / stock.price);
            return (
              <button
                key={stock.ticker}
                onClick={() => maxShares > 0 && setTradeStock(stock)}
                disabled={maxShares === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-alt transition-colors text-left disabled:opacity-30"
              >
                <span className="text-xs font-mono font-bold w-12">
                  {stock.ticker}
                </span>
                <span className="text-[10px] text-text-muted flex-1 truncate">
                  {stock.name}
                </span>
                <span className="text-xs font-mono">
                  ${stock.price.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {tradeStock && (
        <TradeModal
          stock={tradeStock}
          action="buy"
          maxShares={Math.floor(portfolio.cash / tradeStock.price)}
          onTrade={(shares) => {
            onBuy(tradeStock.ticker, shares);
            setTradeStock(null);
          }}
          onClose={() => setTradeStock(null)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Position Row
// ---------------------------------------------------------------------------

function PositionRow({
  position,
  stock,
  onSell,
}: {
  readonly position: SimPosition;
  readonly stock: Stock | undefined;
  readonly onSell: () => void;
}) {
  if (!stock) return null;

  const { value, gain, gainPct } = getPositionValue(position, stock.price);
  const isUp = gain >= 0;

  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-border last:border-b-0 group">
      <Link
        href={`/research/${stock.ticker.toLowerCase()}`}
        className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-[10px] font-mono font-bold">
          {stock.ticker.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-bold">{stock.ticker}</span>
            <span className="text-[10px] text-text-muted">
              {position.shares} shares
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-muted">
            <span>Avg ${position.avgCost.toFixed(2)}</span>
            <span>Now ${stock.price.toFixed(2)}</span>
          </div>
        </div>
      </Link>

      <div className="text-right">
        <p className="text-xs font-mono font-bold">
          ${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        <p
          className={`text-[10px] font-mono flex items-center gap-0.5 justify-end ${
            isUp ? "text-green" : "text-red"
          }`}
        >
          {isUp ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {isUp ? "+" : ""}
          {gainPct.toFixed(1)}%
        </p>
      </div>

      <button
        onClick={onSell}
        className="px-2.5 py-1.5 text-[10px] font-medium rounded-lg text-red bg-red-bg opacity-0 group-hover:opacity-100 hover:bg-red/20 transition-all"
      >
        Sell
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trade History
// ---------------------------------------------------------------------------

function TradeHistory({
  trades,
}: {
  readonly trades: SimPortfolio["trades"];
}) {
  if (trades.length === 0) return null;

  const recent = trades.slice(-10).reverse();

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-text-muted" />
        Recent Trades
      </h3>
      <div className="flex flex-col gap-1">
        {recent.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center gap-2 py-1.5 text-[10px]"
          >
            <span
              className={`px-1.5 py-0.5 rounded font-medium ${
                trade.action === "buy"
                  ? "bg-green-bg text-green"
                  : "bg-red-bg text-red"
              }`}
            >
              {trade.action.toUpperCase()}
            </span>
            <span className="font-mono font-bold">{trade.ticker}</span>
            <span className="text-text-muted">
              {trade.shares} @ ${trade.price.toFixed(2)}
            </span>
            <span className="ml-auto font-mono text-text-muted">
              ${trade.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function SimulatorPage() {
  const [portfolio, setPortfolio] = useState<SimPortfolio | null>(null);
  const [profile, setProfile] = useState<StoredDNAProfile | null>(null);
  const [sellTarget, setSellTarget] = useState<Stock | null>(null);
  const [pendingTrade, setPendingTrade] = useState<TradeCheckRequest | null>(null);
  const [pendingTradeCallback, setPendingTradeCallback] = useState<(() => void) | null>(null);
  const [loaded, setLoaded] = useState(false);

  const priceMap = useMemo(() => buildPriceMap(), []);
  const stockMap = useMemo(() => {
    const map = new Map<string, Stock>();
    for (const s of stocks) map.set(s.ticker, s);
    return map;
  }, []);

  useEffect(() => {
    const saved = loadSimPortfolio();
    setPortfolio(saved ?? createSimPortfolio());
    setProfile(loadDNAProfile());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded && portfolio) {
      saveSimPortfolio(portfolio);
    }
  }, [portfolio, loaded]);

  const executeBuy = useCallback((ticker: string, shares: number) => {
    setPortfolio((prev) => {
      if (!prev) return prev;
      const stock = stocks.find((s) => s.ticker === ticker);
      if (!stock) return prev;
      return buyStock(prev, ticker, shares, stock.price);
    });
  }, []);

  const executeSell = useCallback((ticker: string, shares: number) => {
    setPortfolio((prev) => {
      if (!prev) return prev;
      const stock = stocks.find((s) => s.ticker === ticker);
      if (!stock) return prev;
      return sellStock(prev, ticker, shares, stock.price);
    });
    setSellTarget(null);
  }, []);

  // Wrap buy/sell with pre-trade check
  const handleBuy = useCallback((ticker: string, shares: number) => {
    const stock = stocks.find((s) => s.ticker === ticker);
    if (!stock || !portfolio) return;

    const tradeReq: TradeCheckRequest = {
      ticker,
      action: "buy",
      shares,
      price: stock.price,
      currentCash: portfolio.cash,
      currentPositions: portfolio.positions.map((p) => ({
        ticker: p.ticker,
        shares: p.shares,
        avgCost: p.avgCost,
      })),
    };

    setPendingTrade(tradeReq);
    setPendingTradeCallback(() => () => executeBuy(ticker, shares));
  }, [portfolio, executeBuy]);

  const handleSell = useCallback((ticker: string, shares: number) => {
    const stock = stocks.find((s) => s.ticker === ticker);
    if (!stock || !portfolio) return;

    const tradeReq: TradeCheckRequest = {
      ticker,
      action: "sell",
      shares,
      price: stock.price,
      currentCash: portfolio.cash,
      currentPositions: portfolio.positions.map((p) => ({
        ticker: p.ticker,
        shares: p.shares,
        avgCost: p.avgCost,
      })),
    };

    setPendingTrade(tradeReq);
    setPendingTradeCallback(() => () => executeSell(ticker, shares));
  }, [portfolio, executeSell]);

  const handleTradeConfirm = useCallback(() => {
    pendingTradeCallback?.();
    setPendingTrade(null);
    setPendingTradeCallback(null);
  }, [pendingTradeCallback]);

  const handleTradeCancel = useCallback(() => {
    setPendingTrade(null);
    setPendingTradeCallback(null);
  }, []);

  const handleReset = useCallback(() => {
    resetSimPortfolio();
    setPortfolio(createSimPortfolio());
  }, []);

  const coaching = useMemo(() => getSimCoaching(profile), [profile]);

  if (!loaded || !portfolio) {
    return (
      <div className="min-h-screen pt-20 px-4 max-w-6xl mx-auto">
        <div className="animate-shimmer h-8 w-48 rounded-lg mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-shimmer h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const totalValue = getPortfolioValue(portfolio, priceMap);
  const totalReturn = getTotalReturn(portfolio, priceMap);
  const isUp = totalReturn.absolute >= 0;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Market Simulator</h1>
              <p className="text-xs text-text-muted">
                Paper trade with $100k virtual cash -- no risk, all learning
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-medium text-text-muted border border-border hover:text-red hover:border-red/30 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* Coaching bar */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-bg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-blue" />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {coaching}
          </p>
        </div>

        <AIInsightCard pageId="simulator" className="mb-4" />

        {/* Portfolio summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-text-muted" />
              <p className="text-xs text-text-muted">Portfolio Value</p>
            </div>
            <p className="text-lg font-bold font-mono">
              $
              {totalValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              {isUp ? (
                <TrendingUp className="w-4 h-4 text-green" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red" />
              )}
              <p className="text-xs text-text-muted">Total Return</p>
            </div>
            <p
              className={`text-lg font-bold font-mono ${
                isUp ? "text-green" : "text-red"
              }`}
            >
              {isUp ? "+" : ""}
              {totalReturn.percent.toFixed(2)}%
            </p>
            <p className="text-[10px] text-text-muted font-mono">
              {isUp ? "+" : ""}$
              {totalReturn.absolute.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-text-muted" />
              <p className="text-xs text-text-muted">Cash Available</p>
            </div>
            <p className="text-lg font-bold font-mono">
              $
              {portfolio.cash.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-text-muted" />
              <p className="text-xs text-text-muted">Positions</p>
            </div>
            <p className="text-lg font-bold font-mono">
              {portfolio.positions.length}
            </p>
            <p className="text-[10px] text-text-muted">
              {portfolio.trades.length} trades made
            </p>
          </div>
        </div>

        {/* Main content: two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Positions + Trade History */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Holdings */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-xs font-semibold">Holdings</h3>
              </div>

              {portfolio.positions.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-xs text-text-muted">
                    No positions yet. Search and buy stocks to get started.
                  </p>
                </div>
              ) : (
                <div>
                  {portfolio.positions.map((pos) => {
                    const stock = stockMap.get(pos.ticker);
                    return (
                      <PositionRow
                        key={pos.ticker}
                        position={pos}
                        stock={stock}
                        onSell={() => stock && setSellTarget(stock)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trade history */}
            <TradeHistory trades={portfolio.trades} />
          </div>

          {/* Right: Buy Panel */}
          <div>
            <BuyPanel
              portfolio={portfolio}
              onBuy={handleBuy}
              priceMap={priceMap}
            />
          </div>
        </div>
      </div>

      {/* Sell modal */}
      {sellTarget && (
        <TradeModal
          stock={sellTarget}
          action="sell"
          maxShares={
            portfolio.positions.find((p) => p.ticker === sellTarget.ticker)
              ?.shares ?? 0
          }
          onTrade={(shares) => handleSell(sellTarget.ticker, shares)}
          onClose={() => setSellTarget(null)}
        />
      )}

      {/* Pre-trade AI check */}
      {pendingTrade && (
        <PreTradeModal
          isOpen={true}
          trade={pendingTrade}
          onConfirm={handleTradeConfirm}
          onCancel={handleTradeCancel}
        />
      )}
    </div>
  );
}
