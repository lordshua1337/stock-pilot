// Stock Matcher -- scores stocks against a user's Investor Identity profile
// Uses dimension scores to weight beta preference, dividend preference,
// AI score, sector diversity, and analyst sentiment

import type { CoreDimensions } from "./financial-dna";
import { stocks, type Stock } from "./stock-data";

export interface MatchedStock {
  stock: Stock;
  score: number;
  reason: string;
}

// ---------------------------------------------------------------------------
// Scoring algorithm
// ---------------------------------------------------------------------------

function scoreStock(stock: Stock, dims: CoreDimensions): number {
  let score = 0;

  // Base: AI score always matters (0-30 points)
  score += (stock.aiScore / 100) * 30;

  // Risk dimension (R) -> beta preference
  // High R: prefer higher-beta (growth), Low R: prefer low-beta (stable)
  if (dims.R >= 60) {
    // Risk-tolerant: reward higher beta
    score += Math.min(stock.beta * 8, 15);
  } else {
    // Risk-averse: reward lower beta, penalize high beta
    score += Math.max(15 - stock.beta * 8, 0);
    // Bonus for dividend payers
    score += Math.min(stock.dividendYield * 4, 10);
  }

  // Horizon dimension (H) -> growth vs income preference
  // High H: weight AI score and growth, Low H: weight dividend yield
  if (dims.H >= 60) {
    // Long-term: extra AI score bonus for high-conviction picks
    score += stock.aiScore >= 80 ? 8 : 0;
  } else {
    // Short-term: dividend yield matters more
    score += Math.min(stock.dividendYield * 5, 12);
  }

  // Discipline dimension (D) -> prefer well-rated stocks
  // High D: follows rules, so analyst consensus matters more
  if (dims.D >= 60) {
    if (stock.analystRating === "Strong Buy") score += 10;
    else if (stock.analystRating === "Buy") score += 5;
  }

  // Analyst rating bonus (always some weight)
  if (stock.analystRating === "Strong Buy") score += 10;
  else if (stock.analystRating === "Buy") score += 5;

  return score;
}

function getMatchReason(stock: Stock, dims: CoreDimensions): string {
  const reasons: string[] = [];

  if (stock.aiScore >= 85) {
    reasons.push(`High AI confidence score (${stock.aiScore}/100)`);
  }

  if (dims.R >= 60 && stock.beta >= 1.3) {
    reasons.push("Matches your comfort with volatility");
  } else if (dims.R < 60 && stock.beta <= 0.9) {
    reasons.push("Low volatility fits your risk profile");
  }

  if (dims.H >= 60 && stock.aiScore >= 80) {
    reasons.push("Strong long-term growth thesis");
  }

  if (dims.R < 60 && stock.dividendYield >= 1.5) {
    reasons.push(`${stock.dividendYield.toFixed(1)}% dividend provides steady income`);
  }

  if (stock.analystRating === "Strong Buy") {
    reasons.push("Wall Street consensus: Strong Buy");
  }

  if (reasons.length === 0) {
    reasons.push("Well-balanced fit for your profile");
  }

  return reasons[0];
}

// ---------------------------------------------------------------------------
// Diversity filter: ensure sector spread when D is high
// ---------------------------------------------------------------------------

function applyDiversityFilter(
  ranked: MatchedStock[],
  dims: CoreDimensions
): MatchedStock[] {
  if (dims.D < 50) return ranked.slice(0, 5);

  // High discipline investors get sector-diverse picks
  const result: MatchedStock[] = [];
  const usedSectors = new Set<string>();

  for (const match of ranked) {
    if (result.length >= 5) break;

    // Allow max 2 from same sector
    const sectorCount = result.filter(
      (m) => m.stock.sector === match.stock.sector
    ).length;

    if (sectorCount < 2) {
      result.push(match);
      usedSectors.add(match.stock.sector);
    }
  }

  // Fill remaining if diversity filter was too strict
  if (result.length < 5) {
    for (const match of ranked) {
      if (result.length >= 5) break;
      if (!result.includes(match)) {
        result.push(match);
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function matchStocksToDNA(dims: CoreDimensions): MatchedStock[] {
  const scored = stocks.map((stock) => ({
    stock,
    score: scoreStock(stock, dims),
    reason: getMatchReason(stock, dims),
  }));

  // Sort by score descending
  const ranked = [...scored].sort((a, b) => b.score - a.score);

  return applyDiversityFilter(ranked, dims);
}
