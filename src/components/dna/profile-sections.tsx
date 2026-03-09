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
import type { DimKey, ArchetypeKey } from "@/lib/financial-dna";
import {
  DIMENSION_LABELS,
  DIMENSION_DESCRIPTIONS,
  ARCHETYPE_INFO,
  type DNAProfile,
  type BiasFlag,
} from "@/lib/dna-scoring";
import {
  getDimensionCoaching,
  BIAS_EDUCATION,
  ARCHETYPE_CONTENT,
} from "@/lib/archetype-content";

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
  if (value >= 70) return "#006DD8";
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
            stroke="#e5e5e7"
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
  const color = getScoreColor(value);
  const descriptor = getScoreDescriptor(value);
  const coaching = getDimensionCoaching(dimKey, value);

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
            {coaching.averageRange && (
              <p className="text-[10px] text-text-muted mt-1">
                Most investors score {coaching.averageRange} on this dimension
              </p>
            )}
          </div>

          {/* Interpretation */}
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            {coaching.interpretation || desc}
          </p>

          {/* In practice */}
          {coaching.inPractice && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-text-primary mb-1">In practice, this means:</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                {coaching.inPractice}
              </p>
            </div>
          )}

          {/* Portfolio implication */}
          <div
            className="text-xs rounded-lg p-2.5 border mb-3"
            style={{
              borderColor: `${accentColor ?? color}30`,
              backgroundColor: `${accentColor ?? color}08`,
            }}
          >
            <span className="font-semibold" style={{ color: accentColor ?? color }}>
              Portfolio implication:
            </span>{" "}
            <span className="text-text-secondary">
              {coaching.portfolioImplication || (isHigh ? PORTFOLIO_IMPLICATIONS[dimKey].high : PORTFOLIO_IMPLICATIONS[dimKey].low)}
            </span>
          </div>

          {/* Watch out */}
          {coaching.watchOut && (
            <div className="flex items-start gap-2 text-xs mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-gold">Watch out: </span>
                <span className="text-text-secondary">{coaching.watchOut}</span>
              </div>
            </div>
          )}

          {/* Coaching tip */}
          {coaching.tip && (
            <div
              className="text-xs rounded-lg p-2.5 border"
              style={{
                borderColor: `${accentColor ?? color}20`,
                backgroundColor: `${accentColor ?? color}05`,
              }}
            >
              <span className="font-semibold" style={{ color: accentColor ?? color }}>
                Tip:
              </span>{" "}
              <span className="text-text-secondary">{coaching.tip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BiasCard
// ---------------------------------------------------------------------------

export function BiasCard({
  bias,
  archetypeKey,
}: {
  bias: BiasFlag;
  archetypeKey?: ArchetypeKey;
}) {
  const [expanded, setExpanded] = useState(false);
  if (bias.severity === 0) return null;

  const severityLabel =
    bias.severity >= 3 ? "High" : bias.severity >= 2 ? "Moderate" : "Low";
  const severityColor =
    bias.severity >= 3 ? "#FF5252" : bias.severity >= 2 ? "#FFD740" : "#A0A0A0";
  const education = BIAS_EDUCATION[bias.bias];

  return (
    <div className="bg-surface-alt rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-3 hover:bg-surface-hover transition-colors text-left"
      >
        <AlertTriangle
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          style={{ color: severityColor }}
        />
        <div className="min-w-0 flex-1">
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
        {education && (
          expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted flex-shrink-0 mt-1" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0 mt-1" />
          )
        )}
      </button>
      {expanded && education && (
        <div className="px-3 pb-3 pt-0 border-t border-border/50 animate-fade-in">
          <div className="mt-3 space-y-2.5">
            {/* Definition */}
            <p className="text-xs text-text-secondary leading-relaxed">
              {education.definition}
            </p>

            {/* Real world example */}
            <div className="text-xs text-text-secondary bg-surface rounded-lg p-2.5 border border-border/50">
              <span className="font-semibold text-text-primary">Sound familiar? </span>
              {education.realWorldExample}
            </div>

            {/* Archetype-specific interaction */}
            {archetypeKey && education.archetypeInteraction[archetypeKey] && (
              <div className="text-xs text-text-secondary bg-surface rounded-lg p-2.5 border border-border/50">
                <span className="font-semibold text-text-primary">How this affects your type: </span>
                {education.archetypeInteraction[archetypeKey]}
              </div>
            )}

            {/* Countermeasure */}
            <div
              className="text-xs rounded-lg p-2.5 border"
              style={{
                borderColor: "#006DD830",
                backgroundColor: "#006DD808",
              }}
            >
              <span className="font-semibold text-green">Countermeasure: </span>
              <span className="text-text-secondary">{education.countermeasure}</span>
            </div>
          </div>
        </div>
      )}
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
    color: "#006DD8",
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

  const content = ARCHETYPE_CONTENT[archetypeKey as ArchetypeKey];
  const starters = content?.advisorStarters ?? [];

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
        className="text-sm text-text-secondary rounded-lg p-3 italic border mb-4"
        style={{
          borderColor: `${accentColor ?? "#006DD8"}20`,
          backgroundColor: `${accentColor ?? "#006DD8"}08`,
        }}
      >
        {archetype.communicationRule}
      </p>

      {starters.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-primary mb-2">
            Conversation starters for your advisor:
          </p>
          <div className="space-y-2">
            {starters.map((starter, i) => (
              <div
                key={i}
                className="text-xs text-text-secondary bg-surface-alt rounded-lg p-2.5 flex items-start gap-2"
              >
                <span
                  className="font-mono font-bold flex-shrink-0 mt-px"
                  style={{ color: accentColor ?? "#006DD8" }}
                >
                  {i + 1}.
                </span>
                <span>&ldquo;{starter}&rdquo;</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Strength leverage tips (keyed by text prefix from dim-based generation)
// ---------------------------------------------------------------------------

const STRENGTH_LEVERAGE: Record<string, { leverage: string; example: string }> = {
  "Comfortable with market volatility": {
    leverage: "Use your calm during downturns to dollar-cost average when others are panicking. Your ability to stay rational under pressure is a genuine competitive edge.",
    example: "Next time markets drop 5%+, instead of watching from the sidelines, review your watchlist for buying opportunities you've pre-identified.",
  },
  "Strong decision-making autonomy": {
    leverage: "Channel your independence into deep research rather than quick decisions. Your best moves come from conviction backed by evidence, not speed.",
    example: "Before your next trade, write a one-paragraph thesis explaining your reasoning. If you can't, the conviction isn't real yet.",
  },
  "Natural long-term thinker": {
    leverage: "Maximize your time horizon advantage by focusing on companies with strong compounding characteristics. Patience is the rarest edge in investing.",
    example: "Set a calendar reminder to review your portfolio only quarterly. Between reviews, redirect urges to trade into research instead.",
  },
  "Disciplined execution": {
    leverage: "Build on your consistency by creating a written investment policy statement (IPS). Your follow-through turns plans into results faster than most investors.",
    example: "This week, write down your 3 core investing rules. Post them where you trade. Your discipline makes rules more powerful than algorithms.",
  },
  "Emotionally regulated": {
    leverage: "Use your emotional steadiness to be the last one out during corrections. While others panic-sell, your composure lets you buy quality assets at discounts.",
    example: "Keep a 'buy list' of stocks you'd love to own at lower prices. When a correction hits, you'll act while others freeze.",
  },
  "Self-awareness": {
    leverage: "Your willingness to assess yourself honestly puts you ahead of most investors. Turn that self-awareness into a journaling habit to track your decisions.",
    example: "Start a simple trade journal: what you bought/sold, why, and how you felt. Review it monthly to spot patterns.",
  },
};

const VULN_MANAGEMENT: Record<string, { manage: string; example: string }> = {
  "Loss sensitivity may cause": {
    manage: "Pre-commit to holding periods and exit rules before entering positions. When the urge to sell hits during a dip, your written rules override your emotions.",
    example: "Next time you feel the urge to sell a falling stock, pull up your original thesis. If nothing fundamental changed, close the app and wait 48 hours.",
  },
  "You may over-rely on others": {
    manage: "Limit your information sources to 2-3 trusted ones. Write down your own analysis before reading anyone else's take to avoid being anchored by external opinions.",
    example: "Before your next investment decision, write your thesis independently. Only then read analysts' views to check your blind spots.",
  },
  "Short-term focus can lead": {
    manage: "Visualize your compound growth trajectory with a calculator. Seeing the exponential curve makes short-term patience feel like an investment, not a sacrifice.",
    example: "Set up auto-invest contributions so the decision is made once. Your short-term brain doesn't get a vote on the long-term plan.",
  },
  "Without structured habits": {
    manage: "Externalize your discipline through automation and calendar reminders. The less willpower required, the more consistent you'll become.",
    example: "This week, automate at least one financial habit: DCA contribution, portfolio check schedule, or rebalancing alert.",
  },
  "Emotional reactivity during": {
    manage: "Create a 'crisis protocol' now while you're calm: specific rules for what you'll do when markets drop 10%, 20%, 30%. Pre-made decisions beat in-the-moment reactions.",
    example: "Write a sticky note with one rule: 'I do not sell during a market drop. I follow my plan.' Put it on your monitor.",
  },
  "No critical vulnerabilities": {
    manage: "Your balanced profile is strong, but complacency itself is a risk. Schedule quarterly self-assessments to ensure you stay sharp.",
    example: "Set a recurring calendar event to retake this assessment every quarter and compare your scores over time.",
  },
};

function findCoaching(text: string, map: Record<string, { leverage?: string; manage?: string; example: string }>): { tip: string; example: string } | null {
  for (const [prefix, coaching] of Object.entries(map)) {
    if (text.startsWith(prefix)) {
      return {
        tip: ("leverage" in coaching ? coaching.leverage : coaching.manage) ?? "",
        example: coaching.example,
      };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Expandable strength/vulnerability item
// ---------------------------------------------------------------------------

function ExpandableItem({
  text,
  tipLabel,
  tip,
  example,
  bulletColor,
  bulletChar,
}: {
  text: string;
  tipLabel: string;
  tip: string | null;
  example: string | null;
  bulletColor: string;
  bulletChar: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasContent = tip || example;

  return (
    <li className="text-sm text-text-secondary">
      <button
        onClick={() => hasContent && setExpanded(!expanded)}
        className={`flex items-start gap-2 text-left w-full ${hasContent ? "cursor-pointer" : ""}`}
      >
        <span className="mt-0.5 flex-shrink-0" style={{ color: bulletColor }}>
          {bulletChar}
        </span>
        <span className="flex-1">{text}</span>
        {hasContent && (
          expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted flex-shrink-0 mt-1" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0 mt-1" />
          )
        )}
      </button>
      {expanded && (tip || example) && (
        <div className="ml-5 mt-2 space-y-2 animate-fade-in">
          {tip && (
            <p className="text-xs text-text-secondary leading-relaxed">
              <span className="font-semibold" style={{ color: bulletColor }}>{tipLabel}: </span>
              {tip}
            </p>
          )}
          {example && (
            <p className="text-xs text-text-muted bg-surface-alt rounded-lg p-2.5 leading-relaxed italic">
              {example}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// StrengthsVulnerabilities -- expandable cards with coaching
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
  const color = accentColor ?? "#006DD8";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3
          className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
          style={{ color }}
        >
          <CheckCircle className="w-4 h-4" />
          Strengths
        </h3>
        <ul className="space-y-2">
          {strengths.map((s, i) => {
            const coaching = findCoaching(s, STRENGTH_LEVERAGE);
            return (
              <ExpandableItem
                key={i}
                text={s}
                tipLabel="How to leverage this"
                tip={coaching?.tip ?? null}
                example={coaching?.example ?? null}
                bulletColor={color}
                bulletChar="+"
              />
            );
          })}
        </ul>
      </div>
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-gold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Vulnerabilities
        </h3>
        <ul className="space-y-2">
          {vulnerabilities.map((s, i) => {
            const coaching = findCoaching(s, VULN_MANAGEMENT);
            return (
              <ExpandableItem
                key={i}
                text={s}
                tipLabel="How to manage this"
                tip={coaching?.tip ?? null}
                example={coaching?.example ?? null}
                bulletColor="#FFD740"
                bulletChar="!"
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
}
