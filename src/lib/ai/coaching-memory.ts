// Coaching Memory -- tracks which insights the user acted on vs dismissed
// Builds a feedback loop so the AI learns what resonates

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FeedbackAction = "acted" | "dismissed" | "saved";

export interface InsightFeedback {
  readonly insightId: string;
  readonly pageId: string;
  readonly insightType: string;
  readonly insightTitle: string;
  readonly action: FeedbackAction;
  readonly timestamp: string;
}

export interface UserPreference {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly createdAt: string;
}

export interface CoachingMemoryState {
  readonly feedback: readonly InsightFeedback[];
  readonly preferences: readonly UserPreference[];
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const STORAGE_KEY = "stockpilot_coaching_memory";
const MAX_FEEDBACK = 200;

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadCoachingMemory(): CoachingMemoryState {
  const storage = getStorage();
  if (!storage) {
    return { feedback: [], preferences: [], createdAt: new Date().toISOString() };
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return { feedback: [], preferences: [], createdAt: new Date().toISOString() };
    }
    const parsed = JSON.parse(raw) as CoachingMemoryState;
    return {
      ...parsed,
      feedback: parsed.feedback.map((f) => ({ ...f })),
      preferences: parsed.preferences.map((p) => ({ ...p })),
    };
  } catch {
    return { feedback: [], preferences: [], createdAt: new Date().toISOString() };
  }
}

function saveCoachingMemory(state: CoachingMemoryState): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full
  }
}

// ---------------------------------------------------------------------------
// Feedback operations (immutable)
// ---------------------------------------------------------------------------

export function recordFeedback(
  state: CoachingMemoryState,
  feedback: Omit<InsightFeedback, "timestamp">
): CoachingMemoryState {
  const entry: InsightFeedback = {
    ...feedback,
    timestamp: new Date().toISOString(),
  };

  const updated: CoachingMemoryState = {
    ...state,
    feedback: [entry, ...state.feedback].slice(0, MAX_FEEDBACK),
  };
  saveCoachingMemory(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Preference operations (immutable)
// ---------------------------------------------------------------------------

export function addPreference(
  state: CoachingMemoryState,
  label: string,
  value: string
): CoachingMemoryState {
  const pref: UserPreference = {
    id: `pref_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    label,
    value,
    createdAt: new Date().toISOString(),
  };

  const updated: CoachingMemoryState = {
    ...state,
    preferences: [...state.preferences, pref],
  };
  saveCoachingMemory(updated);
  return updated;
}

export function removePreference(
  state: CoachingMemoryState,
  prefId: string
): CoachingMemoryState {
  const updated: CoachingMemoryState = {
    ...state,
    preferences: state.preferences.filter((p) => p.id !== prefId),
  };
  saveCoachingMemory(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Analytics from feedback
// ---------------------------------------------------------------------------

export interface CoachingAnalytics {
  readonly totalFeedback: number;
  readonly actedCount: number;
  readonly dismissedCount: number;
  readonly savedCount: number;
  readonly actedRate: number;
  readonly topActedTypes: readonly string[];
  readonly topDismissedTypes: readonly string[];
}

export function getCoachingAnalytics(
  state: CoachingMemoryState
): CoachingAnalytics {
  const acted = state.feedback.filter((f) => f.action === "acted");
  const dismissed = state.feedback.filter((f) => f.action === "dismissed");
  const saved = state.feedback.filter((f) => f.action === "saved");

  const countByType = (items: readonly InsightFeedback[]) => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.insightType] = (counts[item.insightType] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type);
  };

  return {
    totalFeedback: state.feedback.length,
    actedCount: acted.length,
    dismissedCount: dismissed.length,
    savedCount: saved.length,
    actedRate:
      state.feedback.length > 0
        ? acted.length / state.feedback.length
        : 0,
    topActedTypes: countByType(acted).slice(0, 3),
    topDismissedTypes: countByType(dismissed).slice(0, 3),
  };
}

// ---------------------------------------------------------------------------
// Build memory context for AI system prompt
// ---------------------------------------------------------------------------

export function buildMemoryContext(state: CoachingMemoryState): string {
  const analytics = getCoachingAnalytics(state);
  const parts: string[] = [];

  if (analytics.totalFeedback > 0) {
    parts.push(`\n--- COACHING MEMORY ---`);
    parts.push(`Insights acted on: ${analytics.actedCount}/${analytics.totalFeedback} (${Math.round(analytics.actedRate * 100)}%)`);

    if (analytics.topActedTypes.length > 0) {
      parts.push(`They respond best to: ${analytics.topActedTypes.join(", ")} insights`);
    }
    if (analytics.topDismissedTypes.length > 0) {
      parts.push(`They tend to dismiss: ${analytics.topDismissedTypes.join(", ")} insights`);
    }

    // Recent feedback (last 5)
    const recent = state.feedback.slice(0, 5);
    if (recent.length > 0) {
      parts.push(`Recent reactions: ${recent.map((f) => `${f.action} "${f.insightTitle}"`).join("; ")}`);
    }
  }

  if (state.preferences.length > 0) {
    parts.push(`\n--- USER PREFERENCES ---`);
    for (const pref of state.preferences) {
      parts.push(`${pref.label}: ${pref.value}`);
    }
  }

  return parts.join("\n");
}
