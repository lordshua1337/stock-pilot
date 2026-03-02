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
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Technology",
    price: 186.42,
    change: 2.87,
    changePercent: 1.56,
    marketCap: "$2.3T",
    peRatio: 24.1,
    dividendYield: 0.45,
    fiftyTwoHigh: 201.42,
    fiftyTwoLow: 130.67,
    analystRating: "Strong Buy",
    aiScore: 87,
    thesis:
      "Google Search maintains 90%+ market share with AI Overviews expanding utility. YouTube is the #2 streaming platform by watch time. Google Cloud growing 28% with AI workloads accelerating. Most undervalued of the Mag 7 on P/E basis.",
    risks: [
      "DOJ antitrust case could force structural changes",
      "AI search disruption threatening core ads model",
      "Waymo's autonomous vehicle unit burning cash",
    ],
    catalysts: [
      "Gemini AI integration across all products",
      "Google Cloud approaching profitability inflection",
      "First-ever dividend signals capital return shift",
    ],
  },
  {
    ticker: "META",
    name: "Meta Platforms Inc.",
    sector: "Technology",
    price: 612.38,
    change: 4.51,
    changePercent: 0.74,
    marketCap: "$1.6T",
    peRatio: 27.8,
    dividendYield: 0.33,
    fiftyTwoHigh: 638.4,
    fiftyTwoLow: 414.5,
    analystRating: "Buy",
    aiScore: 83,
    thesis:
      "3.3 billion daily active users across family of apps. Reels monetization closing the gap with TikTok engagement. AI-driven ad targeting producing record revenue per user despite privacy changes.",
    risks: [
      "Reality Labs losing $16B/year with unclear path to profitability",
      "Regulatory risk in EU (DMA/DSA) and US",
      "Young user engagement shifting to TikTok and alternatives",
    ],
    catalysts: [
      "Llama open-source AI strategy building developer ecosystem",
      "Threads growing as Twitter/X alternative",
      "WhatsApp Business API monetization ramping",
    ],
  },
  {
    ticker: "LLY",
    name: "Eli Lilly and Company",
    sector: "Healthcare",
    price: 825.67,
    change: -8.32,
    changePercent: -1.0,
    marketCap: "$785B",
    peRatio: 71.2,
    dividendYield: 0.62,
    fiftyTwoHigh: 972.53,
    fiftyTwoLow: 596.8,
    analystRating: "Strong Buy",
    aiScore: 89,
    thesis:
      "GLP-1 drugs (Mounjaro/Zepbound) are the biggest pharmaceutical opportunity in decades. Weight loss + diabetes addresses a $100B+ market. First-mover advantage with years of patent protection.",
    risks: [
      "Extreme valuation assumes flawless execution",
      "Manufacturing capacity constraints limiting supply",
      "Potential regulatory pushback on pricing",
    ],
    catalysts: [
      "Zepbound weight loss approvals in new markets",
      "Pipeline includes Alzheimer's drug donanemab",
      "GLP-1 showing cardiovascular and liver benefits beyond weight loss",
    ],
  },
  {
    ticker: "BRK.B",
    name: "Berkshire Hathaway",
    sector: "Finance",
    price: 478.52,
    change: 1.23,
    changePercent: 0.26,
    marketCap: "$1.1T",
    peRatio: 10.8,
    dividendYield: 0,
    fiftyTwoHigh: 498.0,
    fiftyTwoLow: 390.17,
    analystRating: "Buy",
    aiScore: 78,
    thesis:
      "Warren Buffett's conglomerate owns GEICO, BNSF railway, Berkshire Hathaway Energy, and $300B+ in public equities. Record cash position ($325B+) provides optionality for acquisitions. Insurance float provides free leverage.",
    risks: [
      "Succession uncertainty after Buffett (94 years old)",
      "Cash drag on returns from massive cash pile",
      "Insurance catastrophe risk from climate events",
    ],
    catalysts: [
      "Deploying cash into large acquisition",
      "Record operating earnings from subsidiaries",
      "Defensive positioning in volatile markets",
    ],
  },
  {
    ticker: "AVGO",
    name: "Broadcom Inc.",
    sector: "Technology",
    price: 224.18,
    change: 6.73,
    changePercent: 3.1,
    marketCap: "$1.05T",
    peRatio: 45.6,
    dividendYield: 1.08,
    fiftyTwoHigh: 251.88,
    fiftyTwoLow: 119.76,
    analystRating: "Strong Buy",
    aiScore: 85,
    thesis:
      "Second-largest AI chip company behind NVIDIA. Custom AI accelerators for Google (TPU), Meta, and Apple provide design wins that competitors can't easily replicate. VMware acquisition adds enterprise software recurring revenue.",
    risks: [
      "Heavy debt from VMware acquisition",
      "Concentration in a few hyperscaler customers",
      "Integration risk from $69B VMware deal",
    ],
    catalysts: [
      "Custom AI chip revenue growing triple digits",
      "VMware subscription transition boosting margins",
      "Networking chip demand from AI data center buildout",
    ],
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    sector: "Consumer",
    price: 342.18,
    change: -5.47,
    changePercent: -1.57,
    marketCap: "$1.1T",
    peRatio: 95.4,
    dividendYield: 0,
    fiftyTwoHigh: 488.54,
    fiftyTwoLow: 138.8,
    analystRating: "Hold",
    aiScore: 62,
    thesis:
      "The EV transition is real, and Tesla has the brand, manufacturing scale, and software ecosystem. Full Self-Driving and robotaxis represent optionality that no other automaker has. Energy storage growing 100%+ year-over-year.",
    risks: [
      "Automotive margins under pressure from price cuts",
      "CEO distraction and political polarization affecting brand",
      "Chinese EV competition intensifying globally",
    ],
    catalysts: [
      "Robotaxi launch could unlock new revenue stream",
      "Energy storage becoming a meaningful profit center",
      "Affordable Model Q targeting mass market",
    ],
  },
  {
    ticker: "HD",
    name: "The Home Depot",
    sector: "Consumer",
    price: 402.85,
    change: 1.93,
    changePercent: 0.48,
    marketCap: "$400B",
    peRatio: 27.3,
    dividendYield: 2.24,
    fiftyTwoHigh: 439.37,
    fiftyTwoLow: 324.69,
    analystRating: "Buy",
    aiScore: 74,
    thesis:
      "Dominant home improvement retailer benefiting from aging US housing stock (median home age 40+ years). Pro customer segment growing faster than DIY. Housing turnover recovery will drive comp growth.",
    risks: [
      "Housing market weakness reducing demand",
      "High interest rates suppressing home improvement spending",
      "SRS Distribution acquisition integration risk",
    ],
    catalysts: [
      "Housing turnover recovery as rates normalize",
      "Pro segment share gains from SRS acquisition",
      "Aging housing stock creating non-discretionary repair demand",
    ],
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    sector: "Healthcare",
    price: 158.42,
    change: 0.31,
    changePercent: 0.2,
    marketCap: "$381B",
    peRatio: 15.8,
    dividendYield: 3.17,
    fiftyTwoHigh: 168.85,
    fiftyTwoLow: 143.16,
    analystRating: "Hold",
    aiScore: 68,
    thesis:
      "62 consecutive years of dividend increases (Dividend King). MedTech and pharmaceutical segments provide diversified healthcare exposure. Post-Kenvue spinoff, now a pure healthcare company.",
    risks: [
      "Talc litigation overhang despite bankruptcy strategy",
      "Key drug patent cliffs (Stelara, Tremfya competition)",
      "Limited top-line growth relative to biotech peers",
    ],
    catalysts: [
      "Pharmaceutical pipeline with 100+ programs",
      "MedTech innovation in robotics surgery",
      "Dividend aristocrat status attracting income investors",
    ],
  },
  {
    ticker: "PG",
    name: "Procter & Gamble",
    sector: "Consumer",
    price: 172.31,
    change: 0.52,
    changePercent: 0.3,
    marketCap: "$406B",
    peRatio: 27.8,
    dividendYield: 2.33,
    fiftyTwoHigh: 180.43,
    fiftyTwoLow: 153.51,
    analystRating: "Buy",
    aiScore: 71,
    thesis:
      "World's largest consumer staples company with 70+ billion-dollar brands. Pricing power proven through inflation. Consistent 5-6% organic growth from mix shift to premium products.",
    risks: [
      "Volume declines as consumers trade down in recession",
      "Private label competition in value segment",
      "FX headwinds from strong dollar",
    ],
    catalysts: [
      "Premiumization strategy driving revenue per unit growth",
      "Productivity improvements expanding margins",
      "Share buyback program reducing share count steadily",
    ],
  },
  {
    ticker: "CRM",
    name: "Salesforce Inc.",
    sector: "Technology",
    price: 298.45,
    change: 3.12,
    changePercent: 1.06,
    marketCap: "$286B",
    peRatio: 42.1,
    dividendYield: 0.55,
    fiftyTwoHigh: 348.86,
    fiftyTwoLow: 212.0,
    analystRating: "Buy",
    aiScore: 77,
    thesis:
      "Dominant CRM platform with 23% market share. Agentforce AI product represents the next growth vector. Margin expansion story: operating margins expanded from 5% to 20%+ in two years.",
    risks: [
      "AI disruption from Microsoft Copilot for Dynamics 365",
      "Slowing enterprise software spending",
      "Activist investor pressure on capital allocation",
    ],
    catalysts: [
      "Agentforce AI agents driving new product adoption",
      "Continued margin expansion toward 35% operating margin",
      "Data Cloud becoming competitive with Snowflake",
    ],
  },
];

export function getStockByTicker(ticker: string): Stock | undefined {
  return stocks.find((s) => s.ticker === ticker);
}

export function getStocksBySector(sector: string): Stock[] {
  return stocks.filter((s) => s.sector === sector);
}

export interface SectorMetrics {
  name: string;
  color: string;
  stockCount: number;
  avgAiScore: number;
  avgPE: number;
  avgDividend: number;
  topStock: Stock;
  totalMarketCap: string;
  avgChange: number;
}

export function getSectorMetrics(): SectorMetrics[] {
  return sectors
    .map((sector) => {
      const sectorStocks = getStocksBySector(sector.name);
      if (sectorStocks.length === 0) {
        return null;
      }

      const avgAiScore =
        sectorStocks.reduce((sum, s) => sum + s.aiScore, 0) / sectorStocks.length;
      const avgPE =
        sectorStocks.reduce((sum, s) => sum + s.peRatio, 0) / sectorStocks.length;
      const avgDividend =
        sectorStocks.reduce((sum, s) => sum + s.dividendYield, 0) /
        sectorStocks.length;
      const avgChange =
        sectorStocks.reduce((sum, s) => sum + s.changePercent, 0) /
        sectorStocks.length;
      const topStock = [...sectorStocks].sort(
        (a, b) => b.aiScore - a.aiScore
      )[0];

      return {
        name: sector.name,
        color: sector.color,
        stockCount: sectorStocks.length,
        avgAiScore: Math.round(avgAiScore),
        avgPE: Number(avgPE.toFixed(1)),
        avgDividend: Number(avgDividend.toFixed(2)),
        topStock,
        totalMarketCap: sectorStocks[0].marketCap,
        avgChange: Number(avgChange.toFixed(2)),
      };
    })
    .filter((m): m is SectorMetrics => m !== null);
}
