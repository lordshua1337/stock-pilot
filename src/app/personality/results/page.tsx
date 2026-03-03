"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Shield,
  Share2,
} from "lucide-react";
import type { ArchetypeKey } from "@/lib/financial-dna";
import { DIMENSION_KEYS } from "@/lib/financial-dna";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import {
  loadDNAProfile,
  type StoredDNAProfile,
} from "@/lib/dna-storage";
import { loadV2Profile, type StoredDNAProfileV2 } from "@/lib/dna-v2/storage";
import { ARCHETYPE_CONTENT } from "@/lib/archetype-content";
import { ARCHETYPE_COLORS } from "@/components/dna/archetype-colors";
import { RadarChart } from "@/components/dna/radar-chart";
import {
  DimensionDetail,
  MarketMoodBadge,
  BiasCard,
  CommunicationStyle,
  StrengthsVulnerabilities,
} from "@/components/dna/profile-sections";
import { StockPicks } from "@/components/dna/stock-picks";
import { ActionPlan } from "@/components/dna/action-plan";
import {
  SharePanel,
  SharedBanner,
  decodeSharedProfile,
  type SharedProfile,
} from "@/components/dna/share-panel";
import { DownloadPdfButton } from "@/components/dna/pdf-builder";
import { V2ResultsDisplay } from "./v2-results";
import { ARCHETYPE_ICON_MAP } from "./icon-map";

// ---------------------------------------------------------------------------
// Section wrapper with alternating backgrounds and numbered headers
// ---------------------------------------------------------------------------

function Section({
  number,
  label,
  title,
  accentColor,
  alt = false,
  children,
}: {
  number: number;
  label: string;
  title: string;
  accentColor: string;
  alt?: boolean;
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: number * 0.06 }}
    >
      <div
        className="h-0.5 rounded-full mb-6 opacity-30"
        style={{ backgroundColor: accentColor }}
      />
      <div className="mb-2">
        <span
          className="text-xs uppercase tracking-widest font-semibold font-mono"
          style={{ color: accentColor }}
        >
          {number}. {label}
        </span>
      </div>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main results page
// ---------------------------------------------------------------------------

export default function DNAResultsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StoredDNAProfile | null>(null);
  const [profileV2, setProfileV2] = useState<StoredDNAProfileV2 | null>(null);
  const [sharedProfile, setSharedProfile] = useState<SharedProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showSharePanel, setShowSharePanel] = useState(false);

  useEffect(() => {
    // Check for shared profile in URL hash
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const sharedPrefix = "#shared=";
      if (hash.startsWith(sharedPrefix)) {
        const encoded = hash.slice(sharedPrefix.length);
        const decoded = decodeSharedProfile(encoded);
        if (decoded) {
          setSharedProfile(decoded);
          setLoading(false);
          return;
        }
      }
    }

    // Try V2 first
    const storedV2 = loadV2Profile();
    if (storedV2) {
      setProfileV2(storedV2);
      setLoading(false);
      return;
    }

    // Fall back to V1
    const stored = loadDNAProfile();
    if (!stored) {
      router.push("/personality");
      return;
    }
    setProfile(stored);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Brain className="w-8 h-8 text-green animate-pulse" />
      </div>
    );
  }

  // V2 Profile Display
  if (profileV2) {
    return <V2ResultsDisplay profileV2={profileV2} />;
  }

  // V1 Profile Display (original logic)
  const isSharedView = sharedProfile !== null && profile === null;

  const displayDimensions = isSharedView
    ? sharedProfile.dimensions
    : profile!.dimensions;
  const displayArchetypeKey = (
    isSharedView
      ? sharedProfile.archetype
      : profile!.communicationArchetype
  ) as ArchetypeKey;
  const displaySecondaryKey = isSharedView
    ? sharedProfile.secondaryArchetype
    : profile!.secondaryArchetype;
  const displayStrengths = isSharedView
    ? sharedProfile.strengths
    : profile!.strengths;
  const displayVulnerabilities = isSharedView
    ? sharedProfile.vulnerabilities
    : profile!.vulnerabilities;
  const displayBehavioralRule = isSharedView
    ? sharedProfile.behavioralRule
    : profile!.behavioralRule;
  const displayBiasFlags = isSharedView
    ? sharedProfile.biasFlags
    : profile!.biasFlags;
  const displayMarketMood = isSharedView
    ? sharedProfile.marketMood
    : profile!.marketMood;
  const displayConfidence = isSharedView
    ? sharedProfile.confidence.overall
    : profile!.confidence.overall;
  const displayCompletedAt = isSharedView
    ? sharedProfile.completedAt
    : profile!.completedAt;

  const archetype = ARCHETYPE_INFO[displayArchetypeKey];
  const secondaryArchetype = displaySecondaryKey
    ? ARCHETYPE_INFO[displaySecondaryKey as ArchetypeKey]
    : null;
  const accentColor =
    ARCHETYPE_COLORS[displayArchetypeKey] ?? "#00C853";

  const activeBiases = [...displayBiasFlags]
    .filter((f) => f.severity > 0)
    .sort((a, b) => b.severity - a.severity);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Share panel modal */}
        {showSharePanel && profile && (
          <SharePanel
            profile={profile}
            onClose={() => setShowSharePanel(false)}
          />
        )}

        {/* Shared view banner */}
        {isSharedView && <SharedBanner />}

        {/* Nav bar */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            href="/personality"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isSharedView ? "Take Assessment" : "Retake"}
          </Link>
          <div className="flex items-center gap-3">
            {!isSharedView && (
              <>
                <button
                  onClick={() => setShowSharePanel(true)}
                  className="text-sm text-text-muted hover:text-text-secondary transition-colors inline-flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
                <DownloadPdfButton
                  profile={profile!}
                  accentColor={accentColor}
                />
              </>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* ============================================================= */}
          {/* Hero / Archetype Card */}
          {/* ============================================================= */}
          <div
            className="border border-border rounded-xl p-6 sm:p-8 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${accentColor}10 0%, ${accentColor}05 50%, transparent 100%)`,
            }}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20"
              style={{ backgroundColor: accentColor }}
            />

            <div className="relative">
              {/* Archetype icon */}
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                {ARCHETYPE_ICON_MAP[displayArchetypeKey] ?? (
                  <Shield className="w-6 h-6" />
                )}
              </div>

              <div
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium mb-3"
                style={{ color: accentColor }}
              >
                Your Investor Personality Type
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {archetype?.name ?? "Unknown Type"}
              </h1>
              <p className="text-text-secondary text-lg italic mb-4">
                &ldquo;{archetype?.tagline ?? ""}&rdquo;
              </p>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xl mx-auto mb-4">
                {archetype?.description ?? ""}
              </p>

              {/* Rarity badge + secondary type */}
              <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
                {ARCHETYPE_CONTENT[displayArchetypeKey] && (
                  <span
                    className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border"
                    style={{
                      color: accentColor,
                      borderColor: `${accentColor}40`,
                      backgroundColor: `${accentColor}10`,
                    }}
                  >
                    {ARCHETYPE_CONTENT[displayArchetypeKey].rarity}% of investors
                  </span>
                )}
                {secondaryArchetype && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                    style={{
                      color: ARCHETYPE_COLORS[displaySecondaryKey as ArchetypeKey] ?? "#A0A0A0",
                      backgroundColor: `${ARCHETYPE_COLORS[displaySecondaryKey as ArchetypeKey] ?? "#A0A0A0"}15`,
                    }}
                  >
                    Secondary: {secondaryArchetype.name}
                  </span>
                )}
              </div>

              {/* Metaphor */}
              {ARCHETYPE_CONTENT[displayArchetypeKey]?.metaphor && (
                <p className="text-text-secondary text-sm leading-relaxed max-w-xl mx-auto mb-4 italic bg-surface/50 rounded-lg p-3 border border-border/50">
                  {ARCHETYPE_CONTENT[displayArchetypeKey].metaphor}
                </p>
              )}

              {/* Famous investors */}
              {ARCHETYPE_CONTENT[displayArchetypeKey]?.famousInvestors?.length > 0 && (
                <div className="max-w-md mx-auto">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">
                    Famous investors like you
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {ARCHETYPE_CONTENT[displayArchetypeKey].famousInvestors.map((inv) => (
                      <span
                        key={inv.name}
                        className="text-xs px-2.5 py-1 rounded-full bg-surface border border-border/50 text-text-secondary"
                        title={inv.why}
                      >
                        {inv.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================= */}
          {/* 1. Profile + Radar Chart */}
          {/* ============================================================= */}
          <Section
            number={1}
            label="Your Profile"
            title="Who You Are as an Investor"
            accentColor={accentColor}
          >
            <p className="text-sm text-text-secondary mb-6">
              Your investment style isn&apos;t just a strategy. It&apos;s a
              window into how you process uncertainty, manage anxiety, and
              relate to the future. These five dimensions map the behavioral
              patterns that shape every financial decision you make.
            </p>

            <RadarChart
              dimensions={displayDimensions}
              accentColor={accentColor}
            />

            <div className="mt-6 space-y-3">
              {DIMENSION_KEYS.map((k) => (
                <DimensionDetail
                  key={k}
                  dimKey={k}
                  value={displayDimensions[k]}
                  accentColor={accentColor}
                />
              ))}
            </div>
          </Section>

          {/* ============================================================= */}
          {/* 2. Strengths & Vulnerabilities */}
          {/* ============================================================= */}
          <Section
            number={2}
            label="Assessment"
            title="Strengths & Vulnerabilities"
            accentColor={accentColor}
            alt
          >
            <StrengthsVulnerabilities
              strengths={displayStrengths}
              vulnerabilities={displayVulnerabilities}
              accentColor={accentColor}
            />

            {/* Behavioral Rule */}
            <div
              className="mt-4 rounded-xl p-5 border"
              style={{
                borderColor: `${accentColor}30`,
                backgroundColor: `${accentColor}08`,
              }}
            >
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-2"
                style={{ color: accentColor }}
              >
                Your Behavioral Rule
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {displayBehavioralRule}
              </p>
            </div>
          </Section>

          {/* ============================================================= */}
          {/* 3. Behavioral Analysis */}
          {/* ============================================================= */}
          <Section
            number={3}
            label="Behavioral Analysis"
            title="Market Mood & Bias Profile"
            accentColor={accentColor}
          >
            <MarketMoodBadge
              mood={displayMarketMood}
              accentColor={accentColor}
            />

            {activeBiases.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5 mt-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
                  Bias Profile
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  {activeBiases.length} behavioral bias
                  {activeBiases.length !== 1 ? "es" : ""} detected
                </p>
                <div className="space-y-2">
                  {activeBiases.slice(0, 5).map((bias) => (
                    <BiasCard key={bias.bias} bias={bias} archetypeKey={displayArchetypeKey} />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <CommunicationStyle
                archetypeKey={displayArchetypeKey}
                accentColor={accentColor}
              />
            </div>
          </Section>

          {/* ============================================================= */}
          {/* 4. Personality-Matched Stocks (not shown in shared view) */}
          {/* ============================================================= */}
          {!isSharedView && (
            <Section
              number={4}
              label="Stock Matches"
              title="Personality-Matched Picks"
              accentColor={accentColor}
              alt
            >
              <StockPicks
                dimensions={displayDimensions}
                accentColor={accentColor}
              />
            </Section>
          )}

          {/* ============================================================= */}
          {/* 5. Action Plan (not shown in shared view) */}
          {/* ============================================================= */}
          {!isSharedView && profile && (
            <Section
              number={5}
              label="Next Steps"
              title="Your Personalized Action Plan"
              accentColor={accentColor}
            >
              <ActionPlan
                dimensions={displayDimensions}
                biasFlags={displayBiasFlags}
                triggeredModules={profile.triggeredModules}
                archetypeKey={displayArchetypeKey}
                accentColor={accentColor}
              />
            </Section>
          )}

          {/* ============================================================= */}
          {/* 6. Investor Operating System -- the "screenshot and save" card */}
          {/* ============================================================= */}
          {ARCHETYPE_CONTENT[displayArchetypeKey] && (
            <Section
              number={isSharedView ? 4 : 6}
              label="Your Playbook"
              title="Investor Operating System"
              accentColor={accentColor}
              alt
            >
              <div
                className="rounded-xl border p-5 sm:p-6 space-y-4"
                style={{
                  borderColor: `${accentColor}30`,
                  background: `linear-gradient(135deg, ${accentColor}08 0%, transparent 100%)`,
                }}
              >
                {/* Header row */}
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${accentColor}15`,
                      color: accentColor,
                    }}
                  >
                    {ARCHETYPE_ICON_MAP[displayArchetypeKey] ?? (
                      <Shield className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{archetype?.name}</h3>
                    <p className="text-xs text-text-muted italic">&ldquo;{archetype?.tagline}&rdquo;</p>
                  </div>
                </div>

                {/* Top strengths */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5 font-semibold">
                    Core Strengths
                  </p>
                  <div className="space-y-1">
                    {displayStrengths.slice(0, 3).map((s, i) => (
                      <p key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <span style={{ color: accentColor }}>+</span> {s}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Top risks */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1.5 font-semibold">
                    Risks to Watch
                  </p>
                  <div className="space-y-1">
                    {displayVulnerabilities.slice(0, 2).map((v, i) => (
                      <p key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <span className="text-gold">!</span> {v}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Behavioral rule */}
                <div
                  className="rounded-lg p-3 border text-xs"
                  style={{
                    borderColor: `${accentColor}25`,
                    backgroundColor: `${accentColor}06`,
                  }}
                >
                  <span className="font-semibold" style={{ color: accentColor }}>
                    Your #1 rule:
                  </span>{" "}
                  <span className="text-text-secondary">{displayBehavioralRule}</span>
                </div>

                {/* Portfolio style + allocation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-surface/50 rounded-lg p-3 border border-border/50">
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1 font-semibold">
                      Portfolio Style
                    </p>
                    <p className="text-xs text-text-secondary">
                      {ARCHETYPE_CONTENT[displayArchetypeKey].portfolioStyle}
                    </p>
                  </div>
                  <div className="bg-surface/50 rounded-lg p-3 border border-border/50">
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1 font-semibold">
                      Ideal Allocation
                    </p>
                    <p className="text-xs text-text-secondary">
                      {ARCHETYPE_CONTENT[displayArchetypeKey].idealAllocation}
                    </p>
                  </div>
                </div>

                {/* Decision framework */}
                <div
                  className="rounded-lg p-3 border text-xs text-center"
                  style={{
                    borderColor: `${accentColor}30`,
                    backgroundColor: `${accentColor}10`,
                  }}
                >
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1 font-semibold">
                    Before Any Trade
                  </p>
                  <p className="text-text-primary font-medium">
                    {ARCHETYPE_CONTENT[displayArchetypeKey].decisionFramework}
                  </p>
                </div>
              </div>
            </Section>
          )}

          {/* ============================================================= */}
          {/* Assessment Metadata */}
          {/* ============================================================= */}
          <div className="bg-surface-alt rounded-xl p-4 flex items-center justify-between text-xs text-text-muted">
            <span>
              Completed{" "}
              {new Date(displayCompletedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>Confidence: {displayConfidence}%</span>
          </div>

          {/* ============================================================= */}
          {/* CTAs */}
          {/* ============================================================= */}
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            {isSharedView ? (
              <Link
                href="/personality"
                className="flex-1 bg-green text-black px-5 py-3 rounded-lg font-medium text-center hover:bg-green-light transition-colors inline-flex items-center justify-center gap-2"
              >
                Take Your Own Assessment
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/research"
                  className="flex-1 px-5 py-3 rounded-lg font-medium text-center text-white hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
                  style={{ backgroundColor: accentColor }}
                >
                  Explore Stocks
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/portfolio"
                  className="flex-1 bg-surface border border-border px-5 py-3 rounded-lg font-medium text-center hover:border-green/30 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Build Portfolio
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setShowSharePanel(true)}
                  className="flex-1 bg-surface border border-border px-5 py-3 rounded-lg font-medium text-center hover:border-green/30 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share with Advisor
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
