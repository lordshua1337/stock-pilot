// Risk Radar -- Portfolio risk analysis engine
// Calculates 6 risk dimensions, stress tests, personality-calibrated thresholds,
// and generates risk alerts. All calculations derived from stock data + portfolio.

import type { Stock } from "./stock-data";
import type { StoredPortfolioItem } from "./portfolio-storage";
import type { CoreDimensions } from "./financial-dna";

// ─── Types ─────────────────────────────────────────────────────────────

export interface RiskDimension {
  readonly key: string;
  readonly label: string;
  readonly score: number; // 0-100 (higher = MORE risk)
  readonly personalThreshold: number; // 0-100 (max acceptable for this archetype)
  readonly description: string;
  readonly detail: string;
}

export interface RiskAlert {
  readonly severity: "high" | "medium" | "low";
  readonly title: string;
  readonly message: string;
  readonly dimension: string;
}

export interface StressScenario {
  readonly name: string;
  readonly description: string;
  readonly marketDrop: number; // percentage (e.g., -20)
  readonly estimatedLoss: number; // dollar amount
  readonly estimatedLossPercent: number;
  readonly survivability: "high" | "medium" | "low";
}

export interface PositionRisk {
  readonly ticker: string;
  readonly allocation: number;
  readonly beta: number;
  readonly riskContribution: number; // percentage of total portfolio risk
  readonly signal: "safe" | "caution" | "danger";
  readonly reason: string;
}

export interface RiskAnalysis {
  readonly overallScore: number; // 0-100
  readonly overallLabel: string;
  readonly dimensions: readonly RiskDimension[];
  readonly alerts: readonly RiskAlert[];
  readonly stressTests: readonly StressScenario[];
  readonly positionRisks: readonly PositionRisk[];
  readonly sectorBreakdown: readonly SectorWeight[];
}

export interface SectorWeight {
  readonly sector: string;
  readonly weight: number;
  readonly count: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Risk Dimension Calculators ────────────────────────────────────────

function calcConcentrationRisk(
  items: readonly StoredPortfolioItem[]
): number {
  if (items.length === 0) return 0;
  if (items.length === 1) return 100;

  // Herfindahl-Hirschman Index (HHI) normalized to 0-100
  const totalAlloc = items.reduce((sum, i) => sum + i.allocation, 0);
  if (totalAlloc === 0) return 0;

  const hhi = items.reduce((sum, i) => {
    const share = (i.allocation / totalAlloc) * 100;
    return sum + share * share;
  }, 0);

  // HHI ranges from 10000/n (perfect distribution) to 10000 (one stock)
  // Normalize: 10000 = 100 risk, 10000/n = 0 risk
  const minHHI = 10000 / items.length;
  const normalized = ((hhi - minHHI) / (10000 - minHHI)) * 100;
  return clamp(Math.round(normalized), 0, 100);
}

function calcSectorOverlap(
  items: readonly StoredPortfolioItem[],
  stockMap: ReadonlyMap<string, Stock>
): number {
  if (items.length === 0) return 0;

  const sectorWeights = new Map<string, number>();
  let totalAlloc = 0;

  for (const item of items) {
    const stock = stockMap.get(item.ticker);
    if (!stock) continue;
    const current = sectorWeights.get(stock.sector) ?? 0;
    sectorWeights.set(stock.sector, current + item.allocation);
    totalAlloc += item.allocation;
  }

  if (totalAlloc === 0) return 0;

  // Largest sector weight as % of total
  let maxWeight = 0;
  for (const weight of sectorWeights.values()) {
    const pct = (weight / totalAlloc) * 100;
    if (pct > maxWeight) maxWeight = pct;
  }

  // If one sector > 50% = high risk; < 20% per sector = low risk
  return clamp(Math.round((maxWeight - 20) * 1.25), 0, 100);
}

function calcBetaExposure(
  items: readonly StoredPortfolioItem[],
  stockMap: ReadonlyMap<string, Stock>
): number {
  if (items.length === 0) return 0;

  let weightedBeta = 0;
  let totalAlloc = 0;

  for (const item of items) {
    const stock = stockMap.get(item.ticker);
    if (!stock) continue;
    weightedBeta += stock.beta * item.allocation;
    totalAlloc += item.allocation;
  }

  if (totalAlloc === 0) return 0;

  const avgBeta = weightedBeta / totalAlloc;
  // Beta 0.5 = 0 risk, beta 2.0 = 100 risk
  return clamp(Math.round((avgBeta - 0.5) * 66.7), 0, 100);
}

function calcDividendDependence(
  items: readonly StoredPortfolioItem[],
  stockMap: ReadonlyMap<string, Stock>
): number {
  if (items.length === 0) return 0;

  let zeroDivAlloc = 0;
  let totalAlloc = 0;

  for (const item of items) {
    const stock = stockMap.get(item.ticker);
    if (!stock) continue;
    if (stock.dividendYield === 0) {
      zeroDivAlloc += item.allocation;
    }
    totalAlloc += item.allocation;
  }

  if (totalAlloc === 0) return 0;

  // Higher % of non-dividend stocks = higher income risk
  const noDivPct = (zeroDivAlloc / totalAlloc) * 100;
  return clamp(Math.round(noDivPct), 0, 100);
}

function calcAIScoreVariance(
  items: readonly StoredPortfolioItem[],
  stockMap: ReadonlyMap<string, Stock>
): number {
  const scores: number[] = [];

  for (const item of items) {
    const stock = stockMap.get(item.ticker);
    if (stock) scores.push(stock.aiScore);
  }

  if (scores.length < 2) return 0;

  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((sum, s) => sum + (s - mean) * (s - mean), 0) /
    scores.length;
  const stdDev = Math.sqrt(variance);

  // StdDev 0 = 0 risk, StdDev 30 = 100 risk
  return clamp(Math.round((stdDev / 30) * 100), 0, 100);
}

function calcCorrelationRisk(
  items: readonly StoredPortfolioItem[],
  stockMap: ReadonlyMap<string, Stock>
): number {
  if (items.length < 2) return 0;

  // Approximate correlation via sector + beta similarity
  const pairs: { sectorMatch: boolean; betaDiff: number }[] = [];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = stockMap.get(items[i].ticker);
      const b = stockMap.get(items[j].ticker);
      if (!a || !b) continue;
      pairs.push({
        sectorMatch: a.sector === b.sector,
        betaDiff: Math.abs(a.beta - b.beta),
      });
    }
  }

  if (pairs.length === 0) return 0;

  const sectorMatchPct =
    (pairs.filter((p) => p.sectorMatch).length / pairs.length) * 100;
  const avgBetaDiff =
    pairs.reduce((sum, p) => sum + p.betaDiff, 0) / pairs.length;

  // High sector overlap + low beta diff = high correlation
  const betaSimilarity = clamp(Math.round((1 - avgBetaDiff) * 50), 0, 50);
  const sectorScore = clamp(Math.round(sectorMatchPct * 0.5), 0, 50);

  return clamp(betaSimilarity + sectorScore, 0, 100);
}

// ─── Personality Thresholds ────────────────────────────────────────────

interface PersonalityThresholds {
  readonly concentration: number;
  readonly sectorOverlap: number;
  readonly betaExposure: number;
  readonly dividendGap: number;
  readonly aiVariance: number;
  readonly correlation: number;
}

function getPersonalityThresholds(
  dimensions: CoreDimensions | null
): PersonalityThresholds {
  if (!dimensions) {
    // Default thresholds for users without a profile
    return {
      concentration: 50,
      sectorOverlap: 50,
      betaExposure: 50,
      dividendGap: 50,
      aiVariance: 50,
      correlation: 50,
    };
  }

  const { R, D, H, E } = dimensions;

  return {
    // High risk tolerance -> higher threshold (more risk acceptable)
    concentration: clamp(30 + Math.round(R * 0.4), 20, 80),
    sectorOverlap: clamp(30 + Math.round(R * 0.3), 20, 70),
    // High risk + long horizon -> can handle more beta
    betaExposure: clamp(20 + Math.round(R * 0.4 + H * 0.2), 20, 85),
    // High discipline -> lower income gap tolerance
    dividendGap: clamp(60 - Math.round(D * 0.3), 30, 80),
    // High emotional regulation -> can handle more variance
    aiVariance: clamp(30 + Math.round(E * 0.3), 20, 70),
    // High discipline + high risk -> tolerate more correlation
    correlation: clamp(30 + Math.round(R * 0.2 + D * 0.2), 20, 70),
  };
}

// ─── Risk Alerts ───────────────────────────────────────────────────────

function generateAlerts(
  dimensions: readonly RiskDimension[]
): readonly RiskAlert[] {
  const alerts: RiskAlert[] = [];

  for (const dim of dimensions) {
    const excess = dim.score - dim.personalThreshold;

    if (excess > 30) {
      alerts.push({
        severity: "high",
        title: `${dim.label} Critical`,
        message: `Your ${dim.label.toLowerCase()} (${dim.score}) significantly exceeds your comfort zone (${dim.personalThreshold}). Consider rebalancing.`,
        dimension: dim.key,
      });
    } else if (excess > 10) {
      alerts.push({
        severity: "medium",
        title: `${dim.label} Elevated`,
        message: `Your ${dim.label.toLowerCase()} (${dim.score}) is above your personality threshold (${dim.personalThreshold}).`,
        dimension: dim.key,
      });
    } else if (excess > 0) {
      alerts.push({
        severity: "low",
        title: `${dim.label} Watch`,
        message: `Your ${dim.label.toLowerCase()} (${dim.score}) is approaching your threshold (${dim.personalThreshold}).`,
        dimension: dim.key,
      });
    }
  }

  return alerts.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

// ─── Stress Tests ──────────────────────────────────────────────────────

function runStressTests(
  items: readonly StoredPortfolioItem[],
  stockMap: ReadonlyMap<string, Stock>,
  investment: number,
  dimensions: CoreDimensions | null
): readonly StressScenario[] {
  const scenarios = [
    { name: "Mild Correction", description: "Market drops 10% -- a normal correction", drop: -10 },
    { name: "Bear Market", description: "Sustained 20% decline like early 2022", drop: -20 },
    { name: "Crash", description: "Severe 30% crash like March 2020 COVID", drop: -30 },
    { name: "Crisis", description: "40%+ crisis-level drop like 2008-2009", drop: -40 },
  ];

  // Calculate portfolio weighted beta
  let weightedBeta = 0;
  let totalAlloc = 0;
  for (const item of items) {
    const stock = stockMap.get(item.ticker);
    if (!stock) continue;
    weightedBeta += stock.beta * item.allocation;
    totalAlloc += item.allocation;
  }
  const avgBeta = totalAlloc > 0 ? weightedBeta / totalAlloc : 1;

  const riskTolerance = dimensions?.R ?? 50;

  return scenarios.map((s) => {
    // Portfolio drops more/less than market based on beta
    const portfolioDrop = s.drop * avgBeta;
    const dollarLoss = Math.round(investment * (Math.abs(portfolioDrop) / 100));
    const lossPct = Math.abs(portfolioDrop);

    let survivability: "high" | "medium" | "low";
    if (riskTolerance >= 70) {
      survivability = lossPct < 30 ? "high" : lossPct < 45 ? "medium" : "low";
    } else if (riskTolerance >= 40) {
      survivability = lossPct < 15 ? "high" : lossPct < 30 ? "medium" : "low";
    } else {
      survivability = lossPct < 10 ? "high" : lossPct < 20 ? "medium" : "low";
    }

    return {
      name: s.name,
      description: s.description,
      marketDrop: s.drop,
      estimatedLoss: dollarLoss,
      estimatedLossPercent: Math.round(lossPct * 10) / 10,
      survivability,
    };
  });
}

// ─── Position-Level Risk ───────────────────────────────────────────────

function analyzePositionRisks(
  items: readonly StoredPortfolioItem[],
  stockMap: ReadonlyMap<string, Stock>,
  dimensions: CoreDimensions | null
): readonly PositionRisk[] {
  const totalAlloc = items.reduce((sum, i) => sum + i.allocation, 0);
  if (totalAlloc === 0) return [];

  // Total portfolio beta-weighted risk
  let totalBetaRisk = 0;
  for (const item of items) {
    const stock = stockMap.get(item.ticker);
    if (!stock) continue;
    totalBetaRisk += stock.beta * item.allocation;
  }

  const riskTolerance = dimensions?.R ?? 50;

  return items.map((item) => {
    const stock = stockMap.get(item.ticker);
    if (!stock) {
      return {
        ticker: item.ticker,
        allocation: item.allocation,
        beta: 1,
        riskContribution: 0,
        signal: "caution" as const,
        reason: "Stock data unavailable",
      };
    }

    const contribution =
      totalBetaRisk > 0
        ? ((stock.beta * item.allocation) / totalBetaRisk) * 100
        : 0;

    let signal: "safe" | "caution" | "danger";
    let reason: string;

    const allocPct = (item.allocation / totalAlloc) * 100;

    if (stock.beta > 1.5 && allocPct > 15) {
      signal = "danger";
      reason = `High beta (${stock.beta.toFixed(1)}) with large position (${allocPct.toFixed(0)}%)`;
    } else if (stock.beta > 1.3 && riskTolerance < 40) {
      signal = "danger";
      reason = `Beta ${stock.beta.toFixed(1)} exceeds your risk comfort zone`;
    } else if (stock.beta > 1.2 || allocPct > 25) {
      signal = "caution";
      reason =
        allocPct > 25
          ? `Position is ${allocPct.toFixed(0)}% of portfolio -- concentration risk`
          : `Moderate beta (${stock.beta.toFixed(1)}) adds volatility`;
    } else {
      signal = "safe";
      reason = `Beta ${stock.beta.toFixed(1)} with ${allocPct.toFixed(0)}% allocation -- balanced`;
    }

    return {
      ticker: item.ticker,
      allocation: item.allocation,
      beta: stock.beta,
      riskContribution: Math.round(contribution * 10) / 10,
      signal,
      reason,
    };
  }).sort((a, b) => {
    const order = { danger: 0, caution: 1, safe: 2 };
    return order[a.signal] - order[b.signal];
  });
}

// ─── Sector Breakdown ──────────────────────────────────────────────────

function getSectorBreakdown(
  items: readonly StoredPortfolioItem[],
  stockMap: ReadonlyMap<string, Stock>
): readonly SectorWeight[] {
  const sectors = new Map<string, { weight: number; count: number }>();
  let totalAlloc = 0;

  for (const item of items) {
    const stock = stockMap.get(item.ticker);
    if (!stock) continue;
    const existing = sectors.get(stock.sector) ?? { weight: 0, count: 0 };
    sectors.set(stock.sector, {
      weight: existing.weight + item.allocation,
      count: existing.count + 1,
    });
    totalAlloc += item.allocation;
  }

  if (totalAlloc === 0) return [];

  return Array.from(sectors.entries())
    .map(([sector, data]) => ({
      sector,
      weight: Math.round((data.weight / totalAlloc) * 1000) / 10,
      count: data.count,
    }))
    .sort((a, b) => b.weight - a.weight);
}

// ─── Main Analysis Function ────────────────────────────────────────────

export function analyzePortfolioRisk(
  items: readonly StoredPortfolioItem[],
  stockMap: ReadonlyMap<string, Stock>,
  investment: number,
  personalityDimensions: CoreDimensions | null
): RiskAnalysis {
  const thresholds = getPersonalityThresholds(personalityDimensions);

  const concentrationScore = calcConcentrationRisk(items);
  const sectorScore = calcSectorOverlap(items, stockMap);
  const betaScore = calcBetaExposure(items, stockMap);
  const dividendScore = calcDividendDependence(items, stockMap);
  const aiVarianceScore = calcAIScoreVariance(items, stockMap);
  const correlationScore = calcCorrelationRisk(items, stockMap);

  const dimensions: RiskDimension[] = [
    {
      key: "concentration",
      label: "Concentration",
      score: concentrationScore,
      personalThreshold: thresholds.concentration,
      description: "How much portfolio weight is in a few positions",
      detail:
        concentrationScore > 60
          ? "Your portfolio is heavily concentrated in a few stocks. A single bad earnings report could hurt significantly."
          : concentrationScore > 30
            ? "Moderate concentration -- you have some diversification but could spread further."
            : "Well-diversified across positions. No single stock dominates.",
    },
    {
      key: "sector",
      label: "Sector Overlap",
      score: sectorScore,
      personalThreshold: thresholds.sectorOverlap,
      description: "How concentrated your portfolio is in one sector",
      detail:
        sectorScore > 60
          ? "Heavy sector tilt. A sector-wide downturn would hit your portfolio hard."
          : sectorScore > 30
            ? "Some sector lean, but not extreme. Consider adding exposure to underrepresented sectors."
            : "Good sector diversification. You're spread across multiple industries.",
    },
    {
      key: "beta",
      label: "Beta Exposure",
      score: betaScore,
      personalThreshold: thresholds.betaExposure,
      description: "Portfolio sensitivity to market movements",
      detail:
        betaScore > 60
          ? "High beta -- your portfolio amplifies market swings. Expect bigger drops in selloffs."
          : betaScore > 30
            ? "Moderate beta. Your portfolio roughly tracks the market with some extra volatility."
            : "Low beta exposure. Your portfolio should be more stable than the broader market.",
    },
    {
      key: "dividend",
      label: "Income Gap",
      score: dividendScore,
      personalThreshold: thresholds.dividendGap,
      description: "Percentage of holdings that pay no dividends",
      detail:
        dividendScore > 60
          ? "Most of your holdings pay no dividends. Returns depend entirely on price appreciation."
          : dividendScore > 30
            ? "Mixed income profile. Some holdings generate income, others rely on growth."
            : "Strong income generation. Most holdings pay dividends, providing a return floor.",
    },
    {
      key: "aiVariance",
      label: "Quality Spread",
      score: aiVarianceScore,
      personalThreshold: thresholds.aiVariance,
      description: "Variance in AI quality scores across holdings",
      detail:
        aiVarianceScore > 60
          ? "Wide spread in quality scores -- you're mixing strong and weak positions."
          : aiVarianceScore > 30
            ? "Some quality variance. A few positions score significantly lower than others."
            : "Consistent quality across holdings. Your picks align at a similar conviction level.",
    },
    {
      key: "correlation",
      label: "Correlation",
      score: correlationScore,
      personalThreshold: thresholds.correlation,
      description: "How similarly your holdings move together",
      detail:
        correlationScore > 60
          ? "Holdings are highly correlated -- they'll likely all drop together in a downturn."
          : correlationScore > 30
            ? "Moderate correlation. Some holdings provide diversification benefit."
            : "Low correlation. Your positions should offset each other during volatility.",
    },
  ];

  const alerts = generateAlerts(dimensions);
  const stressTests = runStressTests(items, stockMap, investment, personalityDimensions);
  const positionRisks = analyzePositionRisks(items, stockMap, personalityDimensions);
  const sectorBreakdown = getSectorBreakdown(items, stockMap);

  // Overall score = weighted average of dimensions
  const overallScore = Math.round(
    concentrationScore * 0.2 +
      sectorScore * 0.15 +
      betaScore * 0.25 +
      dividendScore * 0.1 +
      aiVarianceScore * 0.1 +
      correlationScore * 0.2
  );

  const overallLabel =
    overallScore > 70
      ? "High Risk"
      : overallScore > 45
        ? "Moderate Risk"
        : overallScore > 25
          ? "Low-Moderate Risk"
          : "Conservative";

  return {
    overallScore,
    overallLabel,
    dimensions,
    alerts,
    stressTests,
    positionRisks,
    sectorBreakdown,
  };
}
