import { stocks, sectors, type Stock, type Sector } from "./stock-data";

export interface PortfolioItem {
  ticker: string;
  allocation: number; // percentage 0-100
}

export interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  dividendYield: number;
  sectorExposure: { sector: string; weight: number; color: string }[];
  concentrationWarnings: string[];
  riskScore: number; // 1-10
  suggestions: string[];
}

// Resolve each PortfolioItem to a full Stock record, filtering out unknowns.
function resolveStocks(items: PortfolioItem[]): { stock: Stock; allocation: number }[] {
  return items.flatMap((item) => {
    const stock = stocks.find((s) => s.ticker === item.ticker);
    if (!stock) return [];
    return [{ stock: { ...stock }, allocation: item.allocation }];
  });
}

// Normalize allocations so they always sum to 100, guarding against divide-by-zero.
function normalizeAllocations(
  resolved: { stock: Stock; allocation: number }[]
): { stock: Stock; allocation: number }[] {
  const total = resolved.reduce((sum, r) => sum + r.allocation, 0);
  if (total === 0) return [];
  return resolved.map((r) => ({ ...r, allocation: (r.allocation / total) * 100 }));
}

// Expected return: aiScore is 1-100; map it linearly to a -5% to +30% annual return range.
function estimateExpectedReturn(resolved: { stock: Stock; allocation: number }[]): number {
  const weighted = resolved.reduce((sum, { stock, allocation }) => {
    const stockReturn = -5 + (stock.aiScore / 100) * 35; // -5% to +30%
    return sum + stockReturn * (allocation / 100);
  }, 0);
  return Math.round(weighted * 100) / 100;
}

// Volatility: higher PE = more volatile. Normalize PE against a baseline of 20.
// A PE of 20 maps to ~15% volatility; each additional 10 PE points adds ~3%.
function estimateVolatility(resolved: { stock: Stock; allocation: number }[]): number {
  const weighted = resolved.reduce((sum, { stock, allocation }) => {
    const stockVol = 15 + Math.max(0, stock.peRatio - 20) * 0.3;
    return sum + stockVol * (allocation / 100);
  }, 0);
  return Math.round(weighted * 100) / 100;
}

// Sharpe ratio: (expected return - risk-free rate) / volatility
function estimateSharpeRatio(expectedReturn: number, volatility: number): number {
  const RISK_FREE_RATE = 4.5;
  if (volatility === 0) return 0;
  return Math.round(((expectedReturn - RISK_FREE_RATE) / volatility) * 100) / 100;
}

// Portfolio dividend yield weighted by allocation.
function estimateDividendYield(resolved: { stock: Stock; allocation: number }[]): number {
  const weighted = resolved.reduce((sum, { stock, allocation }) => {
    return sum + stock.dividendYield * (allocation / 100);
  }, 0);
  return Math.round(weighted * 100) / 100;
}

// Aggregate allocations per sector; attach the sector color from the sectors list.
function calculateSectorExposure(
  resolved: { stock: Stock; allocation: number }[]
): { sector: string; weight: number; color: string }[] {
  const map: Record<string, number> = {};
  for (const { stock, allocation } of resolved) {
    map[stock.sector] = (map[stock.sector] ?? 0) + allocation;
  }
  return Object.entries(map).map(([sectorName, weight]) => {
    const sectorMeta: Sector | undefined = sectors.find((s) => s.name === sectorName);
    return {
      sector: sectorName,
      weight: Math.round(weight * 100) / 100,
      color: sectorMeta?.color ?? "#888888",
    };
  });
}

// Emit warning strings for single-stock or single-sector concentration breaches.
function buildConcentrationWarnings(
  resolved: { stock: Stock; allocation: number }[],
  sectorExposure: { sector: string; weight: number; color: string }[]
): string[] {
  const warnings: string[] = [];

  for (const { stock, allocation } of resolved) {
    if (allocation > 25) {
      warnings.push(
        `${stock.ticker} represents ${allocation.toFixed(1)}% of the portfolio (limit: 25%)`
      );
    }
  }

  for (const { sector, weight } of sectorExposure) {
    if (weight > 40) {
      warnings.push(
        `${sector} sector represents ${weight.toFixed(1)}% of the portfolio (limit: 40%)`
      );
    }
  }

  return warnings;
}

// Risk score 1-10 based on avg PE, concentration, volatility, and sector diversity.
function calculateRiskScore(
  resolved: { stock: Stock; allocation: number }[],
  volatility: number,
  sectorExposure: { sector: string; weight: number; color: string }[],
  concentrationWarnings: string[]
): number {
  if (resolved.length === 0) return 1;
  const avgPe = resolved.reduce((sum, { stock }) => sum + stock.peRatio, 0) / resolved.length;
  const peScore = Math.min(10, avgPe / 10); // PE of 100 = score 10
  const volScore = Math.min(10, volatility / 5); // 50% vol = score 10
  const concentrationPenalty = concentrationWarnings.length * 1.5;
  const diversityBonus = Math.min(2, sectorExposure.length * 0.4); // up to -2 for wide diversity

  const raw = peScore * 0.4 + volScore * 0.4 + concentrationPenalty - diversityBonus;
  return Math.min(10, Math.max(1, Math.round(raw)));
}

// Plain-language suggestions based on portfolio characteristics.
function buildSuggestions(
  resolved: { stock: Stock; allocation: number }[],
  sectorExposure: { sector: string; weight: number; color: string }[],
  concentrationWarnings: string[],
  riskScore: number
): string[] {
  const suggestions: string[] = [];

  if (concentrationWarnings.length > 0) {
    suggestions.push("Reduce position sizes that exceed concentration limits to lower single-name risk.");
  }

  if (sectorExposure.length < 4) {
    suggestions.push("Diversify across more sectors to reduce correlation and smooth volatility.");
  }

  const lowAi = resolved.filter((r) => r.stock.aiScore < 50);
  if (lowAi.length > 0) {
    const tickers = lowAi.map((r) => r.stock.ticker).join(", ");
    suggestions.push(`Consider reviewing low-conviction positions: ${tickers}.`);
  }

  if (riskScore >= 8) {
    suggestions.push("Overall risk is high. Adding defensive or dividend-paying positions may help.");
  }

  if (riskScore <= 3) {
    suggestions.push("Portfolio is conservative. Growth-oriented positions could improve long-term returns.");
  }

  return suggestions;
}

export function calculatePortfolioMetrics(items: PortfolioItem[]): PortfolioMetrics {
  if (items.length === 0) {
    return {
      expectedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      dividendYield: 0,
      sectorExposure: [],
      concentrationWarnings: ["Portfolio is empty."],
      riskScore: 1,
      suggestions: ["Add stocks to your portfolio to see metrics."],
    };
  }

  const resolved = normalizeAllocations(resolveStocks(items));

  if (resolved.length === 0) {
    return {
      expectedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      dividendYield: 0,
      sectorExposure: [],
      concentrationWarnings: ["No valid tickers found in portfolio."],
      riskScore: 1,
      suggestions: ["Check that all tickers match stocks in the StockPilot database."],
    };
  }

  const expectedReturn = estimateExpectedReturn(resolved);
  const volatility = estimateVolatility(resolved);
  const sharpeRatio = estimateSharpeRatio(expectedReturn, volatility);
  const dividendYield = estimateDividendYield(resolved);
  const sectorExposure = calculateSectorExposure(resolved);
  const concentrationWarnings = buildConcentrationWarnings(resolved, sectorExposure);
  const riskScore = calculateRiskScore(resolved, volatility, sectorExposure, concentrationWarnings);
  const suggestions = buildSuggestions(resolved, sectorExposure, concentrationWarnings, riskScore);

  return {
    expectedReturn,
    volatility,
    sharpeRatio,
    dividendYield,
    sectorExposure,
    concentrationWarnings,
    riskScore,
    suggestions,
  };
}
