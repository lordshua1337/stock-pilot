// Bias Correction Engine
// Detects when portfolio behavior diverges from the user's archetype principles.
// Returns contextual nudges to help the user stay aligned with their investment identity.

import type { ArchetypeKey } from "./financial-dna";
import type { Stock } from "./stock-data";
import { scoreStockForArchetype } from "./archetype-stock-scores";

export interface BiasNudge {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  message: string;
  affectedTickers: string[];
}

interface PortfolioItem {
  ticker: string;
  allocation: number;
}

// ─── Nudge Detectors ──────────────────────────────────────────────────

type NudgeDetector = (
  items: ReadonlyArray<PortfolioItem>,
  stockMap: ReadonlyMap<string, Stock>,
  archetype: ArchetypeKey
) => BiasNudge | null;

// 1. Vault Keeper holding high-beta stocks
const detectHighBetaForDefensive: NudgeDetector = (items, stockMap, archetype) => {
  if (archetype !== "avoider_under_stress" && archetype !== "reassurance_seeker") {
    return null;
  }

  const highBeta = items.filter((i) => {
    const s = stockMap.get(i.ticker);
    return s && s.beta > 1.3;
  });

  if (highBeta.length === 0) return null;

  const tickers = highBeta.map((i) => i.ticker);
  const label = archetype === "avoider_under_stress" ? "Vault Keeper" : "Steady Hand";

  return {
    id: "high-beta-defensive",
    severity: highBeta.length >= 3 ? "high" : "medium",
    title: `High-volatility stocks in a ${label} portfolio`,
    message: `${tickers.join(", ")} have beta > 1.3. As a ${label}, market swings on these positions may cause stress that leads to panic selling.`,
    affectedTickers: tickers,
  };
};

// 2. Marathon Capitalist with short-horizon plays
const detectShortHorizonForLongTerm: NudgeDetector = (items, stockMap, archetype) => {
  if (archetype !== "big_picture_optimist") return null;

  // High momentum + high beta = likely short-term plays
  const shortTerm = items.filter((i) => {
    const s = stockMap.get(i.ticker);
    return s && s.beta > 1.4 && s.changePercent > 3;
  });

  if (shortTerm.length === 0) return null;

  return {
    id: "short-horizon-long-term",
    severity: "medium",
    title: "Momentum plays in a long-term portfolio",
    message: `${shortTerm.map((i) => i.ticker).join(", ")} look like short-term momentum plays. As a Marathon Capitalist, consider whether these fit your long-arc thesis or if you're chasing trends.`,
    affectedTickers: shortTerm.map((i) => i.ticker),
  };
};

// 3. Wave Rider with too much stability
const detectOverStabilityForTrend: NudgeDetector = (items, stockMap, archetype) => {
  if (archetype !== "trend_sensitive_explorer") return null;

  const stable = items.filter((i) => {
    const s = stockMap.get(i.ticker);
    return s && s.beta < 0.7 && s.dividendYield > 2;
  });

  const stableAlloc = stable.reduce((sum, i) => sum + i.allocation, 0);
  const totalAlloc = items.reduce((sum, i) => sum + i.allocation, 0);

  if (totalAlloc === 0 || stableAlloc / totalAlloc < 0.4) return null;

  return {
    id: "over-stability-trend",
    severity: "low",
    title: "Heavy stability allocation for a Wave Rider",
    message: `${Math.round((stableAlloc / totalAlloc) * 100)}% of your portfolio is in low-beta, high-yield stocks. As a Wave Rider, this may cap your upside on momentum plays.`,
    affectedTickers: stable.map((i) => i.ticker),
  };
};

// 4. Concentration risk for any archetype
const detectConcentration: NudgeDetector = (items, stockMap, archetype) => {
  const overweight = items.filter((i) => i.allocation >= 25);
  if (overweight.length === 0) return null;

  return {
    id: "concentration-risk",
    severity: overweight.some((i) => i.allocation >= 40) ? "high" : "medium",
    title: "Heavy concentration in single positions",
    message: `${overweight.map((i) => `${i.ticker} (${i.allocation}%)`).join(", ")} -- having more than 25% in one stock amplifies risk regardless of conviction.`,
    affectedTickers: overweight.map((i) => i.ticker),
  };
};

// 5. Low-score stocks for user's archetype
const detectLowFitStocks: NudgeDetector = (items, stockMap, archetype) => {
  const lowFit = items.filter((i) => {
    const s = stockMap.get(i.ticker);
    if (!s) return false;
    const scored = scoreStockForArchetype(s, archetype);
    return scored.score < 35;
  });

  if (lowFit.length === 0) return null;

  return {
    id: "low-archetype-fit",
    severity: lowFit.length >= 3 ? "medium" : "low",
    title: "Stocks with low archetype compatibility",
    message: `${lowFit.map((i) => i.ticker).join(", ")} score below 35 for your investor identity. They may not align with your natural investment approach.`,
    affectedTickers: lowFit.map((i) => i.ticker),
  };
};

// 6. Sector over-concentration
const detectSectorConcentration: NudgeDetector = (items, stockMap) => {
  const sectorAlloc = new Map<string, number>();
  for (const item of items) {
    const stock = stockMap.get(item.ticker);
    if (!stock) continue;
    const current = sectorAlloc.get(stock.sector) ?? 0;
    sectorAlloc.set(stock.sector, current + item.allocation);
  }

  const totalAlloc = items.reduce((sum, i) => sum + i.allocation, 0);
  if (totalAlloc === 0) return null;

  const overweightSectors: string[] = [];
  for (const [sector, alloc] of sectorAlloc) {
    if (alloc / totalAlloc > 0.5) {
      overweightSectors.push(`${sector} (${Math.round((alloc / totalAlloc) * 100)}%)`);
    }
  }

  if (overweightSectors.length === 0) return null;

  return {
    id: "sector-concentration",
    severity: "medium",
    title: "Sector over-concentration",
    message: `${overweightSectors.join(", ")} -- more than 50% of your portfolio is in one sector. A sector downturn would hit hard.`,
    affectedTickers: [],
  };
};

// ─── Main Function ────────────────────────────────────────────────────

const ALL_DETECTORS: NudgeDetector[] = [
  detectHighBetaForDefensive,
  detectShortHorizonForLongTerm,
  detectOverStabilityForTrend,
  detectConcentration,
  detectLowFitStocks,
  detectSectorConcentration,
];

export function detectBiases(
  items: ReadonlyArray<PortfolioItem>,
  stockMap: ReadonlyMap<string, Stock>,
  archetype: ArchetypeKey
): BiasNudge[] {
  if (items.length === 0) return [];

  const nudges: BiasNudge[] = [];
  for (const detector of ALL_DETECTORS) {
    const nudge = detector(items, stockMap, archetype);
    if (nudge) nudges.push(nudge);
  }

  // Sort by severity: high first
  const order = { high: 0, medium: 1, low: 2 };
  return nudges.sort((a, b) => order[a.severity] - order[b.severity]);
}
