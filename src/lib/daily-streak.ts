// Daily streak engine -- localStorage-backed habit tracker
// Rules:
// - "Active" = completed the daily action (not just opened the app)
// - Grace period: missing 1 day freezes the streak, missing 2 resets it
// - Milestones at 3, 7, 14, 30 days

const STORAGE_KEY = "stockpilot-daily-streak";

export interface StreakState {
  readonly currentStreak: number;
  readonly longestStreak: number;
  readonly lastActiveDate: string; // "YYYY-MM-DD"
  readonly totalDaysActive: number;
  readonly completedToday: boolean;
}

const DEFAULT_STATE: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: "",
  totalDaysActive: 0,
  completedToday: false,
};

export const MILESTONES = [3, 7, 14, 30, 60, 100] as const;

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayBeforeYesterdayString(): string {
  const dby = new Date();
  dby.setDate(dby.getDate() - 2);
  const year = dby.getFullYear();
  const month = String(dby.getMonth() + 1).padStart(2, "0");
  const day = String(dby.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function loadStreak(): StreakState {
  if (typeof window === "undefined") return DEFAULT_STATE;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    const stored = JSON.parse(raw) as StreakState;
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const dayBeforeYesterday = getDayBeforeYesterdayString();

    if (stored.lastActiveDate === today) {
      return { ...stored, completedToday: true };
    }

    if (stored.lastActiveDate === yesterday) {
      return { ...stored, completedToday: false };
    }

    if (stored.lastActiveDate === dayBeforeYesterday) {
      return { ...stored, completedToday: false };
    }

    return {
      ...DEFAULT_STATE,
      longestStreak: stored.longestStreak,
      totalDaysActive: stored.totalDaysActive,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function completeToday(current: StreakState): StreakState {
  if (current.completedToday) return current;

  const today = getTodayString();
  const newStreak = current.currentStreak + 1;
  const newLongest = Math.max(newStreak, current.longestStreak);

  const updated: StreakState = {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastActiveDate: today,
    totalDaysActive: current.totalDaysActive + 1,
    completedToday: true,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return updated;
}

export function getReachedMilestone(streak: number): number | null {
  if (MILESTONES.includes(streak as (typeof MILESTONES)[number])) {
    return streak;
  }
  return null;
}

export function getNextMilestone(streak: number): number {
  for (const m of MILESTONES) {
    if (streak < m) return m;
  }
  return MILESTONES[MILESTONES.length - 1];
}
