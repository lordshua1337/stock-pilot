"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Hammer,
  LineChart,
  Lightbulb,
  Shield,
  FileText,
  Lock,
  Coins,
  Scale,
  Grid3X3,
  GitBranch,
  RefreshCw,
  Dna,
} from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";
import {
  generateStockSignal,
  type StockSignal,
} from "@/lib/portfolio-signals";
import {
  savePortfolio,
  loadPortfolio,
} from "@/lib/portfolio-storage";
import { BuildTab } from "./_components/build-tab";
import { SimulateTab } from "./_components/simulate-tab";
import { InsightsTab } from "./_components/insights-tab";
import { ScenariosTab } from "./_components/scenarios-tab";
import { ReportTab } from "./_components/report-tab";
import { DividendTab } from "./_components/dividend-tab";
import { BenchmarkTab } from "./_components/benchmark-tab";
import { HeatmapTab } from "./_components/heatmap-tab";
import { CorrelationTab } from "./_components/correlation-tab";
import { RebalanceTab } from "./_components/rebalance-tab";
import { AlignmentTab } from "./_components/alignment-tab";
import { BiasNudgeBanner } from "@/components/bias-nudge-banner";
import { AIInsightCard } from "@/components/copilot/ai-insight-card";
import { ConfirmationModal } from "./_components/confirmation-modal";

// ─── Types ─────────────────────────────────────────────────────────────

export interface PortfolioItem {
  ticker: string;
  allocation: number; // percentage 1-50
}

type TabId = "build" | "simulate" | "insights" | "scenarios" | "report" | "dividends" | "benchmark" | "heatmap" | "correlation" | "rebalance" | "alignment";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  minStocks: number; // stocks needed to unlock
}

// ─── Constants ─────────────────────────────────────────────────────────

const TABS: TabDef[] = [
  { id: "build", label: "Build", icon: <Hammer className="w-4 h-4" />, minStocks: 1 },
  { id: "simulate", label: "Simulate", icon: <LineChart className="w-4 h-4" />, minStocks: 3 },
  { id: "insights", label: "Insights", icon: <Lightbulb className="w-4 h-4" />, minStocks: 2 },
  { id: "scenarios", label: "Scenarios", icon: <Shield className="w-4 h-4" />, minStocks: 3 },
  { id: "report", label: "Report", icon: <FileText className="w-4 h-4" />, minStocks: 3 },
  { id: "dividends", label: "Dividends", icon: <Coins className="w-4 h-4" />, minStocks: 2 },
  { id: "benchmark", label: "Benchmark", icon: <Scale className="w-4 h-4" />, minStocks: 3 },
  { id: "heatmap", label: "Heatmap", icon: <Grid3X3 className="w-4 h-4" />, minStocks: 4 },
  { id: "correlation", label: "Correlation", icon: <GitBranch className="w-4 h-4" />, minStocks: 4 },
  { id: "rebalance", label: "Rebalance", icon: <RefreshCw className="w-4 h-4" />, minStocks: 3 },
  { id: "alignment", label: "DNA Fit", icon: <Dna className="w-4 h-4" />, minStocks: 3 },
];

const INVESTMENT_PILLS = [1000, 5000, 10000, 25000, 50000, 100000];

// ─── Helpers ───────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function resolveStock(ticker: string): Stock | undefined {
  return stocks.find((s) => s.ticker === ticker);
}

// ─── Page Component ────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [totalInvestment, setTotalInvestment] = useState(10000);
  const [activeTab, setActiveTab] = useState<TabId>("build");
  const [pendingTicker, setPendingTicker] = useState<string | null>(null);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<TabId | null>(null);

  // ── Restore from localStorage on mount ──
  useEffect(() => {
    const stored = loadPortfolio();
    if (stored && stored.items.length > 0) {
      setPortfolio(stored.items.map((i) => ({ ...i })));
      setTotalInvestment(stored.investment);
    }
  }, []);

  // ── Auto-save on changes ──
  useEffect(() => {
    if (portfolio.length > 0) {
      savePortfolio(portfolio, totalInvestment);
    }
  }, [portfolio, totalInvestment]);

  // ── Track progressive disclosure unlocks ──
  const prevCountRef = useMemo(() => ({ current: 0 }), []);
  useEffect(() => {
    const count = portfolio.length;
    const prev = prevCountRef.current;
    prevCountRef.current = count;

    // Check if any tab just unlocked
    for (const tab of TABS) {
      if (count >= tab.minStocks && prev < tab.minStocks && prev > 0) {
        setRecentlyUnlocked(tab.id);
        const timer = setTimeout(() => setRecentlyUnlocked(null), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [portfolio.length, prevCountRef]);

  // ── Resolve portfolio stocks and signals ──
  const portfolioStocks = useMemo(() => {
    return portfolio.flatMap((item) => {
      const stock = resolveStock(item.ticker);
      return stock ? [stock] : [];
    });
  }, [portfolio]);

  const signals = useMemo(() => {
    return portfolioStocks.map((s) => generateStockSignal(s));
  }, [portfolioStocks]);

  const signalMap = useMemo(() => {
    const map: Record<string, StockSignal> = {};
    for (const sig of signals) {
      map[sig.ticker] = sig;
    }
    return map;
  }, [signals]);

  // ── Portfolio mutation callbacks ──
  const requestAddStock = useCallback((ticker: string) => {
    if (portfolio.some((p) => p.ticker === ticker)) return;
    setPendingTicker(ticker);
  }, [portfolio]);

  const confirmAddStock = useCallback(() => {
    if (!pendingTicker) return;
    const remaining = 100 - portfolio.reduce((sum, p) => sum + p.allocation, 0);
    if (remaining < 1) {
      setPendingTicker(null);
      return;
    }
    const defaultAlloc = Math.min(remaining, 10);
    setPortfolio((prev) => [...prev, { ticker: pendingTicker, allocation: defaultAlloc }]);
    setPendingTicker(null);
  }, [pendingTicker, portfolio]);

  const cancelAddStock = useCallback(() => {
    setPendingTicker(null);
  }, []);

  const removeStock = useCallback((ticker: string) => {
    setPortfolio((prev) => prev.filter((p) => p.ticker !== ticker));
  }, []);

  const updateAllocation = useCallback((ticker: string, newAlloc: number) => {
    const clamped = Math.max(1, Math.min(50, newAlloc));
    setPortfolio((prev) =>
      prev.map((p) => (p.ticker === ticker ? { ...p, allocation: clamped } : p))
    );
  }, []);

  const loadPreset = useCallback((items: PortfolioItem[]) => {
    setPortfolio(items.map((i) => ({ ...i })));
  }, []);

  const totalAllocation = portfolio.reduce((sum, p) => sum + p.allocation, 0);

  // ── Pending stock data for confirmation modal ──
  const pendingStock = pendingTicker ? resolveStock(pendingTicker) : null;
  const pendingSignal = pendingStock ? generateStockSignal(pendingStock) : null;

  // ── Empty state ──
  if (portfolio.length === 0 && !pendingTicker) {
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

          <BuildTab
            portfolio={portfolio}
            totalInvestment={totalInvestment}
            setTotalInvestment={setTotalInvestment}
            totalAllocation={totalAllocation}
            signals={signalMap}
            onAddStock={requestAddStock}
            onRemoveStock={removeStock}
            onUpdateAllocation={updateAllocation}
            onLoadPreset={loadPreset}
            investmentPills={INVESTMENT_PILLS}
            isEmpty
          />
        </div>
      </div>
    );
  }

  // ── Tab bar + active content ──
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-green mb-2">
            <Briefcase className="w-4 h-4" />
            <p className="text-xs uppercase tracking-widest font-medium">
              Portfolio Builder
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-1">
            Your Portfolio
          </h1>
          <p className="text-text-secondary text-sm">
            {portfolio.length} position{portfolio.length !== 1 ? "s" : ""} &middot; {formatCurrency(totalInvestment)} invested
          </p>
        </div>

        {/* Bias nudge banner */}
        <BiasNudgeBanner portfolio={portfolio} />

        <AIInsightCard pageId="portfolio" className="mb-4" />

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto pb-px">
          {TABS.map((tab) => {
            const unlocked = portfolio.length >= tab.minStocks;
            const isActive = activeTab === tab.id;
            const justUnlocked = recentlyUnlocked === tab.id;
            const needed = tab.minStocks - portfolio.length;

            return (
              <button
                key={tab.id}
                onClick={() => unlocked && setActiveTab(tab.id)}
                disabled={!unlocked}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                  transition-colors whitespace-nowrap
                  ${isActive
                    ? "text-green border-b-2 border-green -mb-px"
                    : unlocked
                      ? "text-text-secondary hover:text-text-primary"
                      : "text-text-muted/40 cursor-not-allowed"
                  }
                `}
                title={!unlocked ? `Add ${needed} more stock${needed !== 1 ? "s" : ""} to unlock` : undefined}
              >
                {!unlocked && <Lock className="w-3 h-3" />}
                {tab.icon}
                {tab.label}
                {justUnlocked && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "build" && (
              <BuildTab
                portfolio={portfolio}
                totalInvestment={totalInvestment}
                setTotalInvestment={setTotalInvestment}
                totalAllocation={totalAllocation}
                signals={signalMap}
                onAddStock={requestAddStock}
                onRemoveStock={removeStock}
                onUpdateAllocation={updateAllocation}
                onLoadPreset={loadPreset}
                investmentPills={INVESTMENT_PILLS}
              />
            )}
            {activeTab === "simulate" && (
              <SimulateTab
                portfolio={portfolio}
                portfolioStocks={portfolioStocks}
                totalInvestment={totalInvestment}
                signals={signals}
              />
            )}
            {activeTab === "insights" && (
              <InsightsTab
                portfolio={portfolio}
                portfolioStocks={portfolioStocks}
                totalInvestment={totalInvestment}
                signals={signals}
                signalMap={signalMap}
              />
            )}
            {activeTab === "scenarios" && (
              <ScenariosTab
                portfolio={portfolio}
                portfolioStocks={portfolioStocks}
                totalInvestment={totalInvestment}
              />
            )}
            {activeTab === "report" && (
              <ReportTab
                portfolio={portfolio}
                portfolioStocks={portfolioStocks}
                totalInvestment={totalInvestment}
                signals={signals}
                signalMap={signalMap}
              />
            )}
            {activeTab === "dividends" && (
              <DividendTab
                portfolio={portfolio}
                portfolioStocks={portfolioStocks}
                totalInvestment={totalInvestment}
              />
            )}
            {activeTab === "benchmark" && (
              <BenchmarkTab
                portfolio={portfolio}
                portfolioStocks={portfolioStocks}
                totalInvestment={totalInvestment}
              />
            )}
            {activeTab === "heatmap" && (
              <HeatmapTab
                portfolio={portfolio}
                portfolioStocks={portfolioStocks}
                totalInvestment={totalInvestment}
              />
            )}
            {activeTab === "correlation" && (
              <CorrelationTab
                portfolio={portfolio}
                portfolioStocks={portfolioStocks}
                totalInvestment={totalInvestment}
              />
            )}
            {activeTab === "rebalance" && (
              <RebalanceTab
                portfolio={portfolio}
                portfolioStocks={portfolioStocks}
                totalInvestment={totalInvestment}
              />
            )}
            {activeTab === "alignment" && (
              <AlignmentTab
                portfolio={portfolio}
                portfolioStocks={portfolioStocks}
                totalInvestment={totalInvestment}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Confirmation modal */}
      {pendingStock && pendingSignal && (
        <ConfirmationModal
          stock={pendingStock}
          signal={pendingSignal}
          onConfirm={confirmAddStock}
          onCancel={cancelAddStock}
        />
      )}
    </div>
  );
}
