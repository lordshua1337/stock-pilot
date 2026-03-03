// Portfolio localStorage persistence layer
// Follows the same pattern as dna-storage.ts: SSR-safe, immutable returns, namespaced keys.

export interface StoredPortfolioItem {
  ticker: string;
  allocation: number; // percentage 0-100
}

export interface StoredPortfolio {
  items: StoredPortfolioItem[];
  investment: number;
  savedAt: string; // ISO date
}

const PORTFOLIO_KEY = "stockpilot_portfolio";

export function savePortfolio(
  items: StoredPortfolioItem[],
  investment: number
): StoredPortfolio {
  const stored: StoredPortfolio = {
    items: items.map((i) => ({ ...i })),
    investment,
    savedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(stored));
    } catch {
      // Storage full or unavailable -- fail silently
    }
  }

  return stored;
}

export function loadPortfolio(): StoredPortfolio | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(PORTFOLIO_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredPortfolio;
    // Return a defensive copy
    return {
      ...parsed,
      items: parsed.items.map((i) => ({ ...i })),
    };
  } catch {
    return null;
  }
}

export function deletePortfolio(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PORTFOLIO_KEY);
}

export function hasStoredPortfolio(): boolean {
  return loadPortfolio() !== null;
}
