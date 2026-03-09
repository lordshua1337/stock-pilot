// Investment Journal -- trade diary with emotional tracking
// Captures the WHY behind every buy/sell/hold decision
// All operations are immutable, returns new state

export type JournalAction = "buy" | "sell" | "hold" | "watchlist" | "exit";
export type EmotionalState =
  | "calm"
  | "confident"
  | "anxious"
  | "excited"
  | "fomo"
  | "panicking"
  | "uncertain"
  | "disciplined";

export type BiasTag =
  | "anchoring"
  | "recency"
  | "confirmation"
  | "loss_aversion"
  | "overconfidence"
  | "herd_mentality"
  | "sunk_cost"
  | "disposition_effect";

export interface JournalEntry {
  readonly id: string;
  readonly ticker: string;
  readonly action: JournalAction;
  readonly thesis: string;
  readonly emotionalState: EmotionalState;
  readonly biases: readonly BiasTag[];
  readonly followedRule: boolean; // did they follow their behavioral rule?
  readonly outcome?: string; // optional post-trade reflection
  readonly priceAtEntry: number;
  readonly timestamp: string;
}

export interface JournalState {
  readonly entries: readonly JournalEntry[];
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// Emotional state metadata
// ---------------------------------------------------------------------------

export const EMOTIONAL_STATES: Record<
  EmotionalState,
  { readonly label: string; readonly color: string; readonly icon: string }
> = {
  calm: { label: "Calm", color: "#006DD8", icon: "leaf" },
  confident: { label: "Confident", color: "#448AFF", icon: "shield" },
  anxious: { label: "Anxious", color: "#FFD740", icon: "alert-triangle" },
  excited: { label: "Excited", color: "#E040FB", icon: "zap" },
  fomo: { label: "FOMO", color: "#FF8A65", icon: "flame" },
  panicking: { label: "Panicking", color: "#FF5252", icon: "alert-circle" },
  uncertain: { label: "Uncertain", color: "#8B8B8B", icon: "help-circle" },
  disciplined: { label: "Disciplined", color: "#0058B0", icon: "target" },
};

export const BIAS_INFO: Record<
  BiasTag,
  { readonly label: string; readonly description: string }
> = {
  anchoring: {
    label: "Anchoring",
    description:
      "Fixating on a specific price point or piece of information when making decisions",
  },
  recency: {
    label: "Recency Bias",
    description:
      "Overweighting recent events and assuming they will continue",
  },
  confirmation: {
    label: "Confirmation Bias",
    description:
      "Seeking information that confirms your existing beliefs about a stock",
  },
  loss_aversion: {
    label: "Loss Aversion",
    description:
      "Feeling losses more intensely than equivalent gains, leading to holding losers too long",
  },
  overconfidence: {
    label: "Overconfidence",
    description:
      "Overestimating your ability to predict outcomes or pick winners",
  },
  herd_mentality: {
    label: "Herd Mentality",
    description:
      "Following the crowd instead of doing your own analysis",
  },
  sunk_cost: {
    label: "Sunk Cost",
    description:
      "Continuing to hold because of what you already invested, not future prospects",
  },
  disposition_effect: {
    label: "Disposition Effect",
    description:
      "Selling winners too early and holding losers too long",
  },
};

export const ACTION_INFO: Record<
  JournalAction,
  { readonly label: string; readonly color: string }
> = {
  buy: { label: "Buy", color: "#006DD8" },
  sell: { label: "Sell", color: "#FF5252" },
  hold: { label: "Hold", color: "#448AFF" },
  watchlist: { label: "Watchlist", color: "#FFD740" },
  exit: { label: "Exit", color: "#FF8A65" },
};

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const STORAGE_KEY = "stockpilot_journal";

export function loadJournal(): JournalState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as JournalState) : null;
  } catch {
    return null;
  }
}

export function saveJournal(state: JournalState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createJournal(): JournalState {
  return {
    entries: [],
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Operations (immutable)
// ---------------------------------------------------------------------------

export function addEntry(
  state: JournalState,
  entry: Omit<JournalEntry, "id" | "timestamp">
): JournalState {
  const newEntry: JournalEntry = {
    ...entry,
    id: `j_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  return { ...state, entries: [newEntry, ...state.entries] };
}

export function updateOutcome(
  state: JournalState,
  entryId: string,
  outcome: string
): JournalState {
  return {
    ...state,
    entries: state.entries.map((e) =>
      e.id === entryId ? { ...e, outcome } : e
    ),
  };
}

export function deleteEntry(
  state: JournalState,
  entryId: string
): JournalState {
  return {
    ...state,
    entries: state.entries.filter((e) => e.id !== entryId),
  };
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface JournalAnalytics {
  readonly totalEntries: number;
  readonly thisMonth: number;
  readonly ruleFollowRate: number;
  readonly emotionBreakdown: ReadonlyMap<EmotionalState, number>;
  readonly biasFrequency: ReadonlyMap<BiasTag, number>;
  readonly actionBreakdown: ReadonlyMap<JournalAction, number>;
  readonly streakDays: number; // consecutive days with entries
  readonly calmTradeRate: number; // % of trades made while calm/confident/disciplined
  readonly avgEntriesPerWeek: number;
}

export function getAnalytics(state: JournalState): JournalAnalytics {
  const entries = state.entries;
  const now = new Date();
  const thisMonth = entries.filter((e) => {
    const d = new Date(e.timestamp);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Rule-following rate
  const withRule = entries.filter((e) => e.followedRule !== undefined);
  const ruleFollowRate =
    withRule.length > 0
      ? withRule.filter((e) => e.followedRule).length / withRule.length
      : 0;

  // Emotion breakdown
  const emotionBreakdown = new Map<EmotionalState, number>();
  for (const e of entries) {
    emotionBreakdown.set(
      e.emotionalState,
      (emotionBreakdown.get(e.emotionalState) ?? 0) + 1
    );
  }

  // Bias frequency
  const biasFrequency = new Map<BiasTag, number>();
  for (const e of entries) {
    for (const b of e.biases) {
      biasFrequency.set(b, (biasFrequency.get(b) ?? 0) + 1);
    }
  }

  // Action breakdown
  const actionBreakdown = new Map<JournalAction, number>();
  for (const e of entries) {
    actionBreakdown.set(e.action, (actionBreakdown.get(e.action) ?? 0) + 1);
  }

  // Streak calculation (consecutive days with entries, counting back from today)
  const entryDates = new Set(
    entries.map((e) => new Date(e.timestamp).toISOString().slice(0, 10))
  );
  let streakDays = 0;
  const check = new Date();
  while (entryDates.has(check.toISOString().slice(0, 10))) {
    streakDays++;
    check.setDate(check.getDate() - 1);
  }

  // Calm trade rate
  const calmStates: ReadonlySet<EmotionalState> = new Set([
    "calm",
    "confident",
    "disciplined",
  ]);
  const calmTrades = entries.filter((e) => calmStates.has(e.emotionalState));
  const calmTradeRate =
    entries.length > 0 ? calmTrades.length / entries.length : 0;

  // Average entries per week
  const firstEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const weeksSinceFirst = firstEntry
    ? Math.max(
        1,
        (now.getTime() - new Date(firstEntry.timestamp).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      )
    : 1;

  return {
    totalEntries: entries.length,
    thisMonth,
    ruleFollowRate,
    emotionBreakdown,
    biasFrequency,
    actionBreakdown,
    streakDays,
    calmTradeRate,
    avgEntriesPerWeek: entries.length / weeksSinceFirst,
  };
}

// ---------------------------------------------------------------------------
// Pattern detection (AI-like insights)
// ---------------------------------------------------------------------------

export interface JournalInsight {
  readonly type: "warning" | "positive" | "neutral";
  readonly title: string;
  readonly description: string;
}

export function detectPatterns(state: JournalState): readonly JournalInsight[] {
  const analytics = getAnalytics(state);
  const insights: JournalInsight[] = [];

  if (state.entries.length < 3) return insights;

  // Anxious trading pattern
  const anxiousCount = analytics.emotionBreakdown.get("anxious") ?? 0;
  const panicCount = analytics.emotionBreakdown.get("panicking") ?? 0;
  const stressedPct =
    (anxiousCount + panicCount) / Math.max(1, analytics.totalEntries);
  if (stressedPct > 0.3) {
    insights.push({
      type: "warning",
      title: "High-Stress Trading Detected",
      description: `${Math.round(stressedPct * 100)}% of your entries were made while anxious or panicking. Consider waiting 24 hours before acting when stressed.`,
    });
  }

  // FOMO pattern
  const fomoCount = analytics.emotionBreakdown.get("fomo") ?? 0;
  if (fomoCount >= 3) {
    insights.push({
      type: "warning",
      title: "FOMO Pattern",
      description: `You've logged ${fomoCount} FOMO-driven entries. FOMO trades typically underperform. Next time, write down your thesis before acting.`,
    });
  }

  // Good discipline
  if (analytics.ruleFollowRate >= 0.8 && analytics.totalEntries >= 5) {
    insights.push({
      type: "positive",
      title: "Strong Discipline",
      description: `You followed your behavioral rule ${Math.round(analytics.ruleFollowRate * 100)}% of the time. Keep it up -- consistent rule-followers outperform by 12-15%.`,
    });
  }

  // Bias awareness
  const totalBiases = Array.from(analytics.biasFrequency.values()).reduce(
    (sum, c) => sum + c,
    0
  );
  if (totalBiases > 0 && analytics.totalEntries >= 5) {
    const mostCommon = Array.from(analytics.biasFrequency.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];
    if (mostCommon) {
      const biasLabel = BIAS_INFO[mostCommon[0]].label;
      insights.push({
        type: "neutral",
        title: `Most Common Bias: ${biasLabel}`,
        description: `${biasLabel} appeared in ${mostCommon[1]} of your entries. Awareness is the first step -- you're already ahead by tracking it.`,
      });
    }
  }

  // Calm trading correlation
  if (analytics.calmTradeRate >= 0.7 && analytics.totalEntries >= 5) {
    insights.push({
      type: "positive",
      title: "Emotionally Grounded",
      description: `${Math.round(analytics.calmTradeRate * 100)}% of your decisions were made in a calm state. Research shows calm decisions outperform emotional ones by 20%+.`,
    });
  }

  // Streak
  if (analytics.streakDays >= 3) {
    insights.push({
      type: "positive",
      title: `${analytics.streakDays}-Day Journaling Streak`,
      description: `You've logged entries ${analytics.streakDays} days in a row. Consistent journaling is the #1 habit of improving investors.`,
    });
  }

  return insights;
}
