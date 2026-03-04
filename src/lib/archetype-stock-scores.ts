// Archetype-Stock Compatibility Scoring Engine
// Scores every stock (0-100) for each archetype based on stock metrics.
// Each archetype has a unique weight profile reflecting its investment philosophy.

import type { ArchetypeKey } from "./financial-dna";
import type { Stock } from "./stock-data";

export interface ScoredStock {
  stock: Stock;
  score: number; // 0-100
  reasons: string[]; // top 3 reasons this stock fits
}

// ─── Weight Profiles ──────────────────────────────────────────────────

interface WeightProfile {
  // Each weight is a function: (stock) => 0-100 sub-score
  // The archetype's overall score = weighted average of sub-scores
  factors: Array<{
    name: string;
    weight: number; // 0-1, all weights should sum to 1
    scorer: (stock: Stock) => number;
    reasonTemplate: string; // "{score}" will be replaced
  }>;
}

// Helper scoring functions
const scoreLowBeta = (s: Stock): number =>
  s.beta <= 0.5 ? 100 : s.beta <= 0.8 ? 80 : s.beta <= 1.0 ? 60 : s.beta <= 1.3 ? 30 : 10;

const scoreHighBeta = (s: Stock): number =>
  s.beta >= 1.5 ? 100 : s.beta >= 1.2 ? 80 : s.beta >= 1.0 ? 60 : s.beta >= 0.7 ? 40 : 20;

const scoreDividend = (s: Stock): number =>
  s.dividendYield >= 3.0 ? 100 : s.dividendYield >= 2.0 ? 80 : s.dividendYield >= 1.0 ? 50 : s.dividendYield > 0 ? 25 : 0;

const scoreValue = (s: Stock): number =>
  s.peRatio <= 15 ? 100 : s.peRatio <= 20 ? 80 : s.peRatio <= 25 ? 60 : s.peRatio <= 35 ? 40 : 20;

const scoreGrowth = (s: Stock): number =>
  s.peRatio >= 40 ? 90 : s.peRatio >= 30 ? 75 : s.peRatio >= 20 ? 55 : 30;

const scoreAI = (s: Stock): number => s.aiScore;

const scoreAnalyst = (s: Stock): number =>
  s.analystRating === "Strong Buy" ? 100 : s.analystRating === "Buy" ? 75 : s.analystRating === "Hold" ? 40 : 10;

const scoreLowRisk = (s: Stock): number =>
  s.risks.length <= 1 ? 90 : s.risks.length <= 2 ? 70 : s.risks.length <= 3 ? 50 : 30;

const scoreCatalysts = (s: Stock): number =>
  s.catalysts.length >= 3 ? 90 : s.catalysts.length >= 2 ? 70 : s.catalysts.length >= 1 ? 50 : 20;

const scoreNear52Low = (s: Stock): number => {
  if (s.fiftyTwoHigh === s.fiftyTwoLow) return 50;
  const position = (s.price - s.fiftyTwoLow) / (s.fiftyTwoHigh - s.fiftyTwoLow);
  return position <= 0.3 ? 90 : position <= 0.5 ? 70 : position <= 0.7 ? 50 : 30;
};

const scoreNear52High = (s: Stock): number => {
  if (s.fiftyTwoHigh === s.fiftyTwoLow) return 50;
  const position = (s.price - s.fiftyTwoLow) / (s.fiftyTwoHigh - s.fiftyTwoLow);
  return position >= 0.8 ? 90 : position >= 0.6 ? 70 : position >= 0.4 ? 50 : 30;
};

const scoreMomentum = (s: Stock): number =>
  s.changePercent >= 3 ? 100 : s.changePercent >= 1.5 ? 80 : s.changePercent >= 0 ? 55 : s.changePercent >= -2 ? 30 : 10;

// ─── Archetype Profiles ───────────────────────────────────────────────

const PROFILES: Record<ArchetypeKey, WeightProfile> = {
  // Money Architect: systematic, rule-based, values consistency
  systems_builder: {
    factors: [
      { name: "AI Score", weight: 0.25, scorer: scoreAI, reasonTemplate: "High data-driven conviction (AI {score})" },
      { name: "Analyst Rating", weight: 0.20, scorer: scoreAnalyst, reasonTemplate: "Strong analyst consensus" },
      { name: "Low Risk", weight: 0.15, scorer: scoreLowRisk, reasonTemplate: "Clean risk profile" },
      { name: "Dividend", weight: 0.15, scorer: scoreDividend, reasonTemplate: "Systematic income stream" },
      { name: "Value", weight: 0.15, scorer: scoreValue, reasonTemplate: "Reasonable valuation metrics" },
      { name: "Low Beta", weight: 0.10, scorer: scoreLowBeta, reasonTemplate: "Predictable market behavior" },
    ],
  },

  // Steady Hand: needs validation, values safety
  reassurance_seeker: {
    factors: [
      { name: "Analyst Rating", weight: 0.25, scorer: scoreAnalyst, reasonTemplate: "Backed by analyst consensus" },
      { name: "Low Beta", weight: 0.25, scorer: scoreLowBeta, reasonTemplate: "Low volatility -- less stress" },
      { name: "Dividend", weight: 0.20, scorer: scoreDividend, reasonTemplate: "Reliable income provides comfort" },
      { name: "Low Risk", weight: 0.15, scorer: scoreLowRisk, reasonTemplate: "Minimal downside surprises" },
      { name: "AI Score", weight: 0.15, scorer: scoreAI, reasonTemplate: "AI validates this pick" },
    ],
  },

  // Market Surgeon: data-first, skeptical, evidence-based
  analytical_skeptic: {
    factors: [
      { name: "AI Score", weight: 0.30, scorer: scoreAI, reasonTemplate: "Passes quantitative screening (AI {score})" },
      { name: "Value", weight: 0.25, scorer: scoreValue, reasonTemplate: "Valuation supported by fundamentals" },
      { name: "Low Risk", weight: 0.20, scorer: scoreLowRisk, reasonTemplate: "Risk factors thoroughly mapped" },
      { name: "Catalysts", weight: 0.15, scorer: scoreCatalysts, reasonTemplate: "Clear evidence-based catalysts" },
      { name: "Analyst Rating", weight: 0.10, scorer: scoreAnalyst, reasonTemplate: "Corroborated by multiple analysts" },
    ],
  },

  // Lone Wolf: independent, wants tools not advice
  diy_controller: {
    factors: [
      { name: "Catalysts", weight: 0.25, scorer: scoreCatalysts, reasonTemplate: "Multiple actionable catalysts" },
      { name: "AI Score", weight: 0.20, scorer: scoreAI, reasonTemplate: "Strong data backing (AI {score})" },
      { name: "Value", weight: 0.20, scorer: scoreValue, reasonTemplate: "Attractive entry point" },
      { name: "Near 52w Low", weight: 0.20, scorer: scoreNear52Low, reasonTemplate: "Trading near value zone" },
      { name: "Low Risk", weight: 0.15, scorer: scoreLowRisk, reasonTemplate: "Manageable risk profile" },
    ],
  },

  // War Room Strategist: collaborative, wants debate
  collaborative_partner: {
    factors: [
      { name: "Catalysts", weight: 0.25, scorer: scoreCatalysts, reasonTemplate: "Rich thesis material for discussion" },
      { name: "AI Score", weight: 0.20, scorer: scoreAI, reasonTemplate: "AI perspective adds to debate" },
      { name: "Analyst Rating", weight: 0.20, scorer: scoreAnalyst, reasonTemplate: "Analyst views to stress-test" },
      { name: "Growth", weight: 0.20, scorer: scoreGrowth, reasonTemplate: "Growth narrative worth exploring" },
      { name: "Momentum", weight: 0.15, scorer: scoreMomentum, reasonTemplate: "Current momentum adds context" },
    ],
  },

  // Marathon Capitalist: long-term, trusts compounding
  big_picture_optimist: {
    factors: [
      { name: "Growth", weight: 0.25, scorer: scoreGrowth, reasonTemplate: "Positioned for long-term growth" },
      { name: "AI Score", weight: 0.20, scorer: scoreAI, reasonTemplate: "Strong long-term conviction (AI {score})" },
      { name: "Catalysts", weight: 0.20, scorer: scoreCatalysts, reasonTemplate: "Multi-year catalyst runway" },
      { name: "Dividend", weight: 0.20, scorer: scoreDividend, reasonTemplate: "Compounding dividend reinvestment" },
      { name: "Low Beta", weight: 0.15, scorer: scoreLowBeta, reasonTemplate: "Steady compounder, not a roller coaster" },
    ],
  },

  // Wave Rider: momentum, trends, social signals
  trend_sensitive_explorer: {
    factors: [
      { name: "Momentum", weight: 0.30, scorer: scoreMomentum, reasonTemplate: "Strong price momentum" },
      { name: "Near 52w High", weight: 0.25, scorer: scoreNear52High, reasonTemplate: "Riding near highs -- trend intact" },
      { name: "High Beta", weight: 0.20, scorer: scoreHighBeta, reasonTemplate: "High volatility = high opportunity" },
      { name: "AI Score", weight: 0.15, scorer: scoreAI, reasonTemplate: "AI confirms the trend (AI {score})" },
      { name: "Catalysts", weight: 0.10, scorer: scoreCatalysts, reasonTemplate: "Catalysts fueling the wave" },
    ],
  },

  // Vault Keeper: capital preservation, defensive
  avoider_under_stress: {
    factors: [
      { name: "Low Beta", weight: 0.30, scorer: scoreLowBeta, reasonTemplate: "Minimal volatility exposure" },
      { name: "Dividend", weight: 0.25, scorer: scoreDividend, reasonTemplate: "Income cushions downturns" },
      { name: "Low Risk", weight: 0.20, scorer: scoreLowRisk, reasonTemplate: "Fewest risk factors" },
      { name: "Analyst Rating", weight: 0.15, scorer: scoreAnalyst, reasonTemplate: "Consensus says safe" },
      { name: "Value", weight: 0.10, scorer: scoreValue, reasonTemplate: "Not paying a premium" },
    ],
  },

  // First Mover: speed, action, quick decisions
  action_first_decider: {
    factors: [
      { name: "Momentum", weight: 0.30, scorer: scoreMomentum, reasonTemplate: "Moving now -- time to act" },
      { name: "High Beta", weight: 0.25, scorer: scoreHighBeta, reasonTemplate: "Big moves = big opportunity" },
      { name: "Catalysts", weight: 0.20, scorer: scoreCatalysts, reasonTemplate: "Near-term catalysts to capitalize on" },
      { name: "AI Score", weight: 0.15, scorer: scoreAI, reasonTemplate: "Quick AI validation (AI {score})" },
      { name: "Near 52w High", weight: 0.10, scorer: scoreNear52High, reasonTemplate: "Breakout potential" },
    ],
  },

  // Legacy Builder: values-driven, purposeful
  values_anchored_steward: {
    factors: [
      { name: "Dividend", weight: 0.25, scorer: scoreDividend, reasonTemplate: "Builds generational income stream" },
      { name: "Low Risk", weight: 0.25, scorer: scoreLowRisk, reasonTemplate: "Protects legacy capital" },
      { name: "AI Score", weight: 0.20, scorer: scoreAI, reasonTemplate: "Aligned with long-term purpose (AI {score})" },
      { name: "Value", weight: 0.15, scorer: scoreValue, reasonTemplate: "Sustainable valuation" },
      { name: "Low Beta", weight: 0.15, scorer: scoreLowBeta, reasonTemplate: "Steady wealth preservation" },
    ],
  },
};

// ─── Scoring Functions ────────────────────────────────────────────────

export function scoreStockForArchetype(
  stock: Stock,
  archetype: ArchetypeKey
): ScoredStock {
  const profile = PROFILES[archetype];
  let totalScore = 0;
  const factorScores: Array<{ name: string; score: number; template: string }> = [];

  for (const factor of profile.factors) {
    const subScore = factor.scorer(stock);
    totalScore += subScore * factor.weight;
    factorScores.push({
      name: factor.name,
      score: subScore,
      template: factor.reasonTemplate,
    });
  }

  // Top 3 reasons: highest-scoring factors
  const topReasons = factorScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((f) => f.template.replace("{score}", String(Math.round(totalScore))));

  return {
    stock,
    score: Math.round(totalScore),
    reasons: topReasons,
  };
}

export function getTopStocksForArchetype(
  allStocks: ReadonlyArray<Stock>,
  archetype: ArchetypeKey,
  limit = 10
): ScoredStock[] {
  const scored = allStocks.map((s) => scoreStockForArchetype(s, archetype));
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getAllArchetypeScores(
  allStocks: ReadonlyArray<Stock>
): Record<ArchetypeKey, ScoredStock[]> {
  const archetypes = Object.keys(PROFILES) as ArchetypeKey[];
  const result = {} as Record<ArchetypeKey, ScoredStock[]>;

  for (const archetype of archetypes) {
    result[archetype] = allStocks
      .map((s) => scoreStockForArchetype(s, archetype))
      .sort((a, b) => b.score - a.score);
  }

  return result;
}
