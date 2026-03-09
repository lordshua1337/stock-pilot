"use client";

import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { StoredDNAProfileV2 } from "@/lib/dna-v2/storage";
// V2 storage used for profile loading only (no JSON export)
import { ARCHETYPE_INFO as ARCHETYPE_INFO_V2 } from "@/lib/dna-v2/archetypes";
import { PRIMARY_FACTORS, FACTOR_MAP } from "@/lib/dna-v2/factors";
import type { FactorCode } from "@/lib/dna-v2/types";
import type { ArchetypeKey } from "@/lib/financial-dna";
import { RadarChartV2 } from "@/components/dna/radar-chart-v2";
import { MarketMoodBadge } from "@/components/dna/profile-sections";
import { ARCHETYPE_COLORS } from "@/components/dna/archetype-colors";
import { ARCHETYPE_ICON_MAP } from "./icon-map";

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({
  number,
  label,
  title,
  accentColor,
  children,
}: {
  number: number;
  label: string;
  title: string;
  accentColor: string;
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
          className="text-xs uppercase tracking-widest font-semibold"
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
// V2 Factor Detail Component
// ---------------------------------------------------------------------------

function FactorDetail({
  factorCode,
  score,
  accentColor,
}: {
  factorCode: FactorCode;
  score: number;
  accentColor: string;
}) {
  const factor = FACTOR_MAP[factorCode];
  if (!factor) return null;

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-mono text-text-muted">{factor.code}</span>
          <h4 className="text-sm font-semibold">{factor.name}</h4>
        </div>
        <span className="text-lg font-bold" style={{ color: accentColor }}>
          {score}
        </span>
      </div>
      <div className="w-full bg-surface-alt rounded-full h-2 mb-2">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: accentColor }}
        />
      </div>
      <div className="flex justify-between text-xs text-text-muted">
        <span>{factor.lowLabel}</span>
        <span>{factor.highLabel}</span>
      </div>
      <p className="text-xs text-text-secondary mt-2">
        {score >= 50 ? factor.highDescription : factor.lowDescription}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// V2 Bias Card (inline render for V2 shape)
// ---------------------------------------------------------------------------

function BiasCardV2({
  bias,
  severity,
  label,
  behavioralSignature,
}: {
  bias: string;
  severity: number;
  label: string;
  behavioralSignature: string;
}) {
  const getSeverityColor = (sev: number) => {
    if (sev >= 0.8) return "#FF6B6B";
    if (sev >= 0.6) return "#FFA500";
    return "#FFD93D";
  };

  const color = getSeverityColor(severity);

  return (
    <div className="flex items-start gap-3 p-2 rounded-md hover:bg-surface-alt transition-colors">
      <div
        className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold leading-tight">{label}</h4>
          <span className="text-xs font-mono text-text-muted flex-shrink-0">
            {Math.round(severity * 100)}%
          </span>
        </div>
        <p className="text-xs text-text-secondary mt-1">{behavioralSignature}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// V2 Results Page
// ---------------------------------------------------------------------------

export function V2ResultsDisplay({ profileV2 }: { profileV2: StoredDNAProfileV2 }) {
  const primaryArchetypeMeta = ARCHETYPE_INFO_V2[profileV2.archetype.primary];
  const secondaryArchetypeMeta = profileV2.archetype.secondary
    ? ARCHETYPE_INFO_V2[profileV2.archetype.secondary]
    : null;
  const accentColorV2 = ARCHETYPE_COLORS[profileV2.archetype.primary as ArchetypeKey] ?? "#2E8BEF";

  const activeBiasesV2 = [...profileV2.biasFlags]
    .filter((f) => f.severity > 0)
    .sort((a, b) => b.severity - a.severity);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Nav bar */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            href="/personality"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            ← Retake
          </Link>
          <span className="text-sm text-text-muted">
            V2 Assessment
          </span>
        </div>

        <div className="space-y-8">
          {/* ============================================================= */}
          {/* Hero / Archetype Card */}
          {/* ============================================================= */}
          <div
            className="border border-border rounded-xl p-6 sm:p-8 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${accentColorV2}10 0%, ${accentColorV2}05 50%, transparent 100%)`,
            }}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20"
              style={{ backgroundColor: accentColorV2 }}
            />

            <div className="relative">
              {/* Archetype icon */}
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                style={{
                  backgroundColor: `${accentColorV2}15`,
                  color: accentColorV2,
                }}
              >
                {ARCHETYPE_ICON_MAP[profileV2.archetype.primary as ArchetypeKey] ?? (
                  <Shield className="w-6 h-6" />
                )}
              </div>

              <div
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium mb-3"
                style={{ color: accentColorV2 }}
              >
                Your Investor Personality Type
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {primaryArchetypeMeta?.name ?? "Unknown Type"}
              </h1>
              <p className="text-text-secondary text-lg italic mb-4">
                &ldquo;{primaryArchetypeMeta?.tagline ?? ""}&rdquo;
              </p>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xl mx-auto mb-4">
                {primaryArchetypeMeta?.description ?? ""}
              </p>
              {secondaryArchetypeMeta && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                  style={{
                    color: ARCHETYPE_COLORS[profileV2.archetype.secondary as ArchetypeKey] ?? "#A0A0A0",
                    backgroundColor: `${ARCHETYPE_COLORS[profileV2.archetype.secondary as ArchetypeKey] ?? "#A0A0A0"}15`,
                  }}
                >
                  Secondary: {secondaryArchetypeMeta.name}
                </span>
              )}
            </div>
          </div>

          {/* ============================================================= */}
          {/* 1. Profile + Radar Chart (V2) */}
          {/* ============================================================= */}
          <Section
            number={1}
            label="Your Profile"
            title="Who You Are as an Investor"
            accentColor={accentColorV2}
          >
            <p className="text-sm text-text-secondary mb-6">
              Your investment style reflects eight core behavioral factors that shape how you
              process risk, opportunity, and financial change. These dimensions reveal the
              innate patterns driving your financial decisions.
            </p>

            <RadarChartV2
              factors={profileV2.factors.primary}
              accentColor={accentColorV2}
            />

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRIMARY_FACTORS.map((factor) => (
                <FactorDetail
                  key={factor.code}
                  factorCode={factor.code}
                  score={profileV2.factors.primary[factor.code].normalized}
                  accentColor={accentColorV2}
                />
              ))}
            </div>
          </Section>

          {/* ============================================================= */}
          {/* 2. Strengths & Vulnerabilities (V2) */}
          {/* ============================================================= */}
          <Section
            number={2}
            label="Assessment"
            title="Strengths & Vulnerabilities"
            accentColor={accentColorV2}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Strengths */}
              <div className="bg-surface border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {profileV2.strengths.map((strength, idx) => (
                    <li key={idx} className="text-xs text-text-secondary flex items-start gap-2">
                      <span className="text-green flex-shrink-0 mt-0.5">+</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vulnerabilities */}
              <div className="bg-surface border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-400 mb-3">Vulnerabilities</h3>
                <ul className="space-y-2">
                  {profileV2.vulnerabilities.map((vuln, idx) => (
                    <li key={idx} className="text-xs text-text-secondary flex items-start gap-2">
                      <span className="text-red-400 flex-shrink-0 mt-0.5">-</span>
                      <span>{vuln}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Behavioral Rule */}
            <div
              className="mt-4 rounded-xl p-5 border"
              style={{
                borderColor: `${accentColorV2}30`,
                backgroundColor: `${accentColorV2}08`,
              }}
            >
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-2"
                style={{ color: accentColorV2 }}
              >
                Your Behavioral Rule
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {profileV2.behavioralRule}
              </p>
            </div>
          </Section>

          {/* ============================================================= */}
          {/* 3. Behavioral Analysis (V2) */}
          {/* ============================================================= */}
          <Section
            number={3}
            label="Behavioral Analysis"
            title="Market Mood & Bias Profile"
            accentColor={accentColorV2}
          >
            <MarketMoodBadge
              mood={{
                state: profileV2.marketMood.state,
                panic_probability: profileV2.marketMood.panicProbability,
                fomo_probability: profileV2.marketMood.fomoProbability,
                impulse_trade_probability: profileV2.marketMood.impulseTradeProbability,
                reassurance_dependency: profileV2.marketMood.reassuranceDependency,
              }}
              accentColor={accentColorV2}
            />

            {activeBiasesV2.length > 0 && (
              <div className="bg-surface border border-border rounded-xl p-5 mt-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
                  Bias Profile
                </h3>
                <p className="text-xs text-text-muted mb-4">
                  {activeBiasesV2.length} behavioral bias
                  {activeBiasesV2.length !== 1 ? "es" : ""} detected
                </p>
                <div className="space-y-2">
                  {activeBiasesV2.slice(0, 5).map((bias) => (
                    <BiasCardV2
                      key={bias.bias}
                      bias={bias.bias}
                      severity={bias.severity}
                      label={bias.label}
                      behavioralSignature={bias.behavioralSignature}
                    />
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* ============================================================= */}
          {/* Assessment Metadata */}
          {/* ============================================================= */}
          <div className="bg-surface-alt rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>
                Completed{" "}
                {new Date(profileV2.timestamp).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>Confidence: {profileV2.confidence.overall}%</span>
            </div>

            {profileV2.confidence.socialDesirability.flagged && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-200">
                Social Desirability Index is elevated — results may reflect how you want to
                behave rather than your natural tendencies.
              </div>
            )}
          </div>

          {/* ============================================================= */}
          {/* CTAs */}
          {/* ============================================================= */}
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <Link
              href="/research"
              className="flex-1 px-5 py-3 rounded-lg font-medium text-center text-white hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
              style={{ backgroundColor: accentColorV2 }}
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
          </div>
        </div>
      </div>
    </div>
  );
}
