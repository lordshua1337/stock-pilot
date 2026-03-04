"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";
import type { PortfolioItem } from "../page";
import { formatCurrency } from "../page";
import {
  generateRebalanceAdvice,
  type RebalanceAdvice,
  type RebalanceSummary,
} from "@/lib/rebalance-calculator";
import { loadDNAProfile } from "@/lib/dna-storage";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import type { ArchetypeKey } from "@/lib/financial-dna";

interface RebalanceTabProps {
  portfolio: PortfolioItem[];
  portfolioStocks: Stock[];
  totalInvestment: number;
}

function buildStockMap(allStocks: Stock[]): Map<string, Stock> {
  const map = new Map<string, Stock>();
  for (const s of allStocks) map.set(s.ticker, s);
  return map;
}

const ACTION_STYLES = {
  buy: { bg: "bg-green/10", text: "text-green", label: "Buy More" },
  trim: { bg: "bg-gold/10", text: "text-gold", label: "Trim" },
  hold: { bg: "bg-surface", text: "text-text-muted", label: "Hold" },
  "consider-selling": {
    bg: "bg-red/10",
    text: "text-red",
    label: "Consider Selling",
  },
};

// ─── Main Component ───────────────────────────────────────────────────

export function RebalanceTab({
  portfolio,
  portfolioStocks,
  totalInvestment,
}: RebalanceTabProps) {
  const stockMap = useMemo(() => buildStockMap(stocks), []);
  const [archetype, setArchetype] = useState<ArchetypeKey | null>(null);

  useEffect(() => {
    const profile = loadDNAProfile();
    if (profile) setArchetype(profile.communicationArchetype);
  }, []);

  const summary = useMemo(
    () =>
      generateRebalanceAdvice(
        portfolio,
        stockMap,
        totalInvestment,
        archetype ?? undefined
      ),
    [portfolio, stockMap, totalInvestment, archetype]
  );

  const archetypeName = archetype
    ? ARCHETYPE_INFO[archetype]?.name
    : null;

  return (
    <div className="space-y-6">
      {/* Method info */}
      <div className="bg-surface-alt rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 text-text-muted text-xs mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Rebalancing Method
        </div>
        {archetype ? (
          <div>
            <p className="text-sm text-text-primary">
              Optimized for{" "}
              <span className="font-medium text-green">
                {archetypeName}
              </span>
            </p>
            <p className="text-xs text-text-muted mt-1">
              Allocations weighted by archetype compatibility score.
              Higher-fit stocks get more weight.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-text-primary">Equal-Weight Rebalance</p>
            <p className="text-xs text-text-muted mt-1">
              Take the Financial DNA quiz for archetype-optimized
              recommendations.
            </p>
          </div>
        )}

        {summary.improvementScore > 0 && (
          <div className="mt-3 px-3 py-2 bg-green/5 border border-green/20 rounded-lg">
            <p className="text-xs text-green font-medium">
              Estimated fit improvement: +{summary.improvementScore}{" "}
              points
            </p>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-alt rounded-xl border border-border p-3 text-center">
          <p className="text-xs text-text-muted">Buy More</p>
          <p className="text-lg font-semibold text-green">
            {summary.totalBuys}
          </p>
        </div>
        <div className="bg-surface-alt rounded-xl border border-border p-3 text-center">
          <p className="text-xs text-text-muted">Trim</p>
          <p className="text-lg font-semibold text-gold">
            {summary.totalTrims}
          </p>
        </div>
        <div className="bg-surface-alt rounded-xl border border-border p-3 text-center">
          <p className="text-xs text-text-muted">Hold</p>
          <p className="text-lg font-semibold text-text-secondary">
            {summary.advice.filter((a) => a.action === "hold").length}
          </p>
        </div>
      </div>

      {/* Advice rows */}
      <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-medium text-text-primary">
            Rebalance Suggestions
          </h3>
        </div>
        <div className="divide-y divide-border/30">
          {summary.advice.map((item, i) => (
            <AdviceRow key={item.ticker} advice={item} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Advice Row ───────────────────────────────────────────────────────

function AdviceRow({
  advice,
  index,
}: {
  advice: RebalanceAdvice;
  index: number;
}) {
  const style = ACTION_STYLES[advice.action];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-4 px-4 py-3"
    >
      {/* Ticker + name */}
      <div className="w-24 shrink-0">
        <span className="font-mono text-sm font-medium text-text-primary">
          {advice.ticker}
        </span>
        {advice.score > 0 && (
          <p className="text-[10px] text-text-muted">
            Fit: {advice.score}
          </p>
        )}
      </div>

      {/* Current -> Target */}
      <div className="flex items-center gap-2 flex-1">
        <div className="text-center">
          <p className="text-[10px] text-text-muted">Current</p>
          <p className="text-sm font-medium text-text-secondary">
            {advice.currentAllocation}%
          </p>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-text-muted shrink-0" />

        <div className="text-center">
          <p className="text-[10px] text-text-muted">Target</p>
          <p className="text-sm font-medium text-text-primary">
            {advice.targetAllocation}%
          </p>
        </div>

        {/* Delta */}
        <div className="flex items-center gap-1 ml-2">
          {advice.delta > 0 ? (
            <TrendingUp className="w-3 h-3 text-green" />
          ) : advice.delta < 0 ? (
            <TrendingDown className="w-3 h-3 text-red" />
          ) : (
            <Minus className="w-3 h-3 text-text-muted" />
          )}
          <span
            className={`text-xs font-medium ${
              advice.delta > 0
                ? "text-green"
                : advice.delta < 0
                  ? "text-red"
                  : "text-text-muted"
            }`}
          >
            {advice.delta > 0 ? "+" : ""}
            {advice.delta}%
          </span>
        </div>
      </div>

      {/* Dollar change */}
      <div className="w-20 text-right shrink-0">
        <p
          className={`text-xs font-medium ${
            advice.dollarChange > 0
              ? "text-green"
              : advice.dollarChange < 0
                ? "text-red"
                : "text-text-muted"
          }`}
        >
          {advice.dollarChange > 0 ? "+" : ""}
          {formatCurrency(Math.abs(advice.dollarChange))}
        </p>
      </div>

      {/* Action badge */}
      <span
        className={`text-[10px] font-medium px-2 py-1 rounded-md shrink-0 ${style.bg} ${style.text}`}
      >
        {advice.action === "consider-selling" && (
          <AlertTriangle className="w-3 h-3 inline mr-1" />
        )}
        {style.label}
      </span>
    </motion.div>
  );
}
