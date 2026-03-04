// Benchmark comparison engine.
// Compares portfolio metrics against S&P 500 averages using static data.
// All functions are pure -- no side effects, no mutations.

import type { Stock } from "./stock-data";

// ─── S&P 500 Benchmark Data (approximate averages) ────────────────────

const SP500_BENCHMARK = {
  name: "S&P 500",
  peRatio: 22.0,
  dividendYield: 1.32,
  beta: 1.0,
  aiScore: 65,
  sectorWeights: new Map<string, number>([
    ["Technology", 32],
    ["Healthcare", 13],
    ["Finance", 13],
    ["Consumer", 11],
    ["Industrial", 9],
    ["Energy", 4],
    ["Real Estate", 2.5],
    ["Utilities", 2.5],
  ]),
} as const;

// ─── Types ────────────────────────────────────────────────────────────

export interface MetricComparison {
  label: string;
  portfolio: number;
  benchmark: number;
  delta: number; // portfolio - benchmark
  deltaPercent: number; // (delta / benchmark) * 100
  direction: "higher" | "lower" | "even";
  interpretation: string; // short human-readable meaning
}

export interface SectorComparison {
  sector: string;
  portfolioWeight: number;
  benchmarkWeight: number;
  delta: number;
  overUnder: "over" | "under" | "even";
}

export interface BenchmarkAnalysis {
  metrics: MetricComparison[];
  sectors: SectorComparison[];
  diversificationScore: number; // 0-100
  summary: string;
}

// ─── Core Functions ───────────────────────────────────────────────────

export function comparePortfolioToBenchmark(
  items: ReadonlyArray<{ ticker: string; allocation: number }>,
  stockMap: ReadonlyMap<string, Stock>,
  totalInvestment: number
): BenchmarkAnalysis {
  const totalAlloc = items.reduce((sum, i) => sum + i.allocation, 0);
  if (totalAlloc === 0) {
    return emptyAnalysis();
  }

  // Calculate weighted portfolio averages
  let weightedPE = 0;
  let weightedYield = 0;
  let weightedBeta = 0;
  let weightedAI = 0;
  const sectorAlloc = new Map<string, number>();

  for (const item of items) {
    const stock = stockMap.get(item.ticker);
    if (!stock) continue;

    const weight = item.allocation / totalAlloc;
    weightedPE += stock.peRatio * weight;
    weightedYield += stock.dividendYield * weight;
    weightedBeta += stock.beta * weight;
    weightedAI += stock.aiScore * weight;

    const current = sectorAlloc.get(stock.sector) ?? 0;
    sectorAlloc.set(stock.sector, current + item.allocation);
  }

  // Normalize sector allocations to percentages of total
  const normalizedSectors = new Map<string, number>();
  for (const [sector, alloc] of sectorAlloc) {
    normalizedSectors.set(sector, (alloc / totalAlloc) * 100);
  }

  // Build metric comparisons
  const metrics: MetricComparison[] = [
    buildMetric("P/E Ratio", weightedPE, SP500_BENCHMARK.peRatio, "pe"),
    buildMetric(
      "Dividend Yield",
      weightedYield,
      SP500_BENCHMARK.dividendYield,
      "yield"
    ),
    buildMetric("Beta", weightedBeta, SP500_BENCHMARK.beta, "beta"),
    buildMetric("AI Score", weightedAI, SP500_BENCHMARK.aiScore, "ai"),
  ];

  // Build sector comparisons
  const allSectors = new Set([
    ...normalizedSectors.keys(),
    ...SP500_BENCHMARK.sectorWeights.keys(),
  ]);
  const sectors: SectorComparison[] = [];
  for (const sector of allSectors) {
    const pw = normalizedSectors.get(sector) ?? 0;
    const bw = SP500_BENCHMARK.sectorWeights.get(sector) ?? 0;
    const delta = pw - bw;
    sectors.push({
      sector,
      portfolioWeight: pw,
      benchmarkWeight: bw,
      delta,
      overUnder:
        Math.abs(delta) < 0.5 ? "even" : delta > 0 ? "over" : "under",
    });
  }
  sectors.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  // Diversification score: penalize deviation from benchmark weights
  const diversificationScore = calculateDiversificationScore(
    normalizedSectors,
    SP500_BENCHMARK.sectorWeights
  );

  // Summary
  const summary = buildSummary(metrics, diversificationScore);

  return { metrics, sectors, diversificationScore, summary };
}

// ─── Helpers ──────────────────────────────────────────────────────────

function buildMetric(
  label: string,
  portfolio: number,
  benchmark: number,
  type: "pe" | "yield" | "beta" | "ai"
): MetricComparison {
  const delta = portfolio - benchmark;
  const deltaPercent = benchmark !== 0 ? (delta / benchmark) * 100 : 0;
  const direction: MetricComparison["direction"] =
    Math.abs(delta) < 0.01 ? "even" : delta > 0 ? "higher" : "lower";

  let interpretation = "";
  switch (type) {
    case "pe":
      interpretation =
        direction === "higher"
          ? "You're paying more for earnings growth"
          : direction === "lower"
            ? "Better value relative to the market"
            : "In line with market valuations";
      break;
    case "yield":
      interpretation =
        direction === "higher"
          ? "Generating more income than the market"
          : direction === "lower"
            ? "Less income focus than average"
            : "Income in line with market average";
      break;
    case "beta":
      interpretation =
        direction === "higher"
          ? "More volatile than the broad market"
          : direction === "lower"
            ? "Less volatile -- more defensive"
            : "Moves with the market";
      break;
    case "ai":
      interpretation =
        direction === "higher"
          ? "Higher conviction picks than average"
          : direction === "lower"
            ? "Below-average AI conviction"
            : "Average conviction level";
      break;
  }

  return {
    label,
    portfolio: Math.round(portfolio * 100) / 100,
    benchmark,
    delta: Math.round(delta * 100) / 100,
    deltaPercent: Math.round(deltaPercent * 10) / 10,
    direction,
    interpretation,
  };
}

function calculateDiversificationScore(
  portfolioSectors: ReadonlyMap<string, number>,
  benchmarkSectors: ReadonlyMap<string, number>
): number {
  // Sum of absolute deviations from benchmark weights
  const allSectors = new Set([
    ...portfolioSectors.keys(),
    ...benchmarkSectors.keys(),
  ]);
  let totalDeviation = 0;
  for (const sector of allSectors) {
    const pw = portfolioSectors.get(sector) ?? 0;
    const bw = benchmarkSectors.get(sector) ?? 0;
    totalDeviation += Math.abs(pw - bw);
  }

  // Max possible deviation is ~200 (100% in one sector vs spread)
  // Score: 100 = perfectly diversified like benchmark, 0 = maximally concentrated
  const score = Math.max(0, 100 - totalDeviation);
  return Math.round(score);
}

function buildSummary(
  metrics: MetricComparison[],
  diversificationScore: number
): string {
  const parts: string[] = [];

  const beta = metrics.find((m) => m.label === "Beta");
  if (beta && beta.direction === "higher") {
    parts.push("more aggressive than the market");
  } else if (beta && beta.direction === "lower") {
    parts.push("more defensive than the market");
  }

  const yld = metrics.find((m) => m.label === "Dividend Yield");
  if (yld && yld.direction === "higher") {
    parts.push("income-oriented");
  }

  if (diversificationScore >= 75) {
    parts.push("well-diversified");
  } else if (diversificationScore < 50) {
    parts.push("concentrated in fewer sectors");
  }

  if (parts.length === 0) return "Your portfolio is closely aligned with the market.";
  return `Your portfolio is ${parts.join(", ")}.`;
}

function emptyAnalysis(): BenchmarkAnalysis {
  return {
    metrics: [],
    sectors: [],
    diversificationScore: 0,
    summary: "Add stocks to see benchmark comparison.",
  };
}
