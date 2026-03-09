export interface QuizQuestion {
  id: number;
  text: string;
  dimension: "risk" | "horizon" | "style" | "behavior" | "knowledge";
  options: {
    label: string;
    score: number; // 1-5 scale per dimension
  }[];
}

export interface InvestorArchetype {
  id: string;
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  blindSpots: string[];
  idealAllocation: { label: string; pct: number; color: string }[];
  famousExample: string;
  compatibleWith: string[];
  riskRange: [number, number];
  horizonRange: [number, number];
  styleRange: [number, number];
  behaviorRange: [number, number];
}

export const quizQuestions: QuizQuestion[] = [
  // Risk tolerance (questions 1-5)
  {
    id: 1,
    text: "Your portfolio drops 25% in one month. What do you do?",
    dimension: "risk",
    options: [
      { label: "Sell everything immediately -- I can't handle this", score: 1 },
      { label: "Sell some to limit further losses", score: 2 },
      { label: "Hold and wait it out nervously", score: 3 },
      { label: "Hold confidently -- downturns are normal", score: 4 },
      { label: "Buy more aggressively -- stocks are on sale", score: 5 },
    ],
  },
  {
    id: 2,
    text: "Which best describes your reaction to financial uncertainty?",
    dimension: "risk",
    options: [
      { label: "I lose sleep and check constantly", score: 1 },
      { label: "I worry but try to distract myself", score: 2 },
      { label: "I acknowledge it but move on", score: 3 },
      { label: "I see it as an opportunity", score: 4 },
      { label: "I thrive on it -- uncertainty means potential", score: 5 },
    ],
  },
  {
    id: 3,
    text: "You have $50,000 to invest. Which option appeals most?",
    dimension: "risk",
    options: [
      { label: "Guaranteed 3% return, no risk", score: 1 },
      { label: "80% chance of 6%, 20% chance of losing 2%", score: 2 },
      { label: "60% chance of 12%, 40% chance of losing 5%", score: 3 },
      { label: "50% chance of 25%, 50% chance of losing 10%", score: 4 },
      { label: "30% chance of 100%, 70% chance of losing 30%", score: 5 },
    ],
  },
  {
    id: 4,
    text: "How much of your net worth would you put into a single high-conviction stock pick?",
    dimension: "risk",
    options: [
      { label: "0% -- I only index", score: 1 },
      { label: "Up to 5%", score: 2 },
      { label: "Up to 15%", score: 3 },
      { label: "Up to 30%", score: 4 },
      { label: "50% or more if the thesis is strong enough", score: 5 },
    ],
  },
  // Time horizon (questions 5-8)
  {
    id: 5,
    text: "When do you expect to need most of this money?",
    dimension: "horizon",
    options: [
      { label: "Within 1-2 years", score: 1 },
      { label: "3-5 years", score: 2 },
      { label: "5-10 years", score: 3 },
      { label: "10-20 years", score: 4 },
      { label: "20+ years -- this is generational wealth", score: 5 },
    ],
  },
  {
    id: 6,
    text: "How often do you check your portfolio?",
    dimension: "horizon",
    options: [
      { label: "Multiple times per day", score: 1 },
      { label: "Daily", score: 2 },
      { label: "Weekly", score: 3 },
      { label: "Monthly", score: 4 },
      { label: "Quarterly or less -- I set it and forget it", score: 5 },
    ],
  },
  {
    id: 7,
    text: "A stock you bought doubles in 6 months. What's your move?",
    dimension: "horizon",
    options: [
      { label: "Sell all -- lock in the profit", score: 1 },
      { label: "Sell half, let the rest ride", score: 2 },
      { label: "Hold and reassess quarterly", score: 3 },
      { label: "Hold -- the thesis hasn't changed", score: 4 },
      { label: "Add more if fundamentals still support it", score: 5 },
    ],
  },
  {
    id: 8,
    text: "How do you feel about holding a position for 10+ years without selling?",
    dimension: "horizon",
    options: [
      { label: "Impossible -- I'd go crazy", score: 1 },
      { label: "Very difficult, I'd probably sell earlier", score: 2 },
      { label: "Okay if the company stays strong", score: 3 },
      { label: "Ideal -- compounding works best over decades", score: 4 },
      { label: "That's the ONLY way to invest", score: 5 },
    ],
  },
  // Investment style (questions 9-13)
  {
    id: 9,
    text: "What matters most when choosing an investment?",
    dimension: "style",
    options: [
      { label: "Capital preservation -- I don't want to lose money", score: 1 },
      { label: "Steady dividends and income", score: 2 },
      { label: "Strong fundamentals and reasonable valuation", score: 3 },
      { label: "Revenue growth and market disruption potential", score: 4 },
      { label: "Narrative, momentum, and explosive upside", score: 5 },
    ],
  },
  {
    id: 10,
    text: "Which portfolio sounds most appealing?",
    dimension: "style",
    options: [
      { label: "90% bonds, 10% stocks", score: 1 },
      { label: "40% stocks, 40% bonds, 20% REITs", score: 2 },
      { label: "70% broad market ETFs, 20% international, 10% bonds", score: 3 },
      { label: "80% growth stocks, 15% emerging markets, 5% crypto", score: 4 },
      { label: "100% concentrated in 5-10 high-conviction picks", score: 5 },
    ],
  },
  {
    id: 11,
    text: "How do you research a stock before buying?",
    dimension: "style",
    options: [
      { label: "I don't pick stocks -- I buy index funds only", score: 1 },
      { label: "Read a few analyst reports and check the dividend", score: 2 },
      { label: "Full fundamental analysis: financials, moat, valuation", score: 3 },
      { label: "Deep dive into TAM, unit economics, and management", score: 4 },
      { label: "Charts, momentum, social sentiment, and insider activity", score: 5 },
    ],
  },
  {
    id: 12,
    text: "Your view on index funds vs stock picking?",
    dimension: "style",
    options: [
      { label: "Index funds only -- stock picking is gambling", score: 1 },
      { label: "Mostly index with a small 'play money' allocation", score: 2 },
      { label: "50/50 split -- core index plus satellite picks", score: 3 },
      { label: "Mostly individual stocks, some ETFs for diversification", score: 4 },
      { label: "100% individual stocks -- I can beat the market", score: 5 },
    ],
  },
  {
    id: 13,
    text: "Which investor do you most admire?",
    dimension: "style",
    options: [
      { label: "John Bogle (Vanguard founder, index investing)", score: 1 },
      { label: "Warren Buffett (value investing, long-term holds)", score: 2 },
      { label: "Peter Lynch (growth at reasonable price)", score: 3 },
      { label: "Cathie Wood (disruptive innovation, ARK)", score: 4 },
      { label: "Keith Gill / Roaring Kitty (conviction, community)", score: 5 },
    ],
  },
  // Behavioral patterns (questions 14-17)
  {
    id: 14,
    text: "After selling a stock that then goes up 50%, how do you feel?",
    dimension: "behavior",
    options: [
      { label: "Devastated -- I should have held", score: 1 },
      { label: "Annoyed but I learn from it", score: 2 },
      { label: "Slight regret but I trust my process", score: 3 },
      { label: "Fine -- I made the best decision with what I knew", score: 4 },
      { label: "Doesn't bother me at all -- there's always another trade", score: 5 },
    ],
  },
  {
    id: 15,
    text: "How influenced are you by financial media and social media?",
    dimension: "behavior",
    options: [
      { label: "I follow media recommendations closely", score: 1 },
      { label: "I consider media as one input", score: 2 },
      { label: "I read it but do my own analysis", score: 3 },
      { label: "I mostly ignore mainstream financial media", score: 4 },
      { label: "I'm contrarian -- if everyone's buying, I'm skeptical", score: 5 },
    ],
  },
  {
    id: 16,
    text: "You find out a friend made 200% on a stock you passed on. Your reaction?",
    dimension: "behavior",
    options: [
      { label: "FOMO -- I rush to buy in even though it's already up", score: 1 },
      { label: "Jealous but I stick to my plan", score: 2 },
      { label: "Happy for them, indifferent about missing it", score: 3 },
      { label: "Ask them about their thesis -- I'm always learning", score: 4 },
      { label: "I'd already looked at it and had my reasons for passing", score: 5 },
    ],
  },
  {
    id: 17,
    text: "How do you handle a losing position after 6 months?",
    dimension: "behavior",
    options: [
      { label: "Average down -- it's cheaper now so it's a better deal", score: 1 },
      { label: "Hold and hope -- selling would make the loss real", score: 2 },
      { label: "Re-evaluate the thesis and cut it if nothing changed for the better", score: 3 },
      { label: "Set a stop-loss and let the system decide", score: 4 },
      { label: "If the thesis is broken, sell immediately regardless of loss", score: 5 },
    ],
  },
  // Financial knowledge (questions 18-20)
  {
    id: 18,
    text: "Do you know what a P/E ratio tells you?",
    dimension: "knowledge",
    options: [
      { label: "No idea", score: 1 },
      { label: "I've heard of it but couldn't explain it", score: 2 },
      { label: "Price relative to earnings -- lower might mean cheaper", score: 3 },
      { label: "I use it alongside P/S, EV/EBITDA, and PEG", score: 4 },
      { label: "I can build a DCF model from scratch", score: 5 },
    ],
  },
  {
    id: 19,
    text: "Which statement about diversification is most true?",
    dimension: "knowledge",
    options: [
      { label: "I'm not sure what diversification means in practice", score: 1 },
      { label: "Don't put all your eggs in one basket", score: 2 },
      { label: "Spread across sectors, geographies, and asset classes", score: 3 },
      { label: "Correlation matters more than number of holdings", score: 4 },
      { label: "Diversification is for those who don't know what they're doing (Buffett)", score: 5 },
    ],
  },
  {
    id: 20,
    text: "How comfortable are you with reading financial statements (10-K, balance sheet)?",
    dimension: "knowledge",
    options: [
      { label: "I've never looked at one", score: 1 },
      { label: "I can find revenue and profit but that's about it", score: 2 },
      { label: "I understand income statement, balance sheet, and cash flow", score: 3 },
      { label: "I analyze margins, ROIC, FCF yield, and debt covenants", score: 4 },
      { label: "I've read thousands -- I could audit a company", score: 5 },
    ],
  },
];

export const archetypes: InvestorArchetype[] = [
  {
    id: "guardian",
    name: "The Guardian",
    tagline: "Protect first, grow second",
    description:
      "You prioritize capital preservation above all else. You'd rather earn a modest, steady return than risk losing money. You sleep well at night because your portfolio is built for stability, not excitement. You're not boring -- you're disciplined.",
    strengths: [
      "Rarely makes emotional decisions",
      "Low portfolio volatility",
      "Strong focus on real, inflation-adjusted returns",
      "Natural saver with strong cash management",
    ],
    blindSpots: [
      "May be too conservative for your time horizon",
      "Inflation can erode purchasing power of overly safe portfolios",
      "Opportunity cost of avoiding equities over decades",
      "May anchor to nominal losses instead of real (inflation-adjusted) returns",
    ],
    idealAllocation: [
      { label: "Bonds / Fixed Income", pct: 50, color: "#448AFF" },
      { label: "Broad Market ETFs", pct: 30, color: "#2E8BEF" },
      { label: "Cash / Money Market", pct: 15, color: "#FFD740" },
      { label: "REITs", pct: 5, color: "#FF5252" },
    ],
    famousExample: "Ray Dalio -- 'Risk management is everything.'",
    compatibleWith: ["sentinel", "strategist"],
    riskRange: [1, 2],
    horizonRange: [1, 3],
    styleRange: [1, 2],
    behaviorRange: [2, 4],
  },
  {
    id: "sentinel",
    name: "The Sentinel",
    tagline: "Steady income, compound patience",
    description:
      "You're drawn to dividend-paying stocks, bonds, and income-generating assets. You believe in getting paid to wait. Your portfolio is like a money machine: it throws off cash while you sleep. You reinvest dividends and let compounding do the heavy lifting.",
    strengths: [
      "Built-in cash flow regardless of market direction",
      "Lower volatility than growth-focused portfolios",
      "Psychologically easy to hold -- you see income every quarter",
      "Natural alignment with long-term compounding",
    ],
    blindSpots: [
      "Dividend stocks can underperform growth in bull markets",
      "High-yield 'traps' -- a 10% dividend might signal trouble",
      "May over-concentrate in mature, slow-growth sectors",
      "Dividend cuts during recessions can be psychologically devastating",
    ],
    idealAllocation: [
      { label: "Dividend Growth Stocks", pct: 40, color: "#2E8BEF" },
      { label: "Bond Funds", pct: 25, color: "#448AFF" },
      { label: "REITs", pct: 15, color: "#FF5252" },
      { label: "Broad Market ETFs", pct: 15, color: "#FFD740" },
      { label: "Cash", pct: 5, color: "#A0A0A0" },
    ],
    famousExample: "John D. Rockefeller -- 'The only thing that gives me pleasure is to see my dividends coming in.'",
    compatibleWith: ["guardian", "strategist"],
    riskRange: [2, 3],
    horizonRange: [3, 5],
    styleRange: [2, 3],
    behaviorRange: [3, 5],
  },
  {
    id: "strategist",
    name: "The Strategist",
    tagline: "Data-driven, process-oriented",
    description:
      "You believe investing is a craft that can be learned and optimized. You study valuation metrics, read 10-Ks, and have a clear framework for every decision. You're not swayed by hype or fear -- your process is your edge. You probably have a spreadsheet for this.",
    strengths: [
      "Systematic decision-making reduces emotional errors",
      "Deep understanding of fundamentals and valuation",
      "Consistent process leads to reproducible results",
      "Good at identifying quality at reasonable prices",
    ],
    blindSpots: [
      "Analysis paralysis -- waiting for the 'perfect' entry point",
      "May miss momentum-driven opportunities by insisting on valuation",
      "Can be stubborn when the thesis takes longer to play out",
      "Over-reliance on historical data in rapidly changing industries",
    ],
    idealAllocation: [
      { label: "Quality Growth Stocks", pct: 35, color: "#2E8BEF" },
      { label: "Value / GARP Stocks", pct: 25, color: "#448AFF" },
      { label: "International Developed", pct: 15, color: "#FFD740" },
      { label: "Emerging Markets", pct: 10, color: "#FF5252" },
      { label: "Bonds", pct: 10, color: "#A0A0A0" },
      { label: "Alternatives", pct: 5, color: "#7C3AED" },
    ],
    famousExample: "Warren Buffett -- 'Price is what you pay, value is what you get.'",
    compatibleWith: ["sentinel", "architect"],
    riskRange: [3, 4],
    horizonRange: [3, 5],
    styleRange: [3, 4],
    behaviorRange: [3, 5],
  },
  {
    id: "architect",
    name: "The Architect",
    tagline: "Building the future, one thesis at a time",
    description:
      "You invest in transformative companies and secular trends. You look for businesses that are reshaping industries -- cloud computing, AI, biotech, clean energy. You're willing to pay a premium for growth because you're betting on the future, not the present.",
    strengths: [
      "Early identification of multi-year growth trends",
      "Comfortable with short-term volatility for long-term gains",
      "Deep research into TAM, competitive advantages, and management",
      "Higher potential returns from identifying compounders early",
    ],
    blindSpots: [
      "Overpaying for growth -- 'any price for a great company' can backfire",
      "Concentration risk in correlated tech/growth names",
      "Drawdowns of 30-50% are common and can test conviction",
      "Narrative-driven investing can blind you to deteriorating fundamentals",
    ],
    idealAllocation: [
      { label: "High-Growth Stocks", pct: 45, color: "#2E8BEF" },
      { label: "Innovation ETFs / Thematic", pct: 20, color: "#FF5252" },
      { label: "Emerging Markets Growth", pct: 15, color: "#FFD740" },
      { label: "Broad Market ETF", pct: 15, color: "#448AFF" },
      { label: "Crypto / Alt Assets", pct: 5, color: "#7C3AED" },
    ],
    famousExample: "Cathie Wood -- 'We invest in innovation.'",
    compatibleWith: ["strategist", "maverick"],
    riskRange: [4, 5],
    horizonRange: [3, 5],
    styleRange: [4, 5],
    behaviorRange: [3, 5],
  },
  {
    id: "maverick",
    name: "The Maverick",
    tagline: "High conviction, high octane",
    description:
      "You trust your own research over consensus. When you have conviction, you go big. You've probably made some incredible calls -- and some spectacular misses. You thrive on the challenge of finding asymmetric opportunities that the market is mispricing.",
    strengths: [
      "Extreme conviction can produce outsized returns",
      "Willing to be contrarian when the crowd is wrong",
      "Quick to act on new information",
      "High energy and engagement with the market",
    ],
    blindSpots: [
      "Survivorship bias -- you remember the wins, forget the losses",
      "Position sizing can be reckless under high conviction",
      "Social media echo chambers reinforce biases",
      "May confuse luck with skill in a bull market",
    ],
    idealAllocation: [
      { label: "Concentrated Stock Picks (5-10)", pct: 50, color: "#2E8BEF" },
      { label: "Growth / Momentum ETFs", pct: 20, color: "#FF5252" },
      { label: "Speculative / Crypto", pct: 15, color: "#7C3AED" },
      { label: "Cash (for opportunities)", pct: 10, color: "#FFD740" },
      { label: "Hedges / Puts", pct: 5, color: "#448AFF" },
    ],
    famousExample: "Keith Gill (Roaring Kitty) -- 'I like the stock.'",
    compatibleWith: ["architect"],
    riskRange: [4, 5],
    horizonRange: [1, 3],
    styleRange: [4, 5],
    behaviorRange: [1, 3],
  },
  {
    id: "philosopher",
    name: "The Philosopher",
    tagline: "Index, automate, live your life",
    description:
      "You've read the research: most active managers underperform. You buy broad market index funds, set automatic contributions, and rarely check your portfolio. Your investing philosophy is simple, evidence-based, and leaves you free to focus on what actually matters in life.",
    strengths: [
      "Lowest cost approach with market-matching returns",
      "Virtually eliminates behavioral errors",
      "Maximum time for other pursuits (career, family, hobbies)",
      "Backed by decades of academic research",
    ],
    blindSpots: [
      "May be under-optimized on tax efficiency (no tax-loss harvesting on individual positions)",
      "Can feel disengaged during exciting market periods",
      "Misses legitimate alpha opportunities from deep research",
      "May be too passive about asset allocation shifts as life changes",
    ],
    idealAllocation: [
      { label: "Total US Market ETF", pct: 50, color: "#2E8BEF" },
      { label: "Total International ETF", pct: 30, color: "#448AFF" },
      { label: "Total Bond Market ETF", pct: 15, color: "#FFD740" },
      { label: "TIPS", pct: 5, color: "#A0A0A0" },
    ],
    famousExample: "John Bogle -- 'Don't look for the needle in the haystack. Buy the haystack.'",
    compatibleWith: ["guardian", "sentinel"],
    riskRange: [2, 3],
    horizonRange: [4, 5],
    styleRange: [1, 2],
    behaviorRange: [4, 5],
  },
];

export interface QuizResult {
  archetype: InvestorArchetype;
  scores: {
    risk: number;
    horizon: number;
    style: number;
    behavior: number;
    knowledge: number;
  };
}

export function calculateResult(answers: Record<number, number>): QuizResult {
  const dimensions = { risk: 0, horizon: 0, style: 0, behavior: 0, knowledge: 0 };
  const counts = { risk: 0, horizon: 0, style: 0, behavior: 0, knowledge: 0 };

  for (const question of quizQuestions) {
    const answer = answers[question.id];
    if (answer !== undefined) {
      dimensions[question.dimension] += answer;
      counts[question.dimension] += 1;
    }
  }

  // Average scores per dimension (1-5 scale)
  const scores = {
    risk: counts.risk > 0 ? dimensions.risk / counts.risk : 3,
    horizon: counts.horizon > 0 ? dimensions.horizon / counts.horizon : 3,
    style: counts.style > 0 ? dimensions.style / counts.style : 3,
    behavior: counts.behavior > 0 ? dimensions.behavior / counts.behavior : 3,
    knowledge: counts.knowledge > 0 ? dimensions.knowledge / counts.knowledge : 3,
  };

  // Score each archetype based on how well the user's scores fit its ranges
  let bestArchetype = archetypes[0];
  let bestFit = -Infinity;

  for (const arch of archetypes) {
    let fit = 0;
    fit -= Math.abs(scores.risk - (arch.riskRange[0] + arch.riskRange[1]) / 2);
    fit -= Math.abs(scores.horizon - (arch.horizonRange[0] + arch.horizonRange[1]) / 2);
    fit -= Math.abs(scores.style - (arch.styleRange[0] + arch.styleRange[1]) / 2);
    fit -= Math.abs(scores.behavior - (arch.behaviorRange[0] + arch.behaviorRange[1]) / 2);

    if (fit > bestFit) {
      bestFit = fit;
      bestArchetype = arch;
    }
  }

  return { archetype: bestArchetype, scores };
}
