"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";
import type { PortfolioItem } from "../page";
import { formatCurrency } from "../page";
import {
  calculateSectorHeatmap,
  type HeatmapBlock,
} from "@/lib/heatmap-calculator";

interface HeatmapTabProps {
  portfolio: PortfolioItem[];
  portfolioStocks: Stock[];
  totalInvestment: number;
}

function buildStockMap(allStocks: Stock[]): Map<string, Stock> {
  const map = new Map<string, Stock>();
  for (const s of allStocks) map.set(s.ticker, s);
  return map;
}

function getPerformanceColor(changePercent: number): string {
  if (changePercent >= 3) return "rgba(74,222,128,0.6)"; // strong green
  if (changePercent >= 1) return "rgba(74,222,128,0.35)";
  if (changePercent >= 0) return "rgba(74,222,128,0.15)";
  if (changePercent >= -2) return "rgba(248,113,113,0.25)";
  return "rgba(248,113,113,0.5)"; // strong red
}

function getPerformanceTextColor(changePercent: number): string {
  return changePercent >= 0 ? "text-green" : "text-red";
}

// ─── Main Component ───────────────────────────────────────────────────

export function HeatmapTab({
  portfolio,
  portfolioStocks,
  totalInvestment,
}: HeatmapTabProps) {
  const stockMap = useMemo(() => buildStockMap(stocks), []);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);

  const blocks = useMemo(
    () => calculateSectorHeatmap(portfolio, stockMap, totalInvestment),
    [portfolio, stockMap, totalInvestment]
  );

  if (blocks.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        Add stocks to see sector heatmap.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Treemap */}
      <div className="bg-surface-alt rounded-xl border border-border p-4">
        <h3 className="text-sm font-medium text-text-primary mb-4">
          Sector Allocation Heatmap
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {blocks.map((block) => {
            const isExpanded = expandedSector === block.sector;
            // Minimum width 80px, scale by allocation
            const widthPercent = Math.max(
              15,
              block.allocationPercent
            );

            return (
              <motion.button
                key={block.sector}
                onClick={() =>
                  setExpandedSector(isExpanded ? null : block.sector)
                }
                className="rounded-lg border border-border/30 transition-all hover:border-border/60 text-left overflow-hidden"
                style={{
                  width: `calc(${widthPercent}% - 6px)`,
                  minWidth: "100px",
                  backgroundColor: getPerformanceColor(
                    block.avgChangePercent
                  ),
                }}
                layout
              >
                <div className="p-3">
                  <p className="text-xs font-medium text-text-primary truncate">
                    {block.sector}
                  </p>
                  <p className="text-lg font-bold text-text-primary">
                    {block.allocationPercent.toFixed(0)}%
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`text-[10px] font-medium ${getPerformanceTextColor(block.avgChangePercent)}`}
                    >
                      {block.avgChangePercent >= 0 ? "+" : ""}
                      {block.avgChangePercent.toFixed(2)}%
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {block.stockCount} stock
                      {block.stockCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Expanded sector detail */}
      <AnimatePresence>
        {expandedSector && (
          <SectorDetail
            block={blocks.find((b) => b.sector === expandedSector)!}
            onClose={() => setExpandedSector(null)}
          />
        )}
      </AnimatePresence>

      {/* Sector breakdown table */}
      <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-medium text-text-primary">
            Sector Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-text-muted">
                <th className="text-left py-2 px-3 font-medium">Sector</th>
                <th className="text-right py-2 px-3 font-medium">Alloc</th>
                <th className="text-right py-2 px-3 font-medium">Value</th>
                <th className="text-right py-2 px-3 font-medium">Avg Change</th>
                <th className="text-right py-2 px-3 font-medium">Avg AI</th>
                <th className="text-right py-2 px-3 font-medium">Stocks</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block) => (
                <tr
                  key={block.sector}
                  className="border-t border-border/50 hover:bg-surface-alt/50 transition-colors cursor-pointer"
                  onClick={() =>
                    setExpandedSector(
                      expandedSector === block.sector ? null : block.sector
                    )
                  }
                >
                  <td className="py-3 px-3 text-sm text-text-primary font-medium">
                    {block.sector}
                  </td>
                  <td className="py-3 px-3 text-sm text-right text-text-secondary">
                    {block.allocationPercent.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-sm text-right text-text-secondary">
                    {formatCurrency(block.dollarValue)}
                  </td>
                  <td
                    className={`py-3 px-3 text-sm text-right font-medium ${getPerformanceTextColor(block.avgChangePercent)}`}
                  >
                    {block.avgChangePercent >= 0 ? "+" : ""}
                    {block.avgChangePercent.toFixed(2)}%
                  </td>
                  <td className="py-3 px-3 text-sm text-right text-text-secondary">
                    {block.avgAiScore.toFixed(0)}
                  </td>
                  <td className="py-3 px-3 text-sm text-right text-text-secondary">
                    {block.stockCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Sector Detail Panel ──────────────────────────────────────────────

function SectorDetail({
  block,
  onClose,
}: {
  block: HeatmapBlock;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-surface-alt rounded-xl border border-border overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <h3 className="text-sm font-medium text-text-primary">
          {block.sector} -- {block.stockCount} stock
          {block.stockCount !== 1 ? "s" : ""}
        </h3>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-secondary transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 grid gap-2">
        {block.stocks.map((stock) => (
          <div
            key={stock.ticker}
            className="flex items-center justify-between bg-surface rounded-lg px-3 py-2"
          >
            <div>
              <span className="font-mono text-xs font-medium text-text-primary">
                {stock.ticker}
              </span>
              <span className="text-[10px] text-text-muted ml-2">
                {stock.name}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-text-secondary">
                {stock.allocation}%
              </span>
              <span
                className={`font-medium ${getPerformanceTextColor(stock.changePercent)}`}
              >
                {stock.changePercent >= 0 ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </span>
              <span className="text-text-muted">
                AI {stock.aiScore}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
