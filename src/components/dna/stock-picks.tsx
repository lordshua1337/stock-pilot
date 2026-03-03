"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight, AlertTriangle, Info } from "lucide-react";
import type { CoreDimensions } from "@/lib/financial-dna";
import {
  matchStocksToDNA,
  antiMatchStocksToDNA,
  type MatchedStock,
} from "@/lib/dna-stock-matcher";

// ---------------------------------------------------------------------------
// Why-these-stocks explanation based on dimensions
// ---------------------------------------------------------------------------

function getProfileExplanation(dims: CoreDimensions): string {
  const parts: string[] = [];

  if (dims.R >= 60) {
    parts.push("your comfort with volatility allows for higher-beta growth picks");
  } else {
    parts.push("your preference for stability favors lower-volatility dividend payers");
  }

  if (dims.H >= 60) {
    parts.push("your long-term horizon supports high-conviction growth positions");
  } else {
    parts.push("your shorter horizon favors stocks with near-term catalysts");
  }

  if (dims.D >= 60) {
    parts.push("picks are diversified across sectors to match your disciplined approach");
  }

  return `Based on your profile: ${parts.join(", ")}.`;
}

// ---------------------------------------------------------------------------
// Stock card
// ---------------------------------------------------------------------------

function StockCard({
  match,
  index,
  accentColor,
}: {
  match: MatchedStock;
  index: number;
  accentColor: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { stock, reason } = match;

  return (
    <motion.div
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      <Link
        href={`/research/${stock.ticker}`}
        className="block bg-surface border border-border rounded-xl p-4 hover:border-opacity-60 transition-colors group"
        style={{ borderColor: undefined }}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">{stock.ticker}</span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{
                  color: accentColor,
                  backgroundColor: `${accentColor}15`,
                }}
              >
                AI {stock.aiScore}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">{stock.name}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors flex-shrink-0 mt-1" />
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">{reason}</p>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
          <span>{stock.sector}</span>
          <span>Beta {stock.beta.toFixed(2)}</span>
          {stock.dividendYield > 0 && (
            <span>Div {stock.dividendYield.toFixed(1)}%</span>
          )}
          <span>{stock.analystRating}</span>
        </div>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Anti-match card (stocks to watch out for)
// ---------------------------------------------------------------------------

function AntiMatchCard({
  match,
  index,
}: {
  match: MatchedStock;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { stock, reason } = match;

  return (
    <motion.div
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      <Link
        href={`/research/${stock.ticker}`}
        className="block bg-surface border border-border rounded-xl p-4 hover:border-opacity-60 transition-colors group"
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">{stock.ticker}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded text-[#FF5252] bg-[#FF525215]">
                Mismatch
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">{stock.name}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors flex-shrink-0 mt-1" />
        </div>
        <p className="text-xs text-[#FF5252]/80 leading-relaxed">{reason}</p>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
          <span>{stock.sector}</span>
          <span>Beta {stock.beta.toFixed(2)}</span>
          <span>AI {stock.aiScore}</span>
        </div>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// StockPicks section
// ---------------------------------------------------------------------------

export function StockPicks({
  dimensions,
  accentColor = "#00C853",
}: {
  dimensions: CoreDimensions;
  accentColor?: string;
}) {
  const matches = matchStocksToDNA(dimensions);
  const antiMatches = antiMatchStocksToDNA(dimensions);

  return (
    <div className="space-y-6">
      {/* Top picks */}
      <div className="bg-surface-alt rounded-xl p-6">
        <div
          className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold mb-1"
          style={{ color: accentColor }}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Personality-Matched Stocks
        </div>
        <h2 className="text-xl font-bold mb-2">
          Top 5 Picks for Your Profile
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          {getProfileExplanation(dimensions)}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {matches.map((match, i) => (
            <StockCard
              key={match.stock.ticker}
              match={match}
              index={i}
              accentColor={accentColor}
            />
          ))}
        </div>
      </div>

      {/* Stocks to avoid */}
      <div className="bg-surface-alt rounded-xl p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold mb-1 text-[#FF5252]">
          <TrendingDown className="w-3.5 h-3.5" />
          Behavioral Mismatch
        </div>
        <h3 className="text-lg font-bold mb-2">
          Stocks That Clash With Your Profile
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          These stocks score lowest for your behavioral DNA. They are not necessarily bad
          investments, but they conflict with your natural tendencies, which increases the
          risk of emotional decision-making.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {antiMatches.map((match, i) => (
            <AntiMatchCard key={match.stock.ticker} match={match} index={i} />
          ))}
        </div>

        <div className="flex items-start gap-2 text-[11px] text-text-muted bg-surface border border-border rounded-lg p-3">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#FF5252]" />
          <p>
            Mismatch does not mean "bad stock." It means the stock's characteristics
            may trigger your specific behavioral weak spots. If you own any of these,
            consider extra discipline measures.
          </p>
        </div>
      </div>

      {/* Shared disclaimer */}
      <div className="flex items-start gap-2 text-[11px] text-text-muted bg-surface border border-border rounded-lg p-3">
        <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <p>
          Not financial advice. These matches are based on your behavioral profile
          and StockPilot AI scores, not guaranteed returns. Always do your own
          research before investing.
        </p>
      </div>
    </div>
  );
}
