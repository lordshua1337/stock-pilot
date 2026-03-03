"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BarChart3,
  Clock,
  Users,
  AlertTriangle,
  Brain,
} from "lucide-react";
import {
  earningsCalendar,
  getEarningsByWeek,
  getBeatRate,
  getAverageSurprise,
  getPreEarningsCoaching,
  type EarningsEntry,
} from "@/lib/earnings-data";
import { loadDNAProfile } from "@/lib/dna-storage";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import type { ArchetypeKey } from "@/lib/financial-dna";
import { ARCHETYPE_COLORS } from "@/components/dna/archetype-colors";

// ---------------------------------------------------------------------------
// View toggle
// ---------------------------------------------------------------------------

type ViewMode = "week" | "list";

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatWeekLabel(mondayIso: string): string {
  const mon = new Date(mondayIso);
  const fri = new Date(mon);
  fri.setDate(fri.getDate() + 4);
  const monStr = mon.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const friStr = fri.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${monStr} -- ${friStr}`;
}

function getDaysUntil(iso: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getCountdownLabel(iso: string): string {
  const days = getDaysUntil(iso);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)}d ago`;
  return `${days}d away`;
}

// ---------------------------------------------------------------------------
// Surprise history mini chart (CSS-only bar chart)
// ---------------------------------------------------------------------------

function SurpriseChart({ entry }: { entry: EarningsEntry }) {
  if (entry.surpriseHistory.length === 0) return null;

  return (
    <div className="flex items-end gap-1 h-8">
      {entry.surpriseHistory.map((s, i) => {
        const isPositive = s.surprisePercent > 0;
        const height = Math.min(Math.abs(s.surprisePercent) * 2, 100);
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-0.5"
            title={`${s.quarter}: ${s.surprisePercent > 0 ? "+" : ""}${s.surprisePercent.toFixed(1)}%`}
          >
            <div
              className="w-2.5 rounded-sm transition-all"
              style={{
                height: `${Math.max(height, 8)}%`,
                backgroundColor: isPositive ? "#00C853" : s.surprisePercent === 0 ? "#555" : "#FF5252",
                opacity: 0.8,
              }}
            />
            <span className="text-[8px] text-text-muted leading-none">
              {s.quarter.split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Earnings card -- expandable
// ---------------------------------------------------------------------------

function EarningsCard({
  entry,
  index,
  accentColor,
}: {
  entry: EarningsEntry;
  index: number;
  accentColor?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const beatRate = getBeatRate(entry);
  const avgSurprise = getAverageSurprise(entry);
  const daysUntil = getDaysUntil(entry.nextEarningsDate);
  const isUpcoming = daysUntil >= 0;

  const countdownColor = daysUntil <= 2 && daysUntil >= 0
    ? "#FF5252"
    : daysUntil <= 7 && daysUntil >= 0
      ? "#FFD740"
      : "#00C853";

  return (
    <motion.div
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="bg-surface border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Ticker badge */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <span className="text-base font-bold">{entry.ticker}</span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                style={{
                  color: countdownColor,
                  backgroundColor: `${countdownColor}15`,
                }}
              >
                {getCountdownLabel(entry.nextEarningsDate)}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-text-muted truncate">{entry.name}</p>
              <p className="text-xs text-text-muted mt-0.5">
                {formatDate(entry.nextEarningsDate)} -- {entry.sector}
              </p>

              {/* EPS row */}
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <p className="text-[9px] text-text-muted uppercase tracking-wider">Expected</p>
                  <p className="text-sm font-bold" style={{ color: accentColor ?? "#00C853" }}>
                    ${entry.expectedEPS.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-text-muted uppercase tracking-wider">Previous</p>
                  <p className="text-sm font-mono text-text-secondary">
                    ${entry.previousEPS.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-text-muted uppercase tracking-wider">Beat Rate</p>
                  <p
                    className="text-sm font-mono font-semibold"
                    style={{
                      color: beatRate >= 66 ? "#00C853" : beatRate >= 33 ? "#FFD740" : "#FF5252",
                    }}
                  >
                    {beatRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <SurpriseChart entry={entry} />
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border animate-fade-in">
          <div className="mt-3 space-y-3">
            {/* Consensus details */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-alt rounded-lg p-2.5 text-center">
                <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5">
                  Consensus
                </p>
                <p className="text-sm font-bold">${entry.consensusEstimate.toFixed(2)}</p>
              </div>
              <div className="bg-surface-alt rounded-lg p-2.5 text-center">
                <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5">
                  Analysts
                </p>
                <p className="text-sm font-bold">{entry.analystCount}</p>
              </div>
              <div className="bg-surface-alt rounded-lg p-2.5 text-center">
                <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5">
                  Revenue Est.
                </p>
                <p className="text-sm font-bold">{entry.revenueExpected}</p>
              </div>
            </div>

            {/* Surprise history table */}
            <div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-semibold">
                Surprise History
              </p>
              <div className="space-y-1">
                {entry.surpriseHistory.map((s) => (
                  <div
                    key={s.quarter}
                    className="flex items-center justify-between text-xs bg-surface-alt rounded-lg px-3 py-2"
                  >
                    <span className="text-text-muted">{s.quarter}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-text-muted">
                        Est. ${s.expected.toFixed(2)}
                      </span>
                      <span className="text-text-secondary font-medium">
                        Act. ${s.actual.toFixed(2)}
                      </span>
                      <span
                        className="font-mono font-semibold min-w-[60px] text-right"
                        style={{
                          color:
                            s.surprisePercent > 0
                              ? "#00C853"
                              : s.surprisePercent === 0
                                ? "#888"
                                : "#FF5252",
                        }}
                      >
                        {s.surprisePercent > 0 ? "+" : ""}
                        {s.surprisePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pre-earnings note */}
            <div className="flex items-start gap-2 text-xs text-text-secondary bg-surface-alt rounded-lg p-3">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gold" />
              <div>
                <span className="font-semibold text-gold">What to watch: </span>
                {entry.preEarningsNote}
              </div>
            </div>

            {/* Avg surprise */}
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Avg. surprise: {avgSurprise > 0 ? "+" : ""}{avgSurprise}%</span>
              <Link
                href={`/research/${entry.ticker}`}
                className="inline-flex items-center gap-1 text-green hover:text-green-light transition-colors"
              >
                Full Research
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Week group
// ---------------------------------------------------------------------------

function WeekGroup({
  weekKey,
  entries,
  accentColor,
  startIndex,
}: {
  weekKey: string;
  entries: EarningsEntry[];
  accentColor?: string;
  startIndex: number;
}) {
  const weekLabel = formatWeekLabel(weekKey);
  const sorted = [...entries].sort(
    (a, b) => new Date(a.nextEarningsDate).getTime() - new Date(b.nextEarningsDate).getTime()
  );

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-text-muted" />
        <h3 className="text-sm font-semibold text-text-secondary">{weekLabel}</h3>
        <span className="text-[10px] text-text-muted bg-surface-alt px-2 py-0.5 rounded-full">
          {entries.length} {entries.length === 1 ? "report" : "reports"}
        </span>
      </div>
      <div className="space-y-2">
        {sorted.map((entry, i) => (
          <EarningsCard
            key={entry.ticker}
            entry={entry}
            index={startIndex + i}
            accentColor={accentColor}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats bar
// ---------------------------------------------------------------------------

function StatsBar({ entries }: { entries: EarningsEntry[] }) {
  const totalReports = entries.length;

  const avgBeatRate = useMemo(() => {
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, e) => sum + getBeatRate(e), 0);
    return Math.round(total / entries.length);
  }, [entries]);

  const upcomingThisWeek = useMemo(() => {
    return entries.filter((e) => {
      const days = getDaysUntil(e.nextEarningsDate);
      return days >= 0 && days <= 7;
    }).length;
  }, [entries]);

  const sectors = useMemo(() => {
    const set = new Set(entries.map((e) => e.sector));
    return set.size;
  }, [entries]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: "Total Reports", value: totalReports.toString(), icon: BarChart3 },
        { label: "This Week", value: upcomingThisWeek.toString(), icon: Clock },
        { label: "Avg Beat Rate", value: `${avgBeatRate}%`, icon: TrendingUp },
        { label: "Sectors", value: sectors.toString(), icon: Users },
      ].map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="bg-surface border border-border rounded-xl p-4 text-center"
        >
          <Icon className="w-4 h-4 text-text-muted mx-auto mb-1" />
          <p className="text-lg font-bold">{value}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function EarningsPage() {
  const [view, setView] = useState<ViewMode>("week");
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [archetypeKey, setArchetypeKey] = useState<ArchetypeKey | null>(null);

  useEffect(() => {
    const profile = loadDNAProfile();
    if (profile) {
      setArchetypeKey(profile.communicationArchetype as ArchetypeKey);
    }
  }, []);

  const accentColor = archetypeKey
    ? ARCHETYPE_COLORS[archetypeKey] ?? "#00C853"
    : "#00C853";

  const archetype = archetypeKey ? ARCHETYPE_INFO[archetypeKey] : null;

  // Sector filters
  const sectors = useMemo(() => {
    const set = new Set(earningsCalendar.map((e) => e.sector));
    return [...set].sort();
  }, []);

  const filtered = useMemo(() => {
    if (!sectorFilter) return earningsCalendar;
    return earningsCalendar.filter((e) => e.sector === sectorFilter);
  }, [sectorFilter]);

  // Week groups
  const weekGroups = useMemo(() => {
    return getEarningsByWeek(filtered);
  }, [filtered]);

  const sortedWeeks = useMemo(() => {
    return [...weekGroups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [weekGroups]);

  // List view: sort by date
  const sortedList = useMemo(() => {
    return [...filtered].sort(
      (a, b) =>
        new Date(a.nextEarningsDate).getTime() - new Date(b.nextEarningsDate).getTime()
    );
  }, [filtered]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold mb-2"
            style={{ color: accentColor }}
          >
            <Calendar className="w-3.5 h-3.5" />
            Earnings Calendar
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Upcoming Earnings
          </h1>
          <p className="text-text-secondary text-sm max-w-lg">
            Track earnings dates, EPS expectations, and surprise history for stocks in the
            StockPilot universe. Expand any card for deep analysis.
          </p>
        </div>

        {/* Personality coaching bar */}
        {archetype && archetypeKey && (
          <div
            className="rounded-xl border p-4 mb-6"
            style={{
              borderColor: `${accentColor}30`,
              backgroundColor: `${accentColor}08`,
            }}
          >
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: accentColor }}>
                  Earnings coaching for {archetype.name}
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {getPreEarningsCoaching(archetypeKey)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <StatsBar entries={filtered} />

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          {/* Sector pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSectorFilter(null)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                sectorFilter === null
                  ? "bg-green/15 text-green border border-green/30"
                  : "bg-surface-alt text-text-muted border border-border hover:text-text-secondary"
              }`}
            >
              All ({earningsCalendar.length})
            </button>
            {sectors.map((sector) => {
              const count = earningsCalendar.filter((e) => e.sector === sector).length;
              return (
                <button
                  key={sector}
                  onClick={() =>
                    setSectorFilter(sectorFilter === sector ? null : sector)
                  }
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    sectorFilter === sector
                      ? "bg-green/15 text-green border border-green/30"
                      : "bg-surface-alt text-text-muted border border-border hover:text-text-secondary"
                  }`}
                >
                  {sector} ({count})
                </button>
              );
            })}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-surface-alt border border-border rounded-lg overflow-hidden">
            {(["week", "list"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`text-xs px-3 py-1.5 font-medium transition-colors capitalize ${
                  view === mode
                    ? "bg-green/15 text-green"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-8 h-8 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary text-sm">
              No earnings reports match your filter.
            </p>
          </div>
        ) : view === "week" ? (
          <div>
            {sortedWeeks.map(([weekKey, entries], weekIdx) => {
              const startIdx = sortedWeeks
                .slice(0, weekIdx)
                .reduce((sum, [, e]) => sum + e.length, 0);
              return (
                <WeekGroup
                  key={weekKey}
                  weekKey={weekKey}
                  entries={entries}
                  accentColor={accentColor}
                  startIndex={startIdx}
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedList.map((entry, i) => (
              <EarningsCard
                key={entry.ticker}
                entry={entry}
                index={i}
                accentColor={accentColor}
              />
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 text-center text-[11px] text-text-muted">
          Earnings dates and estimates are for educational purposes only. Always verify with
          your broker or financial data provider before making trading decisions.
        </div>
      </div>
    </div>
  );
}
