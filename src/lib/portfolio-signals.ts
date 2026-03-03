// Portfolio AI Signal Engine
// Generates composite scores, sub-scores, trading signals, and insight bullets
// for each stock in a portfolio. All calculations derived from existing stock data.

import type { Stock } from "./stock-data";

// ─── Types ─────────────────────────────────────────────────────────────

export interface SubScores {
  momentum: number; // 0-100
  value: number; // 0-100
  growth: number; // 0-100
  stability: number; // 0-100
}

export type SignalType =
  | "High Volatility"
  | "Overbought"
  | "Oversold"
  | "Bullish Momentum"
  | "Bearish Divergence"
  | "Neutral";

export interface TradingSignal {
  type: SignalType;
  color: string; // tailwind-compatible color token
  icon: "alert-triangle" | "trending-up" | "trending-down" | "minus";
}

export interface StockSignal {
  ticker: string;
  compositeScore: number; // 0-100 (weighted blend of sub-scores)
  subScores: SubScores;
  rsi: number; // 0-100 approximation
  signal: TradingSignal;
  whyItWorks: string[];
  watchOutFor: string[];
}

// ─── Sub-Score Calculations ────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Momentum: from 52-week position, changePercent, analyst rating
function calculateMomentum(stock: Stock): number {
  const range = stock.fiftyTwoHigh - stock.fiftyTwoLow;
  const positionInRange = range > 0
    ? ((stock.price - stock.fiftyTwoLow) / range) * 50
    : 25;

  const changeBonus = clamp(stock.changePercent * 5, -15, 15);

  const ratingMap: Record<string, number> = {
    "Strong Buy": 25,
    "Buy": 18,
    "Hold": 8,
    "Sell": 0,
  };
  const ratingScore = ratingMap[stock.analystRating] ?? 8;

  return clamp(Math.round(positionInRange + changeBonus + ratingScore), 0, 100);
}

// Value: from inverse P/E, dividend yield, distance below 52w high
function calculateValue(stock: Stock): number {
  // Lower PE = higher value score. PE of 10 -> 40pts, PE of 50 -> 8pts
  const peScore = stock.peRatio > 0
    ? clamp(Math.round((400 / stock.peRatio)), 0, 45)
    : 20; // no earnings = mid score

  // Dividend yield bonus: each 1% yield = 8pts, max 25
  const divScore = clamp(Math.round(stock.dividendYield * 8), 0, 25);

  // Distance below 52w high: more discount = more value
  const discount = stock.fiftyTwoHigh > 0
    ? ((stock.fiftyTwoHigh - stock.price) / stock.fiftyTwoHigh) * 100
    : 0;
  const discountScore = clamp(Math.round(discount * 1.2), 0, 30);

  return clamp(Math.round(peScore + divScore + discountScore), 0, 100);
}

// Growth: from aiScore proxy, analyst rating, positive momentum
function calculateGrowth(stock: Stock): number {
  // aiScore as primary growth proxy (0-100 -> 0-50)
  const aiGrowth = Math.round(stock.aiScore * 0.5);

  const ratingMap: Record<string, number> = {
    "Strong Buy": 30,
    "Buy": 22,
    "Hold": 12,
    "Sell": 5,
  };
  const ratingScore = ratingMap[stock.analystRating] ?? 12;

  // Positive change adds growth signal
  const momentumBonus = stock.changePercent > 0
    ? clamp(Math.round(stock.changePercent * 4), 0, 20)
    : 0;

  return clamp(Math.round(aiGrowth + ratingScore + momentumBonus), 0, 100);
}

// Stability: from inverse beta, dividend yield, narrow 52w range
function calculateStability(stock: Stock): number {
  // Lower beta = more stable. beta 0.5 -> 40pts, beta 2.0 -> 10pts
  const betaScore = clamp(Math.round(50 - (stock.beta - 0.5) * 26), 0, 50);

  // Dividend yield stability bonus
  const divStability = clamp(Math.round(stock.dividendYield * 6), 0, 20);

  // Narrow 52w range = stable. range/price < 30% is stable
  const range = stock.fiftyTwoHigh - stock.fiftyTwoLow;
  const rangePercent = stock.price > 0 ? (range / stock.price) * 100 : 50;
  const rangeScore = clamp(Math.round(30 - rangePercent * 0.5), 0, 30);

  return clamp(Math.round(betaScore + divStability + rangeScore), 0, 100);
}

// ─── RSI Approximation ────────────────────────────────────────────────

function calculateRSI(stock: Stock): number {
  const range = stock.fiftyTwoHigh - stock.fiftyTwoLow;
  if (range <= 0) return 50;
  return clamp(
    Math.round(((stock.price - stock.fiftyTwoLow) / range) * 100),
    0,
    100
  );
}

// ─── Trading Signal ───────────────────────────────────────────────────

function determineTradingSignal(
  stock: Stock,
  rsi: number,
  stability: number
): TradingSignal {
  // Priority order: High Volatility > Overbought > Oversold > Bullish > Bearish > Neutral

  // High Volatility: beta > 1.8 OR 52w range > 60% of price
  const range = stock.fiftyTwoHigh - stock.fiftyTwoLow;
  const rangePercent = stock.price > 0 ? (range / stock.price) * 100 : 0;
  if (stock.beta > 1.8 || rangePercent > 60) {
    return { type: "High Volatility", color: "red", icon: "alert-triangle" };
  }

  // Overbought: RSI > 80 AND near 52w high (within 5%)
  const nearHigh = stock.fiftyTwoHigh > 0
    ? ((stock.fiftyTwoHigh - stock.price) / stock.fiftyTwoHigh) < 0.05
    : false;
  if (rsi > 80 && nearHigh) {
    return { type: "Overbought", color: "gold", icon: "alert-triangle" };
  }

  // Oversold: RSI < 25 AND well below 52w high
  const farFromHigh = stock.fiftyTwoHigh > 0
    ? ((stock.fiftyTwoHigh - stock.price) / stock.fiftyTwoHigh) > 0.25
    : false;
  if (rsi < 25 && farFromHigh) {
    return { type: "Oversold", color: "green", icon: "trending-up" };
  }

  // Bullish Momentum: positive change AND analyst Buy/Strong Buy AND RSI 50-80
  const bullishRating = stock.analystRating === "Strong Buy" || stock.analystRating === "Buy";
  if (stock.changePercent > 0 && bullishRating && rsi >= 50 && rsi <= 80) {
    return { type: "Bullish Momentum", color: "green", icon: "trending-up" };
  }

  // Bearish Divergence: negative change despite Buy rating, or Hold/Sell with RSI decline
  if (stock.changePercent < 0 && bullishRating) {
    return { type: "Bearish Divergence", color: "gold", icon: "trending-down" };
  }
  if ((stock.analystRating === "Hold" || stock.analystRating === "Sell") && rsi < 40) {
    return { type: "Bearish Divergence", color: "gold", icon: "trending-down" };
  }

  return { type: "Neutral", color: "text-muted", icon: "minus" };
}

// ─── Why / Watch Out Bullets ──────────────────────────────────────────

function buildWhyBullets(stock: Stock, subScores: SubScores, rsi: number): string[] {
  const bullets: string[] = [];

  if (subScores.stability >= 70) {
    bullets.push("Low beta provides portfolio ballast during market selloffs");
  }
  if (subScores.momentum >= 70) {
    bullets.push("Strong price momentum with analyst consensus supporting the trend");
  }
  if (subScores.value >= 65) {
    bullets.push("Attractive valuation relative to earnings and dividend yield");
  }
  if (subScores.growth >= 70) {
    bullets.push("High growth conviction backed by AI analysis and analyst sentiment");
  }
  if (stock.dividendYield >= 2.0) {
    bullets.push(`${stock.dividendYield.toFixed(1)}% dividend yield adds income stability`);
  }
  if (stock.analystRating === "Strong Buy") {
    bullets.push("Strong Buy consensus reflects broad institutional conviction");
  }
  if (rsi >= 40 && rsi <= 65) {
    bullets.push("RSI in neutral zone -- not overbought or oversold");
  }
  if (stock.beta <= 0.7) {
    bullets.push("Defensive positioning reduces downside in volatile markets");
  }

  // Always return at least 2 bullets
  if (bullets.length === 0) {
    bullets.push("Provides sector diversification to your portfolio");
    bullets.push("Liquid large-cap with established market position");
  }
  if (bullets.length === 1) {
    bullets.push("Liquid large-cap with established market position");
  }

  return bullets.slice(0, 4);
}

function buildWatchOutBullets(stock: Stock, subScores: SubScores, rsi: number): string[] {
  const bullets: string[] = [];

  if (stock.beta >= 1.5) {
    bullets.push(`High beta (${stock.beta.toFixed(1)}) means amplified losses in downturns`);
  }
  if (stock.peRatio > 50) {
    bullets.push(`Elevated P/E of ${stock.peRatio.toFixed(0)}x prices in significant growth expectations`);
  }
  if (rsi > 75) {
    bullets.push("Trading near 52-week high -- risk of mean reversion pullback");
  }
  if (rsi < 30) {
    bullets.push("Trading near 52-week low -- may signal continued weakness");
  }
  if (subScores.stability < 35) {
    bullets.push("Low stability score suggests higher portfolio volatility contribution");
  }
  if (stock.dividendYield === 0) {
    bullets.push("No dividend -- returns depend entirely on price appreciation");
  }
  if (stock.analystRating === "Hold" || stock.analystRating === "Sell") {
    bullets.push("Analyst consensus is cautious -- monitor for downgrade risk");
  }
  if (subScores.value < 30 && stock.peRatio > 30) {
    bullets.push("Premium valuation leaves little margin of safety");
  }

  // Always return at least 1 bullet
  if (bullets.length === 0) {
    bullets.push("Monitor position sizing to maintain diversification targets");
  }

  return bullets.slice(0, 3);
}

// ─── Main Signal Generator ────────────────────────────────────────────

export function generateStockSignal(stock: Stock): StockSignal {
  const subScores: SubScores = {
    momentum: calculateMomentum(stock),
    value: calculateValue(stock),
    growth: calculateGrowth(stock),
    stability: calculateStability(stock),
  };

  // Composite = Momentum(0.25) + Value(0.25) + Growth(0.20) + Stability(0.30)
  const compositeScore = clamp(
    Math.round(
      subScores.momentum * 0.25 +
      subScores.value * 0.25 +
      subScores.growth * 0.20 +
      subScores.stability * 0.30
    ),
    0,
    100
  );

  const rsi = calculateRSI(stock);
  const signal = determineTradingSignal(stock, rsi, subScores.stability);
  const whyItWorks = buildWhyBullets(stock, subScores, rsi);
  const watchOutFor = buildWatchOutBullets(stock, subScores, rsi);

  return {
    ticker: stock.ticker,
    compositeScore,
    subScores,
    rsi,
    signal,
    whyItWorks,
    watchOutFor,
  };
}

// Generate signals for an entire portfolio at once
export function generatePortfolioSignals(
  portfolioStocks: Stock[]
): StockSignal[] {
  return portfolioStocks.map((stock) => generateStockSignal(stock));
}

// Weighted portfolio composite score
export function getPortfolioCompositeScore(
  signals: StockSignal[],
  allocations: Record<string, number> // ticker -> allocation %
): number {
  const totalAlloc = Object.values(allocations).reduce((sum, a) => sum + a, 0);
  if (totalAlloc === 0) return 0;

  const weighted = signals.reduce((sum, sig) => {
    const alloc = allocations[sig.ticker] ?? 0;
    return sum + sig.compositeScore * (alloc / totalAlloc);
  }, 0);

  return Math.round(weighted);
}
