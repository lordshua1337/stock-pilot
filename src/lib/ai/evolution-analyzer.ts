// Behavioral Evolution Analyzer -- longitudinal view of investor growth
// Computes factor trends, milestone detection, and coaching report data

import {
  loadJournal,
  getAnalytics,
  type JournalState,
  type JournalEntry,
  type EmotionalState,
  type BiasTag,
} from "@/lib/journal-data";
import { loadCoachingMemory, getCoachingAnalytics } from "@/lib/ai/coaching-memory";
import { loadSimPortfolio } from "@/lib/simulator-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TimeSlice {
  readonly period: string; // e.g. "2026-W01", "2026-03"
  readonly ruleFollowRate: number;
  readonly calmTradeRate: number;
  readonly entryCount: number;
  readonly biasCount: number;
  readonly topEmotion: EmotionalState | null;
  readonly topBias: BiasTag | null;
}

export interface Milestone {
  readonly id: string;
  readonly type: "achievement" | "concern" | "growth";
  readonly title: string;
  readonly description: string;
  readonly date: string;
}

export interface EvolutionData {
  readonly timeline: readonly TimeSlice[];
  readonly milestones: readonly Milestone[];
  readonly journalHeatmap: readonly { date: string; count: number }[];
  readonly overallGrowth: {
    readonly ruleFollowTrend: "improving" | "stable" | "declining";
    readonly calmTradeTrend: "improving" | "stable" | "declining";
    readonly biasAwarenessTrend: "improving" | "stable" | "declining";
    readonly consistencyScore: number; // 0-100
  };
  readonly totalEntries: number;
  readonly totalTrades: number;
  readonly totalInsightFeedback: number;
  readonly daysSinceFirstEntry: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const weekNum = Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

function computeTrend(values: readonly number[]): "improving" | "stable" | "declining" {
  if (values.length < 2) return "stable";

  const half = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, half);
  const secondHalf = values.slice(half);

  const avg = (arr: readonly number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const diff = avg(secondHalf) - avg(firstHalf);

  if (diff > 0.05) return "improving";
  if (diff < -0.05) return "declining";
  return "stable";
}

// ---------------------------------------------------------------------------
// Main analyzer
// ---------------------------------------------------------------------------

export function analyzeEvolution(): EvolutionData {
  const journal = loadJournal();
  const coachingMemory = loadCoachingMemory();
  const coachingAnalytics = getCoachingAnalytics(coachingMemory);
  const simPortfolio = loadSimPortfolio();

  const entries = journal?.entries ?? [];
  const totalTrades = simPortfolio?.trades.length ?? 0;

  // Build weekly time slices
  const weekMap = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const key = getWeekKey(new Date(entry.timestamp));
    const existing = weekMap.get(key) ?? [];
    weekMap.set(key, [...existing, entry]);
  }

  const timeline: TimeSlice[] = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, weekEntries]) => {
      const withRule = weekEntries.filter((e) => e.followedRule !== undefined);
      const ruleFollowRate =
        withRule.length > 0
          ? withRule.filter((e) => e.followedRule).length / withRule.length
          : 0;

      const calmStates = new Set<EmotionalState>(["calm", "confident", "disciplined"]);
      const calmTradeRate =
        weekEntries.length > 0
          ? weekEntries.filter((e) => calmStates.has(e.emotionalState)).length /
            weekEntries.length
          : 0;

      const biasCount = weekEntries.reduce((sum, e) => sum + e.biases.length, 0);

      // Find top emotion
      const emotionCounts = new Map<EmotionalState, number>();
      for (const e of weekEntries) {
        emotionCounts.set(e.emotionalState, (emotionCounts.get(e.emotionalState) ?? 0) + 1);
      }
      const topEmotion =
        emotionCounts.size > 0
          ? Array.from(emotionCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
          : null;

      // Find top bias
      const biasCounts = new Map<BiasTag, number>();
      for (const e of weekEntries) {
        for (const b of e.biases) {
          biasCounts.set(b, (biasCounts.get(b) ?? 0) + 1);
        }
      }
      const topBias =
        biasCounts.size > 0
          ? Array.from(biasCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
          : null;

      return {
        period,
        ruleFollowRate,
        calmTradeRate,
        entryCount: weekEntries.length,
        biasCount,
        topEmotion,
        topBias,
      };
    });

  // Build journal heatmap (last 90 days)
  const dateCounts = new Map<string, number>();
  const now = new Date();
  for (const entry of entries) {
    const d = new Date(entry.timestamp);
    const daysDiff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (daysDiff <= 90) {
      const dateKey = d.toISOString().slice(0, 10);
      dateCounts.set(dateKey, (dateCounts.get(dateKey) ?? 0) + 1);
    }
  }

  const journalHeatmap = Array.from(dateCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Detect milestones
  const milestones = detectMilestones(entries, journal);

  // Overall growth trends
  const ruleRates = timeline.map((t) => t.ruleFollowRate);
  const calmRates = timeline.map((t) => t.calmTradeRate);
  const biasRates = timeline.map((t) =>
    t.entryCount > 0 ? t.biasCount / t.entryCount : 0
  );

  // Consistency: how regularly they journal (entries per week over last 4 weeks)
  const recentWeeks = timeline.slice(-4);
  const avgEntriesPerWeek =
    recentWeeks.length > 0
      ? recentWeeks.reduce((sum, w) => sum + w.entryCount, 0) / recentWeeks.length
      : 0;
  const consistencyScore = Math.min(100, Math.round(avgEntriesPerWeek * 20));

  const firstEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const daysSinceFirstEntry = firstEntry
    ? Math.floor((now.getTime() - new Date(firstEntry.timestamp).getTime()) / 86400000)
    : 0;

  return {
    timeline,
    milestones,
    journalHeatmap,
    overallGrowth: {
      ruleFollowTrend: computeTrend(ruleRates),
      calmTradeTrend: computeTrend(calmRates),
      biasAwarenessTrend: computeTrend(biasRates.map((r) => 1 - r)), // inverted: fewer biases = better
      consistencyScore,
    },
    totalEntries: entries.length,
    totalTrades,
    totalInsightFeedback: coachingAnalytics.totalFeedback,
    daysSinceFirstEntry,
  };
}

// ---------------------------------------------------------------------------
// Milestone detection
// ---------------------------------------------------------------------------

function detectMilestones(
  entries: readonly JournalEntry[],
  journal: JournalState | null
): readonly Milestone[] {
  const milestones: Milestone[] = [];

  if (entries.length === 0) return milestones;

  // Entry count milestones
  const countThresholds = [5, 10, 25, 50, 100];
  for (const threshold of countThresholds) {
    if (entries.length >= threshold) {
      const entry = entries[entries.length - threshold];
      milestones.push({
        id: `entries_${threshold}`,
        type: "achievement",
        title: `${threshold} Journal Entries`,
        description: `You've logged ${threshold} trading decisions. Journaling builds self-awareness.`,
        date: entry?.timestamp ?? new Date().toISOString(),
      });
    }
  }

  // Check for streaks
  const sortedDates = [...new Set(entries.map((e) => e.timestamp.slice(0, 10)))].sort();
  let maxStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  if (maxStreak >= 7) {
    milestones.push({
      id: "streak_7",
      type: "achievement",
      title: `${maxStreak}-Day Streak`,
      description: `Your longest journaling streak: ${maxStreak} consecutive days.`,
      date: sortedDates[sortedDates.length - 1],
    });
  }

  // Rule compliance improvement
  if (entries.length >= 10) {
    const firstHalf = entries.slice(Math.floor(entries.length / 2));
    const secondHalf = entries.slice(0, Math.floor(entries.length / 2));

    const firstRate =
      firstHalf.filter((e) => e.followedRule).length / Math.max(1, firstHalf.length);
    const secondRate =
      secondHalf.filter((e) => e.followedRule).length / Math.max(1, secondHalf.length);

    if (secondRate - firstRate > 0.15) {
      milestones.push({
        id: "rule_improvement",
        type: "growth",
        title: "Rule Compliance Improved",
        description: `Your rule-following rate improved from ${Math.round(firstRate * 100)}% to ${Math.round(secondRate * 100)}%.`,
        date: entries[0].timestamp,
      });
    }
  }

  // Bias awareness (if they're tagging biases, they're aware)
  const entriesWithBiases = entries.filter((e) => e.biases.length > 0);
  if (entriesWithBiases.length >= 5) {
    milestones.push({
      id: "bias_awareness",
      type: "growth",
      title: "Bias-Aware Trader",
      description: `You've identified biases in ${entriesWithBiases.length} entries. Awareness is the first step to overcoming them.`,
      date: entriesWithBiases[0].timestamp,
    });
  }

  return milestones.sort((a, b) => b.date.localeCompare(a.date));
}
