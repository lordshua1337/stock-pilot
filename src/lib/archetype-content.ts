// Rich archetype content -- extended data for the results page deep-dive
// Each archetype gets: metaphor, famous investors, rarity, portfolio style,
// decision framework, advisor conversation starters, and dimension coaching

import type { ArchetypeKey } from "./financial-dna";

export interface ArchetypeContent {
  metaphor: string;
  famousInvestors: { name: string; why: string }[];
  rarity: number; // percentage of investors who share this type
  portfolioStyle: string;
  idealAllocation: string;
  decisionFramework: string;
  advisorStarters: string[];
  strengthLeveraging: Record<string, string>;
  vulnerabilityManagement: Record<string, string>;
}

export const ARCHETYPE_CONTENT: Record<ArchetypeKey, ArchetypeContent> = {
  systems_builder: {
    metaphor:
      "Think of yourself as the architect who builds the blueprint before laying a single brick. You don't react to markets -- you design systems that react for you. Your edge isn't speed or instinct; it's the machine you've built.",
    famousInvestors: [
      { name: "Ray Dalio", why: "Built Bridgewater on systematic, rules-based decision-making" },
      { name: "Jim Simons", why: "Created Renaissance Technologies -- pure algorithmic investing" },
      { name: "David Swensen", why: "Engineered Yale's endowment system that ran for decades" },
    ],
    rarity: 8,
    portfolioStyle: "Rules-based, automated, rebalanced on schedule",
    idealAllocation: "60% diversified index / 25% factor tilts / 10% alternatives / 5% cash reserve",
    decisionFramework: "Before any trade, ask: Does this fit my system's rules? If not, it doesn't happen.",
    advisorStarters: [
      "Can you walk me through the methodology behind this recommendation?",
      "What systematic rebalancing schedule would you suggest for my allocation?",
      "How do I automate contributions to reduce my own decision fatigue?",
    ],
    strengthLeveraging: {},
    vulnerabilityManagement: {},
  },
  reassurance_seeker: {
    metaphor:
      "Think of yourself as the captain who checks the weather forecast three times before setting sail. You're not afraid of the ocean -- you're smart enough to know that preparation prevents disaster. Your caution is your armor.",
    famousInvestors: [
      { name: "John Bogle", why: "Valued certainty and simplicity -- created index funds to reduce anxiety" },
      { name: "Benjamin Graham", why: "Insisted on a 'margin of safety' before every investment" },
    ],
    rarity: 14,
    portfolioStyle: "Conservative, diversified, validation-seeking before major moves",
    idealAllocation: "40% bonds/treasuries / 35% large-cap value / 15% dividend stocks / 10% cash",
    decisionFramework: "Before any trade, ask: Have I validated this with someone I trust?",
    advisorStarters: [
      "Am I on the right track with my current allocation?",
      "Can you help me understand what 'normal' volatility looks like for my portfolio?",
      "What's the worst realistic scenario here, and can I handle it?",
    ],
    strengthLeveraging: {},
    vulnerabilityManagement: {},
  },
  analytical_skeptic: {
    metaphor:
      "Think of yourself as the surgeon in the operating room -- precise, evidence-driven, and completely immune to bedside manner when it comes to cutting through financial noise. You trust the scalpel of data, not the stethoscope of sentiment.",
    famousInvestors: [
      { name: "Michael Burry", why: "Saw through the subprime mortgage hype using pure data analysis" },
      { name: "Seth Klarman", why: "Deeply contrarian, insists on independent research over consensus" },
      { name: "Howard Marks", why: "Famous for challenging conventional wisdom with rigorous analysis" },
    ],
    rarity: 11,
    portfolioStyle: "Research-heavy, contrarian, evidence-based positions",
    idealAllocation: "45% deep-value picks / 25% contrarian bets / 20% index / 10% cash for opportunities",
    decisionFramework: "Before any trade, ask: What's the evidence? What's the methodology? Who disagrees and why?",
    advisorStarters: [
      "What primary sources support this recommendation?",
      "What's the bear case for this position, and how do you quantify it?",
      "Show me the backtested data on this strategy across different market conditions.",
    ],
    strengthLeveraging: {},
    vulnerabilityManagement: {},
  },
  diy_controller: {
    metaphor:
      "Think of yourself as the solo pilot who trusts their own instruments over air traffic control. You've studied the maps, you know the weather, and you'll fly your own route. The cockpit is yours -- you just need better instruments, not a co-pilot.",
    famousInvestors: [
      { name: "Peter Lynch", why: "Famously encouraged individual investors to trust their own research" },
      { name: "Carl Icahn", why: "The quintessential self-directed activist investor" },
    ],
    rarity: 12,
    portfolioStyle: "Self-directed, tool-heavy, independent research-based",
    idealAllocation: "50% conviction picks / 25% growth / 15% index core / 10% experimental",
    decisionFramework: "Before any trade, ask: Is this MY analysis, or am I following someone else's?",
    advisorStarters: [
      "I've done my research. Here's my thesis -- poke holes in it.",
      "What tools or data sources am I missing that would improve my analysis?",
      "I want information, not recommendations. What should I be looking at?",
    ],
    strengthLeveraging: {},
    vulnerabilityManagement: {},
  },
  collaborative_partner: {
    metaphor:
      "Think of yourself as the general who wins battles in the war room, not on the battlefield. Your strength isn't solo conviction -- it's the ability to synthesize multiple perspectives into a strategy that's smarter than any one person could build alone.",
    famousInvestors: [
      { name: "Charlie Munger", why: "Buffett's thinking partner -- their collaboration produced legendary returns" },
      { name: "Bill Gross", why: "Built PIMCO's investment committee culture around collaborative decision-making" },
    ],
    rarity: 9,
    portfolioStyle: "Collaborative, committee-style, multi-perspective analysis",
    idealAllocation: "40% consensus picks / 30% index core / 20% partner-vetted / 10% satellite",
    decisionFramework: "Before any trade, ask: Have I stress-tested this idea with someone who thinks differently than me?",
    advisorStarters: [
      "Let's think through this together. What am I not seeing?",
      "What would someone with the opposite investment philosophy say about this position?",
      "Help me build a framework for evaluating this -- I want to understand your reasoning process.",
    ],
    strengthLeveraging: {},
    vulnerabilityManagement: {},
  },
  big_picture_optimist: {
    metaphor:
      "Think of yourself as the farmer who plants oak trees -- not because you'll sit in their shade, but because you understand that the greatest returns come from patience that most people don't have. While everyone else chases quarterly numbers, you're watching the decades unfold.",
    famousInvestors: [
      { name: "Warren Buffett", why: "The ultimate long-term holder -- 'Our favorite holding period is forever'" },
      { name: "Jack Bogle", why: "Proved that time in the market beats timing the market" },
      { name: "Terry Smith", why: "Buy good companies, don't overpay, do nothing -- his entire strategy" },
    ],
    rarity: 15,
    portfolioStyle: "Buy-and-hold, compound-focused, minimal trading",
    idealAllocation: "70% total market index / 15% international / 10% growth / 5% bonds",
    decisionFramework: "Before any trade, ask: Will this matter in 10 years? If not, don't touch it.",
    advisorStarters: [
      "How does this position fit into a 20-year compounding strategy?",
      "What's the total return potential if I hold this for a decade?",
      "Help me ignore the noise. What are the 3 things that actually matter for long-term returns?",
    ],
    strengthLeveraging: {},
    vulnerabilityManagement: {},
  },
  trend_sensitive_explorer: {
    metaphor:
      "Think of yourself as the surfer scanning the horizon for the next wave. You've got the instinct to spot momentum before the crowd, and the courage to paddle out when others are still on the beach. Your challenge isn't finding waves -- it's knowing when to get off before the wipeout.",
    famousInvestors: [
      { name: "Cathie Wood", why: "Unapologetically rides disruptive innovation trends" },
      { name: "George Soros", why: "Made billions by spotting and riding macro trends early" },
      { name: "Paul Tudor Jones", why: "Master of trend-following across markets" },
    ],
    rarity: 13,
    portfolioStyle: "Momentum-driven, trend-following, sector-rotating",
    idealAllocation: "40% momentum picks / 25% thematic ETFs / 20% index safety net / 15% cash for opportunities",
    decisionFramework: "Before any trade, ask: Am I early to this trend, or am I chasing? What's my exit signal?",
    advisorStarters: [
      "What sectors are showing the strongest momentum right now?",
      "Help me set a trailing stop-loss strategy so I don't ride trends into the ground.",
      "What's the counter-argument to this trend? What could make it reverse?",
    ],
    strengthLeveraging: {},
    vulnerabilityManagement: {},
  },
  avoider_under_stress: {
    metaphor:
      "Think of yourself as the fortress commander -- when the siege comes, your first instinct is to raise the drawbridge and protect what's inside. That instinct has saved countless portfolios from panic-selling into a bottom. But a fortress that never opens its gates eventually runs out of supplies.",
    famousInvestors: [
      { name: "John Templeton", why: "Famous for buying during maximum pessimism -- but only when ready" },
      { name: "Howard Marks", why: "Advocates patience and waiting for the right moment, never forcing trades" },
    ],
    rarity: 10,
    portfolioStyle: "Defensive, capital-preservation, anxiety-buffered",
    idealAllocation: "35% treasuries/bonds / 30% dividend aristocrats / 20% defensive sectors / 15% cash",
    decisionFramework: "Before any trade, ask: Am I acting from calm analysis, or am I avoiding something that needs attention?",
    advisorStarters: [
      "What's the single most important action I should take this quarter?",
      "Can you simplify my options to just two choices so I don't freeze?",
      "What would happen if I did absolutely nothing for the next 6 months?",
    ],
    strengthLeveraging: {},
    vulnerabilityManagement: {},
  },
  action_first_decider: {
    metaphor:
      "Think of yourself as the fighter pilot -- trained to make split-second decisions under pressure, knowing that a good decision now beats a perfect decision later. Your speed is genuinely an edge in markets that reward first movers. But every fast move needs a faster exit plan.",
    famousInvestors: [
      { name: "Steve Cohen", why: "Known for rapid-fire decision-making and quick position adjustments" },
      { name: "Jesse Livermore", why: "Legendary trader who acted on conviction before the crowd" },
    ],
    rarity: 7,
    portfolioStyle: "Active, high-conviction, quick-trigger with defined exits",
    idealAllocation: "35% high-conviction / 25% momentum / 20% index core / 15% cash / 5% speculative",
    decisionFramework: "Before any trade, ask: What's my exit price? Both up AND down. If I can't answer, I'm not ready.",
    advisorStarters: [
      "I've already decided to buy this. Tell me why I shouldn't.",
      "What's the fastest way to get diversified exposure to this theme?",
      "Help me build automatic exit rules so my speed doesn't become my biggest risk.",
    ],
    strengthLeveraging: {},
    vulnerabilityManagement: {},
  },
  values_anchored_steward: {
    metaphor:
      "Think of yourself as the architect of a cathedral -- you're not building for this quarter or this year. You're building something that outlasts you. Every financial decision is measured against the legacy you're creating: security for your family, freedom for the next generation, impact that compounds beyond returns.",
    famousInvestors: [
      { name: "Bill Gates", why: "Invests with purpose -- his wealth serves his foundation's mission" },
      { name: "Abigail Johnson", why: "Stewards Fidelity with a focus on long-term value, not quarterly pressure" },
      { name: "Mellody Hobson", why: "Advocates investing as a tool for financial empowerment and legacy" },
    ],
    rarity: 6,
    portfolioStyle: "Purpose-driven, ESG-conscious, legacy-focused",
    idealAllocation: "40% values-aligned index / 25% ESG leaders / 20% dividend growth / 10% impact investments / 5% cash",
    decisionFramework: "Before any trade, ask: Does this align with why I'm investing? Does it serve my purpose?",
    advisorStarters: [
      "How do I align my portfolio with my values without sacrificing returns?",
      "What impact investments actually perform well over the long term?",
      "Help me build a portfolio that my kids would be proud to inherit.",
    ],
    strengthLeveraging: {},
    vulnerabilityManagement: {},
  },
};

// Dimension coaching tips -- score-range-specific advice
// Used in the expanded dimension detail views

export interface DimensionCoaching {
  interpretation: string;
  inPractice: string;
  portfolioImplication: string;
  watchOut: string;
  averageRange: string;
  tip: string;
}

type ScoreRange = "low" | "moderate" | "high";

function getRange(score: number): ScoreRange {
  if (score <= 35) return "low";
  if (score <= 65) return "moderate";
  return "high";
}

const DIMENSION_COACHING: Record<string, Record<ScoreRange, DimensionCoaching>> = {
  R: {
    low: {
      interpretation: "You have a lower risk tolerance than most investors. Market drops genuinely stress you out, and that's completely normal.",
      inPractice: "When markets drop 5-10%, you'll feel a strong urge to sell or stop checking your portfolio. You might avoid making investment decisions altogether during volatile periods.",
      portfolioImplication: "Lean toward stable, dividend-paying stocks and bonds. Your portfolio should let you sleep at night -- if checking it makes you anxious, it's too aggressive.",
      watchOut: "Being too conservative can cost you in the long run. Inflation erodes cash. A small allocation to growth (even 10-15%) protects your purchasing power without keeping you up at night.",
      averageRange: "40-60",
      tip: "Set up automatic investments so market timing anxiety can't derail your plan.",
    },
    moderate: {
      interpretation: "You have a balanced risk tolerance. You can handle normal market fluctuations but would feel uncomfortable during a major crash.",
      inPractice: "A 10% market correction bothers you but doesn't make you sell. A 20%+ bear market would test your resolve. You prefer a mix of stability and growth.",
      portfolioImplication: "A balanced portfolio fits you well -- roughly 60/40 stocks to bonds, or similar. You can handle growth exposure but need enough stability to stay the course.",
      watchOut: "During extended bull markets, you might be tempted to increase risk ('I can handle more'). During downturns, the opposite. Your sweet spot is consistent allocation regardless of sentiment.",
      averageRange: "40-60",
      tip: "Write down your risk tolerance NOW while markets are calm. Refer to it when things get scary.",
    },
    high: {
      interpretation: "You have a high tolerance for volatility. Market drops feel like opportunities, not threats. You're comfortable watching your portfolio drop 20% because you trust the recovery.",
      inPractice: "You can buy during panics while others sell. You don't lose sleep over market swings. You might even get excited by dips because you see them as discounts.",
      portfolioImplication: "You can handle a growth-heavy allocation -- 80%+ equities with meaningful exposure to higher-beta sectors. Just make sure your timeline actually supports this risk level.",
      watchOut: "High risk tolerance doesn't mean high risk is always smart. Overconfidence can masquerade as courage. Make sure you're taking calculated risks, not just comfortable ones.",
      averageRange: "40-60",
      tip: "Use your risk tolerance as an edge during panics, but always check: is my timeline long enough to recover from a worst-case drawdown?",
    },
  },
  C: {
    low: {
      interpretation: "You prefer expert guidance over going it alone. You value having a trusted advisor and are comfortable delegating financial decisions.",
      inPractice: "You'll follow recommendations from trusted sources and advisors. Making financial decisions without input feels uncomfortable. You'd rather have a plan built for you than build one yourself.",
      portfolioImplication: "Target-date funds, robo-advisors, or managed accounts fit your style well. Having someone else handle rebalancing reduces your stress.",
      watchOut: "Blind delegation can be dangerous. Even if you delegate, understand the basics of what you own and why. Trust but verify.",
      averageRange: "35-55",
      tip: "Find ONE trusted source (advisor, fund, platform) and stick with them. Too many voices creates confusion.",
    },
    moderate: {
      interpretation: "You like having input but also value your own judgment. You want recommendations but make the final call yourself.",
      inPractice: "You'll research options, consult advisors or resources, but ultimately decide based on your own analysis. You want to understand the reasoning, not just the recommendation.",
      portfolioImplication: "A self-directed account with advisory access works well. You benefit from tools that provide recommendations you can accept or reject.",
      watchOut: "Analysis paralysis can hit when you're between trusting yourself and trusting others. Set a decision deadline for each investment choice.",
      averageRange: "35-55",
      tip: "Build a process: research, consult, decide, commit. The decision part has a deadline.",
    },
    high: {
      interpretation: "You strongly prefer to maintain control over your financial decisions. You trust your own judgment above external advice.",
      inPractice: "You'll do deep research before any investment. You're skeptical of advisors and prefer raw data over recommendations. You want tools, not hand-holding.",
      portfolioImplication: "Self-directed brokerage accounts with advanced tools suit you best. You'll build your own allocation and rebalance on your own schedule.",
      watchOut: "Going it alone means missing blind spots. Even the best solo investors benefit from a contrarian viewpoint. Build in a 'devil's advocate' step.",
      averageRange: "35-55",
      tip: "Keep a decision journal. Writing down your reasoning before each trade helps you catch your own biases.",
    },
  },
  H: {
    low: {
      interpretation: "You think in shorter timeframes. You want to see progress and results relatively quickly. Waiting years for a payoff feels frustrating.",
      inPractice: "You check your portfolio regularly and evaluate performance frequently. Investments that don't show results within months feel like failures. You prefer liquid positions you can adjust.",
      portfolioImplication: "Include some dividend stocks for regular income 'signals.' Avoid locking money in illiquid investments. Shorter-term bonds over long-term.",
      watchOut: "Short time horizons amplify volatility's emotional impact. Every dip feels like a crisis when you're measuring monthly. Zoom out deliberately.",
      averageRange: "35-60",
      tip: "Set quarterly review dates instead of checking daily. The data is more meaningful and the emotional toll is lower.",
    },
    moderate: {
      interpretation: "You think in medium-range timeframes -- years, not decades or months. You can be patient, but you also want to see the plan working.",
      inPractice: "You'll hold positions for 1-5 years comfortably. You review performance quarterly or semi-annually. You can tolerate temporary underperformance if the thesis is intact.",
      portfolioImplication: "A mix of growth and income works well. You can hold individual stocks through temporary dips but prefer seeing some dividends or regular returns.",
      watchOut: "Medium-term thinking can lead to premature selling of long-term winners. If a position is working, let it compound.",
      averageRange: "35-60",
      tip: "For each position, write down your expected holding period BEFORE you buy. Revisit only at that milestone.",
    },
    high: {
      interpretation: "You naturally think in decades. Compounding is your religion. Short-term performance is irrelevant to your strategy.",
      inPractice: "You can hold through multi-year bear markets without flinching. You reinvest dividends automatically. You rarely sell -- and when you do, it's thesis-driven, not price-driven.",
      portfolioImplication: "Growth stocks and compounding vehicles are your playground. Minimize tax drag with long-term holds. You can afford to take bigger swings because time heals volatility.",
      watchOut: "Don't mistake stubbornness for conviction. Even long-term theses need periodic review. A stock you planned to hold forever can still have a broken thesis.",
      averageRange: "35-60",
      tip: "Review your long-term holdings annually with one question: 'Would I buy this today at this price?' If not, it's time to re-evaluate.",
    },
  },
  D: {
    low: {
      interpretation: "You tend to decide in the moment rather than follow a rigid plan. Structure feels constraining, and you adjust based on how you feel.",
      inPractice: "You might skip rebalancing dates, change your allocation based on market mood, or make impulsive buys when you see something exciting. Following a schedule feels boring.",
      portfolioImplication: "Automate everything you can. Automatic contributions, automatic rebalancing, automatic dividend reinvestment. Remove yourself from the execution loop.",
      watchOut: "Low discipline + high market access = dangerous combination. Every impulse trade is a potential portfolio drag. The cure is automation, not willpower.",
      averageRange: "30-55",
      tip: "Set up automatic investments on payday. You can't impulsively NOT invest if it happens before you see the money.",
    },
    moderate: {
      interpretation: "You can follow plans but occasionally deviate. You have good intentions about discipline but sometimes let emotions override your process.",
      inPractice: "You'll follow your investment plan most of the time but might make an unplanned trade during market excitement or panic. You set rules but sometimes bend them.",
      portfolioImplication: "Build rules with some flexibility. Example: 'I rebalance quarterly, but I can make one discretionary trade per quarter.' This channels the impulse without breaking the system.",
      watchOut: "'Moderate' discipline tends to erode during stress. Your worst decisions will come during your most emotional moments. Build circuit breakers.",
      averageRange: "30-55",
      tip: "Create a 48-hour rule: any unplanned trade waits 48 hours. If you still want it after sleeping on it twice, proceed.",
    },
    high: {
      interpretation: "You follow rules and systems reliably. When you make a plan, you stick to it. You use automation and schedules to remove emotion from execution.",
      inPractice: "You rebalance on schedule, contribute automatically, and only trade when your system signals it. You can sit on your hands during market chaos because the plan says to.",
      portfolioImplication: "You're built for systematic investing. Rules-based strategies, factor investing, and scheduled rebalancing play to your greatest strength.",
      watchOut: "Rigid discipline can become rigidity. Markets change, and a plan that worked in 2020 might not work in 2026. Schedule annual strategy reviews, not just execution reviews.",
      averageRange: "30-55",
      tip: "Your discipline is your superpower. Pair it with an annual 'assumptions check' -- are the premises behind your plan still true?",
    },
  },
  E: {
    low: {
      interpretation: "Markets affect you emotionally. Volatility triggers real feelings -- anxiety during drops, excitement during rallies -- and those feelings influence your decisions.",
      inPractice: "You check your portfolio during volatile periods. Red days make you want to sell; green days make you want to buy more. You feel market movements in your body.",
      portfolioImplication: "Reduce the emotional surface area. Fewer positions = fewer things to worry about. Index funds > individual stocks. Less checking = less emotional triggering.",
      watchOut: "Your emotions aren't the enemy -- they're data. But acting on them in real-time is destructive. Build a buffer between feeling and action.",
      averageRange: "35-55",
      tip: "Delete your brokerage app from your phone's home screen. Move it to a folder. The 5 extra seconds of friction prevents most impulse checks.",
    },
    moderate: {
      interpretation: "You feel market movements but can usually separate feelings from actions. You're aware of your emotional responses and can override them most of the time.",
      inPractice: "Big drops make you uncomfortable but you don't panic-sell. FOMO tempts you but you usually resist. You might check your portfolio more during volatile periods.",
      portfolioImplication: "You can handle a moderately aggressive portfolio as long as you have some 'sleep well' positions (bonds, dividends) to anchor the emotional experience.",
      watchOut: "Your biggest risk is the extreme event -- the -30% crash that overwhelms your normal emotional regulation. Have a written plan for that specific scenario.",
      averageRange: "35-55",
      tip: "Write your 'crash plan' now while you're calm: what you will and won't do if markets drop 30%. Tape it to your monitor.",
    },
    high: {
      interpretation: "You stay remarkably calm under market pressure. Volatility doesn't trigger impulsive decisions, and you can separate your feelings from your financial actions.",
      inPractice: "You can buy during panics and hold during crashes. You don't check your portfolio obsessively. Red and green days get the same reaction: review the thesis, not the price.",
      portfolioImplication: "Your emotional stability is a genuine edge. You can hold more volatile positions because you won't sell at the worst moment. Use this advantage.",
      watchOut: "Don't mistake emotional detachment for analytical rigor. Staying calm is great, but you still need to review your holdings objectively. Stoicism isn't a strategy.",
      averageRange: "35-55",
      tip: "Lean into your calm during market panics -- that's when others are selling you their best positions at a discount.",
    },
  },
};

export function getDimensionCoaching(dimKey: string, score: number): DimensionCoaching {
  const range = getRange(score);
  const coaching = DIMENSION_COACHING[dimKey];
  if (!coaching) {
    return {
      interpretation: "",
      inPractice: "",
      portfolioImplication: "",
      watchOut: "",
      averageRange: "40-60",
      tip: "",
    };
  }
  return coaching[range];
}

// Bias education content -- deeper explanations for each detected bias
export interface BiasEducation {
  definition: string;
  realWorldExample: string;
  archetypeInteraction: Record<ArchetypeKey, string>;
  countermeasure: string;
}

export const BIAS_EDUCATION: Record<string, BiasEducation> = {
  loss_aversion: {
    definition: "You feel the pain of losing money about twice as intensely as the pleasure of gaining the same amount. A $1,000 loss hurts more than a $1,000 gain feels good.",
    realWorldExample: "Last time the market dropped 5%, you probably felt a strong urge to sell -- even though the rational move might have been to hold or buy more.",
    archetypeInteraction: {
      systems_builder: "You'll over-optimize your system to avoid losses, potentially sacrificing upside for unnecessary protection.",
      reassurance_seeker: "Loss aversion amplifies your need for reassurance. Even small losses can trigger decision paralysis until someone confirms you're okay.",
      analytical_skeptic: "You'll seek out bearish data to confirm your loss aversion, creating a negative confirmation loop.",
      diy_controller: "You'll hold losing positions too long because selling feels like admitting you were wrong -- and you don't like being wrong.",
      collaborative_partner: "You'll look for partners who agree you should sell during losses, seeking social validation for your fear.",
      big_picture_optimist: "Your long-term view usually overrides loss aversion, but in deep drawdowns, it can break through.",
      trend_sensitive_explorer: "You'll exit winning trends too early to 'lock in gains' while riding losers hoping for a reversal.",
      avoider_under_stress: "Loss aversion feeds your avoidance -- you'll stop checking your portfolio entirely to avoid seeing the red.",
      action_first_decider: "You'll make rapid-fire sell decisions during drops, compounding losses through emotional trading.",
      values_anchored_steward: "Losses feel like failing the people you're investing for, adding guilt to the financial pain.",
    },
    countermeasure: "Before selling a losing position, write down your original thesis. If the thesis is still intact, the loss is temporary. If the thesis is broken, sell -- but sell because of logic, not fear.",
  },
  recency_bias: {
    definition: "You give too much weight to what happened recently and not enough to long-term patterns. Last week's crash feels more important than 10 years of data.",
    realWorldExample: "After a great quarter, you feel invincible and want to add more. After a bad month, you question your entire strategy -- even if it's worked for years.",
    archetypeInteraction: {
      systems_builder: "You'll tweak your system based on recent results instead of trusting the long-term backtest.",
      reassurance_seeker: "Recent bad news makes you need MORE reassurance, creating a cycle of anxiety and validation-seeking.",
      analytical_skeptic: "You'll over-index on recent data sets while dismissing historical patterns that contradict the narrative.",
      diy_controller: "You'll adjust your portfolio too frequently based on what just happened instead of your original analysis.",
      collaborative_partner: "Recent market events will dominate your conversations, crowding out longer-term strategic thinking.",
      big_picture_optimist: "Your long-term focus usually protects you, but extreme recent events can shake even your conviction.",
      trend_sensitive_explorer: "This is your biggest risk -- confusing recent momentum with a sustainable trend.",
      avoider_under_stress: "Bad recent news amplifies your freeze response, making you avoid decisions even more.",
      action_first_decider: "You'll chase whatever just worked, making reactive trades based on last week instead of next year.",
      values_anchored_steward: "Recent negative returns can make you question whether your values-based approach is actually working.",
    },
    countermeasure: "Before acting on recent events, check the 5-year and 10-year data. Ask: 'Would I make this same decision if last week hadn't happened?'",
  },
  overconfidence: {
    definition: "You overestimate your ability to predict market outcomes and underestimate the role of luck and randomness in your past successes.",
    realWorldExample: "After a few good trades, you start to think you've 'figured out the market' and increase your position sizes -- right before a humbling loss.",
    archetypeInteraction: {
      systems_builder: "You'll believe your system is more robust than it actually is, under-testing for edge cases and black swans.",
      reassurance_seeker: "Overconfidence is rare for you, but when it hits, it's because someone validated a thesis you should have questioned.",
      analytical_skeptic: "You'll become overconfident in your contrarian calls, believing you're right and the market is wrong -- sometimes too long.",
      diy_controller: "Classic Lone Wolf trap -- you trust yourself so much that you ignore warning signs from the data.",
      collaborative_partner: "Group overconfidence is your risk -- when everyone in the room agrees, the room might be wrong.",
      big_picture_optimist: "You'll stay overconfident in holdings too long, confusing stubbornness with patience.",
      trend_sensitive_explorer: "Riding winning trends creates false confidence. One big win can make you think you can spot every wave.",
      avoider_under_stress: "Rare for you -- but overconfidence can emerge after a period of forced inaction that happened to work out.",
      action_first_decider: "Speed + overconfidence = concentrated positions with no exit plan. Your biggest risk scenario.",
      values_anchored_steward: "You'll believe that investing with purpose guarantees good returns -- it doesn't. Purpose and performance are separate variables.",
    },
    countermeasure: "Keep a trade journal. Track EVERY prediction you make, not just the ones that work out. Your hit rate is lower than you think.",
  },
  fomo: {
    definition: "Fear of Missing Out drives you to enter positions because everyone else is making money, not because the investment fits your strategy.",
    realWorldExample: "When your friend texts about doubling their money on a meme stock, you feel an almost physical urge to buy in -- even though it doesn't fit any of your criteria.",
    archetypeInteraction: {
      systems_builder: "Your system protects you from most FOMO, but extreme hype (crypto, meme stocks) can test even the best rules.",
      reassurance_seeker: "Social proof amplifies your FOMO. If everyone you trust is buying, saying no feels lonely and scary.",
      analytical_skeptic: "You're naturally FOMO-resistant because you demand evidence. But even skeptics can succumb during extreme euphoria.",
      diy_controller: "FOMO threatens your independence -- suddenly you're following the crowd instead of your own analysis.",
      collaborative_partner: "FOMO enters through your network. When your entire circle is buying, the collaborative pressure is intense.",
      big_picture_optimist: "You usually shrug off short-term FOMO, but fear of missing a generational shift (AI, crypto, etc.) can get you.",
      trend_sensitive_explorer: "FOMO is your kryptonite. Your trend-spotting instinct can't always tell the difference between a real trend and a hype bubble.",
      avoider_under_stress: "FOMO can actually break your avoidance pattern -- but it pushes you into action for the wrong reasons.",
      action_first_decider: "FOMO + speed = buying at the top. You'll jump in fast but without the analysis that protects against a crash.",
      values_anchored_steward: "FOMO clashes with your values. The discomfort of missing out can temporarily override your purpose-driven criteria.",
    },
    countermeasure: "When you feel FOMO, set a 72-hour timer. If you still want to buy after 3 days of independent research, proceed. Most FOMO fades within 48 hours.",
  },
};
