// Dividend analysis engine for portfolio income projections.
// All functions are pure -- no side effects, no mutations.

import type { Stock } from "./stock-data";

export interface StockDividend {
  ticker: string;
  name: string;
  allocation: number; // percentage
  investedAmount: number;
  annualDividend: number;
  monthlyDividend: number;
  yield: number; // the stock's dividend yield as decimal (e.g. 0.025 = 2.5%)
  yieldPercent: number; // display-friendly (e.g. 2.5)
}

export interface DividendSummary {
  stocks: StockDividend[];
  totalAnnualIncome: number;
  totalMonthlyIncome: number;
  portfolioYield: number; // weighted average yield as percentage
  topContributors: StockDividend[]; // sorted by annual dividend desc, top 5
  nonPayers: string[]; // tickers with 0 yield
  projection: DividendProjection[];
}

export interface DividendProjection {
  year: number;
  income: number; // cumulative by that year
  annualIncome: number; // income in that specific year
}

// Calculate dividend for a single stock position
export function calculateStockDividend(
  stock: Stock,
  allocation: number,
  totalInvestment: number
): StockDividend {
  const investedAmount = (allocation / 100) * totalInvestment;
  const yieldDecimal = stock.dividendYield / 100;
  const annualDividend = investedAmount * yieldDecimal;
  const monthlyDividend = annualDividend / 12;

  return {
    ticker: stock.ticker,
    name: stock.name,
    allocation,
    investedAmount,
    annualDividend,
    monthlyDividend,
    yield: yieldDecimal,
    yieldPercent: stock.dividendYield,
  };
}

// Full portfolio dividend analysis
export function analyzePortfolioDividends(
  items: ReadonlyArray<{ ticker: string; allocation: number }>,
  stockMap: ReadonlyMap<string, Stock>,
  totalInvestment: number
): DividendSummary {
  const dividendStocks: StockDividend[] = [];

  for (const item of items) {
    const stock = stockMap.get(item.ticker);
    if (!stock) continue;
    dividendStocks.push(
      calculateStockDividend(stock, item.allocation, totalInvestment)
    );
  }

  const totalAnnualIncome = dividendStocks.reduce(
    (sum, s) => sum + s.annualDividend,
    0
  );
  const totalMonthlyIncome = totalAnnualIncome / 12;

  // Weighted average yield
  const totalAllocated = dividendStocks.reduce(
    (sum, s) => sum + s.investedAmount,
    0
  );
  const portfolioYield =
    totalAllocated > 0 ? (totalAnnualIncome / totalAllocated) * 100 : 0;

  // Top contributors (sorted by annual dividend)
  const sorted = [...dividendStocks].sort(
    (a, b) => b.annualDividend - a.annualDividend
  );
  const topContributors = sorted.slice(0, 5);

  // Non-payers
  const nonPayers = dividendStocks
    .filter((s) => s.annualDividend === 0)
    .map((s) => s.ticker);

  // 5-year projection assuming 5% annual dividend growth rate
  const projection = projectDividendGrowth(totalAnnualIncome, 5, 0.05);

  return {
    stocks: dividendStocks,
    totalAnnualIncome,
    totalMonthlyIncome,
    portfolioYield,
    topContributors,
    nonPayers,
    projection,
  };
}

// Project dividend income growth over N years
// Assumes a fixed annual growth rate (default 5% -- historically reasonable for quality dividend stocks)
function projectDividendGrowth(
  currentAnnualIncome: number,
  years: number,
  growthRate: number
): DividendProjection[] {
  const projections: DividendProjection[] = [];
  let cumulative = 0;

  for (let y = 1; y <= years; y++) {
    const annualIncome =
      currentAnnualIncome * Math.pow(1 + growthRate, y);
    cumulative += annualIncome;
    projections.push({
      year: y,
      income: cumulative,
      annualIncome,
    });
  }

  return projections;
}
