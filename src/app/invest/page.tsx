"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { stocks } from "@/lib/stock-data";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import { ARCHETYPE_COLORS } from "@/components/dna/archetype-colors";
import { getTopStocksForArchetype } from "@/lib/archetype-stock-scores";
import { archetypeToSlug } from "@/lib/archetype-slugs";
import { loadDNAProfile } from "@/lib/dna-storage";
import type { ArchetypeKey } from "@/lib/financial-dna";

const ARCHETYPES = Object.keys(ARCHETYPE_INFO) as ArchetypeKey[];

export default function InvestHubPage() {
  const [userArchetype, setUserArchetype] = useState<ArchetypeKey | null>(null);

  useEffect(() => {
    const profile = loadDNAProfile();
    if (profile) {
      setUserArchetype(profile.communicationArchetype);
    }
  }, []);

  const archetypePreviews = useMemo(() => {
    return ARCHETYPES.map((key) => {
      const info = ARCHETYPE_INFO[key];
      const top3 = getTopStocksForArchetype(stocks, key, 3);
      return { key, info, top3, slug: archetypeToSlug(key) };
    });
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 text-green mb-2">
            <Sparkles className="w-4 h-4" />
            <p className="text-xs uppercase tracking-widest font-medium">
              Archetype Research Hub
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Invest Your Way
          </h1>
          <p className="text-text-secondary text-sm max-w-xl">
            Every investor archetype has stocks that naturally align with
            their philosophy. Find the stocks that fit how you think.
          </p>
        </div>

        {/* Archetype grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {archetypePreviews.map((item, i) => {
            const isUserType = userArchetype === item.key;
            const color = ARCHETYPE_COLORS[item.key];

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/invest/${item.slug}`}
                  className={`block bg-surface-alt rounded-xl border p-5 transition-all hover:border-opacity-60 group ${
                    isUserType
                      ? "border-green ring-1 ring-green/20"
                      : "border-border hover:bg-surface-alt/80"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <h2 className="text-sm font-semibold text-text-primary">
                          {item.info.name}
                        </h2>
                        {isUserType && (
                          <span className="text-[10px] bg-green/10 text-green px-2 py-0.5 rounded-full font-medium">
                            Your Type
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted italic">
                        {item.info.tagline}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors shrink-0 mt-1" />
                  </div>

                  {/* Top 3 stocks preview */}
                  <div className="flex gap-2 mt-3">
                    {item.top3.map((scored) => (
                      <div
                        key={scored.stock.ticker}
                        className="flex-1 bg-surface rounded-lg px-3 py-2 text-center"
                      >
                        <p className="font-mono text-xs font-medium text-text-primary">
                          {scored.stock.ticker}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Score: {scored.score}
                        </p>
                      </div>
                    ))}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA if no DNA profile */}
        {!userArchetype && (
          <div className="mt-8 bg-surface-alt rounded-xl border border-border p-6 text-center">
            <h3 className="text-sm font-medium text-text-primary mb-2">
              Discover Your Investor Identity
            </h3>
            <p className="text-xs text-text-muted mb-4">
              Take the Financial DNA quiz to see which archetype you are
              and get personalized stock recommendations.
            </p>
            <Link
              href="/personality"
              className="inline-flex items-center gap-2 text-xs bg-green/10 text-green border border-green/20 px-4 py-2 rounded-lg font-medium hover:bg-green/20 transition-colors"
            >
              Take the Quiz
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
