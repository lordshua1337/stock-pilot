"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dna, ArrowRight } from "lucide-react";
import Link from "next/link";
import { stocks, type Stock } from "@/lib/stock-data";
import type { PortfolioItem } from "../page";
import { formatCurrency } from "../page";
import { scoreStockForArchetype } from "@/lib/archetype-stock-scores";
import { loadDNAProfile } from "@/lib/dna-storage";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import { ARCHETYPE_COLORS } from "@/components/dna/archetype-colors";
import type { ArchetypeKey } from "@/lib/financial-dna";

interface AlignmentTabProps {
  portfolio: PortfolioItem[];
  portfolioStocks: Stock[];
  totalInvestment: number;
}

interface FitGroup {
  label: string;
  range: string;
  items: Array<{
    ticker: string;
    name: string;
    allocation: number;
    score: number;
    changePercent: number;
    dollarValue: number;
  }>;
  avgReturn: number;
  totalAllocation: number;
  color: string;
}

function buildStockMap(allStocks: Stock[]): Map<string, Stock> {
  const map = new Map<string, Stock>();
  for (const s of allStocks) map.set(s.ticker, s);
  return map;
}

// ─── Main Component ───────────────────────────────────────────────────

export function AlignmentTab({
  portfolio,
  portfolioStocks,
  totalInvestment,
}: AlignmentTabProps) {
  const stockMap = useMemo(() => buildStockMap(stocks), []);
  const [archetype, setArchetype] = useState<ArchetypeKey | null>(null);

  useEffect(() => {
    const profile = loadDNAProfile();
    if (profile) setArchetype(profile.communicationArchetype);
  }, []);

  const groups = useMemo((): FitGroup[] => {
    if (!archetype) return [];

    const scored = portfolio.map((item) => {
      const stock = stockMap.get(item.ticker);
      if (!stock) return null;
      const result = scoreStockForArchetype(stock, archetype);
      return {
        ticker: item.ticker,
        name: stock.name,
        allocation: item.allocation,
        score: result.score,
        changePercent: stock.changePercent,
        dollarValue: (item.allocation / 100) * totalInvestment,
      };
    }).filter((x): x is NonNullable<typeof x> => x !== null);

    const high = scored.filter((s) => s.score >= 70);
    const medium = scored.filter((s) => s.score >= 40 && s.score < 70);
    const low = scored.filter((s) => s.score < 40);

    function buildGroup(
      label: string,
      range: string,
      items: typeof scored,
      color: string
    ): FitGroup {
      const totalAlloc = items.reduce((s, i) => s + i.allocation, 0);
      const avgReturn =
        items.length > 0
          ? items.reduce((s, i) => s + i.changePercent, 0) /
            items.length
          : 0;
      return { label, range, items, avgReturn, totalAllocation: totalAlloc, color };
    }

    return [
      buildGroup("High Fit", "70-100", high, "#4ade80"),
      buildGroup("Medium Fit", "40-69", medium, "#fbbf24"),
      buildGroup("Low Fit", "0-39", low, "#f87171"),
    ];
  }, [portfolio, stockMap, totalInvestment, archetype]);

  if (!archetype) {
    return (
      <div className="text-center py-12">
        <Dna className="w-8 h-8 text-text-muted mx-auto mb-4" />
        <h3 className="text-sm font-medium text-text-primary mb-2">
          DNA Profile Required
        </h3>
        <p className="text-xs text-text-muted mb-4 max-w-sm mx-auto">
          Take the Financial DNA quiz to see how well your portfolio
          aligns with your investor identity.
        </p>
        <Link
          href="/personality"
          className="inline-flex items-center gap-2 text-xs bg-green/10 text-green border border-green/20 px-4 py-2 rounded-lg font-medium hover:bg-green/20 transition-colors"
        >
          Take the Quiz
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const archetypeName = ARCHETYPE_INFO[archetype]?.name ?? archetype;
  const accentColor = ARCHETYPE_COLORS[archetype];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface-alt rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <p className="text-xs text-text-muted">
            Alignment with{" "}
            <span className="font-medium text-text-primary">
              {archetypeName}
            </span>
          </p>
        </div>
        <p className="text-xs text-text-muted">
          Stocks grouped by compatibility with your archetype. Higher-fit
          stocks should theoretically align better with your investment
          approach.
        </p>
      </div>

      {/* Group comparison bars */}
      <div className="grid md:grid-cols-3 gap-3">
        {groups.map((group) => (
          <div
            key={group.label}
            className="bg-surface-alt rounded-xl border border-border p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-xs font-medium text-text-primary">
                  {group.label}
                </span>
              </div>
              <span className="text-[10px] text-text-muted">
                {group.range}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Stocks</span>
                <span className="text-text-primary font-medium">
                  {group.items.length}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Allocation</span>
                <span className="text-text-primary font-medium">
                  {group.totalAllocation}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">Avg Return</span>
                <span
                  className={`font-medium ${
                    group.avgReturn >= 0 ? "text-green" : "text-red"
                  }`}
                >
                  {group.avgReturn >= 0 ? "+" : ""}
                  {group.avgReturn.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Allocation bar */}
            <div className="mt-3 h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${group.totalAllocation}%`,
                  backgroundColor: group.color,
                  opacity: 0.7,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Detailed stock list per group */}
      {groups
        .filter((g) => g.items.length > 0)
        .map((group) => (
          <div
            key={group.label}
            className="bg-surface-alt rounded-xl border border-border overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              <h3 className="text-sm font-medium text-text-primary">
                {group.label} Stocks
              </h3>
              <span className="text-xs text-text-muted">
                ({group.items.length})
              </span>
            </div>
            <div className="divide-y divide-border/30">
              {group.items
                .sort((a, b) => b.score - a.score)
                .map((item, i) => (
                  <motion.div
                    key={item.ticker}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-medium text-text-primary w-12">
                        {item.ticker}
                      </span>
                      <span className="text-xs text-text-muted hidden sm:inline">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span
                        className="font-medium px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: `${group.color}15`,
                          color: group.color,
                        }}
                      >
                        {item.score}
                      </span>
                      <span className="text-text-secondary w-10 text-right">
                        {item.allocation}%
                      </span>
                      <span
                        className={`w-14 text-right font-medium ${
                          item.changePercent >= 0
                            ? "text-green"
                            : "text-red"
                        }`}
                      >
                        {item.changePercent >= 0 ? "+" : ""}
                        {item.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
}
