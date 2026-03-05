// Insight Cache -- 24hr localStorage cache for AI-generated insights
// Immutable, SSR-safe, per-page caching

import type { AIInsight } from "./insight-generator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CachedInsight {
  readonly insight: AIInsight;
  readonly expiresAt: string;
}

interface InsightCacheState {
  readonly entries: Record<string, CachedInsight>;
  readonly dismissed: Record<string, string>; // pageId -> dismissedAt ISO
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const STORAGE_KEY = "stockpilot_ai_insights";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function loadCache(): InsightCacheState {
  const storage = getStorage();
  if (!storage) return { entries: {}, dismissed: {} };

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { entries: {}, dismissed: {} };
    return JSON.parse(raw) as InsightCacheState;
  } catch {
    return { entries: {}, dismissed: {} };
  }
}

function saveCache(state: InsightCacheState): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full
  }
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

export function getCachedInsight(cacheKey: string): AIInsight | null {
  const cache = loadCache();
  const entry = cache.entries[cacheKey];
  if (!entry) return null;

  // Check expiration
  if (new Date(entry.expiresAt).getTime() < Date.now()) {
    // Expired -- clean up
    const { [cacheKey]: _removed, ...remaining } = cache.entries;
    saveCache({ ...cache, entries: remaining });
    return null;
  }

  return { ...entry.insight };
}

export function cacheInsight(cacheKey: string, insight: AIInsight): void {
  const cache = loadCache();
  const updated: InsightCacheState = {
    ...cache,
    entries: {
      ...cache.entries,
      [cacheKey]: {
        insight,
        expiresAt: new Date(Date.now() + TTL_MS).toISOString(),
      },
    },
  };
  saveCache(updated);
}

export function isDismissed(pageId: string): boolean {
  const cache = loadCache();
  const dismissedAt = cache.dismissed[pageId];
  if (!dismissedAt) return false;

  // Dismissal lasts 24 hours
  return new Date(dismissedAt).getTime() + TTL_MS > Date.now();
}

export function dismissInsight(pageId: string): void {
  const cache = loadCache();
  const updated: InsightCacheState = {
    ...cache,
    dismissed: {
      ...cache.dismissed,
      [pageId]: new Date().toISOString(),
    },
  };
  saveCache(updated);
}

export function clearDismissal(pageId: string): void {
  const cache = loadCache();
  const { [pageId]: _removed, ...remaining } = cache.dismissed;
  saveCache({ ...cache, dismissed: remaining });
}

export function invalidateCache(cacheKey: string): void {
  const cache = loadCache();
  const { [cacheKey]: _removed, ...remaining } = cache.entries;
  saveCache({ ...cache, entries: remaining });
}

export function buildCacheKey(pageId: string, ticker?: string): string {
  return ticker ? `${pageId}:${ticker}` : pageId;
}
