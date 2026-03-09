"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Briefcase, Search } from "lucide-react";
import { loadDNAProfile } from "@/lib/dna-storage";
import { loadV2Profile } from "@/lib/dna-v2/storage";
import { getPersonalityCopy } from "@/lib/personality-copy";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import { ARCHETYPE_COLORS } from "@/components/dna/archetype-colors";
import type { ArchetypeKey } from "@/lib/financial-dna";

export function PersonalizedHero() {
  const [archetype, setArchetype] = useState<ArchetypeKey | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Try V2 first, fall back to V1
    const v2 = loadV2Profile();
    if (v2) {
      setArchetype(v2.archetype.primary as ArchetypeKey);
      return;
    }
    const v1 = loadDNAProfile();
    if (v1) {
      setArchetype(v1.communicationArchetype as ArchetypeKey);
    }
  }, []);

  const copy = getPersonalityCopy(archetype);
  const accentColor = archetype ? (ARCHETYPE_COLORS[archetype] ?? "#006DD8") : "#006DD8";
  const archetypeName = archetype ? ARCHETYPE_INFO[archetype]?.name : null;

  // SSR / no-profile fallback
  if (!mounted || !copy) {
    return (
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-green-bg text-green px-3 py-1 rounded-full text-xs font-medium mb-6">
          <Zap className="w-3.5 h-3.5" />
          AI-Powered Research
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-5">
          Invest Smarter,{" "}
          <span className="text-green">Not Harder</span>
        </h1>

        <p className="text-text-secondary text-lg max-w-xl mx-auto mb-4">
          AI-driven stock research, sector analysis, and portfolio building.
          Every recommendation comes with a thesis, risks, and catalysts.
        </p>

        <p className="text-text-muted text-sm max-w-lg mx-auto mb-8">
          Not financial advice. Educational tool for informed decision-making.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/portfolio"
            className="bg-green text-black px-6 py-2.5 rounded-lg font-medium hover:bg-green-light transition-colors inline-flex items-center justify-center gap-2"
          >
            Build Portfolio
            <Briefcase className="w-4 h-4" />
          </Link>
          <Link
            href="/research"
            className="bg-surface border border-border text-text-primary px-6 py-2.5 rounded-lg font-medium hover:bg-surface-hover transition-colors inline-flex items-center justify-center gap-2"
          >
            Research Stocks
            <Search className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Personalized hero for users with a profile
  return (
    <div className="max-w-4xl mx-auto text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        <Zap className="w-3.5 h-3.5" />
        {archetypeName}
      </div>

      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-5">
        {copy.heroHeadline}{" "}
        <span style={{ color: accentColor }}>{copy.heroHighlight}</span>
      </h1>

      <p className="text-text-secondary text-lg max-w-xl mx-auto mb-4">
        {copy.heroSubtitle}
      </p>

      <p className="text-text-muted text-sm max-w-lg mx-auto mb-8">
        Not financial advice. Educational tool for informed decision-making.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/portfolio"
          className="text-black px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
          style={{ backgroundColor: accentColor }}
        >
          {copy.heroCta}
          <Briefcase className="w-4 h-4" />
        </Link>
        <Link
          href="/research"
          className="bg-surface border border-border text-text-primary px-6 py-2.5 rounded-lg font-medium hover:bg-surface-hover transition-colors inline-flex items-center justify-center gap-2"
        >
          Research Stocks
          <Search className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
