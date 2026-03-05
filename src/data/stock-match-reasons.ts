// Per-archetype stock match reasoning templates
// Used to generate "Why this fits YOU" explanations on stock match cards
// Templates use dimension-aware logic to create personalized narratives

import type { ArchetypeKey } from "@/lib/financial-dna";
import type { CoreDimensions } from "@/lib/financial-dna";
import type { Stock } from "@/lib/stock-data";

interface MatchReasonTemplate {
  readonly highBeta: string;
  readonly lowBeta: string;
  readonly dividend: string;
  readonly growth: string;
  readonly strongBuy: string;
  readonly general: string;
}

const REASON_TEMPLATES: Record<ArchetypeKey, MatchReasonTemplate> = {
  systems_builder: {
    highBeta: "Higher beta stocks reward systematic entry and exit rules. Your framework thrives on volatility you can model and predict.",
    lowBeta: "Low-beta stocks are the backbone of a rules-based portfolio. Consistent behavior means your system can rely on predictable patterns.",
    dividend: "Dividends add a quantifiable, recurring income layer to your system. Predictable cash flows make portfolio modeling cleaner.",
    growth: "High-conviction growth stocks reward the patience your system demands. Set your rules and let compounding do the work.",
    strongBuy: "Strong analyst consensus aligns with your rules-first approach. Consensus + system = high-confidence position sizing.",
    general: "This stock fits your systematic approach because its metrics are modelable and its behavior is consistent enough for rule-based management.",
  },
  reassurance_seeker: {
    highBeta: "While this stock has higher volatility, its strong fundamentals provide the safety net you need. The upside potential is backed by real data, not hype.",
    lowBeta: "This stock's low volatility gives you the stability you need to stay committed. It won't keep you up at night watching the ticker.",
    dividend: "The dividend provides tangible, regular returns you can see and count. That steady income stream is the reassurance that your money is working for you.",
    growth: "This growth story is backed by strong analyst support and solid fundamentals -- not speculation. You can feel confident this isn't a gamble.",
    strongBuy: "Wall Street's Strong Buy consensus means you're not alone in this conviction. When the experts agree, you can invest with more confidence.",
    general: "This stock has the stability metrics and analyst backing that help you invest without second-guessing yourself.",
  },
  analytical_skeptic: {
    highBeta: "Higher beta, but the data supports it. This isn't a hype play -- the fundamentals justify the volatility premium.",
    lowBeta: "Low beta with strong underlying metrics. The kind of stock that rewards deep analysis over reactive trading.",
    dividend: "The dividend yield is backed by sustainable cash flows, not financial engineering. The numbers check out.",
    growth: "Growth thesis supported by real earnings trajectory, not just narrative. The evidence points to continued outperformance.",
    strongBuy: "Analyst consensus is Strong Buy, but more importantly, the underlying data supports that rating independently.",
    general: "The data speaks for itself on this one. Strip away the narrative and the fundamentals tell a compelling story.",
  },
  diy_controller: {
    highBeta: "Higher-beta stocks give you more entry points and trading opportunities. Your hands-on approach can capitalize on the swings others fear.",
    lowBeta: "A stable anchor for your self-directed portfolio. Low maintenance, solid fundamentals -- freeing you to focus research elsewhere.",
    dividend: "Dividend income you control. No advisor taking a cut, no fund manager making choices for you -- just direct cash flow to your account.",
    growth: "High-conviction growth plays are where self-directed investors shine. You've done the research; this one rewards that effort.",
    strongBuy: "Analyst consensus confirms what your own research likely shows. Independent validation for your independent analysis.",
    general: "This stock rewards the kind of hands-on, self-directed research approach you prefer. Your due diligence pays off here.",
  },
  collaborative_partner: {
    highBeta: "A great discussion stock for your next advisor meeting. The volatility creates interesting strategic conversations about position sizing and timing.",
    lowBeta: "A steady performer that makes a strong foundation piece. Easy to explain, easy to agree on -- the kind of stock that builds trust in a partnership.",
    dividend: "Dividend stocks spark great conversations about income strategy vs. growth reinvestment with your advisor or investment group.",
    growth: "This growth story gives you and your advisor plenty to discuss -- entry timing, position size, and how it fits your broader strategy.",
    strongBuy: "Strong Buy consensus means your advisor likely agrees. A great starting point for a deeper strategic conversation.",
    general: "This stock is worth bringing to your next investment conversation. It has enough nuance to spark valuable dialogue about your strategy.",
  },
  big_picture_optimist: {
    highBeta: "Volatility is just the price of admission for long-term outperformance. Your decade-long horizon makes today's swings irrelevant.",
    lowBeta: "Steady compounding is the marathon runner's secret weapon. This stock grows quietly while others chase the next shiny thing.",
    dividend: "Reinvested dividends compound powerfully over your long time horizon. What looks like 2% today becomes transformative over a decade.",
    growth: "This is the kind of long-term growth story you live for. The thesis extends years into the future, right where your thinking already is.",
    strongBuy: "Even Wall Street sees what you see -- but you'll hold longer than they recommend, and that patience is your edge.",
    general: "This stock rewards the long-term perspective that defines your investment approach. Patient capital wins here.",
  },
  trend_sensitive_explorer: {
    highBeta: "High-beta stocks move with momentum -- your natural element. When this one catches a wave, the ride is worth it.",
    lowBeta: "Even trend-followers need ballast. This stable performer keeps your portfolio grounded while you chase bigger moves elsewhere.",
    dividend: "Dividends provide a baseline return while you scout for the next momentum play. Steady income funds your exploration.",
    growth: "This growth stock is riding a sector trend you should be watching. The momentum signals are real, not just noise.",
    strongBuy: "Strong Buy with momentum behind it. This is the kind of signal your trend-detection instincts are built for.",
    general: "This stock fits the current market trend your instincts are already tracking. Momentum and fundamentals are aligned.",
  },
  avoider_under_stress: {
    highBeta: "This stock has higher volatility, but its strong rating and fundamentals mean you can set it and step away. No need to watch daily.",
    lowBeta: "Low volatility is your friend. This stock won't trigger stress responses during market turbulence. Set a long-term alert and relax.",
    dividend: "Dividends arriving like clockwork give you something positive to focus on, even when markets feel uncertain. Income you can count on.",
    growth: "A steady growth trajectory without the heart-stopping drops. This stock grows your wealth without growing your anxiety.",
    strongBuy: "Strong Buy consensus means fewer reasons to worry. When Wall Street is confident, you can let go of the need to second-guess.",
    general: "This stock has the stability profile that lets you invest without the stress of constant monitoring.",
  },
  action_first_decider: {
    highBeta: "High beta means high action potential. This stock moves fast enough to reward your decisive nature.",
    lowBeta: "A quick decision with lasting results. Low-beta stocks are the fast, confident plays that pay off quietly over time.",
    dividend: "Quick income, no waiting. Dividends start flowing the moment you act. Decisive entry, immediate reward signal.",
    growth: "Strong growth with clear catalysts ahead. The thesis is simple, the upside is clear -- ready when you are.",
    strongBuy: "Strong Buy. Clear signal. You don't need to overthink this one -- the data supports immediate action.",
    general: "This stock has clear, actionable signals that match your decisive investment style. Less deliberation, more conviction.",
  },
  values_anchored_steward: {
    highBeta: "Higher volatility, but this company's mission and governance practices align with building lasting value, not chasing quarterly numbers.",
    lowBeta: "Stability that serves your purpose. This stock builds wealth steadily, the way legacy-minded investors prefer.",
    dividend: "Dividends represent real value sharing with shareholders. This company returns profits to the people who believe in its mission.",
    growth: "Growth with purpose. This company is building something that lasts -- and your investment in it contributes to that legacy.",
    strongBuy: "Strong Buy backed by sustainable business practices. Analyst confidence meets your values-first criteria.",
    general: "This stock aligns with your belief that wealth should serve a larger purpose. Returns and responsibility, together.",
  },
};

// Generate a personalized "Why this fits you" paragraph for a specific stock + archetype + dimensions combo
export function getWhyThisFitsYou(
  stock: Stock,
  archetype: ArchetypeKey,
  dims: CoreDimensions
): string {
  const templates = REASON_TEMPLATES[archetype];
  const parts: string[] = [];

  // Lead with the most relevant template based on stock characteristics
  if (stock.beta >= 1.3) {
    parts.push(templates.highBeta);
  } else if (stock.beta <= 0.8) {
    parts.push(templates.lowBeta);
  }

  if (stock.dividendYield >= 1.5 && parts.length < 2) {
    parts.push(templates.dividend);
  }

  if (stock.aiScore >= 80 && dims.H >= 55 && parts.length < 2) {
    parts.push(templates.growth);
  }

  if (stock.analystRating === "Strong Buy" && parts.length < 2) {
    parts.push(templates.strongBuy);
  }

  // Always have at least one reason
  if (parts.length === 0) {
    parts.push(templates.general);
  }

  return parts.join(" ");
}
