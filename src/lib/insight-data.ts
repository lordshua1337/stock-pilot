// Insight card data types and generated analysis for the HoldingInsightCard component.
// All rating data is AI-generated / simulated -- not from licensed feeds (yet).
// Licensed source blocks show "Data pending" per the build spec.

import type { Stock } from "./stock-data";

export type StanceLabel =
  | "Strong Conviction"
  | "Cautious Optimism"
  | "Conflicted"
  | "Under Review"
  | "Deteriorating"
  | "Avoid";

export interface AnalystConsensus {
  buyPct: number;
  holdPct: number;
  sellPct: number;
  totalAnalysts: number;
  avgPriceTarget: number;
  recentChange?: { analyst: string; from: string; to: string; date: string };
}

export interface MorningstarRating {
  stars: number; // 1-5
  fairValue: number;
  uncertainty: "Low" | "Medium" | "High" | "Very High";
  moat: "None" | "Narrow" | "Wide";
  moatSource?: string;
}

export interface ShortInterestData {
  shortPctFloat: number;
  daysToCover: number;
  changeVsPrior: number; // percentage change vs 2 weeks ago
}

export interface InsiderActivity {
  netDirection: "Net Buyer" | "Net Seller" | "Neutral";
  largestTxn?: { role: string; amount: string; date: string; type: "Buy" | "Sell" };
  clusterSignal: boolean;
  buyCount90d: number;
  sellCount90d: number;
}

export interface FundamentalSignal {
  label: string;
  value: string;
  direction: "up" | "down" | "neutral";
  interpretation: string;
  tooltip: string;
}

export interface TechnicalSignal {
  label: string;
  value: string;
  direction: "up" | "down" | "neutral";
  interpretation: string;
  tooltip: string;
}

export interface RedTeamCase {
  thesis: string;
  claims: string[];
  keyAssumption: string;
  confirmation90d: string;
}

export interface StockInsight {
  stance: StanceLabel;
  analystConsensus: AnalystConsensus;
  morningstar: MorningstarRating;
  shortInterest: ShortInterestData;
  insiderActivity: InsiderActivity;
  fundamentals: FundamentalSignal[];
  technicals: TechnicalSignal[];
  bullCase: RedTeamCase;
  bearCase: RedTeamCase;
  skepticVerdict: string;
  whatWouldChangeMyMind: string[];
}

// Derive stance from stock data heuristics
function deriveStance(stock: Stock): StanceLabel {
  const { aiScore, analystRating } = stock;
  if (aiScore >= 80 && (analystRating === "Strong Buy" || analystRating === "Buy")) return "Strong Conviction";
  if (aiScore >= 65 && analystRating !== "Sell") return "Cautious Optimism";
  if (aiScore >= 50 && aiScore < 65) return "Conflicted";
  if (aiScore >= 40 && aiScore < 50) return "Under Review";
  if (aiScore >= 30 && aiScore < 40) return "Deteriorating";
  return "Avoid";
}

// Generate analyst consensus from stock data
function generateAnalystConsensus(stock: Stock): AnalystConsensus {
  const ratingMap: Record<string, { buy: number; hold: number; sell: number }> = {
    "Strong Buy": { buy: 82, hold: 14, sell: 4 },
    "Buy": { buy: 68, hold: 26, sell: 6 },
    "Hold": { buy: 35, hold: 52, sell: 13 },
    "Sell": { buy: 12, hold: 38, sell: 50 },
  };
  const dist = ratingMap[stock.analystRating] ?? ratingMap["Hold"];
  const analysts = 15 + Math.floor(stock.aiScore / 10);
  const upside = stock.aiScore >= 70 ? 1.12 : stock.aiScore >= 50 ? 1.05 : 0.95;

  return {
    buyPct: dist.buy,
    holdPct: dist.hold,
    sellPct: dist.sell,
    totalAnalysts: analysts,
    avgPriceTarget: Math.round(stock.price * upside * 100) / 100,
  };
}

// Generate morningstar-style rating from fundamentals
function generateMorningstar(stock: Stock): MorningstarRating {
  const peBaseline = 25;
  const undervalued = stock.peRatio < peBaseline && stock.aiScore >= 60;
  const stars = undervalued ? 4 : stock.aiScore >= 75 ? 3 : stock.aiScore >= 50 ? 3 : 2;
  const fairValue = Math.round(stock.price * (stock.aiScore >= 70 ? 1.1 : stock.aiScore >= 50 ? 1.0 : 0.9) * 100) / 100;
  const uncertainty: MorningstarRating["uncertainty"] =
    stock.peRatio > 60 ? "Very High" : stock.peRatio > 35 ? "High" : stock.peRatio > 20 ? "Medium" : "Low";
  const moat: MorningstarRating["moat"] =
    stock.aiScore >= 80 ? "Wide" : stock.aiScore >= 60 ? "Narrow" : "None";

  return { stars, fairValue, uncertainty, moat };
}

// Generate short interest from heuristics
function generateShortInterest(stock: Stock): ShortInterestData {
  const base = stock.analystRating === "Sell" ? 18 : stock.aiScore < 50 ? 12 : stock.aiScore < 70 ? 6 : 3;
  return {
    shortPctFloat: Math.round((base + Math.random() * 4) * 10) / 10,
    daysToCover: Math.round((base / 4 + Math.random() * 2) * 10) / 10,
    changeVsPrior: Math.round((Math.random() * 4 - 2) * 10) / 10,
  };
}

// Generate insider activity
function generateInsiderActivity(stock: Stock): InsiderActivity {
  const bullish = stock.aiScore >= 65;
  const buys = bullish ? 3 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2);
  const sells = bullish ? Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 3);
  const net: InsiderActivity["netDirection"] = buys > sells ? "Net Buyer" : sells > buys ? "Net Seller" : "Neutral";

  return {
    netDirection: net,
    largestTxn: {
      role: buys > sells ? "CFO" : "CEO",
      amount: buys > sells ? "$2.4M" : "$5.1M",
      date: "2026-02-18",
      type: buys > sells ? "Buy" : "Sell",
    },
    clusterSignal: buys >= 3,
    buyCount90d: buys,
    sellCount90d: sells,
  };
}

// Generate fundamental signals
function generateFundamentals(stock: Stock): FundamentalSignal[] {
  const revenueGrowth = stock.aiScore >= 70 ? 15 + Math.floor(Math.random() * 10) : Math.floor(Math.random() * 12);
  const grossMargin = 40 + Math.floor(Math.random() * 25);
  const fcfYield = Math.round((100 / stock.peRatio) * 100) / 100;

  return [
    {
      label: "Revenue Growth (YoY)",
      value: `${revenueGrowth}%`,
      direction: revenueGrowth > 10 ? "up" : revenueGrowth > 0 ? "neutral" : "down",
      interpretation: revenueGrowth > 15 ? "Strong growth trajectory" : revenueGrowth > 5 ? "Moderate growth" : "Growth stalling",
      tooltip: "Year-over-year revenue growth shows how fast the company's top line is expanding. Above 15% is considered strong for large-caps. Decelerating growth (even if positive) often causes stock price declines because the market prices in future growth rates.",
    },
    {
      label: "Gross Margin",
      value: `${grossMargin}%`,
      direction: grossMargin > 50 ? "up" : grossMargin > 30 ? "neutral" : "down",
      interpretation: grossMargin > 60 ? "High-margin business model" : grossMargin > 40 ? "Healthy margins" : "Thin margins -- watch for pressure",
      tooltip: "Gross margin shows how much profit remains after direct production costs. Software companies typically run 70-85%. Hardware/manufacturing runs 25-45%. Declining margins may signal competitive pressure or input cost inflation.",
    },
    {
      label: "Free Cash Flow Yield",
      value: `${fcfYield}%`,
      direction: fcfYield > 4 ? "up" : fcfYield > 2 ? "neutral" : "down",
      interpretation: fcfYield > 5 ? "Generating strong cash relative to price" : fcfYield > 2 ? "Moderate cash generation" : "Low yield -- priced for growth",
      tooltip: "FCF Yield = Free Cash Flow / Market Cap. Tells you what percentage return the company generates in actual cash. Above 5% is attractive for value investors. Below 2% means you're paying a premium for growth expectations. This is more reliable than P/E because it's harder to manipulate cash flow than earnings.",
    },
    {
      label: "Debt/Equity",
      value: stock.peRatio > 30 ? "0.4x" : "1.2x",
      direction: stock.peRatio > 30 ? "up" : "neutral",
      interpretation: stock.peRatio > 30 ? "Conservative balance sheet" : "Moderate leverage",
      tooltip: "Debt-to-equity ratio shows how much debt the company uses relative to shareholder equity. Below 0.5x is conservative. Above 2x is heavily leveraged. Compare within sector -- utilities normally run higher D/E than tech companies. Rising D/E during falling revenue is a red flag.",
    },
  ];
}

// Generate technical signals
function generateTechnicals(stock: Stock): TechnicalSignal[] {
  const fiftyTwoPos = ((stock.price - stock.fiftyTwoLow) / (stock.fiftyTwoHigh - stock.fiftyTwoLow)) * 100;
  const rsi = stock.changePercent > 2 ? 72 : stock.changePercent < -2 ? 28 : 48 + Math.floor(Math.random() * 12);

  return [
    {
      label: "RSI (14-day)",
      value: `${rsi}`,
      direction: rsi > 70 ? "down" : rsi < 30 ? "up" : "neutral",
      interpretation: rsi > 70 ? "Overbought -- momentum may fade" : rsi < 30 ? "Oversold -- potential bounce" : "Neutral momentum",
      tooltip: "Relative Strength Index measures momentum on a 0-100 scale. Above 70 = overbought (stock may have risen too fast). Below 30 = oversold (may be due for a bounce). RSI divergence (price making new highs while RSI doesn't) often precedes reversals. Works best in range-bound markets; less reliable during strong trends.",
    },
    {
      label: "52-Week Position",
      value: `${fiftyTwoPos.toFixed(0)}th percentile`,
      direction: fiftyTwoPos > 80 ? "up" : fiftyTwoPos < 20 ? "down" : "neutral",
      interpretation: fiftyTwoPos > 90 ? "Near 52-week high" : fiftyTwoPos < 10 ? "Near 52-week low" : `${fiftyTwoPos.toFixed(0)}% through range`,
      tooltip: "Shows where the current price sits within the past year's trading range. Near the top (>90%) could mean strong momentum or overextension. Near the bottom (<10%) could mean a buying opportunity or a falling knife. Context matters -- a stock near its high that's breaking out of a long base is different from one that just spiked.",
    },
    {
      label: "Volume vs 30d Avg",
      value: stock.changePercent > 3 ? "2.1x" : stock.changePercent < -3 ? "1.8x" : "0.9x",
      direction: Math.abs(stock.changePercent) > 3 ? "up" : "neutral",
      interpretation: Math.abs(stock.changePercent) > 3 ? "Elevated volume -- conviction behind the move" : "Normal trading volume",
      tooltip: "Compares today's volume to the 30-day average. High volume on up days confirms buying conviction. High volume on down days confirms selling pressure. Low-volume moves are less trustworthy -- they can reverse quickly when real participants return.",
    },
    {
      label: "Price vs 200 DMA",
      value: stock.price > stock.fiftyTwoLow * 1.3 ? "Above" : "Below",
      direction: stock.price > stock.fiftyTwoLow * 1.3 ? "up" : "down",
      interpretation: stock.price > stock.fiftyTwoLow * 1.3 ? "Long-term uptrend intact" : "Below long-term trend -- caution",
      tooltip: "The 200-day moving average is the most widely watched technical indicator. Institutional investors use it as a trend filter. Above = long-term uptrend. Below = long-term downtrend. When price crosses the 200 DMA (either direction), it often triggers large order flows from systematic strategies.",
    },
  ];
}

// Generate red team analysis
function generateRedTeam(stock: Stock): { bull: RedTeamCase; bear: RedTeamCase; skeptic: string; changeMyMind: string[] } {
  const bull: RedTeamCase = {
    thesis: `${stock.name} is positioned to outperform over the next 12 months driven by ${stock.catalysts[0]?.toLowerCase() ?? "improving fundamentals"}.`,
    claims: stock.catalysts.slice(0, 3).map(c => c),
    keyAssumption: `Revenue growth must sustain above current analyst estimates for the premium valuation (${stock.peRatio}x P/E) to hold.`,
    confirmation90d: `Watch for next quarterly earnings beat and forward guidance raise above consensus.`,
  };

  const bear: RedTeamCase = {
    thesis: `${stock.name} faces meaningful headwinds that the market is underpricing, particularly ${stock.risks[0]?.toLowerCase() ?? "competitive pressure"}.`,
    claims: stock.risks.slice(0, 3).map(r => r),
    keyAssumption: `If ${stock.risks[0]?.toLowerCase() ?? "the primary risk"} materializes, the current multiple compresses by 20-30%.`,
    confirmation90d: `Watch for revenue growth deceleration or margin compression in next earnings report.`,
  };

  const skeptic = `The bull case for ${stock.ticker} rests heavily on sustained execution -- ${stock.catalysts[0]?.toLowerCase() ?? "growth"} is promising but unproven at scale. The bear case correctly identifies ${stock.risks[0]?.toLowerCase() ?? "real risks"} but may overweight near-term headwinds relative to the multi-year opportunity. The single most important unknown is whether the company can maintain its growth rate at the current ${stock.peRatio}x P/E -- any deceleration and the stock re-rates significantly lower.`;

  const changeMyMind = [
    `If quarterly revenue growth falls below ${stock.aiScore >= 70 ? "10%" : "5%"} YoY, the growth thesis is broken.`,
    `If ${stock.risks[0]?.toLowerCase() ?? "the key risk"} worsens materially in the next earnings call.`,
    `If insider selling accelerates with 3+ executives reducing positions within 30 days.`,
  ];

  return { bull, bear, skeptic, changeMyMind };
}

// Main function: generate full insight for a stock
export function generateStockInsight(stock: Stock): StockInsight {
  const redTeam = generateRedTeam(stock);

  return {
    stance: deriveStance(stock),
    analystConsensus: generateAnalystConsensus(stock),
    morningstar: generateMorningstar(stock),
    shortInterest: generateShortInterest(stock),
    insiderActivity: generateInsiderActivity(stock),
    fundamentals: generateFundamentals(stock),
    technicals: generateTechnicals(stock),
    bullCase: redTeam.bull,
    bearCase: redTeam.bear,
    skepticVerdict: redTeam.skeptic,
    whatWouldChangeMyMind: redTeam.changeMyMind,
  };
}
