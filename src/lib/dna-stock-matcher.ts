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
// Anti-match reason: why a stock CLASHES with your profile
// ---------------------------------------------------------------------------

function getAntiMatchReason(stock: Stock, dims: CoreDimensions): string {
  const reasons: string[] = [];

  if (dims.R < 45 && stock.beta >= 1.5) {
    reasons.push("Too volatile for your risk comfort zone");
  } else if (dims.R >= 65 && stock.beta <= 0.5) {
    reasons.push("Too conservative for your growth-oriented profile");
  }

  if (dims.H < 45 && stock.dividendYield < 0.5 && stock.beta >= 1.2) {
    reasons.push("High-risk growth play clashes with your short horizon");
  } else if (dims.H >= 65 && stock.aiScore < 60) {
    reasons.push("Weak long-term thesis for a patient investor like you");
  }

  if (dims.D >= 60 && stock.analystRating === "Hold") {
    reasons.push("Analyst ambivalence conflicts with your disciplined approach");
  }

  if (stock.aiScore < 55) {
    reasons.push(`Low AI confidence score (${stock.aiScore}/100)`);
  }

  if (reasons.length === 0) {
    reasons.push("Poor overall fit for your behavioral profile");
  }

  return reasons[0];
}

// ---------------------------------------------------------------------------
// Single-stock fit score (normalized 0-100)
// ---------------------------------------------------------------------------

export function getStockFitScore(stock: Stock, dims: CoreDimensions): number {
  const raw = scoreStock(stock, dims);
  // Theoretical max is roughly 83 (30 AI + 15 beta + 10 div + 8 horizon + 10 disc + 10 analyst)
  // Normalize to 0-100
  return Math.round(Math.min(100, Math.max(0, (raw / 75) * 100)));
}

export function getStockFitDetails(
  stock: Stock,
  dims: CoreDimensions
): { score: number; factors: Array<{ label: string; value: string; positive: boolean }> } {
  const score = getStockFitScore(stock, dims);
  const factors: Array<{ label: string; value: string; positive: boolean }> = [];

  // Risk fit
  if (dims.R >= 60) {
    factors.push({
      label: "Risk Match",
      value: stock.beta >= 1.2 ? "High-growth fits your risk appetite" : "Lower beta than ideal",
      positive: stock.beta >= 1.0,
    });
  } else {
    factors.push({
      label: "Risk Match",
      value: stock.beta <= 1.0 ? "Stable -- fits your profile" : "More volatile than you prefer",
      positive: stock.beta <= 1.0,
    });
  }

  // Income fit
  if (dims.H < 60 || dims.R < 50) {
    factors.push({
      label: "Income",
      value: stock.dividendYield >= 1.5
        ? `${stock.dividendYield.toFixed(1)}% yield -- strong income`
        : "Low dividend yield",
      positive: stock.dividendYield >= 1.0,
    });
  } else {
    factors.push({
      label: "Growth",
      value: stock.aiScore >= 75 ? "High conviction growth thesis" : "Moderate growth outlook",
      positive: stock.aiScore >= 70,
    });
  }

  // Analyst consensus
  factors.push({
    label: "Consensus",
    value: stock.analystRating,
    positive: stock.analystRating === "Strong Buy" || stock.analystRating === "Buy",
  });

  return { score, factors };
}

// ---------------------------------------------------------------------------
// Top N stocks for a given profile (no diversity filter, pure score rank)
// ---------------------------------------------------------------------------

export function topStocksForProfile(dims: CoreDimensions, count: number): MatchedStock[] {
  const scored = stocks.map((stock) => ({
    stock,
    score: getStockFitScore(stock, dims),
    reason: getMatchReason(stock, dims),
  }));

  return [...scored].sort((a, b) => b.score - a.score).slice(0, count);
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

export function antiMatchStocksToDNA(dims: CoreDimensions): MatchedStock[] {
  const scored = stocks.map((stock) => ({
    stock,
    score: scoreStock(stock, dims),
    reason: getAntiMatchReason(stock, dims),
  }));

  // Sort by score ascending (worst matches first)
  const ranked = [...scored].sort((a, b) => a.score - b.score);

  // Return bottom 3, ensuring sector diversity
  const result: MatchedStock[] = [];
  const usedSectors = new Set<string>();

  for (const match of ranked) {
    if (result.length >= 3) break;
    if (!usedSectors.has(match.stock.sector)) {
      result.push(match);
      usedSectors.add(match.stock.sector);
    }
  }

  // Fill if diversity was too strict
  if (result.length < 3) {
    for (const match of ranked) {
      if (result.length >= 3) break;
      if (!result.includes(match)) {
        result.push(match);
      }
    }
  }

  return result;
}
