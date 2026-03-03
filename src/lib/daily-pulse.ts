// Daily Market Pulse -- rotates through stocks, earnings, and AI insights
// Each day surfaces a different stock spotlight with thesis + earnings context

import { stocks, type Stock } from "./stock-data";
import { earningsCalendar, type EarningsEntry } from "./earnings-data";

export interface DailyPulse {
  readonly spotlightStock: Stock;
  readonly aiScoreLabel: string;
  readonly upcomingEarnings: EarningsEntry | null;
  readonly earningsCountdown: number | null; // days until earnings, null if > 14 days
  readonly dayIndex: number;
}

function getDaysSinceEpoch(): number {
  const epoch = new Date(2026, 0, 1).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - epoch) / 86400000);
}

function getAIScoreLabel(score: number): string {
  if (score >= 85) return "Strong Signal";
  if (score >= 70) return "Bullish";
  if (score >= 55) return "Neutral-Positive";
  if (score >= 40) return "Mixed Signals";
  return "Cautious";
}

function findUpcomingEarnings(): EarningsEntry | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const twoWeeksOut = new Date(today);
  twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);

  // Find the nearest earnings within 14 days
  let nearest: EarningsEntry | null = null;
  let nearestDays = Infinity;

  for (const entry of earningsCalendar) {
    const earningsDate = new Date(entry.nextEarningsDate);
    earningsDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.floor(
      (earningsDate.getTime() - today.getTime()) / 86400000,
    );

    if (daysUntil >= 0 && daysUntil <= 14 && daysUntil < nearestDays) {
      nearest = entry;
      nearestDays = daysUntil;
    }
  }

  return nearest;
}

function getEarningsCountdown(entry: EarningsEntry): number | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const earningsDate = new Date(entry.nextEarningsDate);
  earningsDate.setHours(0, 0, 0, 0);
  const days = Math.floor(
    (earningsDate.getTime() - today.getTime()) / 86400000,
  );
  return days >= 0 && days <= 14 ? days : null;
}

export function getDailyPulse(): DailyPulse {
  const dayIndex = getDaysSinceEpoch() % stocks.length;
  const spotlightStock = stocks[dayIndex];
  const upcomingEarnings = findUpcomingEarnings();

  return {
    spotlightStock,
    aiScoreLabel: getAIScoreLabel(spotlightStock.aiScore),
    upcomingEarnings,
    earningsCountdown: upcomingEarnings
      ? getEarningsCountdown(upcomingEarnings)
      : null,
    dayIndex,
  };
}
