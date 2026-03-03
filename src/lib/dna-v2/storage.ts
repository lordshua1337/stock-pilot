// Investor Identity v2 -- localStorage persistence for profiles and sessions
// Separate keys from V1 to allow clean migration path

import type { DNAProfileV2, TriadResponse, AssessmentSession } from "./types";

// Storage keys
const STORAGE_KEYS = {
  PROFILE_V2: "stockpilot_dna_v2",
  SESSION_V2: "stockpilot_dna_v2_session",
  HISTORY_V2: "stockpilot_dna_v2_history",
  PROFILE_V1: "stockpilot_dna_profile", // V1 key for migration detection
} as const;

// Extended profile type with metadata
export interface StoredDNAProfileV2 extends DNAProfileV2 {
  readonly completedAt: string;
  readonly assessmentVersion: string;
  readonly coachingContract: readonly string[];
}

// History entry type
export interface DNAHistoryEntryV2 {
  readonly completedAt: string;
  readonly factors: Record<string, number>;
  readonly archetype: string;
}

// Helper: Safe window check for SSR
function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

// Helper: Safely parse JSON
function safeJsonParse<T>(json: string | null): T | null {
  if (!json) {
    return null;
  }
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

// Save a completed V2 profile with metadata
export function saveV2Profile(profile: DNAProfileV2): StoredDNAProfileV2 {
  const storage = getStorage();
  if (!storage) {
    return enrichProfileWithMetadata(profile);
  }

  const enriched = enrichProfileWithMetadata(profile);

  try {
    storage.setItem(STORAGE_KEYS.PROFILE_V2, JSON.stringify(enriched));
    return enriched;
  } catch (error) {
    console.error("Failed to save V2 profile:", error);
    return enriched;
  }
}

// Load the most recent V2 profile
export function loadV2Profile(): StoredDNAProfileV2 | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const stored = storage.getItem(STORAGE_KEYS.PROFILE_V2);
    return safeJsonParse<StoredDNAProfileV2>(stored);
  } catch (error) {
    console.error("Failed to load V2 profile:", error);
    return null;
  }
}

// Delete the current V2 profile
export function deleteV2Profile(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(STORAGE_KEYS.PROFILE_V2);
  } catch (error) {
    console.error("Failed to delete V2 profile:", error);
  }
}

// Get full history of previous assessments
export function getV2History(): DNAHistoryEntryV2[] {
  const storage = getStorage();
  if (!storage) {
    return [];
  }

  try {
    const stored = storage.getItem(STORAGE_KEYS.HISTORY_V2);
    const history = safeJsonParse<DNAHistoryEntryV2[]>(stored);
    return history ?? [];
  } catch (error) {
    console.error("Failed to load V2 history:", error);
    return [];
  }
}

// Append current profile to history
export function appendToV2History(profile: StoredDNAProfileV2): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    const history = getV2History();

    // Convert primary factors to numeric record
    const factorsRecord: Record<string, number> = {};
    for (const [code, factor] of Object.entries(profile.factors.primary)) {
      factorsRecord[code] = factor.normalized;
    }

    const entry: DNAHistoryEntryV2 = {
      completedAt: profile.completedAt,
      factors: factorsRecord,
      archetype: profile.archetype.primary,
    };

    const updated = [...history, entry];
    storage.setItem(STORAGE_KEYS.HISTORY_V2, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to append to V2 history:", error);
  }
}

// Save in-progress answers for recovery
export function saveV2AnswersInProgress(responses: readonly TriadResponse[]): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    const session: AssessmentSession = {
      responses,
      startedAt: Date.now(),
    };
    storage.setItem(STORAGE_KEYS.SESSION_V2, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to save V2 session answers:", error);
  }
}

// Load in-progress answers if they exist
export function loadV2AnswersInProgress(): readonly TriadResponse[] | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const stored = storage.getItem(STORAGE_KEYS.SESSION_V2);
    const session = safeJsonParse<AssessmentSession>(stored);
    return session?.responses ?? null;
  } catch (error) {
    console.error("Failed to load V2 session answers:", error);
    return null;
  }
}

// Clear in-progress session (call after completing assessment)
export function clearV2AnswersInProgress(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(STORAGE_KEYS.SESSION_V2);
  } catch (error) {
    console.error("Failed to clear V2 session answers:", error);
  }
}

// Check if user has already completed V2 assessment
export function hasCompletedDNAV2(): boolean {
  return loadV2Profile() !== null;
}

// Check if V1 profile exists (for migration prompts)
export function hasV1Profile(): boolean {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(STORAGE_KEYS.PROFILE_V1) !== null;
  } catch {
    return false;
  }
}

// Helper: Enrich profile with metadata
function enrichProfileWithMetadata(profile: DNAProfileV2): StoredDNAProfileV2 {
  return {
    ...profile,
    completedAt: new Date().toISOString(),
    assessmentVersion: "2.0",
    coachingContract: generateCoachingContract(profile),
  };
}

// Helper: Generate coaching contract from profile
function generateCoachingContract(profile: DNAProfileV2): string[] {
  const contract: string[] = [];

  // Based on archetype
  contract.push(`Primary archetype: ${profile.archetype.primary}`);

  // Top bias if severe
  const topBias = profile.biasFlags.find((b) => b.severity >= 2);
  if (topBias) {
    contract.push(`Focus area: Address ${topBias.label}`);
  }

  // Top friction trigger
  if (profile.frictionTriggers.length > 0) {
    contract.push(`Stress trigger: ${profile.frictionTriggers[0]}`);
  }

  // Behavioral rule
  contract.push(`Golden rule: ${profile.behavioralRule}`);

  return contract;
}
