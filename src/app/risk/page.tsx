"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  TrendingDown,
  Activity,
  Target,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";
import { loadPortfolio } from "@/lib/portfolio-storage";
import { loadDNAProfile, type StoredDNAProfile } from "@/lib/dna-storage";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import { ARCHETYPE_COLORS } from "@/components/dna/archetype-colors";
import {
  analyzePortfolioRisk,
  type RiskAnalysis,
  type RiskDimension,
  type RiskAlert,
  type StressScenario,
  type PositionRisk,
} from "@/lib/risk-calculator";

// ─── Archetype-Specific Risk Coaching ──────────────────────────────────

const RISK_COACHING: Record<string, string> = {
  systems_builder:
    "As a Money Architect, your portfolio should reflect systematic rules -- not drift. If any risk dimension exceeds your threshold, it means the system needs recalibration, not emotional reaction.",
  reassurance_seeker:
    "As a Steady Hand, elevated risk scores can trigger anxiety. Focus on the thresholds, not the absolutes. If you're within your personal comfort zone, the portfolio is working as designed.",
  analytical_skeptic:
    "As a Market Surgeon, dig into the numbers behind each dimension. The stress test panel gives you the raw data to make evidence-based rebalancing decisions.",
  diy_controller:
    "As a Lone Wolf, you chose every position yourself. Own the risk profile too. Use the position-level analysis to find where your conviction might be overriding diversification.",
  collaborative_partner:
    "As a War Room Strategist, use this radar as a conversation starter. Which risk dimensions would your thought partners challenge? Where do you need a second opinion?",
  big_picture_optimist:
    "As a Marathon Capitalist, short-term risk metrics matter less to you. Focus on the stress tests -- can your portfolio survive a crisis and still compound over decades?",
  trend_sensitive_explorer:
    "As a Wave Rider, your portfolio likely has elevated beta and correlation risk. That's the cost of momentum. The key question: can you handle the drawdowns when the wave breaks?",
  avoider_under_stress:
    "As a Vault Keeper, this radar helps you see exactly where your vulnerabilities are -- BEFORE a downturn triggers your lock-the-vault instinct. Prepare now, not during a crash.",
  action_first_decider:
    "As a First Mover, your speed can create concentration risk. Check if your latest trades have shifted the risk profile. The radar catches drift that gut feeling misses.",
  values_anchored_steward:
    "As a Legacy Builder, risk management protects the long-term purpose of your wealth. Each threshold is calibrated to your values -- stay within them and your legacy stays on track.",
};

// ─── Radar Chart SVG ───────────────────────────────────────────────────

function RadarChart({
  dimensions,
  accentColor,
}: {
  readonly dimensions: readonly RiskDimension[];
  readonly accentColor: string;
}) {
  const cx = 150;
  const cy = 150;
  const maxR = 120;
  const levels = [20, 40, 60, 80, 100];
  const count = dimensions.length;

  const getPoint = useCallback(
    (index: number, value: number) => {
      const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
      const r = (value / 100) * maxR;
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    },
    [count]
  );

  const scorePath = dimensions
    .map((d, i) => {
      const pt = getPoint(i, d.score);
      return `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`;
    })
    .join(" ") + " Z";

  const thresholdPath = dimensions
    .map((d, i) => {
      const pt = getPoint(i, d.personalThreshold);
      return `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`;
    })
    .join(" ") + " Z";

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[320px] mx-auto">
      {/* Grid levels */}
      {levels.map((level) => (
        <polygon
          key={level}
          points={Array.from({ length: count }, (_, i) => {
            const pt = getPoint(i, level);
            return `${pt.x},${pt.y}`;
          }).join(" ")}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={level === 60 ? 1.5 : 0.5}
          opacity={level === 60 ? 0.6 : 0.3}
        />
      ))}

      {/* Axis lines */}
      {dimensions.map((_, i) => {
        const pt = getPoint(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={pt.x}
            y2={pt.y}
            stroke="var(--color-border)"
            strokeWidth={0.5}
            opacity={0.3}
          />
        );
      })}

      {/* Threshold polygon */}
      <polygon
        points={thresholdPath.replace(/[MLZ]/g, "").trim().replace(/\s+/g, " ")}
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        opacity={0.6}
      />

      {/* Score polygon */}
      <motion.polygon
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        points={scorePath.replace(/[MLZ]/g, "").trim().replace(/\s+/g, " ")}
        fill={accentColor}
        fillOpacity={0.15}
        stroke={accentColor}
        strokeWidth={2}
      />

      {/* Score dots */}
      {dimensions.map((d, i) => {
        const pt = getPoint(i, d.score);
        const overThreshold = d.score > d.personalThreshold;
        return (
          <motion.circle
            key={d.key}
            initial={{ r: 0 }}
            animate={{ r: 4 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            cx={pt.x}
            cy={pt.y}
            fill={overThreshold ? "var(--color-red)" : accentColor}
            stroke="var(--color-background)"
            strokeWidth={2}
          />
        );
      })}

      {/* Labels */}
      {dimensions.map((d, i) => {
        const pt = getPoint(i, 118);
        const overThreshold = d.score > d.personalThreshold;
        return (
          <text
            key={d.key}
            x={pt.x}
            y={pt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={overThreshold ? "var(--color-red)" : "var(--color-text-secondary)"}
            fontSize={10}
            fontWeight={overThreshold ? 600 : 400}
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Dimension Card ────────────────────────────────────────────────────

function DimensionCard({
  dimension,
  accentColor,
}: {
  readonly dimension: RiskDimension;
  readonly accentColor: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const overThreshold = dimension.score > dimension.personalThreshold;
  const pct = dimension.score;

  return (
    <motion.div
      layout
      className={`border rounded-xl p-4 transition-colors ${
        overThreshold
          ? "border-red/30 bg-red/5"
          : "border-border bg-surface"
      }`}
    >
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">
            {dimension.label}
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-bold ${
                overThreshold ? "text-red" : "text-green"
              }`}
            >
              {pct}
            </span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            )}
          </div>
        </div>

        {/* Score bar */}
        <div className="relative h-2 bg-background rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background:
                pct > 70
                  ? "var(--color-red)"
                  : pct > 45
                    ? "var(--color-gold)"
                    : accentColor,
            }}
          />
          {/* Threshold marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gold"
            style={{ left: `${dimension.personalThreshold}%` }}
          />
        </div>

        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-text-muted">
            {dimension.description}
          </span>
          <span className="text-[10px] text-gold">
            Threshold: {dimension.personalThreshold}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-text-secondary mt-3 pt-3 border-t border-border/50 leading-relaxed">
              {dimension.detail}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Alert Card ────────────────────────────────────────────────────────

function AlertCard({ alert }: { readonly alert: RiskAlert }) {
  const config = {
    high: {
      border: "border-red/30",
      bg: "bg-red/5",
      icon: <AlertTriangle className="w-4 h-4 text-red" />,
      badge: "bg-red/10 text-red",
    },
    medium: {
      border: "border-gold/30",
      bg: "bg-gold/5",
      icon: <Activity className="w-4 h-4 text-gold" />,
      badge: "bg-gold/10 text-gold",
    },
    low: {
      border: "border-blue/30",
      bg: "bg-blue/5",
      icon: <Info className="w-4 h-4 text-blue" />,
      badge: "bg-blue/10 text-blue",
    },
  }[alert.severity];

  return (
    <div className={`border ${config.border} ${config.bg} rounded-lg p-3`}>
      <div className="flex items-start gap-2">
        {config.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-text-primary">
              {alert.title}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${config.badge}`}
            >
              {alert.severity}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {alert.message}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Stress Test Card ──────────────────────────────────────────────────

function StressCard({
  scenario,
  investment,
}: {
  readonly scenario: StressScenario;
  readonly investment: number;
}) {
  const survColor = {
    high: "text-green",
    medium: "text-gold",
    low: "text-red",
  }[scenario.survivability];

  return (
    <div className="border border-border bg-surface rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-text-primary">
          {scenario.name}
        </span>
        <span className="text-xs font-bold text-red">
          {scenario.marketDrop}%
        </span>
      </div>
      <p className="text-[10px] text-text-muted mb-3">{scenario.description}</p>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-[10px] text-text-muted">Your Loss</div>
          <div className="text-sm font-bold text-red">
            -${scenario.estimatedLoss.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-text-muted">Portfolio Drop</div>
          <div className="text-sm font-bold text-text-primary">
            -{scenario.estimatedLossPercent}%
          </div>
        </div>
        <div>
          <div className="text-[10px] text-text-muted">Survivability</div>
          <div className={`text-sm font-bold capitalize ${survColor}`}>
            {scenario.survivability}
          </div>
        </div>
      </div>

      {scenario.survivability === "low" && (
        <div className="mt-2 text-[10px] text-red/80 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          This scenario may trigger panic selling based on your risk profile
        </div>
      )}
    </div>
  );
}

// ─── Position Risk Row ─────────────────────────────────────────────────

function PositionRow({ position }: { readonly position: PositionRisk }) {
  const signalConfig = {
    safe: { color: "text-green", bg: "bg-green/10", dot: "bg-green" },
    caution: { color: "text-gold", bg: "bg-gold/10", dot: "bg-gold" },
    danger: { color: "text-red", bg: "bg-red/10", dot: "bg-red" },
  }[position.signal];

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
      <div className={`w-2 h-2 rounded-full ${signalConfig.dot}`} />
      <div className="w-16">
        <span className="text-xs font-bold text-text-primary font-mono">
          {position.ticker}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] text-text-muted truncate block">
          {position.reason}
        </span>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-text-muted">Beta</div>
        <div className="text-xs font-medium text-text-primary">
          {position.beta.toFixed(2)}
        </div>
      </div>
      <div className="text-right w-14">
        <div className="text-[10px] text-text-muted">Risk %</div>
        <div className={`text-xs font-bold ${signalConfig.color}`}>
          {position.riskContribution.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

// ─── Sector Bar ────────────────────────────────────────────────────────

function SectorBar({
  sector,
  weight,
  count,
  maxWeight,
  accentColor,
}: {
  readonly sector: string;
  readonly weight: number;
  readonly count: number;
  readonly maxWeight: number;
  readonly accentColor: string;
}) {
  const barWidth = maxWeight > 0 ? (weight / maxWeight) * 100 : 0;
  const isHeavy = weight > 40;

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-28 text-xs text-text-secondary truncate">{sector}</div>
      <div className="flex-1 relative h-4 bg-background rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.6 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: isHeavy ? "var(--color-red)" : accentColor,
            opacity: isHeavy ? 0.8 : 0.6,
          }}
        />
      </div>
      <div className="w-12 text-right text-xs font-medium text-text-primary">
        {weight.toFixed(1)}%
      </div>
      <div className="w-8 text-right text-[10px] text-text-muted">
        ({count})
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────

export default function RiskRadarPage() {
  const [profile, setProfile] = useState<StoredDNAProfile | null>(null);
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [investment, setInvestment] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "radar" | "stress" | "positions" | "sectors"
  >("radar");

  useEffect(() => {
    const dnaProfile = loadDNAProfile();
    setProfile(dnaProfile);

    const portfolio = loadPortfolio();
    if (portfolio && portfolio.items.length > 0) {
      const stockMap = new Map<string, Stock>();
      for (const s of stocks) {
        stockMap.set(s.ticker, s);
      }

      setInvestment(portfolio.investment);
      const result = analyzePortfolioRisk(
        portfolio.items,
        stockMap,
        portfolio.investment,
        dnaProfile?.dimensions ?? null
      );
      setAnalysis(result);
    }

    setLoaded(true);
  }, []);

  const accentColor = profile
    ? ARCHETYPE_COLORS[profile.communicationArchetype] ?? "#2E8BEF"
    : "#2E8BEF";

  const archetypeName = profile
    ? ARCHETYPE_INFO[profile.communicationArchetype]?.name ?? "Investor"
    : null;

  const coaching = profile
    ? RISK_COACHING[profile.communicationArchetype] ?? null
    : null;

  const alertCounts = useMemo(() => {
    if (!analysis) return { high: 0, medium: 0, low: 0 };
    return {
      high: analysis.alerts.filter((a) => a.severity === "high").length,
      medium: analysis.alerts.filter((a) => a.severity === "medium").length,
      low: analysis.alerts.filter((a) => a.severity === "low").length,
    };
  }, [analysis]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-surface rounded-xl animate-shimmer"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state -- no portfolio
  if (!analysis) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors mb-6"
          >
            <ArrowLeft className="w-3 h-3" /> Home
          </Link>

          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface border border-border flex items-center justify-center">
              <Shield className="w-8 h-8 text-text-muted" />
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">
              Risk Radar
            </h1>
            <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
              Build a portfolio first to see your risk analysis. The Risk Radar
              analyzes concentration, sector overlap, beta exposure, and more.
            </p>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm font-medium px-6 py-2.5 rounded-lg bg-green/10 text-green border border-green/20 hover:bg-green/20 transition-colors"
            >
              <Target className="w-4 h-4" /> Build Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "radar" as const, label: "Risk Radar" },
    { key: "stress" as const, label: "Stress Test" },
    { key: "positions" as const, label: "Positions" },
    { key: "sectors" as const, label: "Sectors" },
  ];

  const maxSectorWeight = Math.max(
    ...analysis.sectorBreakdown.map((s) => s.weight),
    1
  );

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors mb-4"
        >
          <ArrowLeft className="w-3 h-3" /> Home
        </Link>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Shield className="w-6 h-6" style={{ color: accentColor }} />
              Risk Radar
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Portfolio risk analysis with personality-calibrated thresholds
            </p>
          </div>

          {/* Overall score */}
          <div className="text-right">
            <div
              className="text-3xl font-bold"
              style={{
                color:
                  analysis.overallScore > 70
                    ? "var(--color-red)"
                    : analysis.overallScore > 45
                      ? "var(--color-gold)"
                      : "var(--color-green)",
              }}
            >
              {analysis.overallScore}
            </div>
            <div className="text-[10px] text-text-muted uppercase tracking-wide">
              {analysis.overallLabel}
            </div>
          </div>
        </div>

        {/* Personality coaching bar */}
        {coaching && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-xl p-4 mb-6"
            style={{
              borderColor: `${accentColor}30`,
              background: `${accentColor}08`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${accentColor}15` }}
              >
                <Shield className="w-4 h-4" style={{ color: accentColor }} />
              </div>
              <div>
                <div
                  className="text-xs font-semibold mb-1"
                  style={{ color: accentColor }}
                >
                  {archetypeName} Risk Coaching
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {coaching}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="border border-border bg-surface rounded-xl p-3">
            <div className="text-[10px] text-text-muted uppercase mb-1">
              Investment
            </div>
            <div className="text-lg font-bold text-text-primary">
              ${investment.toLocaleString()}
            </div>
          </div>
          <div className="border border-border bg-surface rounded-xl p-3">
            <div className="text-[10px] text-text-muted uppercase mb-1">
              Positions
            </div>
            <div className="text-lg font-bold text-text-primary">
              {analysis.positionRisks.length}
            </div>
          </div>
          <div className="border border-border bg-surface rounded-xl p-3">
            <div className="text-[10px] text-text-muted uppercase mb-1">
              Sectors
            </div>
            <div className="text-lg font-bold text-text-primary">
              {analysis.sectorBreakdown.length}
            </div>
          </div>
          <div className="border border-border bg-surface rounded-xl p-3">
            <div className="text-[10px] text-text-muted uppercase mb-1">
              Alerts
            </div>
            <div className="flex items-center gap-2">
              {alertCounts.high > 0 && (
                <span className="text-xs font-bold text-red">
                  {alertCounts.high} critical
                </span>
              )}
              {alertCounts.medium > 0 && (
                <span className="text-xs font-bold text-gold">
                  {alertCounts.medium} elevated
                </span>
              )}
              {alertCounts.high === 0 && alertCounts.medium === 0 && (
                <span className="text-xs font-bold text-green">All clear</span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1 border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-green/10 text-green border border-green/20"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "radar" && (
            <motion.div
              key="radar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Radar chart + legend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-border bg-surface rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-text-primary">
                      Risk Dimensions
                    </h2>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: accentColor }}
                        />
                        Your Risk
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 bg-gold" style={{ borderBottom: "1px dashed var(--color-gold)" }} />
                        Threshold
                      </span>
                    </div>
                  </div>
                  <RadarChart
                    dimensions={analysis.dimensions}
                    accentColor={accentColor}
                  />
                </div>

                {/* Dimension cards */}
                <div className="space-y-3">
                  {analysis.dimensions.map((dim) => (
                    <DimensionCard
                      key={dim.key}
                      dimension={dim}
                      accentColor={accentColor}
                    />
                  ))}
                </div>
              </div>

              {/* Alerts */}
              {analysis.alerts.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-gold" />
                    Risk Alerts ({analysis.alerts.length})
                  </h2>
                  <div className="space-y-2">
                    {analysis.alerts.map((alert, i) => (
                      <AlertCard key={i} alert={alert} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "stress" && (
            <motion.div
              key="stress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red" />
                Stress Test Scenarios
              </h2>
              <p className="text-xs text-text-muted mb-4">
                How your ${investment.toLocaleString()} portfolio performs under
                market stress, calibrated to your portfolio beta.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.stressTests.map((scenario) => (
                  <StressCard
                    key={scenario.name}
                    scenario={scenario}
                    investment={investment}
                  />
                ))}
              </div>

              {profile && (
                <div className="mt-4 border border-border bg-surface rounded-lg p-3">
                  <div className="text-xs text-text-muted mb-1">
                    Survivability calibrated to your risk tolerance
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-medium text-text-primary">
                      Risk Tolerance: {profile.dimensions.R}/100
                    </div>
                    <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green"
                        style={{ width: `${profile.dimensions.R}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "positions" && (
            <motion.div
              key="positions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: accentColor }} />
                Position-Level Risk
              </h2>
              <p className="text-xs text-text-muted mb-4">
                Individual stock risk analysis based on beta, allocation weight,
                and your personality profile.
              </p>

              <div className="border border-border bg-surface rounded-xl p-4">
                {/* Legend */}
                <div className="flex items-center gap-4 mb-3 pb-3 border-b border-border/50">
                  <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
                    <span className="w-2 h-2 rounded-full bg-green" /> Safe
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
                    <span className="w-2 h-2 rounded-full bg-gold" /> Caution
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
                    <span className="w-2 h-2 rounded-full bg-red" /> Danger
                  </span>
                </div>

                {analysis.positionRisks.map((pos) => (
                  <PositionRow key={pos.ticker} position={pos} />
                ))}

                {analysis.positionRisks.length === 0 && (
                  <div className="text-center py-8 text-xs text-text-muted">
                    No positions to analyze
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "sectors" && (
            <motion.div
              key="sectors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: accentColor }} />
                Sector Exposure
              </h2>
              <p className="text-xs text-text-muted mb-4">
                Portfolio allocation by sector. Heavy sector concentration
                (40%+) is highlighted as a risk.
              </p>

              <div className="border border-border bg-surface rounded-xl p-4">
                {analysis.sectorBreakdown.map((s) => (
                  <SectorBar
                    key={s.sector}
                    sector={s.sector}
                    weight={s.weight}
                    count={s.count}
                    maxWeight={maxSectorWeight}
                    accentColor={accentColor}
                  />
                ))}

                {analysis.sectorBreakdown.length === 0 && (
                  <div className="text-center py-8 text-xs text-text-muted">
                    No sector data available
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
