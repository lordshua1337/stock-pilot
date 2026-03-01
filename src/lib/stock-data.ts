export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  peRatio: number;
  dividendYield: number;
  fiftyTwoHigh: number;
  fiftyTwoLow: number;
  analystRating: "Strong Buy" | "Buy" | "Hold" | "Sell";
  aiScore: number; // 1-100
  thesis: string;
  risks: string[];
  catalysts: string[];
}

export interface Sector {
  name: string;
  allocation: number;
  color: string;
}

export const sectors: Sector[] = [
  { name: "Technology", allocation: 30, color: "#448AFF" },
  { name: "Healthcare", allocation: 15, color: "#00C853" },
  { name: "Finance", allocation: 15, color: "#FFD740" },
  { name: "Consumer", allocation: 12, color: "#FF6E40" },
  { name: "Energy", allocation: 10, color: "#E040FB" },
  { name: "Industrial", allocation: 8, color: "#40C4FF" },
  { name: "Real Estate", allocation: 5, color: "#FF5252" },
  { name: "Utilities", allocation: 5, color: "#69F0AE" },
];

export const stocks: Stock[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    price: 237.49,
    change: 3.21,
    changePercent: 1.37,
    marketCap: "$3.6T",
    peRatio: 38.2,
    dividendYield: 0.44,
    fiftyTwoHigh: 260.1,
    fiftyTwoLow: 164.08,
    analystRating: "Buy",
    aiScore: 82,
    thesis:
      "Services revenue growing at 15%+ annually creates a higher-margin, more predictable revenue stream. Vision Pro opens a new product category. Massive buyback program supports share price.",
    risks: [
      "iPhone revenue concentration (~52% of revenue)",
      "China regulatory and demand uncertainty",
      "Premium valuation leaves little room for misses",
    ],
    catalysts: [
      "Apple Intelligence AI features driving upgrade cycle",
      "Services hitting $100B annual run rate",
      "India manufacturing diversification reducing China risk",
    ],
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Technology",
    price: 141.28,
    change: 5.47,
    changePercent: 4.03,
    marketCap: "$3.5T",
    peRatio: 65.3,
    dividendYield: 0.03,
    fiftyTwoHigh: 153.13,
    fiftyTwoLow: 75.61,
    analystRating: "Strong Buy",
    aiScore: 91,
    thesis:
      "Dominant position in AI training and inference chips with 80%+ market share. Data center revenue tripling year-over-year. Every major tech company is a customer.",
    risks: [
      "Extreme valuation multiple (65x earnings)",
      "Customer concentration risk (hyperscalers)",
      "Export restrictions to China reducing addressable market",
    ],
    catalysts: [
      "Blackwell architecture rollout with massive demand backlog",
      "Sovereign AI initiatives creating new government customers",
      "Inference demand scaling as AI applications deploy",
    ],
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology",
    price: 442.57,
    change: 1.89,
    changePercent: 0.43,
    marketCap: "$3.3T",
    peRatio: 36.8,
    dividendYield: 0.72,
    fiftyTwoHigh: 468.35,
    fiftyTwoLow: 385.58,
    analystRating: "Strong Buy",
    aiScore: 88,
    thesis:
      "Azure cloud growing 30%+ with AI services as a key accelerant. Copilot integration across Office 365 creates new revenue stream from 400M+ users. Most diversified big tech company.",
    risks: [
      "Heavy AI infrastructure spending pressuring margins",
      "Copilot monetization still proving out",
      "Regulatory scrutiny on Activision integration",
    ],
    catalysts: [
      "Azure AI revenue accelerating to $10B+ run rate",
      "Copilot enterprise rollout driving ARPU growth",
      "Gaming division becoming meaningful revenue contributor",
    ],
  },
  {
    ticker: "UNH",
    name: "UnitedHealth Group",
    sector: "Healthcare",
    price: 524.18,
    change: -2.31,
    changePercent: -0.44,
    marketCap: "$484B",
    peRatio: 19.4,
    dividendYield: 1.52,
    fiftyTwoHigh: 630.73,
    fiftyTwoLow: 436.38,
    analystRating: "Buy",
    aiScore: 76,
    thesis:
      "Largest health insurer with integrated Optum services business. Healthcare spending is GDP-resistant. Aging population is a 20-year tailwind. Consistent 10%+ earnings growth.",
    risks: [
      "Regulatory risk from both parties on healthcare costs",
      "Medicare Advantage rate pressure",
      "Cyberattack recovery costs from Change Healthcare breach",
    ],
    catalysts: [
      "Optum Health expanding value-based care model",
      "AI cost reduction in claims processing",
      "Aging baby boomer demographic driving volume",
    ],
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase & Co.",
    sector: "Finance",
    price: 268.04,
    change: 1.15,
    changePercent: 0.43,
    marketCap: "$771B",
    peRatio: 13.2,
    dividendYield: 1.86,
    fiftyTwoHigh: 280.25,
    fiftyTwoLow: 182.89,
    analystRating: "Buy",
    aiScore: 80,
    thesis:
      "Best-managed large bank with dominant positions in investment banking, trading, and consumer banking. Jamie Dimon's track record of navigating crises. Net interest income benefits from higher rates.",
    risks: [
      "Credit losses could rise in consumer portfolio",
      "CEO succession uncertainty",
      "Capital markets revenue volatility",
    ],
    catalysts: [
      "Investment banking recovery from deal drought",
      "First Republic acquisition adding wealthy client base",
      "AI integration reducing operational costs",
    ],
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    sector: "Consumer",
    price: 219.37,
    change: 2.14,
    changePercent: 0.98,
    marketCap: "$2.3T",
    peRatio: 42.1,
    dividendYield: 0,
    fiftyTwoHigh: 233.0,
    fiftyTwoLow: 161.02,
    analystRating: "Strong Buy",
    aiScore: 86,
    thesis:
      "AWS is the #1 cloud platform with AI driving reacceleration. E-commerce margin expansion from logistics optimization. Advertising is a high-margin $50B+ business growing 20%+.",
    risks: [
      "AWS facing growing competition from Azure and GCP",
      "Antitrust scrutiny on marketplace practices",
      "Heavy CapEx requirements for AI infrastructure",
    ],
    catalysts: [
      "AWS custom chips (Trainium/Inferentia) reducing costs",
      "Advertising becoming third major profit pillar",
      "Same-day delivery increasing e-commerce conversion rates",
    ],
  },
  {
    ticker: "XOM",
    name: "Exxon Mobil Corporation",
    sector: "Energy",
    price: 107.82,
    change: -0.93,
    changePercent: -0.86,
    marketCap: "$456B",
    peRatio: 13.8,
    dividendYield: 3.38,
    fiftyTwoHigh: 126.34,
    fiftyTwoLow: 95.77,
    analystRating: "Hold",
    aiScore: 65,
    thesis:
      "Largest integrated oil company with low-cost Permian Basin production. Pioneer acquisition adds decades of high-quality reserves. Consistent dividend growth since 1882.",
    risks: [
      "Oil price volatility directly impacts earnings",
      "Long-term demand destruction from EV adoption",
      "ESG-driven institutional divestment",
    ],
    catalysts: [
      "Pioneer integration increasing production efficiency",
      "Carbon capture and lithium ventures for energy transition",
      "Shareholder-friendly buyback program",
    ],
  },
  {
    ticker: "V",
    name: "Visa Inc.",
    sector: "Finance",
    price: 328.92,
    change: 0.74,
    changePercent: 0.23,
    marketCap: "$668B",
    peRatio: 31.5,
    dividendYield: 0.73,
    fiftyTwoHigh: 340.0,
    fiftyTwoLow: 252.7,
    analystRating: "Strong Buy",
    aiScore: 84,
    thesis:
      "Dominant payment network processing $15T+ annually. Secular shift from cash to digital payments is a multi-decade growth driver. Asset-light model generates 65%+ margins.",
    risks: [
      "Regulatory pressure on interchange fees",
      "Real-time payment systems bypassing card networks",
      "Antitrust concerns over dual-network dominance with Mastercard",
    ],
    catalysts: [
      "Cross-border travel recovery driving high-margin volume",
      "Value-added services growing faster than core payments",
      "B2B payments representing $120T untapped market",
    ],
  },
  {
    ticker: "COST",
    name: "Costco Wholesale",
    sector: "Consumer",
    price: 1018.37,
    change: 4.22,
    changePercent: 0.42,
    marketCap: "$452B",
    peRatio: 55.8,
    dividendYield: 0.49,
    fiftyTwoHigh: 1078.23,
    fiftyTwoLow: 689.47,
    analystRating: "Buy",
    aiScore: 72,
    thesis:
      "Membership model creates predictable, high-loyalty revenue. 93% renewal rate is industry-leading. Recession-resistant as consumers trade down to bulk buying.",
    risks: [
      "Premium valuation (55x earnings) priced for perfection",
      "Limited international expansion opportunities",
      "Thin product margins vulnerable to cost inflation",
    ],
    catalysts: [
      "Membership fee increase driving pure profit growth",
      "E-commerce capabilities improving",
      "Kirkland Signature brand expansion",
    ],
  },
];
