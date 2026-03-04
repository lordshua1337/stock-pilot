// Advanced stock screener with multi-filter support.
// Pure functions -- no side effects.

import type { Stock } from "./stock-data";
import type { ArchetypeKey } from "./financial-dna";

export interface ScreenerFilters {
  sector: string; // "all" for no filter
  peMin: number;
  peMax: number;
  yieldMin: number;
  yieldMax: number;
  betaMin: number;
  betaMax: number;
  aiScoreMin: number;
  aiScoreMax: number;
  analystRating: string; // "all", "Strong Buy", "Buy", "Hold", "Sell"
}

export type SortField =
  | "ticker"
  | "price"
  | "change"
  | "pe"
  | "yield"
  | "beta"
  | "aiScore";
export type SortDir = "asc" | "desc";

export const DEFAULT_FILTERS: ScreenerFilters = {
  sector: "all",
  peMin: 0,
  peMax: 200,
  yieldMin: 0,
  yieldMax: 20,
  betaMin: 0,
  betaMax: 3,
  aiScoreMin: 0,
  aiScoreMax: 100,
  analystRating: "all",
};

export function screenStocks(
  stocks: ReadonlyArray<Stock>,
  filters: ScreenerFilters,
  sortField: SortField = "aiScore",
  sortDir: SortDir = "desc"
): Stock[] {
  let result = stocks.filter((s) => {
    if (filters.sector !== "all" && s.sector !== filters.sector) return false;
    if (s.peRatio < filters.peMin || s.peRatio > filters.peMax) return false;
    if (
      s.dividendYield < filters.yieldMin ||
      s.dividendYield > filters.yieldMax
    )
      return false;
    if (s.beta < filters.betaMin || s.beta > filters.betaMax) return false;
    if (s.aiScore < filters.aiScoreMin || s.aiScore > filters.aiScoreMax)
      return false;
    if (
      filters.analystRating !== "all" &&
      s.analystRating !== filters.analystRating
    )
      return false;
    return true;
  });

  const dir = sortDir === "asc" ? 1 : -1;
  result = [...result].sort((a, b) => {
    switch (sortField) {
      case "ticker":
        return dir * a.ticker.localeCompare(b.ticker);
      case "price":
        return dir * (a.price - b.price);
      case "change":
        return dir * (a.changePercent - b.changePercent);
      case "pe":
        return dir * (a.peRatio - b.peRatio);
      case "yield":
        return dir * (a.dividendYield - b.dividendYield);
      case "beta":
        return dir * (a.beta - b.beta);
      case "aiScore":
        return dir * (a.aiScore - b.aiScore);
      default:
        return 0;
    }
  });

  return result;
}

// Preset filters per archetype
export function getArchetypeFilters(
  archetype: ArchetypeKey
): ScreenerFilters {
  switch (archetype) {
    case "avoider_under_stress":
      return {
        ...DEFAULT_FILTERS,
        betaMax: 1.0,
        yieldMin: 1.0,
        aiScoreMin: 50,
      };
    case "reassurance_seeker":
      return {
        ...DEFAULT_FILTERS,
        betaMax: 1.1,
        analystRating: "Buy",
        aiScoreMin: 60,
      };
    case "trend_sensitive_explorer":
      return {
        ...DEFAULT_FILTERS,
        betaMin: 1.0,
        aiScoreMin: 50,
      };
    case "action_first_decider":
      return {
        ...DEFAULT_FILTERS,
        betaMin: 1.2,
      };
    case "big_picture_optimist":
      return {
        ...DEFAULT_FILTERS,
        peMin: 20,
        aiScoreMin: 60,
      };
    case "values_anchored_steward":
      return {
        ...DEFAULT_FILTERS,
        yieldMin: 1.5,
        betaMax: 1.2,
        aiScoreMin: 55,
      };
    case "analytical_skeptic":
      return {
        ...DEFAULT_FILTERS,
        aiScoreMin: 70,
        peMax: 35,
      };
    case "systems_builder":
      return {
        ...DEFAULT_FILTERS,
        aiScoreMin: 65,
        analystRating: "Buy",
      };
    case "diy_controller":
      return {
        ...DEFAULT_FILTERS,
        peMax: 30,
        aiScoreMin: 55,
      };
    case "collaborative_partner":
      return {
        ...DEFAULT_FILTERS,
        aiScoreMin: 50,
      };
    default:
      return DEFAULT_FILTERS;
  }
}
