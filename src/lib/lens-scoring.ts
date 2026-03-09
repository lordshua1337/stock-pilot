import type { Stock, InstrumentType } from "./stock-data";

// ─── Types ──────────────────────────────────────────────────────────────────

export type PersonaKey =
  | "buffett"
  | "graham"
  | "lynch"
  | "wood"
  | "dalio"
  | "bogle"
  | "soros";

export interface DimensionWeights {
  valuation: number;
  growth: number;
  income: number;
  stability: number;
  quality: number;
  cost: number;
}

export interface InvestorPersona {
  key: PersonaKey;
  name: string;
  fullName: string;
  era: string;
  philosophy: string;
  famousQuote: string;
  weights: DimensionWeights;
  sectorBias: Record<string, number>;
  instrumentBias: Record<InstrumentType, number>;
}

// ─── Persona Definitions ────────────────────────────────────────────────────

export const PERSONAS: Record<PersonaKey, InvestorPersona> = {
  buffett: {
    key: "buffett",
    name: "Buffett",
    fullName: "Warren Buffett",
    era: "1965-present",
    philosophy: "Wide moats, predictable earnings, buy and hold forever",
    famousQuote: "Be fearful when others are greedy, and greedy when others are fearful.",
    weights: {
      valuation: 0.30,
      growth: 0.10,
      income: 0.25,
      stability: 0.20,
      quality: 0.15,
      cost: 0.00,
    },
    sectorBias: {
      Consumer: 10,
      Finance: 8,
      Healthcare: 5,
      Technology: -5,
      Energy: 5,
      Materials: 0,
      Industrial: 5,
      Utilities: 3,
      "Real Estate": -3,
      Communication: 0,
      "Broad Market": 0,
      "Fixed Income": -5,
      International: -5,
    },
    instrumentBias: { stock: 5, etf: -10, fund: -10 },
  },
  graham: {
    key: "graham",
    name: "Graham",
    fullName: "Benjamin Graham",
    era: "1934-1976",
    philosophy: "Margin of safety, deep value, balance sheet fortress",
    famousQuote: "The stock market is a voting machine in the short run but a weighing machine in the long run.",
    weights: {
      valuation: 0.40,
      growth: 0.05,
      income: 0.25,
      stability: 0.20,
      quality: 0.10,
      cost: 0.00,
    },
    sectorBias: {
      Consumer: 5,
      Finance: 5,
      Healthcare: 0,
      Technology: -10,
      Energy: 5,
      Materials: 5,
      Industrial: 5,
      Utilities: 8,
      "Real Estate": 0,
      Communication: -5,
      "Broad Market": 0,
      "Fixed Income": 5,
      International: 0,
    },
    instrumentBias: { stock: 5, etf: -5, fund: -5 },
  },
  lynch: {
    key: "lynch",
    name: "Lynch",
    fullName: "Peter Lynch",
    era: "1977-1990",
    philosophy: "Growth at a reasonable price, invest in what you know",
    famousQuote: "Know what you own, and know why you own it.",
    weights: {
      valuation: 0.20,
      growth: 0.35,
      income: 0.05,
      stability: 0.10,
      quality: 0.30,
      cost: 0.00,
    },
    sectorBias: {
      Consumer: 10,
      Finance: 0,
      Healthcare: 5,
      Technology: 5,
      Energy: 0,
      Materials: 0,
      Industrial: 5,
      Utilities: -5,
      "Real Estate": 0,
      Communication: 5,
      "Broad Market": -5,
      "Fixed Income": -10,
      International: 0,
    },
    instrumentBias: { stock: 10, etf: -5, fund: 0 },
  },
  wood: {
    key: "wood",
    name: "Wood",
    fullName: "Cathie Wood",
    era: "2014-present",
    philosophy: "Disruptive innovation, exponential growth, 5-year horizon",
    famousQuote: "Innovation solves problems. The bigger the problem, the bigger the opportunity.",
    weights: {
      valuation: 0.00,
      growth: 0.50,
      income: 0.00,
      stability: 0.05,
      quality: 0.20,
      cost: 0.00,
    },
    sectorBias: {
      Consumer: -5,
      Finance: -5,
      Healthcare: 10,
      Technology: 15,
      Energy: -10,
      Materials: -10,
      Industrial: 0,
      Utilities: -15,
      "Real Estate": -10,
      Communication: 5,
      "Broad Market": -5,
      "Fixed Income": -15,
      International: 0,
    },
    instrumentBias: { stock: 10, etf: 0, fund: -10 },
  },
  dalio: {
    key: "dalio",
    name: "Dalio",
    fullName: "Ray Dalio",
    era: "1975-present",
    philosophy: "All-weather, risk parity, diversification across regimes",
    famousQuote: "He who lives by the crystal ball will eat shattered glass.",
    weights: {
      valuation: 0.15,
      growth: 0.10,
      income: 0.20,
      stability: 0.30,
      quality: 0.10,
      cost: 0.15,
    },
    sectorBias: {
      Consumer: 0,
      Finance: 0,
      Healthcare: 0,
      Technology: -5,
      Energy: 5,
      Materials: 5,
      Industrial: 0,
      Utilities: 5,
      "Real Estate": 5,
      Communication: 0,
      "Broad Market": 10,
      "Fixed Income": 10,
      International: 8,
    },
    instrumentBias: { stock: -5, etf: 10, fund: 5 },
  },
  bogle: {
    key: "bogle",
    name: "Bogle",
    fullName: "John Bogle",
    era: "1975-2019",
    philosophy: "Index everything, minimize cost, broad market exposure",
    famousQuote: "Don't look for the needle in the haystack. Just buy the haystack!",
    weights: {
      valuation: 0.10,
      growth: 0.05,
      income: 0.15,
      stability: 0.15,
      quality: 0.10,
      cost: 0.45,
    },
    sectorBias: {
      Consumer: 0,
      Finance: 0,
      Healthcare: 0,
      Technology: 0,
      Energy: 0,
      Materials: 0,
      Industrial: 0,
      Utilities: 0,
      "Real Estate": 0,
      Communication: 0,
      "Broad Market": 15,
      "Fixed Income": 10,
      International: 5,
    },
    instrumentBias: { stock: -15, etf: 15, fund: 10 },
  },
  soros: {
    key: "soros",
    name: "Soros",
    fullName: "George Soros",
    era: "1969-2011",
    philosophy: "Macro momentum, reflexivity, ride the trend",
    famousQuote: "It's not whether you're right or wrong, but how much money you make when you're right.",
    weights: {
      valuation: 0.05,
      growth: 0.45,
      income: 0.00,
      stability: 0.05,
      quality: 0.15,
      cost: 0.00,
    },
    sectorBias: {
      Consumer: 0,
      Finance: 5,
      Healthcare: 0,
      Technology: 10,
      Energy: 5,
      Materials: 5,
      Industrial: 0,
      Utilities: -10,
      "Real Estate": 0,
      Communication: 5,
      "Broad Market": -5,
      "Fixed Income": -5,
      International: 10,
    },
    instrumentBias: { stock: 5, etf: 5, fund: -10 },
  },
};

export const PERSONA_LIST: InvestorPersona[] = Object.values(PERSONAS);

// ─── Dimension Scoring Functions ────────────────────────────────────────────
// Each function takes a stock and returns a sub-score from 0 to 100.

function scoreValuation(stock: Stock): number {
  const pe = stock.peRatio;
  let peScore: number;

  // Bond ETFs/funds with P/E 0 are not "cheap" -- they just don't have P/E
  if (pe === 0 && (stock.type === "etf" || stock.type === "fund")) {
    peScore = 50;
  } else if (pe === 0) {
    // Unprofitable stock -- bad for value
    peScore = 15;
  } else if (pe < 10) {
    peScore = 95;
  } else if (pe < 15) {
    peScore = 85;
  } else if (pe < 20) {
    peScore = 70;
  } else if (pe < 25) {
    peScore = 55;
  } else if (pe < 35) {
    peScore = 40;
  } else if (pe < 50) {
    peScore = 25;
  } else {
    peScore = 10;
  }

  // Price position in 52-week range (lower = more margin of safety)
  const range = stock.fiftyTwoHigh - stock.fiftyTwoLow;
  let rangeScore = 50;
  if (range > 0) {
    const position = (stock.price - stock.fiftyTwoLow) / range;
    rangeScore = Math.round((1 - position) * 80 + 10); // 10-90 range
  }

  return Math.round(peScore * 0.65 + rangeScore * 0.35);
}

function scoreGrowth(stock: Stock): number {
  const pct = stock.changePercent;

  // Momentum score based on recent change
  let momentumScore: number;
  if (pct > 5) momentumScore = 95;
  else if (pct > 3) momentumScore = 85;
  else if (pct > 1) momentumScore = 72;
  else if (pct > 0) momentumScore = 58;
  else if (pct > -1) momentumScore = 45;
  else if (pct > -3) momentumScore = 30;
  else momentumScore = 15;

  // Price position in 52-week range (higher = stronger trend)
  const range = stock.fiftyTwoHigh - stock.fiftyTwoLow;
  let trendScore = 50;
  if (range > 0) {
    const position = (stock.price - stock.fiftyTwoLow) / range;
    trendScore = Math.round(position * 80 + 10);
  }

  return Math.round(momentumScore * 0.6 + trendScore * 0.4);
}

function scoreIncome(stock: Stock): number {
  const dy = stock.dividendYield;

  if (dy >= 5) return 95;
  if (dy >= 4) return 88;
  if (dy >= 3) return 78;
  if (dy >= 2) return 65;
  if (dy >= 1) return 50;
  if (dy > 0) return 35;
  return 10;
}

function scoreStability(stock: Stock): number {
  const b = stock.beta;

  // Low beta = stable, but this can be inverted for momentum personas
  // Here we score stability (low beta = high score)
  if (b < 0) return 95; // Negative beta = truly uncorrelated
  if (b < 0.3) return 90;
  if (b < 0.6) return 80;
  if (b < 0.8) return 70;
  if (b < 1.0) return 58;
  if (b < 1.2) return 45;
  if (b < 1.5) return 30;
  return 15;
}

function scoreQuality(stock: Stock): number {
  let ratingScore: number;
  switch (stock.analystRating) {
    case "Strong Buy": ratingScore = 95; break;
    case "Buy": ratingScore = 78; break;
    case "Hold": ratingScore = 50; break;
    case "Sell": ratingScore = 20; break;
    default: ratingScore = 50;
  }

  // Market cap as quality proxy (larger = more established)
  const capStr = stock.marketCap.replace(/[^0-9.]/g, "");
  const capNum = parseFloat(capStr) || 0;
  const isTrillion = stock.marketCap.includes("T");
  const capBillions = isTrillion ? capNum * 1000 : capNum;

  let capScore: number;
  if (capBillions >= 500) capScore = 95;
  else if (capBillions >= 200) capScore = 85;
  else if (capBillions >= 100) capScore = 72;
  else if (capBillions >= 50) capScore = 60;
  else if (capBillions >= 20) capScore = 48;
  else capScore = 35;

  return Math.round(ratingScore * 0.6 + capScore * 0.4);
}

function scoreCost(stock: Stock): number {
  // Only relevant for ETFs and funds
  if (stock.type === "stock") return 50; // neutral baseline

  const er = stock.expenseRatio ?? 1.0;

  if (er <= 0.03) return 98;
  if (er <= 0.05) return 92;
  if (er <= 0.10) return 85;
  if (er <= 0.20) return 72;
  if (er <= 0.40) return 58;
  if (er <= 0.60) return 42;
  if (er <= 0.80) return 30;
  return 18;
}

// ─── Main Scoring Engine ────────────────────────────────────────────────────

export interface DimensionScores {
  valuation: number;
  growth: number;
  income: number;
  stability: number;
  quality: number;
  cost: number;
}

export interface LensResult {
  lensScore: number;
  dimensions: DimensionScores;
  personas: PersonaKey[];
}

/**
 * Compute dimension sub-scores for a stock (persona-independent).
 */
export function computeDimensions(stock: Stock): DimensionScores {
  return {
    valuation: scoreValuation(stock),
    growth: scoreGrowth(stock),
    income: scoreIncome(stock),
    stability: scoreStability(stock),
    quality: scoreQuality(stock),
    cost: scoreCost(stock),
  };
}

/**
 * Merge multiple persona weight vectors into one by averaging.
 */
function mergeWeights(personas: InvestorPersona[]): DimensionWeights {
  if (personas.length === 1) return personas[0].weights;

  const merged: DimensionWeights = {
    valuation: 0,
    growth: 0,
    income: 0,
    stability: 0,
    quality: 0,
    cost: 0,
  };

  for (const p of personas) {
    merged.valuation += p.weights.valuation;
    merged.growth += p.weights.growth;
    merged.income += p.weights.income;
    merged.stability += p.weights.stability;
    merged.quality += p.weights.quality;
    merged.cost += p.weights.cost;
  }

  const n = personas.length;
  merged.valuation /= n;
  merged.growth /= n;
  merged.income /= n;
  merged.stability /= n;
  merged.quality /= n;
  merged.cost /= n;

  return merged;
}

/**
 * Merge sector biases from multiple personas.
 */
function mergeSectorBias(
  personas: InvestorPersona[]
): Record<string, number> {
  const merged: Record<string, number> = {};

  for (const p of personas) {
    for (const [sector, bias] of Object.entries(p.sectorBias)) {
      merged[sector] = (merged[sector] ?? 0) + bias;
    }
  }

  const n = personas.length;
  for (const key of Object.keys(merged)) {
    merged[key] = merged[key] / n;
  }

  return merged;
}

/**
 * Merge instrument type biases from multiple personas.
 */
function mergeInstrumentBias(
  personas: InvestorPersona[]
): Record<InstrumentType, number> {
  const merged = { stock: 0, etf: 0, fund: 0 };

  for (const p of personas) {
    merged.stock += p.instrumentBias.stock;
    merged.etf += p.instrumentBias.etf;
    merged.fund += p.instrumentBias.fund;
  }

  const n = personas.length;
  merged.stock /= n;
  merged.etf /= n;
  merged.fund /= n;

  return merged;
}

/**
 * Compute the Lens Score for a stock through one or more investor personas.
 * Returns the blended score (0-100), dimension breakdown, and active personas.
 */
export function computeLensScore(
  stock: Stock,
  personaKeys: PersonaKey[]
): LensResult {
  if (personaKeys.length === 0) {
    return {
      lensScore: stock.aiScore,
      dimensions: computeDimensions(stock),
      personas: [],
    };
  }

  const personas = personaKeys.map((k) => PERSONAS[k]);
  const weights = mergeWeights(personas);
  const sectorBias = mergeSectorBias(personas);
  const instrumentBias = mergeInstrumentBias(personas);
  const dims = computeDimensions(stock);

  // Weighted dimension score
  const rawScore =
    dims.valuation * weights.valuation +
    dims.growth * weights.growth +
    dims.income * weights.income +
    dims.stability * weights.stability +
    dims.quality * weights.quality +
    dims.cost * weights.cost;

  // Apply sector bias (-15 to +15 range)
  const sectorAdj = sectorBias[stock.sector] ?? 0;

  // Apply instrument type bias
  const typeAdj = instrumentBias[stock.type] ?? 0;

  // Clamp to 1-99
  const lensScore = Math.max(
    1,
    Math.min(99, Math.round(rawScore + sectorAdj + typeAdj))
  );

  return {
    lensScore,
    dimensions: dims,
    personas: personaKeys,
  };
}

/**
 * Batch compute Lens Scores for all stocks.
 * Returns a map of ticker -> LensResult.
 */
export function computeAllLensScores(
  stocks: Stock[],
  personaKeys: PersonaKey[]
): Map<string, LensResult> {
  const results = new Map<string, LensResult>();

  for (const stock of stocks) {
    results.set(stock.ticker, computeLensScore(stock, personaKeys));
  }

  return results;
}

// ─── Storage ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "stockpilot-lens-personas";

export function loadSelectedPersonas(): PersonaKey[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((k: string) => k in PERSONAS) as PersonaKey[];
  } catch {
    return [];
  }
}

export function saveSelectedPersonas(keys: PersonaKey[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}
