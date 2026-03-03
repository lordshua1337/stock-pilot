import type { Stock } from "./stock-data";

// --- Types ---

export interface ScreenerFilters {
  priceMin: number | null;
  priceMax: number | null;
  aiScoreMin: number | null;
  aiScoreMax: number | null;
  peRatioMax: number | null;
  dividendYieldMin: number | null;
  betaMin: number | null;
  betaMax: number | null;
  analystRatings: Set<string>;
}

export interface ScreenerPreset {
  id: string;
  label: string;
  description: string;
  filters: Partial<ScreenerFiltersRaw>;
}

// Serializable version for localStorage (Sets become arrays)
interface ScreenerFiltersRaw {
  priceMin: number | null;
  priceMax: number | null;
  aiScoreMin: number | null;
  aiScoreMax: number | null;
  peRatioMax: number | null;
  dividendYieldMin: number | null;
  betaMin: number | null;
  betaMax: number | null;
  analystRatings: string[];
}

// --- Defaults ---

export const EMPTY_FILTERS: ScreenerFilters = {
  priceMin: null,
  priceMax: null,
  aiScoreMin: null,
  aiScoreMax: null,
  peRatioMax: null,
  dividendYieldMin: null,
  betaMin: null,
  betaMax: null,
  analystRatings: new Set(),
};

export const ALL_RATINGS = ["Strong Buy", "Buy", "Hold", "Sell"] as const;

// --- Presets ---

export const SCREENER_PRESETS: ScreenerPreset[] = [
  {
    id: "growth",
    label: "Growth Picks",
    description: "AI Score 75+, Buy or Strong Buy",
    filters: {
      aiScoreMin: 75,
      analystRatings: ["Strong Buy", "Buy"],
    },
  },
  {
    id: "value",
    label: "Value Plays",
    description: "P/E under 25, pays a dividend",
    filters: {
      peRatioMax: 25,
      dividendYieldMin: 0.5,
    },
  },
  {
    id: "income",
    label: "Income",
    description: "Dividend yield 2%+",
    filters: {
      dividendYieldMin: 2,
    },
  },
  {
    id: "lowvol",
    label: "Low Volatility",
    description: "Beta under 1.0",
    filters: {
      betaMax: 1.0,
    },
  },
];

// --- Filter logic ---

export function applyScreenerFilters(
  stocks: readonly Stock[],
  filters: ScreenerFilters
): Stock[] {
  return stocks.filter((s) => {
    if (filters.priceMin !== null && s.price < filters.priceMin) return false;
    if (filters.priceMax !== null && s.price > filters.priceMax) return false;
    if (filters.aiScoreMin !== null && s.aiScore < filters.aiScoreMin)
      return false;
    if (filters.aiScoreMax !== null && s.aiScore > filters.aiScoreMax)
      return false;
    if (filters.peRatioMax !== null && s.peRatio > filters.peRatioMax)
      return false;
    if (
      filters.dividendYieldMin !== null &&
      s.dividendYield < filters.dividendYieldMin
    )
      return false;
    if (filters.betaMin !== null && s.beta < filters.betaMin) return false;
    if (filters.betaMax !== null && s.beta > filters.betaMax) return false;
    if (
      filters.analystRatings.size > 0 &&
      !filters.analystRatings.has(s.analystRating)
    )
      return false;
    return true;
  });
}

export function countActiveFilters(filters: ScreenerFilters): number {
  let count = 0;
  if (filters.priceMin !== null || filters.priceMax !== null) count++;
  if (filters.aiScoreMin !== null || filters.aiScoreMax !== null) count++;
  if (filters.peRatioMax !== null) count++;
  if (filters.dividendYieldMin !== null) count++;
  if (filters.betaMin !== null || filters.betaMax !== null) count++;
  if (filters.analystRatings.size > 0) count++;
  return count;
}

// --- Preset application ---

export function applyPreset(preset: ScreenerPreset): ScreenerFilters {
  const raw = preset.filters;
  return {
    ...EMPTY_FILTERS,
    priceMin: raw.priceMin ?? null,
    priceMax: raw.priceMax ?? null,
    aiScoreMin: raw.aiScoreMin ?? null,
    aiScoreMax: raw.aiScoreMax ?? null,
    peRatioMax: raw.peRatioMax ?? null,
    dividendYieldMin: raw.dividendYieldMin ?? null,
    betaMin: raw.betaMin ?? null,
    betaMax: raw.betaMax ?? null,
    analystRatings: new Set(raw.analystRatings ?? []),
  };
}

// --- localStorage persistence ---

const STORAGE_KEY = "stockpilot-screener-filters";

export function saveFilters(filters: ScreenerFilters): void {
  try {
    const raw: ScreenerFiltersRaw = {
      ...filters,
      analystRatings: [...filters.analystRatings],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
  } catch {
    // localStorage unavailable — silent fail
  }
}

export function loadFilters(): ScreenerFilters | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const raw: ScreenerFiltersRaw = JSON.parse(stored);
    return {
      priceMin: raw.priceMin ?? null,
      priceMax: raw.priceMax ?? null,
      aiScoreMin: raw.aiScoreMin ?? null,
      aiScoreMax: raw.aiScoreMax ?? null,
      peRatioMax: raw.peRatioMax ?? null,
      dividendYieldMin: raw.dividendYieldMin ?? null,
      betaMin: raw.betaMin ?? null,
      betaMax: raw.betaMax ?? null,
      analystRatings: new Set(raw.analystRatings ?? []),
    };
  } catch {
    return null;
  }
}
