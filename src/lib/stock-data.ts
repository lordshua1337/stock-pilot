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

  // ─── Energy ─────────────────────────────────────────────────────────────

  {
    ticker: "NEE",
    name: "NextEra Energy Inc.",
    sector: "Energy",
    price: 76.83,
    change: 0.92,
    changePercent: 1.21,
    marketCap: "$157B",
    peRatio: 22.4,
    dividendYield: 2.68,
    fiftyTwoHigh: 87.31,
    fiftyTwoLow: 53.95,
    analystRating: "Buy",
    aiScore: 79,
    thesis:
      "World's largest generator of wind and solar energy. Regulated utility provides stable cash flow while renewables segment drives growth. 10% annual dividend growth target through 2026.",
    risks: [
      "Rising interest rates increase borrowing costs for capital-intensive projects",
      "Regulatory changes could reduce renewable energy tax credits",
      "Execution risk on massive backlog of renewable projects",
    ],
    catalysts: [
      "AI data center power demand driving massive utility investment",
      "IRA tax credits extending runway for renewable builds",
      "Rate base growth from Florida Power & Light",
    ],
  },

  // ─── Industrial ─────────────────────────────────────────────────────────

  {
    ticker: "CAT",
    name: "Caterpillar Inc.",
    sector: "Industrial",
    price: 372.15,
    change: -2.84,
    changePercent: -0.76,
    marketCap: "$179B",
    peRatio: 17.8,
    dividendYield: 1.52,
    fiftyTwoHigh: 418.07,
    fiftyTwoLow: 298.0,
    analystRating: "Hold",
    aiScore: 72,
    thesis:
      "Global leader in construction and mining equipment. Benefits from infrastructure spending globally. Strong pricing power and services revenue growing as installed base expands.",
    risks: [
      "Cyclical business sensitive to construction and mining downturns",
      "China slowdown reducing demand in key growth market",
      "Inventory buildup at dealers could signal demand peak",
    ],
    catalysts: [
      "U.S. infrastructure bill driving multi-year demand cycle",
      "Autonomous mining and construction technology leadership",
      "Services revenue reaching 25% of total, improving margin mix",
    ],
  },
  {
    ticker: "HON",
    name: "Honeywell International",
    sector: "Industrial",
    price: 214.67,
    change: 1.33,
    changePercent: 0.62,
    marketCap: "$139B",
    peRatio: 22.6,
    dividendYield: 1.98,
    fiftyTwoHigh: 242.89,
    fiftyTwoLow: 185.24,
    analystRating: "Buy",
    aiScore: 75,
    thesis:
      "Diversified industrial with aerospace, building tech, and energy transition exposure. Portfolio simplification strategy unlocking value. Aerospace aftermarket provides high-margin recurring revenue.",
    risks: [
      "Conglomerate discount persists despite simplification efforts",
      "Commercial aerospace recovery pace uncertain",
      "Process automation segment facing competitive pressure",
    ],
    catalysts: [
      "Planned spin-off to unlock sum-of-parts value",
      "Aerospace aftermarket growing double digits",
      "Quantum computing and AI integration in industrial processes",
    ],
  },

  // ─── Real Estate ────────────────────────────────────────────────────────

  {
    ticker: "AMT",
    name: "American Tower Corp.",
    sector: "Real Estate",
    price: 198.42,
    change: 2.15,
    changePercent: 1.10,
    marketCap: "$92B",
    peRatio: 38.5,
    dividendYield: 3.28,
    fiftyTwoHigh: 243.8,
    fiftyTwoLow: 172.44,
    analystRating: "Buy",
    aiScore: 74,
    thesis:
      "Largest global REIT owning 225,000+ cell towers. Essential infrastructure for 5G rollout. Long-term contracts with built-in escalators provide predictable cash flow growth. International expansion adds growth runway.",
    risks: [
      "Rising rates pressure REIT valuations and increase debt costs",
      "Carrier consolidation could reduce tenant demand",
      "Emerging satellite and fixed wireless could reduce tower demand long-term",
    ],
    catalysts: [
      "5G densification requiring more small cells and tower upgrades",
      "AI and IoT driving explosive data demand and network investment",
      "India expansion as 5G rollout accelerates",
    ],
  },
  {
    ticker: "PLD",
    name: "Prologis Inc.",
    sector: "Real Estate",
    price: 112.56,
    change: -0.78,
    changePercent: -0.69,
    marketCap: "$104B",
    peRatio: 32.1,
    dividendYield: 3.45,
    fiftyTwoHigh: 134.8,
    fiftyTwoLow: 96.2,
    analystRating: "Buy",
    aiScore: 71,
    thesis:
      "World's largest logistics REIT with 1.2B sq ft of warehouse space. E-commerce tailwind drives demand for distribution centers. Mark-to-market rent upside as below-market leases expire.",
    risks: [
      "Warehouse overbuilding in some markets compressing rents",
      "Economic slowdown reducing industrial space demand",
      "Higher cap rates from rising interest rates",
    ],
    catalysts: [
      "AI data center conversions creating new demand driver",
      "30%+ mark-to-market rent spread on lease renewals",
      "Near-shoring trends driving domestic warehouse demand",
    ],
  },

  // ─── Utilities ──────────────────────────────────────────────────────────

  {
    ticker: "SO",
    name: "Southern Company",
    sector: "Utilities",
    price: 88.94,
    change: 0.45,
    changePercent: 0.51,
    marketCap: "$97B",
    peRatio: 21.2,
    dividendYield: 3.18,
    fiftyTwoHigh: 94.75,
    fiftyTwoLow: 68.38,
    analystRating: "Buy",
    aiScore: 68,
    thesis:
      "One of the largest U.S. electric utilities serving 9M customers. Regulated business model provides predictable earnings growth. Vogtle nuclear plant completion removes major overhang and adds clean baseload power.",
    risks: [
      "Regulatory lag could compress returns in inflationary environment",
      "Natural gas price volatility impacts fuel costs",
      "Slow growth profile limits upside in bull markets",
    ],
    catalysts: [
      "Data center demand in Southeast driving rate base growth",
      "Vogtle nuclear units now operational, removing execution risk",
      "6-8% annual EPS growth target with reliable dividend",
    ],
  },
  {
    ticker: "DUK",
    name: "Duke Energy Corp.",
    sector: "Utilities",
    price: 112.38,
    change: -0.22,
    changePercent: -0.20,
    marketCap: "$87B",
    peRatio: 19.8,
    dividendYield: 3.62,
    fiftyTwoHigh: 121.55,
    fiftyTwoLow: 90.12,
    analystRating: "Hold",
    aiScore: 65,
    thesis:
      "Major regulated utility serving Carolinas, Florida, and Midwest. Predictable regulated returns with 5-7% EPS growth. Significant investment in grid modernization and renewable transition.",
    risks: [
      "Coal plant retirement costs could pressure near-term earnings",
      "Hurricane exposure in Carolinas and Florida",
      "Large capital program increases debt load",
    ],
    catalysts: [
      "Grid hardening investment post-hurricane driving rate base growth",
      "Clean energy transition unlocking new capital deployment",
      "AI data center demand in North Carolina service territory",
    ],
  },
  {
    ticker: "ABBV",
    name: "AbbVie Inc.",
    sector: "Healthcare",
    price: 182.34,
    change: 1.87,
    changePercent: 1.04,
    marketCap: "$323B",
    peRatio: 42.1,
    dividendYield: 3.48,
    fiftyTwoHigh: 201.72,
    fiftyTwoLow: 138.97,
    analystRating: "Buy",
    aiScore: 76,
    thesis:
      "Post-Humira transition progressing better than feared. Skyrizi and Rinvoq combined revenue now exceeding Humira at peak. Strong aesthetics portfolio via Allergan. Aggressive dividend raiser with 50+ years of increases.",
    risks: [
      "Humira biosimilar erosion continues to pressure near-term revenue",
      "Concentrated pipeline dependency on immunology franchise",
      "Premium valuation relative to pharma peers",
    ],
    catalysts: [
      "Skyrizi/Rinvoq trajectory toward $27B+ combined peak sales",
      "Aesthetics recovery cycle (Botox, Juvederm)",
      "Neuroscience pipeline including ABBV-951 for Parkinson's",
    ],
  },
  {
    ticker: "GS",
    name: "Goldman Sachs Group",
    sector: "Finance",
    price: 591.22,
    change: 8.45,
    changePercent: 1.45,
    marketCap: "$199B",
    peRatio: 17.4,
    dividendYield: 1.92,
    fiftyTwoHigh: 612.73,
    fiftyTwoLow: 388.87,
    analystRating: "Buy",
    aiScore: 79,
    thesis:
      "Capital markets recovery driving M&A advisory and underwriting fees. Asset/wealth management pivot creating more durable revenue streams. Trading desk consistently outperforming. Marcus consumer exit removes drag.",
    risks: [
      "Investment banking fees cyclically sensitive to deal activity",
      "Regulatory capital requirements could increase under Basel III endgame",
      "Premium valuation vs. universal bank peers",
    ],
    catalysts: [
      "M&A rebound cycle with rising CEO confidence",
      "Alternatives platform scaling toward $300B AUM target",
      "Return on equity consistently above 15% driving multiple expansion",
    ],
  },
  {
    ticker: "CVX",
    name: "Chevron Corp.",
    sector: "Energy",
    price: 156.89,
    change: -1.33,
    changePercent: -0.84,
    marketCap: "$288B",
    peRatio: 14.2,
    dividendYield: 4.12,
    fiftyTwoHigh: 171.7,
    fiftyTwoLow: 135.37,
    analystRating: "Buy",
    aiScore: 71,
    thesis:
      "Permian Basin dominance with industry-lowest production costs. Capital discipline keeping FCF yields above 6%. Hess acquisition adds Guyana growth asset. 37 consecutive years of dividend increases.",
    risks: [
      "Oil price volatility directly impacts earnings and cash flow",
      "Hess acquisition FTC review and Exxon arbitration risk",
      "Long-term energy transition pressure on fossil fuel demand",
    ],
    catalysts: [
      "Permian production growth with sub-$30/bbl breakeven",
      "Hess integration unlocking Guyana production ramp",
      "$75B+ shareholder return program through 2027",
    ],
  },
  {
    ticker: "RTX",
    name: "RTX Corp.",
    sector: "Industrial",
    price: 127.44,
    change: 0.96,
    changePercent: 0.76,
    marketCap: "$172B",
    peRatio: 36.8,
    dividendYield: 1.92,
    fiftyTwoHigh: 134.89,
    fiftyTwoLow: 93.71,
    analystRating: "Buy",
    aiScore: 74,
    thesis:
      "Dual exposure to commercial aerospace recovery and defense spending growth. Pratt & Whitney GTF engine installed base driving decades of aftermarket revenue. Record defense backlog of $206B provides visibility.",
    risks: [
      "GTF powder metal contamination issue requiring accelerated inspections",
      "Raytheon defense programs facing supply chain and labor challenges",
      "High leverage from prior United Technologies merger",
    ],
    catalysts: [
      "Commercial aerospace aftermarket growing 20%+ as fleet utilization rises",
      "European defense spending increase benefiting Patriot missile systems",
      "Collins Aerospace margin expansion toward 20%+ operating margins",
    ],
  },
  {
    ticker: "NFLX",
    name: "Netflix Inc.",
    sector: "Technology",
    price: 854.23,
    change: 12.67,
    changePercent: 1.51,
    marketCap: "$367B",
    peRatio: 48.5,
    dividendYield: 0,
    fiftyTwoHigh: 941.75,
    fiftyTwoLow: 545.68,
    analystRating: "Strong Buy",
    aiScore: 84,
    thesis:
      "Password sharing crackdown added 50M+ subscribers in 2024. Ad-tier growing rapidly with premium CPMs. Live events (NFL, WWE) expanding total addressable market. Operating margins expanding toward 30%.",
    risks: [
      "Content spending must remain elevated to retain subscribers",
      "Streaming competition from Disney+, Amazon, Apple intensifying",
      "Premium valuation requires continued subscriber growth execution",
    ],
    catalysts: [
      "Ad-tier scaling toward $5B+ annual revenue by 2026",
      "Live sports (NFL Christmas, WWE Raw) driving engagement spikes",
      "International markets (India, APAC) still early in penetration curve",
    ],
  },
  {
    ticker: "WMT",
    name: "Walmart Inc.",
    sector: "Consumer",
    price: 92.15,
    change: 0.43,
    changePercent: 0.47,
    marketCap: "$741B",
    peRatio: 36.7,
    dividendYield: 0.91,
    fiftyTwoHigh: 97.18,
    fiftyTwoLow: 59.87,
    analystRating: "Strong Buy",
    aiScore: 81,
    thesis:
      "E-commerce and advertising revenue transforming the margin profile. Walmart+ membership growing 25%+ annually. Automation investments lowering cost-to-serve. Market share gains from all income demographics.",
    risks: [
      "Grocery margins remain razor-thin despite scale advantages",
      "Consumer spending slowdown could pressure same-store sales",
      "Premium tech-like valuation unusual for a retailer",
    ],
    catalysts: [
      "Advertising business reaching $3.4B+ with 30%+ margins",
      "Walmart+ subscriber base approaching 25M households",
      "International e-commerce (Flipkart, Walmex) accelerating growth",
    ],
  },
  {
    ticker: "DE",
    name: "Deere & Co.",
    sector: "Industrial",
    price: 442.87,
    change: -3.21,
    changePercent: -0.72,
    marketCap: "$128B",
    peRatio: 22.5,
    dividendYield: 1.25,
    fiftyTwoHigh: 471.35,
    fiftyTwoLow: 335.88,
    analystRating: "Hold",
    aiScore: 68,
    thesis:
      "Precision agriculture technology creating recurring software revenue stream. Smart Industrial strategy embedding AI and autonomy into farming equipment. Cyclical downturn priced in, setting up recovery play.",
    risks: [
      "Farm equipment demand cyclically weak with low crop prices",
      "Dealer inventory destocking pressuring near-term orders",
      "Autonomous technology adoption slower than expected in rural markets",
    ],
    catalysts: [
      "Precision ag subscription revenue growing 25%+ annually",
      "Autonomous sprayer and tillage equipment entering commercial production",
      "Crop price recovery would trigger equipment replacement cycle",
    ],
  },
  {
    ticker: "ISRG",
    name: "Intuitive Surgical Inc.",
    sector: "Healthcare",
    price: 538.76,
    change: 5.42,
    changePercent: 1.02,
    marketCap: "$192B",
    peRatio: 72.3,
    dividendYield: 0,
    fiftyTwoHigh: 579.64,
    fiftyTwoLow: 362.09,
    analystRating: "Strong Buy",
    aiScore: 85,
    thesis:
      "Da Vinci robotic surgery systems create a razor/blade model: install the system, then sell instruments and accessories for every procedure. Installed base of 9,200+ systems generates predictable recurring revenue. New Da Vinci 5 platform extending into earlier-stage procedures.",
    risks: [
      "Premium valuation requires sustained procedure volume growth",
      "Competition from Medtronic Hugo and J&J Ottava entering market",
      "Hospital capital spending cycles affect system placements",
    ],
    catalysts: [
      "Da Vinci 5 launch expanding into thoracic and colorectal procedures",
      "International penetration still <30% of potential market",
      "Procedure volume growth of 18%+ annually driven by training pipeline",
    ],
  },
  {
    ticker: "ADBE",
    name: "Adobe Inc.",
    sector: "Technology",
    price: 418.53,
    change: -6.82,
    changePercent: -1.6,
    marketCap: "$184B",
    peRatio: 34.2,
    dividendYield: 0,
    fiftyTwoHigh: 638.25,
    fiftyTwoLow: 403.75,
    analystRating: "Buy",
    aiScore: 72,
    thesis:
      "Creative Cloud and Document Cloud remain industry standards with deep workflow integration. Firefly generative AI is being embedded across the entire product suite, creating a new monetization layer on top of the existing subscription base. Enterprise digital experience business growing steadily.",
    risks: [
      "AI-native competitors like Canva and Figma eroding market share in specific niches",
      "Figma acquisition blocked; organic competition now necessary",
      "Generative AI may commoditize creative tools over time",
    ],
    catalysts: [
      "Firefly AI credits creating new usage-based revenue stream",
      "Enterprise digital experience platform winning large contracts",
      "Video and 3D tools expanding total addressable market",
    ],
  },
  {
    ticker: "KO",
    name: "The Coca-Cola Company",
    sector: "Consumer",
    price: 62.87,
    change: 0.28,
    changePercent: 0.45,
    marketCap: "$271B",
    peRatio: 25.1,
    dividendYield: 3.05,
    fiftyTwoHigh: 73.53,
    fiftyTwoLow: 57.93,
    analystRating: "Buy",
    aiScore: 70,
    thesis:
      "Ultimate defensive stock with 62 consecutive years of dividend increases. Global distribution network is a moat no competitor can replicate. Pricing power proven through inflation cycles. Portfolio diversification beyond carbonated drinks into energy, coffee, and sports drinks.",
    risks: [
      "Health-conscious consumer trends reducing sugary drink consumption",
      "Currency headwinds from strong dollar affecting international revenue",
      "Input cost inflation on sugar, aluminum, and transportation",
    ],
    catalysts: [
      "Fairlife protein shakes and Body Armor expanding into high-growth categories",
      "Emerging market volume growth in Africa and Southeast Asia",
      "Price/mix optimization driving margin expansion despite flat volumes",
    ],
  },
  {
    ticker: "BA",
    name: "The Boeing Company",
    sector: "Industrial",
    price: 178.42,
    change: 3.15,
    changePercent: 1.8,
    marketCap: "$131B",
    peRatio: 0,
    dividendYield: 0,
    fiftyTwoHigh: 267.54,
    fiftyTwoLow: 128.88,
    analystRating: "Hold",
    aiScore: 45,
    thesis:
      "Duopoly with Airbus in commercial aviation gives long-term pricing power. Massive backlog of 5,600+ aircraft provides years of revenue visibility. Defense and space segments provide diversification. Recovery from production and quality issues is the key bet.",
    risks: [
      "Ongoing quality control issues and FAA production rate restrictions",
      "Cash burn continues with negative free cash flow",
      "Labor disputes and supply chain disruptions slowing production ramp",
    ],
    catalysts: [
      "737 MAX production rate increase to 38/month would unlock cash flow",
      "777X certification expected to open new wide-body order cycle",
      "Defense budget growth supporting military aircraft and services",
    ],
  },
  {
    ticker: "SCHW",
    name: "Charles Schwab Corporation",
    sector: "Finance",
    price: 79.34,
    change: 1.48,
    changePercent: 1.9,
    marketCap: "$145B",
    peRatio: 26.8,
    dividendYield: 1.28,
    fiftyTwoHigh: 82.47,
    fiftyTwoLow: 56.27,
    analystRating: "Buy",
    aiScore: 76,
    thesis:
      "Largest retail brokerage with $8.5 trillion in client assets. TD Ameritrade integration unlocking massive cost synergies. Net interest revenue from client cash sweeps creates a quasi-bank earnings stream. Scale advantages make it nearly impossible for new entrants to compete on cost.",
    risks: [
      "Client cash sorting into higher-yielding alternatives reducing NII",
      "Integration complexity from TD Ameritrade acquisition ongoing",
      "Rate cuts would reduce net interest margin",
    ],
    catalysts: [
      "Client asset flows averaging $30B+/month driving AUM growth",
      "TD Ameritrade cost synergies of $2B+ reaching full run rate",
      "New advisory and banking products increasing revenue per client",
    ],
  },
  {
    ticker: "T",
    name: "AT&T Inc.",
    sector: "Utilities",
    price: 22.18,
    change: 0.12,
    changePercent: 0.54,
    marketCap: "$159B",
    peRatio: 10.2,
    dividendYield: 5.01,
    fiftyTwoHigh: 23.90,
    fiftyTwoLow: 16.58,
    analystRating: "Buy",
    aiScore: 63,
    thesis:
      "Post-transformation AT&T is a focused connectivity company with industry-leading fiber and 5G networks. Dividend yield above 5% with a sustainable payout ratio after the cut. Free cash flow generation improving as capital-intensive 5G build moderates. Deep value at 10x earnings.",
    risks: [
      "Legacy wireline business in structural decline",
      "Competitive intensity in wireless from T-Mobile",
      "Debt load still elevated at $130B+ despite deleveraging progress",
    ],
    catalysts: [
      "Fiber subscriber additions of 250K+/quarter driving ARPU growth",
      "5G fixed wireless replacing legacy DSL in underserved markets",
      "Debt reduction path toward 2.5x leverage target by 2025",
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
