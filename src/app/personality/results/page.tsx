"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap,
  Clock,
  Target,
  Heart,
  Compass,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  Mail,
  Check,
  ExternalLink,
} from "lucide-react";
import { type DimKey, DIMENSION_KEYS, type BiasKey, type ArchetypeKey } from "@/lib/financial-dna";
import {
  DIMENSION_LABELS,
  DIMENSION_DESCRIPTIONS,
  ARCHETYPE_INFO,
  type DNAProfile,
  type BiasFlag,
} from "@/lib/dna-scoring";
import {
  loadDNAProfile,
  exportDNAProfile,
  type StoredDNAProfile,
} from "@/lib/dna-storage";

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
// Radar chart (SVG) -- 5-point pentagon
// ---------------------------------------------------------------------------

function RadarChart({ dimensions }: { dimensions: DNAProfile["dimensions"] }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 100;
  const keys: DimKey[] = ["R", "C", "H", "D", "E"];
  const labels = ["Risk", "Control", "Horizon", "Discipline", "Emotion"];

  // Calculate pentagon points for a given scale (0-1)
  function getPoints(scale: number): string {
    return keys
      .map((_, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x = cx + radius * scale * Math.cos(angle);
        const y = cy + radius * scale * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");
  }

  // Data points
  const dataPoints = keys.map((k, i) => {
    const scale = dimensions[k] / 100;
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return {
      x: cx + radius * scale * Math.cos(angle),
      y: cy + radius * scale * Math.sin(angle),
      value: dimensions[k],
    };
  });

  // Label positions (pushed further out)
  const labelPositions = keys.map((_, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return {
      x: cx + (radius + 28) * Math.cos(angle),
      y: cy + (radius + 28) * Math.sin(angle),
    };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[260px] mx-auto">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1.0].map((scale) => (
        <polygon
          key={scale}
          points={getPoints(scale)}
          fill="none"
          stroke="#2A2A2A"
          strokeWidth="0.5"
        />
      ))}

      {/* Axis lines */}
      {keys.map((_, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x2 = cx + radius * Math.cos(angle);
        const y2 = cy + radius * Math.sin(angle);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke="#2A2A2A"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="rgba(0, 200, 83, 0.15)"
        stroke="#00C853"
        strokeWidth="2"
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#00C853"
        />
      ))}

      {/* Labels */}
      {labelPositions.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#A0A0A0"
          fontSize="10"
          fontFamily="Inter, sans-serif"
        >
          {labels[i]}
        </text>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Circular score gauge (like the report reference)
// ---------------------------------------------------------------------------

function ScoreGauge({
  value,
  label,
  dimKey,
}: {
  value: number;
  label: string;
  dimKey: DimKey;
}) {
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  const descriptor =
    value >= 70 ? "High" : value >= 40 ? "Moderate" : "Low";

  const color =
    value >= 70 ? "#00C853" : value >= 40 ? "#FFD740" : "#FF5252";

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
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-all duration-1000 ease-out"
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
            style={{
              color,
              backgroundColor: `${color}15`,
            }}
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
// Dimension detail card (expandable)
// ---------------------------------------------------------------------------

function DimensionDetail({
  dimKey,
  value,
}: {
  dimKey: DimKey;
  value: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isHigh = value >= 50;
  const desc = isHigh
    ? DIMENSION_DESCRIPTIONS[dimKey].high
    : DIMENSION_DESCRIPTIONS[dimKey].low;

  const color =
    value >= 70 ? "#00C853" : value >= 40 ? "#FFD740" : "#FF5252";
  const descriptor =
    value >= 70 ? "High" : value >= 40 ? "Moderate" : "Low";

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
          {/* Score bar */}
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
          <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bias card
// ---------------------------------------------------------------------------

function BiasCard({ bias }: { bias: BiasFlag }) {
  if (bias.severity === 0) return null;

  const severityLabel =
    bias.severity >= 3
      ? "High"
      : bias.severity >= 2
        ? "Moderate"
        : "Low";

  const severityColor =
    bias.severity >= 3
      ? "#FF5252"
      : bias.severity >= 2
        ? "#FFD740"
        : "#A0A0A0";

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
            style={{
              color: severityColor,
              backgroundColor: `${severityColor}15`,
            }}
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
// Market mood badge
// ---------------------------------------------------------------------------

function MarketMoodBadge({ mood }: { mood: DNAProfile["marketMood"] }) {
  const moodConfig: Record<
    string,
    { label: string; color: string; desc: string }
  > = {
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
// Share with Advisor -- encoding / decoding
// ---------------------------------------------------------------------------

interface SharedProfile {
  dimensions: DNAProfile["dimensions"];
  archetype: string;
  secondaryArchetype?: string;
  strengths: string[];
  vulnerabilities: string[];
  behavioralRule: string;
  biasFlags: BiasFlag[];
  marketMood: DNAProfile["marketMood"];
  confidence: { overall: number };
  completedAt: string;
}

function encodeProfileForSharing(profile: StoredDNAProfile): string {
  const payload: SharedProfile = {
    dimensions: { ...profile.dimensions },
    archetype: profile.communicationArchetype,
    secondaryArchetype: profile.secondaryArchetype ?? undefined,
    strengths: [...profile.strengths],
    vulnerabilities: [...profile.vulnerabilities],
    behavioralRule: profile.behavioralRule,
    biasFlags: profile.biasFlags.map((b) => ({ ...b })),
    marketMood: { ...profile.marketMood },
    confidence: { overall: profile.confidence.overall },
    completedAt: profile.completedAt,
  };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

function decodeSharedProfile(hash: string): SharedProfile | null {
  try {
    const jsonStr = decodeURIComponent(atob(hash));
    return JSON.parse(jsonStr) as SharedProfile;
  } catch {
    return null;
  }
}

function buildProfileSummary(
  profile: StoredDNAProfile | SharedProfile,
  archetype: string
): string {
  const dims = profile.dimensions;
  const lines = [
    "Financial DNA Assessment Results",
    "================================",
    "",
    `Investor Type: ${archetype}`,
    "",
    "Dimension Scores:",
    `  Risk Tolerance:  ${dims.R}/100`,
    `  Control Need:    ${dims.C}/100`,
    `  Time Horizon:    ${dims.H}/100`,
    `  Discipline:      ${dims.D}/100`,
    `  Emotional Reg:   ${dims.E}/100`,
    "",
    "Strengths:",
    ...profile.strengths.map((s) => `  + ${s}`),
    "",
    "Vulnerabilities:",
    ...profile.vulnerabilities.map((v) => `  ! ${v}`),
    "",
    `Behavioral Rule: ${profile.behavioralRule}`,
    "",
    "---",
    "Generated by StockPilot Financial DNA Assessment",
  ];
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Share panel component
// ---------------------------------------------------------------------------

function SharePanel({
  profile,
  onClose,
}: {
  profile: StoredDNAProfile;
  onClose: () => void;
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const archetype = ARCHETYPE_INFO[profile.communicationArchetype];
  const archetypeName = archetype?.name ?? profile.communicationArchetype;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/personality/results#shared=${encodeProfileForSharing(profile)}`
      : "";

  const summary = buildProfileSummary(profile, archetypeName);

  const emailSubject = encodeURIComponent("My Financial DNA Assessment Results");
  const emailBody = encodeURIComponent(
    `Hi,\n\nI completed a Financial DNA risk assessment and wanted to share my results with you.\n\nYou can view my full profile here:\n${shareUrl}\n\nOr see the summary below:\n\n${summary}`
  );
  const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback: select a hidden input
    }
  }, [shareUrl]);

  const handleCopySummary = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // Fallback
    }
  }, [summary]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Share with Advisor</h2>
              <p className="text-xs text-text-muted mt-1">
                Send your Financial DNA results to your financial advisor
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-secondary transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Shareable link */}
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">
              Shareable Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-surface-alt border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-muted truncate">
                {shareUrl.slice(0, 60)}...
              </div>
              <button
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  copiedLink
                    ? "bg-green/10 text-green border border-green/30"
                    : "bg-surface-alt border border-border text-text-secondary hover:border-green/30"
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-1">
              Your advisor can view your full profile at this link -- no login required.
            </p>
          </div>

          {/* Copy summary */}
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">
              Text Summary
            </label>
            <div className="bg-surface-alt border border-border rounded-lg p-3 text-[11px] text-text-secondary font-mono leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
              {summary.slice(0, 300)}...
            </div>
            <button
              onClick={handleCopySummary}
              className={`mt-2 w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                copiedSummary
                  ? "bg-green/10 text-green border border-green/30"
                  : "bg-surface-alt border border-border text-text-secondary hover:border-green/30"
              }`}
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied to clipboard
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Full Summary
                </>
              )}
            </button>
          </div>

          {/* Email button */}
          <a
            href={mailtoLink}
            className="w-full px-4 py-2.5 rounded-lg bg-green text-background text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-dark transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email to Advisor
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared profile banner
// ---------------------------------------------------------------------------

function SharedBanner() {
  return (
    <div className="bg-blue-bg border border-blue/20 rounded-xl p-4 mb-6 flex items-start gap-3">
      <ExternalLink className="w-4 h-4 text-blue flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-blue">Shared Assessment</p>
        <p className="text-xs text-text-secondary mt-0.5">
          This Financial DNA profile was shared with you for review. The data is
          read-only and comes directly from the investor&apos;s completed assessment.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main results page
// ---------------------------------------------------------------------------

export default function DNAResultsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StoredDNAProfile | null>(null);
  const [sharedProfile, setSharedProfile] = useState<SharedProfile | null>(null);
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
        // Invalid shared link -- fall through to load local profile
      }
    }

    // Otherwise load from localStorage
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

  // Shared view: build a display-only profile from the decoded data
  const isSharedView = sharedProfile !== null && profile === null;

  // Build the display values from either the real profile or the shared data
  const displayDimensions = isSharedView ? sharedProfile.dimensions : profile!.dimensions;
  const displayArchetypeKey = isSharedView ? sharedProfile.archetype : profile!.communicationArchetype;
  const displaySecondaryKey = isSharedView ? sharedProfile.secondaryArchetype : profile!.secondaryArchetype;
  const displayStrengths = isSharedView ? sharedProfile.strengths : profile!.strengths;
  const displayVulnerabilities = isSharedView ? sharedProfile.vulnerabilities : profile!.vulnerabilities;
  const displayBehavioralRule = isSharedView ? sharedProfile.behavioralRule : profile!.behavioralRule;
  const displayBiasFlags = isSharedView ? sharedProfile.biasFlags : profile!.biasFlags;
  const displayMarketMood = isSharedView ? sharedProfile.marketMood : profile!.marketMood;
  const displayConfidence = isSharedView ? sharedProfile.confidence.overall : profile!.confidence.overall;
  const displayCompletedAt = isSharedView ? sharedProfile.completedAt : profile!.completedAt;

  const archetype = ARCHETYPE_INFO[displayArchetypeKey as ArchetypeKey];
  const secondaryArchetype = displaySecondaryKey
    ? ARCHETYPE_INFO[displaySecondaryKey as ArchetypeKey]
    : null;

  const activeBiases = displayBiasFlags
    .filter((f) => f.severity > 0)
    .sort((a, b) => b.severity - a.severity);

  const handleExport = () => {
    const json = exportDNAProfile();
    if (!json) return;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-dna-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 print:pt-4 print:px-8">
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

        {/* Nav */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            href="/personality"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isSharedView ? "Take Assessment" : "Retake"}
          </Link>
          <div className="flex items-center gap-2">
            {!isSharedView && (
              <>
                <button
                  onClick={() => setShowSharePanel(true)}
                  className="text-sm text-text-muted hover:text-text-secondary transition-colors inline-flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share with Advisor
                </button>
                <button
                  onClick={handleExport}
                  className="text-sm text-text-muted hover:text-text-secondary transition-colors inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export JSON
                </button>
              </>
            )}
            <button
              onClick={handlePrint}
              className="text-sm text-green hover:text-green-light transition-colors inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Print / PDF
            </button>
          </div>
        </div>

        <div className="space-y-6 animate-fade-in">
          {/* ============================================================= */}
          {/* Cover / Archetype Card */}
          {/* ============================================================= */}
          <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 text-center relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 text-green text-xs uppercase tracking-widest font-medium mb-4">
                <Shield className="w-3.5 h-3.5" />
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
              {secondaryArchetype && (
                <p className="text-xs text-text-muted">
                  Secondary type:{" "}
                  <span className="text-text-secondary font-medium">
                    {secondaryArchetype.name}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* ============================================================= */}
          {/* Radar Chart + Dimension Overview */}
          {/* ============================================================= */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-green mb-1">
              Understanding Your Profile
            </h3>
            <h2 className="text-xl font-bold mb-6">
              Who You Are as an Investor
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              Your investment style isn&apos;t just a strategy. It&apos;s a window
              into how you process uncertainty, manage anxiety, and relate
              to the future. These five dimensions map the behavioral
              patterns that shape every financial decision you make.
            </p>

            <RadarChart dimensions={displayDimensions} />

            <div className="mt-6 space-y-3">
              {DIMENSION_KEYS.map((k) => (
                <DimensionDetail
                  key={k}
                  dimKey={k}
                  value={displayDimensions[k]}
                />
              ))}
            </div>
          </div>

          {/* ============================================================= */}
          {/* Strengths & Vulnerabilities */}
          {/* ============================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-green flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {displayStrengths.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm text-text-secondary flex items-start gap-2"
                  >
                    <span className="text-green mt-0.5 flex-shrink-0">+</span>
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
                {displayVulnerabilities.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm text-text-secondary flex items-start gap-2"
                  >
                    <span className="text-gold mt-0.5 flex-shrink-0">!</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ============================================================= */}
          {/* Behavioral Rule */}
          {/* ============================================================= */}
          <div className="bg-green-bg border border-green/20 rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-green">
              Your Behavioral Rule
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {displayBehavioralRule}
            </p>
          </div>

          {/* ============================================================= */}
          {/* Market Mood */}
          {/* ============================================================= */}
          <MarketMoodBadge mood={displayMarketMood} />

          {/* ============================================================= */}
          {/* Bias Profile */}
          {/* ============================================================= */}
          {activeBiases.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-1">
                Bias Profile
              </h3>
              <p className="text-xs text-text-muted mb-4">
                {activeBiases.length} behavioral bias
                {activeBiases.length !== 1 ? "es" : ""} detected
              </p>
              <div className="space-y-2">
                {activeBiases.slice(0, 5).map((bias) => (
                  <BiasCard key={bias.bias} bias={bias} />
                ))}
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* Communication Style */}
          {/* ============================================================= */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
              Communication Style
            </h3>
            <p className="text-sm text-text-secondary mb-2">
              <span className="text-text-primary font-medium">
                What you need from any financial tool or advisor:
              </span>
            </p>
            <p className="text-sm text-text-secondary bg-surface-alt rounded-lg p-3 italic">
              {archetype?.communicationRule ?? ""}
            </p>
          </div>

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
            <span>
              Confidence: {displayConfidence}%
            </span>
          </div>

          {/* ============================================================= */}
          {/* Actions */}
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
                  className="flex-1 bg-green text-black px-5 py-3 rounded-lg font-medium text-center hover:bg-green-light transition-colors inline-flex items-center justify-center gap-2"
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
