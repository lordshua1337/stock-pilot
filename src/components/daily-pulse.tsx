"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Check, ArrowRight, Zap, Calendar, Brain } from "lucide-react";
import {
  loadStreak,
  completeToday,
  getReachedMilestone,
  getNextMilestone,
  type StreakState,
} from "@/lib/daily-streak";
import { getDailyPulse, type DailyPulse } from "@/lib/daily-pulse";
import { loadDNAProfile, type StoredDNAProfile } from "@/lib/dna-storage";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";

const MILESTONE_LABELS: Record<number, string> = {
  3: "3-Day Trader",
  7: "Weekly Analyst",
  14: "Market Veteran",
  30: "Monthly Master",
  60: "Quarter King",
  100: "Century Investor",
};

function StreakBadge({ streak }: { readonly streak: StreakState }) {
  const isActive = streak.currentStreak > 0;

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
        isActive
          ? "bg-green-bg text-green"
          : "bg-surface-alt text-text-muted"
      }`}
    >
      <Flame className={`w-3.5 h-3.5 ${isActive ? "text-green" : ""}`} />
      {streak.currentStreak > 0 ? (
        <span>{streak.currentStreak} day streak</span>
      ) : (
        <span>Start a streak</span>
      )}
    </div>
  );
}

export default function DailyPulseCard() {
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [pulse, setPulse] = useState<DailyPulse | null>(null);
  const [dnaProfile, setDnaProfile] = useState<StoredDNAProfile | null>(null);
  const [milestone, setMilestone] = useState<number | null>(null);

  useEffect(() => {
    setStreak(loadStreak());
    setPulse(getDailyPulse());
    setDnaProfile(loadDNAProfile());
  }, []);

  function handleCheckIn() {
    if (!streak) return;
    const updated = completeToday(streak);
    setStreak(updated);

    const reached = getReachedMilestone(updated.currentStreak);
    if (reached) {
      setMilestone(reached);
      setTimeout(() => setMilestone(null), 3000);
    }
  }

  // SSR placeholder
  if (!streak || !pulse) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6 animate-pulse">
        <div className="h-4 bg-surface-alt rounded w-28 mb-4" />
        <div className="h-6 bg-surface-alt rounded w-48 mb-3" />
        <div className="h-4 bg-surface-alt rounded w-full mb-2" />
        <div className="h-4 bg-surface-alt rounded w-3/4" />
      </div>
    );
  }

  const { spotlightStock, aiScoreLabel, upcomingEarnings, earningsCountdown } =
    pulse;
  const scoreColor =
    spotlightStock.aiScore >= 80
      ? "text-green"
      : spotlightStock.aiScore >= 60
        ? "text-gold"
        : "text-red";
  const isUp = spotlightStock.change >= 0;
  const archetype = dnaProfile
    ? ARCHETYPE_INFO[dnaProfile.communicationArchetype]
    : null;
  const nextMilestone = getNextMilestone(streak.currentStreak);
  const progressToMilestone = streak.currentStreak / nextMilestone;

  return (
    <div className="relative bg-surface rounded-xl border border-border overflow-hidden">
      {/* Milestone celebration overlay */}
      {milestone && (
        <div className="absolute inset-0 bg-green/5 flex items-center justify-center z-10 rounded-xl animate-fade-in">
          <div className="text-center">
            <Flame className="w-8 h-8 text-green mx-auto mb-2" />
            <p className="text-lg font-semibold text-green">
              {MILESTONE_LABELS[milestone] || `${milestone}-Day Streak!`}
            </p>
            <p className="text-sm text-text-muted mt-1">Markets reward consistency.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-green" />
          <span className="text-xs text-green uppercase tracking-widest font-medium">
            Today&apos;s Pulse
          </span>
          {!streak.completedToday && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-bg text-green">
              New
            </span>
          )}
        </div>
        <StreakBadge streak={streak} />
      </div>

      <div className="px-6 pb-5 space-y-4">
        {/* Stock Spotlight */}
        <div className="bg-surface-alt rounded-lg p-4">
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2">
            Stock Spotlight
          </p>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-lg">
                {spotlightStock.ticker}
              </span>
              <span className="text-xs text-text-muted">
                {spotlightStock.sector}
              </span>
            </div>
            <div className="text-right">
              <span className={`font-mono text-lg font-bold ${scoreColor}`}>
                {spotlightStock.aiScore}
              </span>
              <p className="text-[10px] text-text-muted">{aiScoreLabel}</p>
            </div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
            {spotlightStock.thesis}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-mono text-text-muted">
              ${spotlightStock.price.toFixed(2)}
            </span>
            <span
              className={`text-xs font-mono ${isUp ? "text-green" : "text-red"}`}
            >
              {isUp ? "+" : ""}
              {spotlightStock.changePercent.toFixed(2)}%
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                spotlightStock.analystRating === "Strong Buy" ||
                spotlightStock.analystRating === "Buy"
                  ? "bg-green-bg text-green"
                  : spotlightStock.analystRating === "Hold"
                    ? "bg-blue-bg text-blue"
                    : "bg-red-bg text-red"
              }`}
            >
              {spotlightStock.analystRating}
            </span>
          </div>
        </div>

        {/* Earnings Alert (if any upcoming) */}
        {upcomingEarnings && earningsCountdown !== null && (
          <div className="flex items-start gap-3 bg-gold/5 border border-gold/10 rounded-lg p-3">
            <Calendar className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gold">
                Earnings Alert -- {upcomingEarnings.ticker} in{" "}
                {earningsCountdown === 0
                  ? "today"
                  : earningsCountdown === 1
                    ? "1 day"
                    : `${earningsCountdown} days`}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                Expected EPS: ${upcomingEarnings.expectedEPS.toFixed(2)} | Rev:{" "}
                {upcomingEarnings.revenueExpected}
              </p>
            </div>
          </div>
        )}

        {/* Personality Insight (if DNA profile exists) */}
        {archetype && (
          <div className="flex items-start gap-3 bg-blue-bg rounded-lg p-3">
            <Brain className="w-4 h-4 text-blue mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue">
                {archetype.name} Insight
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {archetype.tagline}
              </p>
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="flex items-center justify-between pt-1">
          {streak.completedToday ? (
            <div className="flex items-center gap-1.5 text-green text-sm font-medium">
              <Check className="w-4 h-4" />
              Checked in today
            </div>
          ) : (
            <button
              onClick={handleCheckIn}
              className="px-4 py-2 rounded-lg text-sm font-medium sp-btn-primary"
            >
              Check In
            </button>
          )}
          <Link
            href={`/research/${spotlightStock.ticker.toLowerCase()}`}
            className="text-green text-sm font-medium hover:text-green-light transition-colors inline-flex items-center gap-1"
          >
            Full research
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Progress footer */}
      {streak.currentStreak > 0 && (
        <div className="px-6 pb-4">
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between text-[10px] text-text-muted mb-1.5">
              <span>{streak.totalDaysActive} check-ins</span>
              <span>
                {nextMilestone - streak.currentStreak} to{" "}
                {MILESTONE_LABELS[nextMilestone] ||
                  `${nextMilestone}-day streak`}
              </span>
            </div>
            <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green to-green-light rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(progressToMilestone * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
