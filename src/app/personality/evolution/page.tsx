"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  AlertTriangle,
  Sprout,
  Calendar,
  BookOpen,
  Activity,
  Brain,
  Target,
} from "lucide-react";
import {
  getDNAHistory,
  loadDNAProfile,
  type DNAHistoryEntry,
} from "@/lib/dna-storage";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import { ARCHETYPE_COLORS } from "@/components/dna/archetype-colors";
import type { ArchetypeKey, CoreDimensions } from "@/lib/financial-dna";
import {
  analyzeEvolution,
  type EvolutionData,
  type TimeSlice,
  type Milestone,
} from "@/lib/ai/evolution-analyzer";

const DIM_LABELS: Record<string, string> = {
  R: "Risk",
  C: "Control",
  H: "Horizon",
  D: "Discipline",
  E: "Emotional",
};

const DIM_KEYS = ["R", "C", "H", "D", "E"] as const;

export default function EvolutionPage() {
  const [history, setHistory] = useState<DNAHistoryEntry[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [evolutionData, setEvolutionData] = useState<EvolutionData | null>(null);

  useEffect(() => {
    const h = getDNAHistory();
    setHistory(h);
    if (h.length > 0) setSelectedIdx(h.length - 1);
    setEvolutionData(analyzeEvolution());
  }, []);

  const currentProfile = useMemo(() => loadDNAProfile(), []);

  if (history.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/personality"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Identity
          </Link>

          <div className="text-center py-16">
            <Clock className="w-8 h-8 text-text-muted mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">
              No Evolution Data Yet
            </h1>
            <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
              Take the Financial DNA quiz at least once to start tracking
              your investor identity evolution.
            </p>
            <Link
              href="/personality"
              className="inline-flex items-center gap-2 text-sm bg-green/10 text-green border border-green/20 px-5 py-2.5 rounded-lg font-medium hover:bg-green/20 transition-colors"
            >
              Take the Quiz
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selected = selectedIdx !== null ? history[selectedIdx] : null;
  const previous =
    selectedIdx !== null && selectedIdx > 0
      ? history[selectedIdx - 1]
      : null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/personality"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Identity
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 text-green mb-2">
            <RefreshCw className="w-4 h-4" />
            <p className="text-xs uppercase tracking-widest font-medium">
              Identity Evolution
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            How You've Changed
          </h1>
          <p className="text-text-secondary text-sm">
            {history.length} assessment{history.length !== 1 ? "s" : ""}{" "}
            recorded. Click a point to compare.
          </p>
        </div>

        {/* Timeline */}
        <div className="mb-8 bg-surface-alt rounded-xl border border-border p-4">
          <h3 className="text-xs text-text-muted mb-4">Assessment Timeline</h3>
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {history.map((entry, i) => {
              const archKey = entry.communicationArchetype as ArchetypeKey;
              const color = ARCHETYPE_COLORS[archKey] ?? "#4ade80";
              const info = ARCHETYPE_INFO[archKey];
              const isSelected = selectedIdx === i;
              const date = new Date(entry.completedAt);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedIdx(i)}
                  className={`shrink-0 text-center px-4 py-3 rounded-lg border transition-all ${
                    isSelected
                      ? "border-green bg-green/5"
                      : "border-border hover:border-border/80 bg-surface"
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs font-medium text-text-primary">
                    {info?.name ?? archKey}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {selected && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Radar comparison */}
            <div className="bg-surface-alt rounded-xl border border-border p-4">
              <h3 className="text-sm font-medium text-text-primary mb-4">
                Dimension Radar
                {previous && (
                  <span className="text-xs text-text-muted ml-2">
                    (vs previous)
                  </span>
                )}
              </h3>
              <EvolutionRadar
                current={selected.dimensions}
                previous={previous?.dimensions ?? null}
              />
            </div>

            {/* Dimension changes */}
            <div className="bg-surface-alt rounded-xl border border-border p-4">
              <h3 className="text-sm font-medium text-text-primary mb-4">
                Dimension Scores
              </h3>
              <div className="space-y-3">
                {DIM_KEYS.map((key) => {
                  const val = selected.dimensions[key];
                  const prevVal = previous?.dimensions[key] ?? null;
                  const delta =
                    prevVal !== null ? val - prevVal : null;

                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-secondary">
                          {DIM_LABELS[key]} ({key})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-text-primary">
                            {val}
                          </span>
                          {delta !== null && delta !== 0 && (
                            <span
                              className={`text-[10px] font-medium ${
                                delta > 0
                                  ? "text-green"
                                  : "text-red"
                              }`}
                            >
                              {delta > 0 ? "+" : ""}
                              {delta}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-surface rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-green rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${val}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Interpretation */}
        {selected && previous && (
          <div className="mt-4 bg-surface-alt rounded-xl border border-border p-4">
            <h3 className="text-sm font-medium text-text-primary mb-2">
              What Changed
            </h3>
            <EvolutionInsights
              current={selected}
              previous={previous}
            />
          </div>
        )}

        {/* Behavioral Evolution Section */}
        {evolutionData && evolutionData.totalEntries > 0 && (
          <BehavioralEvolutionSection data={evolutionData} />
        )}

        {/* Retake CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/personality"
            className="inline-flex items-center gap-2 text-sm bg-green/10 text-green border border-green/20 px-5 py-2.5 rounded-lg font-medium hover:bg-green/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retake Quiz
          </Link>
          <p className="text-xs text-text-muted mt-2">
            Your previous results are always saved
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Radar Chart ──────────────────────────────────────────────────────

function EvolutionRadar({
  current,
  previous,
}: {
  current: CoreDimensions;
  previous: CoreDimensions | null;
}) {
  const size = 220;
  const center = size / 2;
  const radius = 80;

  const getPoint = (
    angle: number,
    r: number
  ): { x: number; y: number } => ({
    x: center + r * Math.cos(angle - Math.PI / 2),
    y: center + r * Math.sin(angle - Math.PI / 2),
  });

  const angles = DIM_KEYS.map(
    (_, i) => (2 * Math.PI * i) / DIM_KEYS.length
  );

  const buildPolygon = (dims: CoreDimensions): string =>
    DIM_KEYS.map((key, i) => {
      const r = (dims[key] / 100) * radius;
      const pt = getPoint(angles[i], r);
      return `${pt.x},${pt.y}`;
    }).join(" ");

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[220px]">
        {/* Grid */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={angles
              .map((a) => {
                const pt = getPoint(a, radius * scale);
                return `${pt.x},${pt.y}`;
              })
              .join(" ")}
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth="0.5"
          />
        ))}

        {/* Axes + labels */}
        {DIM_KEYS.map((key, i) => {
          const endPt = getPoint(angles[i], radius);
          const labelPt = getPoint(angles[i], radius + 16);
          return (
            <g key={key}>
              <line
                x1={center}
                y1={center}
                x2={endPt.x}
                y2={endPt.y}
                stroke="currentColor"
                className="text-border"
                strokeWidth="0.5"
              />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-text-muted text-[9px]"
              >
                {key}
              </text>
            </g>
          );
        })}

        {/* Previous polygon */}
        {previous && (
          <polygon
            points={buildPolygon(previous)}
            fill="rgba(156,163,175,0.1)"
            stroke="rgba(156,163,175,0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
        )}

        {/* Current polygon */}
        <polygon
          points={buildPolygon(current)}
          fill="rgba(74,222,128,0.15)"
          stroke="rgba(74,222,128,0.8)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

// ─── Behavioral Evolution Section ────────────────────────────────────

function BehavioralEvolutionSection({ data }: { data: EvolutionData }) {
  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-green" />
        <h2 className="text-lg font-semibold">Behavioral Evolution</h2>
      </div>

      {/* Growth trends */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <BehaviorTrendBadge
          trend={data.overallGrowth.ruleFollowTrend}
          label="Rule Following"
        />
        <BehaviorTrendBadge
          trend={data.overallGrowth.calmTradeTrend}
          label="Emotional Control"
        />
        <BehaviorTrendBadge
          trend={data.overallGrowth.biasAwarenessTrend}
          label="Bias Awareness"
        />
        <div className="bg-surface-alt rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-green/10 flex items-center justify-center mb-2">
            <Target className="w-4 h-4 text-green" />
          </div>
          <p className="text-xs text-text-muted mb-0.5">Consistency</p>
          <p className="text-sm font-semibold text-green">
            {data.overallGrowth.consistencyScore}/100
          </p>
        </div>
      </div>

      {/* Factor timelines */}
      {data.timeline.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FactorTimelineChart
            slices={data.timeline}
            accessor={(s) => s.ruleFollowRate}
            label="Rule Follow Rate Over Time"
            color="bg-green"
          />
          <FactorTimelineChart
            slices={data.timeline}
            accessor={(s) => s.calmTradeRate}
            label="Calm Trade Rate Over Time"
            color="bg-blue"
          />
        </div>
      )}

      {/* Journal heatmap */}
      <JournalHeatmapChart data={data.journalHeatmap} />

      {/* Milestones */}
      {data.milestones.length > 0 && (
        <div className="bg-surface-alt rounded-xl border border-border p-4">
          <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-green" />
            Milestones
          </h3>
          <div className="space-y-2">
            {data.milestones.map((m) => {
              const iconMap = {
                achievement: { icon: Award, color: "text-green", bg: "bg-green/10" },
                concern: { icon: AlertTriangle, color: "text-gold", bg: "bg-gold/10" },
                growth: { icon: Sprout, color: "text-blue", bg: "bg-blue/10" },
              };
              const config = iconMap[m.type];
              const Icon = config.icon;
              return (
                <div key={m.id} className="flex items-start gap-3 bg-surface rounded-lg p-3">
                  <div className={`w-6 h-6 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-3 h-3 ${config.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-text-muted">{m.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Links */}
      <div className="flex gap-3">
        <Link
          href="/personality/coaching"
          className="flex-1 bg-surface-alt border border-border rounded-xl p-4 hover:border-green/30 transition-colors"
        >
          <Brain className="w-4 h-4 text-green mb-2" />
          <p className="text-sm font-medium">Coaching Memory</p>
          <p className="text-xs text-text-muted">What the AI learned</p>
        </Link>
        <Link
          href="/journal"
          className="flex-1 bg-surface-alt border border-border rounded-xl p-4 hover:border-green/30 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-green mb-2" />
          <p className="text-sm font-medium">Trade Journal</p>
          <p className="text-xs text-text-muted">Log more decisions</p>
        </Link>
      </div>
    </div>
  );
}

function BehaviorTrendBadge({
  trend,
  label,
}: {
  trend: "improving" | "stable" | "declining";
  label: string;
}) {
  const config = {
    improving: { icon: TrendingUp, color: "text-green", bg: "bg-green/10" },
    stable: { icon: Minus, color: "text-blue", bg: "bg-blue/10" },
    declining: { icon: TrendingDown, color: "text-red", bg: "bg-red/10" },
  };
  const c = config[trend];
  const Icon = c.icon;
  return (
    <div className="bg-surface-alt rounded-xl border border-border p-4">
      <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center mb-2`}>
        <Icon className={`w-4 h-4 ${c.color}`} />
      </div>
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className={`text-sm font-semibold capitalize ${c.color}`}>{trend}</p>
    </div>
  );
}

function FactorTimelineChart({
  slices,
  accessor,
  label,
  color,
}: {
  slices: readonly TimeSlice[];
  accessor: (s: TimeSlice) => number;
  label: string;
  color: string;
}) {
  const recent = slices.slice(-12);
  const maxVal = Math.max(...recent.map(accessor), 0.01);
  return (
    <div className="bg-surface-alt rounded-xl border border-border p-4">
      <p className="text-xs font-medium mb-3">{label}</p>
      <div className="flex items-end gap-1 h-16">
        {recent.map((s) => {
          const val = accessor(s);
          const pct = (val / maxVal) * 100;
          return (
            <div key={s.period} className="flex-1" title={`${s.period}: ${Math.round(val * 100)}%`}>
              <div className={`w-full rounded-t ${color}`} style={{ height: `${Math.max(pct, 4)}%` }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JournalHeatmapChart({ data }: { data: readonly { date: string; count: number }[] }) {
  const now = new Date();
  const countMap = new Map(data.map((d) => [d.date, d.count]));
  const days: { date: string; count: number }[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: countMap.get(key) ?? 0 });
  }
  const maxCount = Math.max(...days.map((d) => d.count), 1);
  return (
    <div className="bg-surface-alt rounded-xl border border-border p-4">
      <p className="text-xs font-medium mb-3 flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-text-muted" />
        Journal Activity (90 days)
      </p>
      <div className="grid grid-cols-[repeat(15,1fr)] gap-0.5">
        {days.map((day) => {
          const intensity = day.count > 0 ? Math.max(0.2, day.count / maxCount) : 0;
          return (
            <div
              key={day.date}
              className="aspect-square rounded-sm"
              style={{
                backgroundColor: day.count > 0
                  ? `rgba(0, 200, 83, ${intensity})`
                  : "rgba(255,255,255,0.03)",
              }}
              title={`${day.date}: ${day.count} entries`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[9px] text-text-muted">90 days ago</span>
        <span className="text-[9px] text-text-muted">Today</span>
      </div>
    </div>
  );
}

// ─── Insights ─────────────────────────────────────────────────────────

function EvolutionInsights({
  current,
  previous,
}: {
  current: DNAHistoryEntry;
  previous: DNAHistoryEntry;
}) {
  const changes: string[] = [];

  // Archetype change
  if (
    current.communicationArchetype !== previous.communicationArchetype
  ) {
    const prevInfo =
      ARCHETYPE_INFO[previous.communicationArchetype as ArchetypeKey];
    const currInfo =
      ARCHETYPE_INFO[current.communicationArchetype as ArchetypeKey];
    changes.push(
      `Your archetype shifted from ${prevInfo?.name ?? previous.communicationArchetype} to ${currInfo?.name ?? current.communicationArchetype}.`
    );
  }

  // Biggest dimension changes
  for (const key of DIM_KEYS) {
    const delta = current.dimensions[key] - previous.dimensions[key];
    if (Math.abs(delta) >= 10) {
      const dir = delta > 0 ? "increased" : "decreased";
      changes.push(
        `${DIM_LABELS[key]} ${dir} by ${Math.abs(delta)} points (${previous.dimensions[key]} to ${current.dimensions[key]}).`
      );
    }
  }

  if (changes.length === 0) {
    changes.push(
      "Your investor identity is remarkably consistent. Small changes are normal -- your core approach hasn't shifted."
    );
  }

  return (
    <ul className="space-y-1.5">
      {changes.map((c, i) => (
        <li key={i} className="text-xs text-text-secondary leading-relaxed">
          <span className="text-green mr-1.5">--</span>
          {c}
        </li>
      ))}
    </ul>
  );
}
