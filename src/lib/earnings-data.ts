// Earnings Calendar Data
// Static earnings dates, EPS expectations, and surprise history for all stocks.
// Dates are set relative to a base reference quarter (Q1 2026 reporting season).

import { stocks, type Stock } from "./stock-data";

export interface EarningsSurprise {
  quarter: string;
  expected: number;
  actual: number;
  surprisePercent: number;
}

export interface EarningsEntry {
  ticker: string;
  name: string;
  sector: string;
  nextEarningsDate: string; // ISO date string
  expectedEPS: number;
  previousEPS: number;
  consensusEstimate: number;
  analystCount: number;
  revenueExpected: string; // e.g. "$94.3B"
  surpriseHistory: EarningsSurprise[];
  preEarningsNote: string; // brief context about what to watch
}

// ---------------------------------------------------------------------------
// Earnings schedule -- spread across Q1 2026 reporting window
// Real companies report in waves: big tech late Jan, financials mid-Jan, etc.
// We simulate a Mar-Apr 2026 season for freshness.
// ---------------------------------------------------------------------------

const RAW_EARNINGS: Omit<EarningsEntry, "name" | "sector">[] = [
  // Wave 1: Financials (early-mid March)
  {
    ticker: "JPM",
    nextEarningsDate: "2026-03-11",
    expectedEPS: 4.65,
    previousEPS: 4.37,
    consensusEstimate: 4.58,
    analystCount: 22,
    revenueExpected: "$42.8B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 4.37, actual: 4.81, surprisePercent: 10.1 },
      { quarter: "Q3 2025", expected: 3.95, actual: 4.37, surprisePercent: 10.6 },
      { quarter: "Q2 2025", expected: 4.11, actual: 4.40, surprisePercent: 7.1 },
    ],
    preEarningsNote: "Watch net interest income guidance and credit loss provisions.",
  },
  {
    ticker: "GS",
    nextEarningsDate: "2026-03-12",
    expectedEPS: 12.85,
    previousEPS: 11.95,
    consensusEstimate: 12.60,
    analystCount: 18,
    revenueExpected: "$13.2B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 11.95, actual: 14.12, surprisePercent: 18.2 },
      { quarter: "Q3 2025", expected: 8.50, actual: 8.40, surprisePercent: -1.2 },
      { quarter: "Q2 2025", expected: 8.62, actual: 8.96, surprisePercent: 3.9 },
    ],
    preEarningsNote: "M&A advisory and trading revenue are the key swing factors.",
  },
  {
    ticker: "BAC",
    nextEarningsDate: "2026-03-12",
    expectedEPS: 0.82,
    previousEPS: 0.77,
    consensusEstimate: 0.80,
    analystCount: 24,
    revenueExpected: "$25.4B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 0.77, actual: 0.82, surprisePercent: 6.5 },
      { quarter: "Q3 2025", expected: 0.75, actual: 0.81, surprisePercent: 8.0 },
      { quarter: "Q2 2025", expected: 0.80, actual: 0.83, surprisePercent: 3.8 },
    ],
    preEarningsNote: "Consumer banking health and deposit trends under scrutiny.",
  },
  {
    ticker: "WFC",
    nextEarningsDate: "2026-03-13",
    expectedEPS: 1.32,
    previousEPS: 1.29,
    consensusEstimate: 1.30,
    analystCount: 20,
    revenueExpected: "$20.1B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 1.29, actual: 1.43, surprisePercent: 10.9 },
      { quarter: "Q3 2025", expected: 1.24, actual: 1.42, surprisePercent: 14.5 },
      { quarter: "Q2 2025", expected: 1.18, actual: 1.33, surprisePercent: 12.7 },
    ],
    preEarningsNote: "Expense cap compliance and mortgage lending volume matter most.",
  },
  {
    ticker: "MS",
    nextEarningsDate: "2026-03-13",
    expectedEPS: 2.15,
    previousEPS: 2.02,
    consensusEstimate: 2.10,
    analystCount: 16,
    revenueExpected: "$15.8B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 2.02, actual: 2.22, surprisePercent: 9.9 },
      { quarter: "Q3 2025", expected: 1.58, actual: 1.88, surprisePercent: 19.0 },
      { quarter: "Q2 2025", expected: 1.65, actual: 1.82, surprisePercent: 10.3 },
    ],
    preEarningsNote: "Wealth management flows and investment banking pipeline.",
  },
  {
    ticker: "SCHW",
    nextEarningsDate: "2026-03-14",
    expectedEPS: 0.92,
    previousEPS: 0.84,
    consensusEstimate: 0.90,
    analystCount: 14,
    revenueExpected: "$5.1B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 0.84, actual: 0.90, surprisePercent: 7.1 },
      { quarter: "Q3 2025", expected: 0.73, actual: 0.77, surprisePercent: 5.5 },
      { quarter: "Q2 2025", expected: 0.72, actual: 0.73, surprisePercent: 1.4 },
    ],
    preEarningsNote: "Client asset inflows and net interest margin recovery.",
  },

  // Wave 2: Healthcare + Consumer (mid March)
  {
    ticker: "UNH",
    nextEarningsDate: "2026-03-17",
    expectedEPS: 7.15,
    previousEPS: 6.81,
    consensusEstimate: 7.05,
    analystCount: 20,
    revenueExpected: "$102.3B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 6.81, actual: 6.93, surprisePercent: 1.8 },
      { quarter: "Q3 2025", expected: 6.56, actual: 7.15, surprisePercent: 9.0 },
      { quarter: "Q2 2025", expected: 6.65, actual: 6.80, surprisePercent: 2.3 },
    ],
    preEarningsNote: "Medical cost ratio and membership growth are the key metrics.",
  },
  {
    ticker: "JNJ",
    nextEarningsDate: "2026-03-18",
    expectedEPS: 2.45,
    previousEPS: 2.29,
    consensusEstimate: 2.42,
    analystCount: 18,
    revenueExpected: "$22.1B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 2.29, actual: 2.31, surprisePercent: 0.9 },
      { quarter: "Q3 2025", expected: 2.18, actual: 2.42, surprisePercent: 11.0 },
      { quarter: "Q2 2025", expected: 2.70, actual: 2.82, surprisePercent: 4.4 },
    ],
    preEarningsNote: "MedTech segment growth and talc litigation reserve updates.",
  },
  {
    ticker: "PG",
    nextEarningsDate: "2026-03-19",
    expectedEPS: 1.68,
    previousEPS: 1.52,
    consensusEstimate: 1.65,
    analystCount: 16,
    revenueExpected: "$21.5B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 1.52, actual: 1.84, surprisePercent: 21.1 },
      { quarter: "Q3 2025", expected: 1.68, actual: 1.93, surprisePercent: 14.9 },
      { quarter: "Q2 2025", expected: 1.37, actual: 1.52, surprisePercent: 10.9 },
    ],
    preEarningsNote: "Volume vs pricing growth split and market share trends.",
  },
  {
    ticker: "KO",
    nextEarningsDate: "2026-03-19",
    expectedEPS: 0.72,
    previousEPS: 0.51,
    consensusEstimate: 0.70,
    analystCount: 14,
    revenueExpected: "$11.3B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 0.51, actual: 0.55, surprisePercent: 7.8 },
      { quarter: "Q3 2025", expected: 0.74, actual: 0.77, surprisePercent: 4.1 },
      { quarter: "Q2 2025", expected: 0.81, actual: 0.84, surprisePercent: 3.7 },
    ],
    preEarningsNote: "International volume growth and currency headwinds.",
  },

  // Wave 3: Big Tech (late March)
  {
    ticker: "MSFT",
    nextEarningsDate: "2026-03-24",
    expectedEPS: 3.22,
    previousEPS: 3.23,
    consensusEstimate: 3.18,
    analystCount: 28,
    revenueExpected: "$68.5B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 3.23, actual: 3.23, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 3.10, actual: 3.30, surprisePercent: 6.5 },
      { quarter: "Q2 2025", expected: 2.93, actual: 3.23, surprisePercent: 10.2 },
    ],
    preEarningsNote: "Azure growth rate and Copilot monetization are the headline numbers.",
  },
  {
    ticker: "GOOGL",
    nextEarningsDate: "2026-03-24",
    expectedEPS: 2.18,
    previousEPS: 2.12,
    consensusEstimate: 2.15,
    analystCount: 30,
    revenueExpected: "$96.2B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 2.12, actual: 2.15, surprisePercent: 1.4 },
      { quarter: "Q3 2025", expected: 1.84, actual: 2.12, surprisePercent: 15.2 },
      { quarter: "Q2 2025", expected: 1.89, actual: 1.89, surprisePercent: 0.0 },
    ],
    preEarningsNote: "Search advertising resilience and Google Cloud profitability.",
  },
  {
    ticker: "META",
    nextEarningsDate: "2026-03-25",
    expectedEPS: 6.30,
    previousEPS: 6.03,
    consensusEstimate: 6.20,
    analystCount: 26,
    revenueExpected: "$45.8B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 6.03, actual: 6.73, surprisePercent: 11.6 },
      { quarter: "Q3 2025", expected: 5.25, actual: 6.03, surprisePercent: 14.9 },
      { quarter: "Q2 2025", expected: 4.73, actual: 5.16, surprisePercent: 9.1 },
    ],
    preEarningsNote: "Reality Labs losses, AI capex guidance, and engagement metrics.",
  },
  {
    ticker: "AMZN",
    nextEarningsDate: "2026-03-26",
    expectedEPS: 1.42,
    previousEPS: 1.48,
    consensusEstimate: 1.38,
    analystCount: 32,
    revenueExpected: "$187.4B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 1.48, actual: 1.86, surprisePercent: 25.7 },
      { quarter: "Q3 2025", expected: 1.14, actual: 1.43, surprisePercent: 25.4 },
      { quarter: "Q2 2025", expected: 1.03, actual: 1.26, surprisePercent: 22.3 },
    ],
    preEarningsNote: "AWS growth acceleration and operating margin expansion story.",
  },
  {
    ticker: "AAPL",
    nextEarningsDate: "2026-03-27",
    expectedEPS: 2.38,
    previousEPS: 2.40,
    consensusEstimate: 2.35,
    analystCount: 30,
    revenueExpected: "$94.3B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 2.40, actual: 2.40, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 1.59, actual: 1.64, surprisePercent: 3.1 },
      { quarter: "Q2 2025", expected: 1.50, actual: 1.53, surprisePercent: 2.0 },
    ],
    preEarningsNote: "iPhone 17 demand signals and Apple Intelligence adoption metrics.",
  },

  // Wave 4: More tech + semis (late March)
  {
    ticker: "NVDA",
    nextEarningsDate: "2026-03-27",
    expectedEPS: 0.89,
    previousEPS: 0.81,
    consensusEstimate: 0.87,
    analystCount: 34,
    revenueExpected: "$42.8B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 0.81, actual: 0.89, surprisePercent: 9.9 },
      { quarter: "Q3 2025", expected: 0.75, actual: 0.81, surprisePercent: 8.0 },
      { quarter: "Q2 2025", expected: 0.64, actual: 0.68, surprisePercent: 6.3 },
    ],
    preEarningsNote: "Data center revenue trajectory and Blackwell chip ramp guidance.",
  },
  {
    ticker: "AVGO",
    nextEarningsDate: "2026-03-28",
    expectedEPS: 14.20,
    previousEPS: 12.79,
    consensusEstimate: 14.00,
    analystCount: 20,
    revenueExpected: "$15.8B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 12.79, actual: 14.38, surprisePercent: 12.4 },
      { quarter: "Q3 2025", expected: 12.00, actual: 13.77, surprisePercent: 14.8 },
      { quarter: "Q2 2025", expected: 10.84, actual: 10.96, surprisePercent: 1.1 },
    ],
    preEarningsNote: "AI networking revenue and VMware integration progress.",
  },
  {
    ticker: "AMD",
    nextEarningsDate: "2026-03-28",
    expectedEPS: 1.15,
    previousEPS: 1.09,
    consensusEstimate: 1.12,
    analystCount: 24,
    revenueExpected: "$7.8B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 1.09, actual: 1.09, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 0.92, actual: 0.92, surprisePercent: 0.0 },
      { quarter: "Q2 2025", expected: 0.68, actual: 0.69, surprisePercent: 1.5 },
    ],
    preEarningsNote: "MI300X AI GPU market share gains vs NVIDIA.",
  },
  {
    ticker: "TSLA",
    nextEarningsDate: "2026-03-25",
    expectedEPS: 0.78,
    previousEPS: 0.73,
    consensusEstimate: 0.75,
    analystCount: 30,
    revenueExpected: "$26.8B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 0.73, actual: 0.73, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 0.58, actual: 0.72, surprisePercent: 24.1 },
      { quarter: "Q2 2025", expected: 0.62, actual: 0.52, surprisePercent: -16.1 },
    ],
    preEarningsNote: "Delivery numbers, margin trajectory, and FSD/robotaxi timeline.",
  },
  {
    ticker: "NFLX",
    nextEarningsDate: "2026-03-18",
    expectedEPS: 5.82,
    previousEPS: 4.27,
    consensusEstimate: 5.70,
    analystCount: 22,
    revenueExpected: "$10.5B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 4.27, actual: 4.27, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 5.12, actual: 5.40, surprisePercent: 5.5 },
      { quarter: "Q2 2025", expected: 4.74, actual: 4.88, surprisePercent: 3.0 },
    ],
    preEarningsNote: "Ad-tier growth, subscriber count, and content spend guidance.",
  },

  // Wave 5: Industrials + Energy (early April)
  {
    ticker: "CAT",
    nextEarningsDate: "2026-04-01",
    expectedEPS: 5.40,
    previousEPS: 5.23,
    consensusEstimate: 5.35,
    analystCount: 16,
    revenueExpected: "$16.8B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 5.23, actual: 5.62, surprisePercent: 7.5 },
      { quarter: "Q3 2025", expected: 5.12, actual: 5.17, surprisePercent: 1.0 },
      { quarter: "Q2 2025", expected: 5.54, actual: 5.99, surprisePercent: 8.1 },
    ],
    preEarningsNote: "Backlog levels and infrastructure spending outlook.",
  },
  {
    ticker: "XOM",
    nextEarningsDate: "2026-04-01",
    expectedEPS: 2.15,
    previousEPS: 1.72,
    consensusEstimate: 2.10,
    analystCount: 18,
    revenueExpected: "$87.2B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 1.72, actual: 1.72, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 1.94, actual: 1.92, surprisePercent: -1.0 },
      { quarter: "Q2 2025", expected: 2.01, actual: 2.14, surprisePercent: 6.5 },
    ],
    preEarningsNote: "Upstream production volumes and Pioneer integration synergies.",
  },
  {
    ticker: "CVX",
    nextEarningsDate: "2026-04-02",
    expectedEPS: 3.15,
    previousEPS: 2.06,
    consensusEstimate: 3.08,
    analystCount: 16,
    revenueExpected: "$48.5B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 2.06, actual: 2.06, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 2.43, actual: 2.48, surprisePercent: 2.1 },
      { quarter: "Q2 2025", expected: 2.55, actual: 2.56, surprisePercent: 0.4 },
    ],
    preEarningsNote: "Permian Basin output and capital return program updates.",
  },
  {
    ticker: "HON",
    nextEarningsDate: "2026-04-02",
    expectedEPS: 2.75,
    previousEPS: 2.67,
    consensusEstimate: 2.72,
    analystCount: 14,
    revenueExpected: "$10.2B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 2.67, actual: 2.84, surprisePercent: 6.4 },
      { quarter: "Q3 2025", expected: 2.50, actual: 2.58, surprisePercent: 3.2 },
      { quarter: "Q2 2025", expected: 2.49, actual: 2.49, surprisePercent: 0.0 },
    ],
    preEarningsNote: "Aerospace aftermarket demand and automation segment orders.",
  },
  {
    ticker: "BA",
    nextEarningsDate: "2026-04-03",
    expectedEPS: -0.45,
    previousEPS: -0.47,
    consensusEstimate: -0.50,
    analystCount: 20,
    revenueExpected: "$18.2B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: -0.47, actual: -0.47, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: -1.56, actual: -10.44, surprisePercent: -569.2 },
      { quarter: "Q2 2025", expected: -1.20, actual: -2.90, surprisePercent: -141.7 },
    ],
    preEarningsNote: "737 MAX delivery rate and cash burn trajectory.",
  },
  {
    ticker: "DE",
    nextEarningsDate: "2026-04-03",
    expectedEPS: 5.85,
    previousEPS: 3.19,
    consensusEstimate: 5.80,
    analystCount: 14,
    revenueExpected: "$11.5B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 3.19, actual: 3.19, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 5.63, actual: 6.29, surprisePercent: 11.7 },
      { quarter: "Q2 2025", expected: 7.53, actual: 8.53, surprisePercent: 13.3 },
    ],
    preEarningsNote: "Farm equipment demand cycle and precision ag technology adoption.",
  },

  // Wave 6: SaaS + Growth (first week April)
  {
    ticker: "CRM",
    nextEarningsDate: "2026-04-07",
    expectedEPS: 2.65,
    previousEPS: 2.41,
    consensusEstimate: 2.60,
    analystCount: 22,
    revenueExpected: "$9.8B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 2.41, actual: 2.41, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 2.44, actual: 2.56, surprisePercent: 4.9 },
      { quarter: "Q2 2025", expected: 2.36, actual: 2.56, surprisePercent: 8.5 },
    ],
    preEarningsNote: "Agentforce AI adoption and remaining performance obligations.",
  },
  {
    ticker: "ADBE",
    nextEarningsDate: "2026-04-07",
    expectedEPS: 5.00,
    previousEPS: 4.81,
    consensusEstimate: 4.95,
    analystCount: 20,
    revenueExpected: "$5.7B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 4.81, actual: 4.81, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 4.67, actual: 4.65, surprisePercent: -0.4 },
      { quarter: "Q2 2025", expected: 4.39, actual: 4.48, surprisePercent: 2.1 },
    ],
    preEarningsNote: "Firefly AI monetization and Creative Cloud net new ARR.",
  },
  {
    ticker: "PLTR",
    nextEarningsDate: "2026-04-08",
    expectedEPS: 0.13,
    previousEPS: 0.11,
    consensusEstimate: 0.12,
    analystCount: 16,
    revenueExpected: "$884M",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 0.11, actual: 0.14, surprisePercent: 27.3 },
      { quarter: "Q3 2025", expected: 0.09, actual: 0.10, surprisePercent: 11.1 },
      { quarter: "Q2 2025", expected: 0.08, actual: 0.09, surprisePercent: 12.5 },
    ],
    preEarningsNote: "AIP platform commercial customer count and US government contract pipeline.",
  },
  {
    ticker: "NOW",
    nextEarningsDate: "2026-04-08",
    expectedEPS: 4.10,
    previousEPS: 3.89,
    consensusEstimate: 4.05,
    analystCount: 18,
    revenueExpected: "$3.1B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 3.89, actual: 3.89, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 3.72, actual: 3.72, surprisePercent: 0.0 },
      { quarter: "Q2 2025", expected: 3.49, actual: 3.55, surprisePercent: 1.7 },
    ],
    preEarningsNote: "Subscription revenue growth rate and large deal metrics.",
  },

  // Wave 7: Retail + Consumer (mid April)
  {
    ticker: "WMT",
    nextEarningsDate: "2026-04-10",
    expectedEPS: 0.58,
    previousEPS: 0.66,
    consensusEstimate: 0.57,
    analystCount: 22,
    revenueExpected: "$168.5B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 0.66, actual: 0.66, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 0.53, actual: 0.58, surprisePercent: 9.4 },
      { quarter: "Q2 2025", expected: 0.65, actual: 0.67, surprisePercent: 3.1 },
    ],
    preEarningsNote: "E-commerce growth, Walmart+ subscriber count, and grocery market share.",
  },
  {
    ticker: "COST",
    nextEarningsDate: "2026-04-10",
    expectedEPS: 4.15,
    previousEPS: 4.04,
    consensusEstimate: 4.10,
    analystCount: 18,
    revenueExpected: "$62.4B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 4.04, actual: 3.82, surprisePercent: -5.4 },
      { quarter: "Q3 2025", expected: 3.79, actual: 3.82, surprisePercent: 0.8 },
      { quarter: "Q2 2025", expected: 3.69, actual: 3.78, surprisePercent: 2.4 },
    ],
    preEarningsNote: "Membership renewal rates and comparable sales growth ex-fuel.",
  },
  {
    ticker: "HD",
    nextEarningsDate: "2026-04-11",
    expectedEPS: 3.65,
    previousEPS: 3.13,
    consensusEstimate: 3.60,
    analystCount: 20,
    revenueExpected: "$39.2B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 3.13, actual: 3.13, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 3.64, actual: 3.67, surprisePercent: 0.8 },
      { quarter: "Q2 2025", expected: 4.53, actual: 4.60, surprisePercent: 1.5 },
    ],
    preEarningsNote: "Housing turnover impact and pro customer segment growth.",
  },
  {
    ticker: "DIS",
    nextEarningsDate: "2026-04-14",
    expectedEPS: 1.48,
    previousEPS: 1.40,
    consensusEstimate: 1.45,
    analystCount: 18,
    revenueExpected: "$24.1B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 1.40, actual: 1.76, surprisePercent: 25.7 },
      { quarter: "Q3 2025", expected: 1.19, actual: 1.39, surprisePercent: 16.8 },
      { quarter: "Q2 2025", expected: 1.10, actual: 1.21, surprisePercent: 10.0 },
    ],
    preEarningsNote: "Disney+ subscriber trajectory and parks revenue per guest.",
  },
  {
    ticker: "SBUX",
    nextEarningsDate: "2026-04-14",
    expectedEPS: 0.78,
    previousEPS: 0.69,
    consensusEstimate: 0.75,
    analystCount: 16,
    revenueExpected: "$9.4B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 0.69, actual: 0.69, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 0.93, actual: 0.93, surprisePercent: 0.0 },
      { quarter: "Q2 2025", expected: 0.80, actual: 0.68, surprisePercent: -15.0 },
    ],
    preEarningsNote: "Same-store sales recovery under new CEO and China market rebound.",
  },

  // Wave 8: Pharma + Utilities (mid April)
  {
    ticker: "LLY",
    nextEarningsDate: "2026-04-15",
    expectedEPS: 5.42,
    previousEPS: 4.88,
    consensusEstimate: 5.35,
    analystCount: 20,
    revenueExpected: "$13.8B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 4.88, actual: 5.32, surprisePercent: 9.0 },
      { quarter: "Q3 2025", expected: 1.47, actual: 1.18, surprisePercent: -19.7 },
      { quarter: "Q2 2025", expected: 2.88, actual: 3.92, surprisePercent: 36.1 },
    ],
    preEarningsNote: "Mounjaro/Zepbound demand vs supply capacity and pipeline catalysts.",
  },
  {
    ticker: "ABBV",
    nextEarningsDate: "2026-04-15",
    expectedEPS: 2.48,
    previousEPS: 2.16,
    consensusEstimate: 2.45,
    analystCount: 16,
    revenueExpected: "$14.2B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 2.16, actual: 2.16, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 3.00, actual: 3.67, surprisePercent: 22.3 },
      { quarter: "Q2 2025", expected: 2.57, actual: 2.65, surprisePercent: 3.1 },
    ],
    preEarningsNote: "Humira biosimilar erosion offset by Skyrizi/Rinvoq growth.",
  },
  {
    ticker: "V",
    nextEarningsDate: "2026-04-16",
    expectedEPS: 2.78,
    previousEPS: 2.75,
    consensusEstimate: 2.75,
    analystCount: 22,
    revenueExpected: "$9.5B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 2.75, actual: 2.75, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 2.58, actual: 2.71, surprisePercent: 5.0 },
      { quarter: "Q2 2025", expected: 2.44, actual: 2.51, surprisePercent: 2.9 },
    ],
    preEarningsNote: "Cross-border transaction volumes and new payment flow growth.",
  },
  {
    ticker: "NEE",
    nextEarningsDate: "2026-04-16",
    expectedEPS: 0.62,
    previousEPS: 0.53,
    consensusEstimate: 0.60,
    analystCount: 12,
    revenueExpected: "$6.2B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 0.53, actual: 0.53, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 1.03, actual: 1.03, surprisePercent: 0.0 },
      { quarter: "Q2 2025", expected: 0.96, actual: 1.00, surprisePercent: 4.2 },
    ],
    preEarningsNote: "Renewable energy development pipeline and interest rate sensitivity.",
  },

  // Wave 9: More stocks (late April)
  {
    ticker: "UBER",
    nextEarningsDate: "2026-04-17",
    expectedEPS: 0.52,
    previousEPS: 0.50,
    consensusEstimate: 0.50,
    analystCount: 22,
    revenueExpected: "$12.2B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 0.50, actual: 0.90, surprisePercent: 80.0 },
      { quarter: "Q3 2025", expected: 0.41, actual: 1.20, surprisePercent: 192.7 },
      { quarter: "Q2 2025", expected: 0.31, actual: 0.47, surprisePercent: 51.6 },
    ],
    preEarningsNote: "Gross bookings growth, autonomous vehicle partnerships, and profitability.",
  },
  {
    ticker: "COIN",
    nextEarningsDate: "2026-04-17",
    expectedEPS: 2.45,
    previousEPS: 4.68,
    consensusEstimate: 2.40,
    analystCount: 14,
    revenueExpected: "$2.1B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 4.68, actual: 4.68, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 0.45, actual: 0.28, surprisePercent: -37.8 },
      { quarter: "Q2 2025", expected: 0.94, actual: 0.14, surprisePercent: -85.1 },
    ],
    preEarningsNote: "Crypto trading volume trends and subscription revenue growth.",
  },
  {
    ticker: "GE",
    nextEarningsDate: "2026-04-18",
    expectedEPS: 1.22,
    previousEPS: 1.32,
    consensusEstimate: 1.20,
    analystCount: 16,
    revenueExpected: "$9.8B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 1.32, actual: 1.32, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 1.12, actual: 1.15, surprisePercent: 2.7 },
      { quarter: "Q2 2025", expected: 0.98, actual: 1.20, surprisePercent: 22.4 },
    ],
    preEarningsNote: "LEAP engine aftermarket revenue and defense orders.",
  },
  {
    ticker: "RTX",
    nextEarningsDate: "2026-04-18",
    expectedEPS: 1.42,
    previousEPS: 1.54,
    consensusEstimate: 1.40,
    analystCount: 14,
    revenueExpected: "$20.5B",
    surpriseHistory: [
      { quarter: "Q4 2025", expected: 1.54, actual: 1.54, surprisePercent: 0.0 },
      { quarter: "Q3 2025", expected: 1.34, actual: 1.45, surprisePercent: 8.2 },
      { quarter: "Q2 2025", expected: 1.30, actual: 1.34, surprisePercent: 3.1 },
    ],
    preEarningsNote: "Pratt & Whitney GTF inspection costs and Collins Aerospace backlog.",
  },
];

// ---------------------------------------------------------------------------
// Join with stock data for full entries
// ---------------------------------------------------------------------------

const stockByTicker = new Map<string, Stock>();
for (const s of stocks) {
  stockByTicker.set(s.ticker, s);
}

export const earningsCalendar: EarningsEntry[] = RAW_EARNINGS.map((raw) => {
  const stock = stockByTicker.get(raw.ticker);
  return {
    ...raw,
    name: stock?.name ?? raw.ticker,
    sector: stock?.sector ?? "Unknown",
  };
});

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export function getEarningsByWeek(entries: EarningsEntry[]): Map<string, EarningsEntry[]> {
  const weeks = new Map<string, EarningsEntry[]>();
  for (const entry of entries) {
    const d = new Date(entry.nextEarningsDate);
    // Get Monday of the week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d);
    monday.setDate(diff);
    const weekKey = monday.toISOString().split("T")[0];
    const existing = weeks.get(weekKey) ?? [];
    weeks.set(weekKey, [...existing, entry]);
  }
  return weeks;
}

export function getEarningsByMonth(entries: EarningsEntry[]): Map<string, EarningsEntry[]> {
  const months = new Map<string, EarningsEntry[]>();
  for (const entry of entries) {
    const d = new Date(entry.nextEarningsDate);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = months.get(monthKey) ?? [];
    months.set(monthKey, [...existing, entry]);
  }
  return months;
}

export function getBeatRate(entry: EarningsEntry): number {
  if (entry.surpriseHistory.length === 0) return 0;
  const beats = entry.surpriseHistory.filter((s) => s.surprisePercent > 0).length;
  return Math.round((beats / entry.surpriseHistory.length) * 100);
}

export function getAverageSurprise(entry: EarningsEntry): number {
  if (entry.surpriseHistory.length === 0) return 0;
  const total = entry.surpriseHistory.reduce((sum, s) => sum + s.surprisePercent, 0);
  return Math.round((total / entry.surpriseHistory.length) * 10) / 10;
}

// ---------------------------------------------------------------------------
// Personality-aware earnings coaching
// ---------------------------------------------------------------------------

export function getPreEarningsCoaching(archetypeKey: string): string {
  const coaching: Record<string, string> = {
    systems_builder:
      "Your system should have rules for earnings: position sizing, stop-losses, and hold-through criteria. If it doesn't, now's the time to add them.",
    reassurance_seeker:
      "Earnings create uncertainty, which is your kryptonite. Decide BEFORE the report whether you're holding or selling -- having a plan reduces anxiety.",
    analytical_skeptic:
      "Don't just read the headline EPS. Dig into revenue quality, guidance changes, and segment breakdowns. The real story is in the footnotes.",
    diy_controller:
      "You've done your homework. Trust your thesis but set a clear 'I was wrong' trigger in case the report invalidates it.",
    collaborative_partner:
      "Earnings days are when noise peaks. Before reacting, find one thoughtful analysis that challenges your initial take.",
    big_picture_optimist:
      "One quarter doesn't define a company. Focus on whether the long-term thesis is intact, not whether they beat by a penny.",
    trend_sensitive_explorer:
      "Post-earnings momentum can be powerful, but the first 30 minutes are noise. Wait for the dust to settle before riding any trend.",
    avoider_under_stress:
      "If earnings stress triggers your freeze response, that's OK. Set your rules now while calm, and let the plan execute itself.",
    action_first_decider:
      "Resist the urge to trade in the first hour after results. Speed is your edge most days, but earnings volatility punishes fast fingers.",
    values_anchored_steward:
      "Look beyond the numbers -- check ESG updates, workforce investments, and long-term strategic initiatives in the earnings call.",
  };

  return coaching[archetypeKey] ?? "Review your holdings reporting this period and have a plan for each -- hold, add, or trim.";
}
