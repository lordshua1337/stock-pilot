"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Minus,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";
import type { Stock } from "@/lib/stock-data";
import type { StockSignal } from "@/lib/portfolio-signals";

interface ConfirmationModalProps {
  stock: Stock;
  signal: StockSignal;
  onConfirm: () => void;
  onCancel: () => void;
}

// ── Sub-score ring (reuses ScoreRing pattern from insight-card) ──
function SubScoreRing({ score, label }: { score: number; label: string }) {
  const pct = score / 100;
  const circumference = 2 * Math.PI * 16;
  const dashOffset = circumference * (1 - pct);
  const color = score >= 70 ? "#2E8BEF" : score >= 45 ? "#FFD740" : "#FF5252";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-11 h-11">
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" stroke="#2A2A2A" strokeWidth="2.5" />
          <circle
            cx="20" cy="20" r="16" fill="none"
            stroke={color} strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold font-mono">
          {score}
        </span>
      </div>
      <span className="text-[10px] text-text-muted">{label}</span>
    </div>
  );
}

// ── Signal icon resolver ──
function SignalIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "trending-up": return <TrendingUp className="w-3.5 h-3.5" />;
    case "trending-down": return <TrendingDown className="w-3.5 h-3.5" />;
    case "alert-triangle": return <AlertTriangle className="w-3.5 h-3.5" />;
    default: return <Minus className="w-3.5 h-3.5" />;
  }
}

export function ConfirmationModal({
  stock,
  signal,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  const scoreColor =
    signal.compositeScore >= 70
      ? "text-green"
      : signal.compositeScore >= 50
        ? "text-gold"
        : "text-red";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-1">
                AI Analysis
              </p>
              <h2 className="text-xl font-semibold">
                Add{" "}
                <span className="text-green font-mono">{stock.ticker}</span>{" "}
                to Portfolio?
              </h2>
              <p className="text-sm text-text-secondary mt-1">{stock.name}</p>
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </div>

        {/* Signal banner */}
        <div className={`px-5 py-3 flex items-center gap-2 border-b border-border ${
          signal.signal.color === "green" ? "bg-green-bg" :
          signal.signal.color === "red" ? "bg-red-bg" :
          signal.signal.color === "gold" ? "bg-[rgba(255,215,64,0.1)]" :
          "bg-surface-alt"
        }`}>
          <SignalIcon icon={signal.signal.icon} />
          <span className="text-sm font-medium">{signal.signal.type}</span>
          <span className="ml-auto text-xs text-text-muted">
            RSI {signal.rsi}
          </span>
        </div>

        <div className="p-5 space-y-5">
          {/* Composite score + sub-scores */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-text-muted uppercase tracking-wider">
                Composite AI Score
              </span>
              <span className={`text-2xl font-mono font-bold ${scoreColor}`}>
                {signal.compositeScore}
              </span>
            </div>
            <div className="flex justify-between">
              <SubScoreRing score={signal.subScores.momentum} label="Momentum" />
              <SubScoreRing score={signal.subScores.value} label="Value" />
              <SubScoreRing score={signal.subScores.growth} label="Growth" />
              <SubScoreRing score={signal.subScores.stability} label="Stability" />
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Price", value: `$${stock.price.toFixed(2)}` },
              { label: "P/E", value: stock.peRatio > 0 ? stock.peRatio.toFixed(1) : "N/A" },
              { label: "Beta", value: stock.beta.toFixed(2) },
              { label: "Yield", value: `${stock.dividendYield.toFixed(1)}%` },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface-alt rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-text-muted">{stat.label}</p>
                <p className="text-sm font-mono font-medium">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Why it works */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green" />
              <h3 className="text-sm font-semibold">Why It Works</h3>
            </div>
            <ul className="space-y-1.5">
              {signal.whyItWorks.map((bullet, i) => (
                <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                  <span className="text-green mt-0.5 flex-shrink-0">+</span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          {/* Watch out for */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-gold" />
              <h3 className="text-sm font-semibold">Watch Out For</h3>
            </div>
            <ul className="space-y-1.5">
              {signal.watchOutFor.map((bullet, i) => (
                <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                  <span className="text-gold mt-0.5 flex-shrink-0">!</span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          {/* Risk acknowledgment */}
          <label className="flex items-start gap-3 p-3 bg-surface-alt rounded-lg cursor-pointer group">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border accent-green"
            />
            <span className="text-xs text-text-secondary leading-relaxed">
              I understand the risks and AI analysis for {stock.ticker}. Past performance
              and AI scores do not guarantee future results.
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!acknowledged}
              className={`
                flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors
                ${acknowledged
                  ? "bg-green text-background hover:bg-green-dark"
                  : "bg-surface-alt text-text-muted cursor-not-allowed"
                }
              `}
            >
              Add to Portfolio
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
