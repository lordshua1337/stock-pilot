// Portfolio rebalancing advisor.
// Suggests allocation adjustments based on archetype fit, equal-weight targets,
// or custom targets. All functions are pure.

import type { Stock } from "./stock-data";
import type { ArchetypeKey } from "./financial-dna";
import { scoreStockForArchetype } from "./archetype-stock-scores";

export interface RebalanceAdvice {
  ticker: string;
  name: string;
  currentAllocation: number;
  targetAllocation: number;
  delta: number; // positive = buy more, negative = trim
  action: "buy" | "trim" | "hold" | "consider-selling";
  score: number; // archetype fit score (0-100)
  dollarChange: number; // how much $ to move
}

export interface RebalanceSummary {
  advice: RebalanceAdvice[];
  improvementScore: number; // estimated improvement in archetype fit 0-100
  totalBuys: number;
  totalTrims: number;
  method: "archetype" | "equal-weight";
}

export function generateRebalanceAdvice(
  items: ReadonlyArray<{ ticker: string; allocation: number }>,
  stockMap: ReadonlyMap<string, Stock>,
  totalInvestment: number,
  archetype?: ArchetypeKey
): RebalanceSummary {
  if (items.length === 0) {
    return {
      advice: [],
      improvementScore: 0,
      totalBuys: 0,
      totalTrims: 0,
      method: archetype ? "archetype" : "equal-weight",
    };
  }

  const totalAlloc = items.reduce((s, i) => s + i.allocation, 0);

  if (archetype) {
    return generateArchetypeRebalance(
      items,
      stockMap,
      totalInvestment,
      totalAlloc,
      archetype
    );
  }

  return generateEqualWeightRebalance(
    items,
    stockMap,
    totalInvestment,
    totalAlloc
  );
}

// Rebalance toward archetype-optimal weights
function generateArchetypeRebalance(
  items: ReadonlyArray<{ ticker: string; allocation: number }>,
  stockMap: ReadonlyMap<string, Stock>,
  totalInvestment: number,
  totalAlloc: number,
  archetype: ArchetypeKey
): RebalanceSummary {
  // Score each stock, then allocate proportionally to scores
  const scored = items.map((item) => {
    const stock = stockMap.get(item.ticker);
    const score = stock
      ? scoreStockForArchetype(stock, archetype).score
      : 50;
    return { ...item, score, stock };
  });

  const totalScore = scored.reduce((s, i) => s + i.score, 0);

  let currentFitScore = 0;
  let targetFitScore = 0;

  const advice: RebalanceAdvice[] = scored.map((item) => {
    const targetAlloc =
      totalScore > 0
        ? Math.round((item.score / totalScore) * totalAlloc)
        : Math.round(totalAlloc / items.length);
    const delta = targetAlloc - item.allocation;
    const dollarChange = (delta / 100) * totalInvestment;

    // Current fit = weighted by current allocation
    currentFitScore += item.score * (item.allocation / totalAlloc);
    // Target fit = weighted by target allocation
    targetFitScore += item.score * (targetAlloc / totalAlloc);

    let action: RebalanceAdvice["action"] = "hold";
    if (delta >= 3) action = "buy";
    else if (delta <= -3) action = "trim";
    if (item.score < 25 && item.allocation > 5) action = "consider-selling";

    return {
      ticker: item.ticker,
      name: item.stock?.name ?? item.ticker,
      currentAllocation: item.allocation,
      targetAllocation: targetAlloc,
      delta,
      action,
      score: item.score,
      dollarChange,
    };
  });

  // Sort: highest-delta buys first, then trims
  advice.sort((a, b) => b.delta - a.delta);

  const improvementScore = Math.round(
    Math.max(0, targetFitScore - currentFitScore)
  );

  return {
    advice,
    improvementScore,
    totalBuys: advice.filter((a) => a.action === "buy").length,
    totalTrims: advice.filter(
      (a) => a.action === "trim" || a.action === "consider-selling"
    ).length,
    method: "archetype",
  };
}

// Simple equal-weight rebalance
function generateEqualWeightRebalance(
  items: ReadonlyArray<{ ticker: string; allocation: number }>,
  stockMap: ReadonlyMap<string, Stock>,
  totalInvestment: number,
  totalAlloc: number
): RebalanceSummary {
  const equalWeight = Math.round(totalAlloc / items.length);

  const advice: RebalanceAdvice[] = items.map((item) => {
    const stock = stockMap.get(item.ticker);
    const delta = equalWeight - item.allocation;
    const dollarChange = (delta / 100) * totalInvestment;

    let action: RebalanceAdvice["action"] = "hold";
    if (delta >= 3) action = "buy";
    else if (delta <= -3) action = "trim";

    return {
      ticker: item.ticker,
      name: stock?.name ?? item.ticker,
      currentAllocation: item.allocation,
      targetAllocation: equalWeight,
      delta,
      action,
      score: stock ? stock.aiScore : 50,
      dollarChange,
    };
  });

  advice.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return {
    advice,
    improvementScore: 0,
    totalBuys: advice.filter((a) => a.action === "buy").length,
    totalTrims: advice.filter((a) => a.action === "trim").length,
    method: "equal-weight",
  };
}
