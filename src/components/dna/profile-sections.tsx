"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Zap,
  Compass,
  Clock,
  Target,
  Heart,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { DimKey } from "@/lib/financial-dna";
import {
  DIMENSION_LABELS,
  DIMENSION_DESCRIPTIONS,
  ARCHETYPE_INFO,
  type DNAProfile,
  type BiasFlag,
} from "@/lib/dna-scoring";

// ---------------------------------------------------------------------------
// Dimension icons
// ---------------------------------------------------------------------------

const dimIcons: Record<DimKey, React.ReactNode> = {
  R: <Zap className="w-4 h-4" />,
  C: <Compass className="w-4 h-4" />,
  H: <Clock className="w-4 h-4" />,
  D: <Target className="w-4 h-4" />,
  E: <Heart className="w-4 h-4" />,
};

// ---------------------------------------------------------------------------
// Portfolio implications per dimension
// ---------------------------------------------------------------------------

const PORTFOLIO_IMPLICATIONS: Record<DimKey, { high: string; low: string }> = {
  R: {
    high: "You can handle growth-heavy allocations without panic selling.",
    low: "Favor bonds and blue-chip stocks to reduce portfolio volatility.",
  },
  C: {
    high: "Self-directed accounts suit you -- you thrive with full control over picks.",
    low: "A managed portfolio or robo-advisor may lower decision fatigue.",
  },
  H: {
    high: "Compound interest is your best friend -- maximize long-term equity exposure.",
    low: "Consider shorter-duration assets and take profits more frequently.",
  },
  D: {
    high: "Automate your DCA schedule -- your follow-through makes consistency easy.",
    low: "Automate contributions -- your follow-through improves with less manual effort.",
  },
  E: {
    high: "You can ride out corrections -- use that steadiness to buy dips strategically.",
    low: "Set stop-loss rules in advance so emotions never drive sell decisions.",
  },
};

// ---------------------------------------------------------------------------
// Score color helpers
// ---------------------------------------------------------------------------

function getScoreColor(value: number): string {
  if (value >= 70) return "#00C853";
  if (value >= 40) return "#FFD740";
  return "#FF5252";
}

function getScoreDescriptor(value: number): string {
  if (value >= 70) return "High";
  if (value >= 40) return "Moderate";
  return "Low";
}

// ---------------------------------------------------------------------------
// ScoreGauge -- animated circular progress indicator
// ---------------------------------------------------------------------------

export function ScoreGauge({
  value,
  label,
  dimKey,
  accentColor,
}: {
  value: number;
  label: string;
  dimKey: DimKey;
  accentColor?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const color = accentColor ?? getScoreColor(value);
  const descriptor = getScoreDescriptor(value);

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2A2A2A"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{
              strokeDashoffset: prefersReducedMotion
                ? circumference - progress
                : circumference,
            }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1, ease: "easeOut" }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>
            {value}
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-text-muted">{dimIcons[dimKey]}</span>
          <span className="text-sm font-semibold">{label}</span>
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded"
            style={{ color, backgroundColor: `${color}15` }}
          >
            {value} / 100
          </span>
        </div>
        <p className="text-xs text-text-muted">{descriptor}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DimensionDetail -- expandable card with portfolio implication
// ---------------------------------------------------------------------------

export function DimensionDetail({
  dimKey,
  value,
  accentColor,
}: {
  dimKey: DimKey;
  value: number;
  accentColor?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isHigh = value >= 50;
  const desc = isHigh
    ? DIMENSION_DESCRIPTIONS[dimKey].high
    : DIMENSION_DESCRIPTIONS[dimKey].low;
  const implication = isHigh
    ? PORTFOLIO_IMPLICATIONS[dimKey].high
    : PORTFOLIO_IMPLICATIONS[dimKey].low;
  const color = getScoreColor(value);
  const descriptor = getScoreDescriptor(value);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <ScoreGauge
            value={value}
            label={DIMENSION_LABELS[dimKey]}
            dimKey={dimKey}
            accentColor={accentColor}
          />
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border animate-fade-in">
          <div className="my-3">
            <div className="flex items-center justify-between text-xs text-text-muted mb-1">
              <span>0</span>
              <span style={{ color }}>{descriptor}</span>
              <span>100</span>
            </div>
            <div className="w-full bg-surface-alt rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${value}%`, backgroundColor: color }}
              />
            </div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            {desc}
          </p>
          <div
            className="text-xs rounded-lg p-2.5 border"
            style={{
              borderColor: `${accentColor ?? color}30`,
              backgroundColor: `${accentColor ?? color}08`,
            }}
          >
            <span className="font-semibold" style={{ color: accentColor ?? color }}>
              Portfolio implication:
            </span>{" "}
            <span className="text-text-secondary">{implication}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BiasCard
// ---------------------------------------------------------------------------

export function BiasCard({ bias }: { bias: BiasFlag }) {
  if (bias.severity === 0) return null;

  const severityLabel =
    bias.severity >= 3 ? "High" : bias.severity >= 2 ? "Moderate" : "Low";
  const severityColor =
    bias.severity >= 3 ? "#FF5252" : bias.severity >= 2 ? "#FFD740" : "#A0A0A0";

  return (
    <div className="flex items-start gap-3 bg-surface-alt rounded-lg p-3">
      <AlertTriangle
        className="w-4 h-4 flex-shrink-0 mt-0.5"
        style={{ color: severityColor }}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium">{bias.label}</span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{ color: severityColor, backgroundColor: `${severityColor}15` }}
          >
            {severityLabel}
          </span>
        </div>
        <p className="text-xs text-text-muted">{bias.behavioral_signature}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MarketMoodBadge
// ---------------------------------------------------------------------------

const moodConfig: Record<string, { label: string; color: string; desc: string }> = {
  panicked: {
    label: "Panicked",
    color: "#FF5252",
    desc: "Under high stress, you're likely to make fear-driven decisions. Pre-commitment rules are critical.",
  },
  reactive: {
    label: "Reactive",
    color: "#FF8A65",
    desc: "You check often and react to short-term moves. Reducing monitoring frequency would help.",
  },
  euphoric: {
    label: "Euphoric",
    color: "#FFD740",
    desc: "You're susceptible to FOMO and trend-chasing. Adding friction before buys protects you.",
  },
  concerned: {
    label: "Concerned",
    color: "#FFD740",
    desc: "You worry about markets but don't always act on it. Building simple rules reduces anxiety.",
  },
  steady: {
    label: "Steady",
    color: "#00C853",
    desc: "You handle market stress well. Your emotional baseline supports good decision-making.",
  },
};

export function MarketMoodBadge({
  mood,
  accentColor,
}: {
  mood: DNAProfile["marketMood"];
  accentColor?: string;
}) {
  const config = moodConfig[mood.state] ?? moodConfig.steady;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
        Market Mood Profile
      </h3>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        <span className="text-lg font-semibold" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>
      <p className="text-sm text-text-secondary mb-4">{config.desc}</p>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-alt rounded-lg p-2.5 text-center">
          <p className="text-xs text-text-muted mb-0.5">Panic</p>
          <p className="text-sm font-mono font-medium">
            {(mood.panic_probability * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-surface-alt rounded-lg p-2.5 text-center">
          <p className="text-xs text-text-muted mb-0.5">FOMO</p>
          <p className="text-sm font-mono font-medium">
            {(mood.fomo_probability * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-surface-alt rounded-lg p-2.5 text-center">
          <p className="text-xs text-text-muted mb-0.5">Impulse</p>
          <p className="text-sm font-mono font-medium">
            {(mood.impulse_trade_probability * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CommunicationStyle
// ---------------------------------------------------------------------------

export function CommunicationStyle({
  archetypeKey,
  accentColor,
}: {
  archetypeKey: string;
  accentColor?: string;
}) {
  const archetype = ARCHETYPE_INFO[archetypeKey as keyof typeof ARCHETYPE_INFO];
  if (!archetype) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
        Communication Style
      </h3>
      <p className="text-sm text-text-secondary mb-2">
        <span className="text-text-primary font-medium">
          What you need from any financial tool or advisor:
        </span>
      </p>
      <p
        className="text-sm text-text-secondary rounded-lg p-3 italic border"
        style={{
          borderColor: `${accentColor ?? "#00C853"}20`,
          backgroundColor: `${accentColor ?? "#00C853"}08`,
        }}
      >
        {archetype.communicationRule}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StrengthsVulnerabilities -- side-by-side cards
// ---------------------------------------------------------------------------

export function StrengthsVulnerabilities({
  strengths,
  vulnerabilities,
  accentColor,
}: {
  strengths: string[];
  vulnerabilities: string[];
  accentColor?: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3
          className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
          style={{ color: accentColor ?? "#00C853" }}
        >
          <CheckCircle className="w-4 h-4" />
          Strengths
        </h3>
        <ul className="space-y-2">
          {strengths.map((s, i) => (
            <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
              <span
                className="mt-0.5 flex-shrink-0"
                style={{ color: accentColor ?? "#00C853" }}
              >
                +
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-gold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Vulnerabilities
        </h3>
        <ul className="space-y-2">
          {vulnerabilities.map((s, i) => (
            <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
              <span className="text-gold mt-0.5 flex-shrink-0">!</span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
