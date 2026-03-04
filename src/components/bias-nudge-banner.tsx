"use client";

import { useState, useMemo, useEffect } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { stocks, type Stock } from "@/lib/stock-data";
import { detectBiases, type BiasNudge } from "@/lib/bias-nudge-engine";
import { loadDNAProfile } from "@/lib/dna-storage";
import type { ArchetypeKey } from "@/lib/financial-dna";

interface BiasNudgeBannerProps {
  portfolio: ReadonlyArray<{ ticker: string; allocation: number }>;
}

function buildStockMap(allStocks: Stock[]): Map<string, Stock> {
  const map = new Map<string, Stock>();
  for (const s of allStocks) map.set(s.ticker, s);
  return map;
}

const SEVERITY_STYLES = {
  high: {
    bg: "bg-red/5",
    border: "border-red/20",
    icon: "text-red",
    badge: "bg-red/10 text-red",
  },
  medium: {
    bg: "bg-gold/5",
    border: "border-gold/20",
    icon: "text-gold",
    badge: "bg-gold/10 text-gold",
  },
  low: {
    bg: "bg-blue-400/5",
    border: "border-blue-400/20",
    icon: "text-blue-400",
    badge: "bg-blue-400/10 text-blue-400",
  },
};

export function BiasNudgeBanner({ portfolio }: BiasNudgeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [archetype, setArchetype] = useState<ArchetypeKey | null>(null);

  useEffect(() => {
    const profile = loadDNAProfile();
    if (profile) setArchetype(profile.communicationArchetype);
  }, []);

  const stockMap = useMemo(() => buildStockMap(stocks), []);

  const nudges = useMemo(() => {
    if (!archetype || portfolio.length === 0) return [];
    return detectBiases(portfolio, stockMap, archetype);
  }, [portfolio, stockMap, archetype]);

  if (dismissed || nudges.length === 0 || !archetype) return null;

  const topNudge = nudges[0];
  const style = SEVERITY_STYLES[topNudge.severity];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`${style.bg} border ${style.border} rounded-xl mb-4 overflow-hidden`}
      >
        {/* Collapsed header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Shield className={`w-4 h-4 ${style.icon}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">
                  {nudges.length} Bias Alert{nudges.length !== 1 ? "s" : ""}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${style.badge}`}
                >
                  {topNudge.severity}
                </span>
              </div>
              {!expanded && (
                <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                  {topNudge.title}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface/50 transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="border-t border-border/30 px-4 py-3 space-y-3"
          >
            {nudges.map((nudge) => {
              const s = SEVERITY_STYLES[nudge.severity];
              return (
                <div
                  key={nudge.id}
                  className="flex items-start gap-3"
                >
                  <AlertTriangle
                    className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${s.icon}`}
                  />
                  <div>
                    <p className="text-xs font-medium text-text-primary">
                      {nudge.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                      {nudge.message}
                    </p>
                    {nudge.affectedTickers.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {nudge.affectedTickers.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono bg-surface px-1.5 py-0.5 rounded text-text-secondary"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
