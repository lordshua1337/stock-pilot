// Investor Identity -- LocalStorage persistence layer
// Stores the full DNA profile so it survives page refreshes
// Structured for AI inference (buildDNAContext reads from this)

import type { DNAProfile } from "./dna-scoring";

const STORAGE_KEY = "stockpilot_financial_dna";
const ANSWERS_KEY = "stockpilot_dna_answers";
const TIMINGS_KEY = "stockpilot_dna_timings";
const HISTORY_KEY = "stockpilot_dna_history";

// ---------------------------------------------------------------------------
// Profile storage
// ---------------------------------------------------------------------------

export interface StoredDNAProfile extends DNAProfile {
  completedAt: string; // ISO date
  assessmentVersion: string;
  coachingContract: string[];
}

export interface DNAHistoryEntry {
  completedAt: string;
  dimensions: DNAProfile["dimensions"];
  communicationArchetype: string;
}

export function saveDNAProfile(profile: DNAProfile): StoredDNAProfile {
  const stored: StoredDNAProfile = {
    ...profile,
    completedAt: new Date().toISOString(),
    assessmentVersion: "1.0",
    coachingContract: [],
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    // Also append to longitudinal history
    const history = getDNAHistory();
    const entry: DNAHistoryEntry = {
      completedAt: stored.completedAt,
      dimensions: stored.dimensions,
      communicationArchetype: stored.communicationArchetype,
    };
    history.push(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  return stored;
}

export function loadDNAProfile(): StoredDNAProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredDNAProfile;
  } catch {
    return null;
  }
}

export function deleteDNAProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ANSWERS_KEY);
  localStorage.removeItem(TIMINGS_KEY);
  localStorage.removeItem(HISTORY_KEY);
}

export function getDNAHistory(): DNAHistoryEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as DNAHistoryEntry[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Coaching contract (user-confirmed commitments)
// ---------------------------------------------------------------------------

export function updateCoachingContract(commitments: string[]): void {
  const profile = loadDNAProfile();
  if (!profile) return;

  const updated: StoredDNAProfile = {
    ...profile,
    coachingContract: commitments,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}

// ---------------------------------------------------------------------------
// In-progress answer persistence (so users can resume mid-assessment)
// ---------------------------------------------------------------------------

export function saveAnswersInProgress(answers: Record<string, number>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
}

export function loadAnswersInProgress(): Record<string, number> | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ANSWERS_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return null;
  }
}

export function clearAnswersInProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ANSWERS_KEY);
  localStorage.removeItem(TIMINGS_KEY);
}

// ---------------------------------------------------------------------------
// Response timings persistence
// ---------------------------------------------------------------------------

export function saveTimings(timings: Record<string, number>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TIMINGS_KEY, JSON.stringify(timings));
}

export function loadTimings(): Record<string, number> | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TIMINGS_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Check if user has completed assessment
// ---------------------------------------------------------------------------

export function hasCompletedDNA(): boolean {
  return loadDNAProfile() !== null;
}

