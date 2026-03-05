"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Plus,
  Trash2,
  BarChart3,
} from "lucide-react";
import {
  loadCoachingMemory,
  getCoachingAnalytics,
  addPreference,
  removePreference,
  type CoachingMemoryState,
  type CoachingAnalytics,
  type InsightFeedback,
} from "@/lib/ai/coaching-memory";

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feedback Timeline
// ---------------------------------------------------------------------------

function FeedbackTimeline({
  feedback,
}: {
  feedback: readonly InsightFeedback[];
}) {
  const actionConfig = {
    acted: {
      icon: ThumbsUp,
      color: "text-green",
      bg: "bg-green/10",
      label: "Acted on",
    },
    dismissed: {
      icon: ThumbsDown,
      color: "text-red",
      bg: "bg-red/10",
      label: "Dismissed",
    },
    saved: {
      icon: Bookmark,
      color: "text-blue",
      bg: "bg-blue/10",
      label: "Saved",
    },
  } as const;

  if (feedback.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="w-8 h-8 text-text-muted mx-auto mb-2" />
        <p className="text-sm text-text-muted">No feedback recorded yet.</p>
        <p className="text-xs text-text-muted mt-1">
          Interact with AI insights on any page to start building your coaching
          memory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {feedback.slice(0, 20).map((entry, i) => {
        const config = actionConfig[entry.action];
        const Icon = config.icon;
        return (
          <div
            key={`${entry.insightId}_${i}`}
            className="flex items-start gap-3 bg-surface-alt rounded-lg p-3"
          >
            <div
              className={`w-6 h-6 rounded ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}
            >
              <Icon className={`w-3 h-3 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary truncate">
                {entry.insightTitle}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-[10px] font-medium ${config.color}`}
                >
                  {config.label}
                </span>
                <span className="text-[10px] text-text-muted">
                  {entry.insightType} -- {entry.pageId}
                </span>
                <span className="text-[10px] text-text-muted">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preferences Manager
// ---------------------------------------------------------------------------

function PreferencesManager({
  state,
  onStateChange,
}: {
  state: CoachingMemoryState;
  onStateChange: (s: CoachingMemoryState) => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAdd = useCallback(() => {
    if (!newLabel.trim() || !newValue.trim()) return;
    const updated = addPreference(state, newLabel.trim(), newValue.trim());
    onStateChange(updated);
    setNewLabel("");
    setNewValue("");
  }, [state, newLabel, newValue, onStateChange]);

  const handleRemove = useCallback(
    (prefId: string) => {
      const updated = removePreference(state, prefId);
      onStateChange(updated);
    },
    [state, onStateChange]
  );

  return (
    <div>
      <p className="text-xs text-text-muted mb-3">
        Tell the AI what matters to you. These preferences shape every insight
        and recommendation.
      </p>

      {/* Existing preferences */}
      {state.preferences.length > 0 && (
        <div className="space-y-2 mb-4">
          {state.preferences.map((pref) => (
            <div
              key={pref.id}
              className="flex items-center gap-3 bg-surface-alt rounded-lg p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  {pref.label}
                </p>
                <p className="text-xs text-text-secondary">{pref.value}</p>
              </div>
              <button
                onClick={() => handleRemove(pref.id)}
                className="p-1.5 rounded text-text-muted hover:text-red hover:bg-red/10 transition-colors shrink-0"
                title="Remove preference"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new preference */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Label (e.g. Risk Tolerance)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="flex-1 bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/50"
        />
        <input
          type="text"
          placeholder="Value (e.g. Conservative)"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/50"
        />
        <button
          onClick={handleAdd}
          disabled={!newLabel.trim() || !newValue.trim()}
          className="px-3 py-2 rounded-lg bg-green/10 text-green border border-green/20 hover:bg-green/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CoachingPage() {
  const [state, setState] = useState<CoachingMemoryState | null>(null);
  const [analytics, setAnalytics] = useState<CoachingAnalytics | null>(null);

  useEffect(() => {
    const loaded = loadCoachingMemory();
    setState(loaded);
    setAnalytics(getCoachingAnalytics(loaded));
  }, []);

  const handleStateChange = useCallback((newState: CoachingMemoryState) => {
    setState(newState);
    setAnalytics(getCoachingAnalytics(newState));
  }, []);

  if (!state || !analytics) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <p className="text-sm text-text-muted">Loading coaching memory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/personality/results"
            className="p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-green" />
              Coaching Memory
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              What the AI has learned about your preferences
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total Feedback"
            value={analytics.totalFeedback}
            color="text-text-primary"
          />
          <StatCard
            label="Acted On"
            value={analytics.actedCount}
            sub={`${Math.round(analytics.actedRate * 100)}% rate`}
            color="text-green"
          />
          <StatCard
            label="Dismissed"
            value={analytics.dismissedCount}
            color="text-red"
          />
          <StatCard
            label="Saved"
            value={analytics.savedCount}
            color="text-blue"
          />
        </div>

        {/* What resonates / what doesn't */}
        {(analytics.topActedTypes.length > 0 ||
          analytics.topDismissedTypes.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {analytics.topActedTypes.length > 0 && (
              <div className="bg-surface border border-green/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-green" />
                  <h3 className="text-sm font-semibold">Resonates Most</h3>
                </div>
                <div className="space-y-1">
                  {analytics.topActedTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-block text-xs bg-green/10 text-green px-2 py-1 rounded mr-1"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {analytics.topDismissedTypes.length > 0 && (
              <div className="bg-surface border border-red/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-red" />
                  <h3 className="text-sm font-semibold">Often Dismissed</h3>
                </div>
                <div className="space-y-1">
                  {analytics.topDismissedTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-block text-xs bg-red/10 text-red px-2 py-1 rounded mr-1"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preferences */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-green/10 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-green" />
            </span>
            Your Preferences
          </h3>
          <PreferencesManager
            state={state}
            onStateChange={handleStateChange}
          />
        </div>

        {/* Feedback timeline */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-3">Feedback Timeline</h3>
          <FeedbackTimeline feedback={state.feedback} />
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-text-muted text-center mt-6">
          Coaching memory is stored locally in your browser. It helps the AI
          learn what resonates with you.
        </p>
      </div>
    </div>
  );
}
