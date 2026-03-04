"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Newspaper,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Minus,
  Clock,
} from "lucide-react";
import { stocks } from "@/lib/stock-data";
import {
  generateBriefing,
  type MarketBriefing,
  type BriefingItem,
} from "@/lib/market-briefing";
import { loadPortfolio } from "@/lib/portfolio-storage";
import { loadDNAProfile } from "@/lib/dna-storage";
import type { ArchetypeKey } from "@/lib/financial-dna";

const TYPE_STYLES = {
  positive: { icon: TrendingUp, color: "text-green", bg: "bg-green/5" },
  negative: { icon: TrendingDown, color: "text-red", bg: "bg-red/5" },
  neutral: { icon: Minus, color: "text-text-muted", bg: "bg-surface" },
  alert: { icon: AlertTriangle, color: "text-gold", bg: "bg-gold/5" },
};

export default function BriefingPage() {
  const [portfolio, setPortfolio] = useState<
    Array<{ ticker: string; allocation: number }> | undefined
  >();
  const [archetype, setArchetype] = useState<ArchetypeKey | undefined>();

  useEffect(() => {
    const stored = loadPortfolio();
    if (stored && stored.items.length > 0) {
      setPortfolio(stored.items);
    }

    const dna = loadDNAProfile();
    if (dna) {
      setArchetype(dna.communicationArchetype);
    }
  }, []);

  const briefing = useMemo(
    () => generateBriefing(stocks, portfolio, archetype),
    [portfolio, archetype]
  );

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-green mb-2">
            <Newspaper className="w-4 h-4" />
            <p className="text-xs uppercase tracking-widest font-medium">
              Daily Market Briefing
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            {briefing.headline}
          </h1>
          <div className="flex items-center gap-2 text-text-muted text-xs">
            <Clock className="w-3.5 h-3.5" />
            {dateStr}
          </div>
        </div>

        {/* Context tags */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {portfolio && (
            <span className="text-[10px] bg-green/10 text-green px-2.5 py-1 rounded-full">
              {portfolio.length} positions tracked
            </span>
          )}
          {archetype && (
            <span className="text-[10px] bg-blue-400/10 text-blue-400 px-2.5 py-1 rounded-full">
              Personalized for your identity
            </span>
          )}
          {!portfolio && !archetype && (
            <span className="text-[10px] bg-surface-alt text-text-muted px-2.5 py-1 rounded-full">
              Generic briefing -- add portfolio or take quiz for personalization
            </span>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {briefing.sections.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.08 }}
              className="bg-surface-alt rounded-xl border border-border overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border/50">
                <h2 className="text-sm font-medium text-text-primary">
                  {section.title}
                </h2>
              </div>
              <div className="divide-y divide-border/30">
                {section.items.map((item, ii) => (
                  <BriefingRow key={ii} item={item} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-text-muted">
          <p>
            Data based on static stock metrics. Not real-time financial
            advice.
          </p>
        </div>
      </div>
    </div>
  );
}

function BriefingRow({ item }: { item: BriefingItem }) {
  const style = TYPE_STYLES[item.type];
  const Icon = style.icon;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 ${style.bg}`}>
      <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${style.color}`} />
      <div className="flex-1">
        <p className="text-xs text-text-secondary leading-relaxed">
          {item.text}
        </p>
      </div>
      {item.ticker && (
        <Link
          href={`/research/${item.ticker}`}
          className="text-[10px] text-text-muted hover:text-green transition-colors shrink-0"
        >
          Details
        </Link>
      )}
    </div>
  );
}
