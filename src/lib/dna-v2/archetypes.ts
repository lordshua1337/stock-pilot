import type { FactorCode, FactorScore, ArchetypeKey, ArchetypeResult, BiasFlag, BiasKey } from "./types";

// ---------------------------------------------------------------------------
// Archetype Metadata
// ---------------------------------------------------------------------------

export const ARCHETYPE_INFO: Record<ArchetypeKey, {
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly communicationRule: string;
  readonly factorSignature: string;
}> = {
  systems_builder: {
    name: "The Money Architect",
    tagline: "Rules over instinct, process over impulse",
    description: "You build frameworks and follow them. Investing for you is a system to optimize, not a game to play. You want rules, automation, and scheduled reviews.",
    communicationRule: "Lead with structure. Offer rule-based frameworks. Skip motivational framing.",
    factorSignature: "High Structure, Deliberate, Analytical",
  },
  reassurance_seeker: {
    name: "The Steady Hand",
    tagline: "Validate first, analyze second",
    description: "You need to feel heard before you can act. Market uncertainty creates anxiety that can paralyze your decision-making until someone confirms you are on the right track.",
    communicationRule: "Validate before analyzing. Normalize uncertainty before risks. Never lead with loss numbers.",
    factorSignature: "Reactive, Consensus-seeking, Delegating",
  },
  analytical_skeptic: {
    name: "The Data Hawk",
    tagline: "Show me the data, not the story",
    description: "You question everything and trust evidence over opinion. You need to see the methodology behind any recommendation before you will consider it.",
    communicationRule: "Lead with data and sources. Cite everything. Skip emotional reassurance.",
    factorSignature: "Analytical, Deliberate, Commanding",
  },
  diy_controller: {
    name: "The Self-Made Investor",
    tagline: "My money, my rules",
    description: "You want to be in the driver's seat. You are not looking for someone to tell you what to do -- you want the best tools and information to make your own calls.",
    communicationRule: "Provide information efficiently. Do not guide or over-explain. Present options, not recommendations.",
    factorSignature: "Commanding, Flexible, Instinctive",
  },
  collaborative_partner: {
    name: "The Strategy Partner",
    tagline: "Think with me, not for me",
    description: "You want a thought partner who explores ideas alongside you. The best outcomes come from dialogue, not directives.",
    communicationRule: "Think out loud. Invite user into reasoning. Ask clarifying questions.",
    factorSignature: "Balanced Control, Balanced Social, Composed",
  },
  big_picture_optimist: {
    name: "The Marathon Runner",
    tagline: "Zoom out, stay the course",
    description: "You see the long arc. Short-term noise is just that -- noise. You trust that markets reward patience and that time in the market beats timing the market.",
    communicationRule: "Frame in terms of long-term trajectory. Minimize near-term noise.",
    factorSignature: "Future-focused, Composed, Aggressive",
  },
  trend_sensitive_explorer: {
    name: "The Momentum Rider",
    tagline: "What's next? What's now?",
    description: "You are drawn to what is moving. Momentum, trends, and social signals pull your attention. You are not afraid to act fast when you see opportunity.",
    communicationRule: "Add friction before trend-following. Surface the bear case first for trend plays.",
    factorSignature: "Consensus-driven, Instinctive, Moderate Risk",
  },
  avoider_under_stress: {
    name: "The Safe Harbor",
    tagline: "When in doubt, freeze",
    description: "Under pressure, you tend to avoid decisions entirely. It is not laziness -- it is self-protection. But avoidance has its own costs.",
    communicationRule: "Reduce decision complexity. Offer one clear action. Do not present multiple options during stress.",
    factorSignature: "Reactive, Deliberate, Protective",
  },
  action_first_decider: {
    name: "The First Mover",
    tagline: "Move fast, adjust later",
    description: "You would rather act and course-correct than deliberate and miss the window. Speed feels like an advantage, but it can also create unnecessary risk.",
    communicationRule: "Add explicit decision buffer recommendation. Surface risk before speed.",
    factorSignature: "Instinctive, Flexible, Commanding",
  },
  values_anchored_steward: {
    name: "The Purpose Investor",
    tagline: "Money is a tool, not the goal",
    description: "Your financial decisions are grounded in purpose. You invest for what money enables -- security, freedom, legacy -- not for the thrill of returns.",
    communicationRule: "Frame everything in terms of their stated goals. Reference their purpose.",
    factorSignature: "Future-focused, Systematic, Independent",
  },
};

// ---------------------------------------------------------------------------
// Archetype Classification
// ---------------------------------------------------------------------------

export function classifyArchetype(
  factors: Record<FactorCode, FactorScore>,
  biasFlags: readonly BiasFlag[]
): ArchetypeResult {
  const scores = computeArchetypeScores(factors, biasFlags);
  const primaryArchetype = findPrimaryArchetype(scores);
  const secondaryArchetype = findSecondaryArchetype(scores, primaryArchetype);

  return {
    primary: primaryArchetype,
    secondary: secondaryArchetype,
    scores,
  };
}

// ---------------------------------------------------------------------------
// Score Computation
// ---------------------------------------------------------------------------

function computeArchetypeScores(
  factors: Record<FactorCode, FactorScore>,
  biasFlags: readonly BiasFlag[]
): Record<ArchetypeKey, number> {
  const rp = factors["RP"]?.normalized ?? 0;
  const ds = factors["DS"]?.normalized ?? 0;
  const cn = factors["CN"]?.normalized ?? 0;
  const to = factors["TO"]?.normalized ?? 0;
  const si = factors["SI"]?.normalized ?? 0;
  const es = factors["ES"]?.normalized ?? 0;
  const sp = factors["SP"]?.normalized ?? 0;
  const ip = factors["IP"]?.normalized ?? 0;

  const hasFomo = biasFlags.some((b) => b.bias === "fomo" && b.severity >= 2);
  const hasHerding = biasFlags.some((b) => b.bias === "herding" && b.severity >= 2);
  const hasRegretAvoidance = biasFlags.some((b) => b.bias === "regret_avoidance" && b.severity >= 2);
  const hasInertia = biasFlags.some((b) => b.bias === "inertia" && b.severity >= 2);

  const scores: Record<ArchetypeKey, number> = {
    systems_builder: sp * 0.4 + (100 - ds) * 0.3 + ip * 0.3 + (sp > 70 ? 15 : 0),

    reassurance_seeker: (100 - es) * 0.4 + si * 0.3 + (100 - cn) * 0.3 + (es < 35 ? 15 : 0),

    analytical_skeptic: ip * 0.4 + (100 - ds) * 0.3 + cn * 0.3 + (ip > 70 ? 15 : 0),

    diy_controller: cn * 0.4 + (100 - sp) * 0.2 + ds * 0.2 + (cn > 70 ? 20 : 0),

    collaborative_partner:
      (50 - Math.abs(cn - 50)) * 0.4 + (50 - Math.abs(si - 50)) * 0.3 + es * 0.3,

    big_picture_optimist: to * 0.4 + es * 0.3 + rp * 0.3 + (to > 70 ? 15 : 0),

    trend_sensitive_explorer:
      si * 0.4 + ds * 0.3 + (50 - Math.abs(rp - 50)) * 0.3 + (hasFomo || hasHerding ? 15 : 0),

    avoider_under_stress:
      (100 - es) * 0.35 + (100 - ds) * 0.35 + (100 - rp) * 0.3 + (hasRegretAvoidance || hasInertia ? 15 : 0),

    action_first_decider: ds * 0.4 + (100 - sp) * 0.3 + cn * 0.3 + (ds > 70 ? 15 : 0),

    values_anchored_steward:
      to * 0.4 + sp * 0.3 + (100 - si) * 0.3 + (to > 70 && sp > 55 ? 15 : 0),
  };

  return scores;
}

function findPrimaryArchetype(scores: Record<ArchetypeKey, number>): ArchetypeKey {
  let max = -Infinity;
  let primaryKey: ArchetypeKey = "collaborative_partner";

  for (const [key, score] of Object.entries(scores)) {
    if (score > max) {
      max = score;
      primaryKey = key as ArchetypeKey;
    }
  }

  return primaryKey;
}

function findSecondaryArchetype(
  scores: Record<ArchetypeKey, number>,
  primary: ArchetypeKey
): ArchetypeKey | null {
  const primaryScore = scores[primary];

  if (primaryScore <= 0) {
    return null;
  }

  const threshold = primaryScore * 0.8;
  let maxSecondary = -Infinity;
  let secondaryKey: ArchetypeKey | null = null;

  for (const [key, score] of Object.entries(scores)) {
    if (key !== primary && score >= threshold && score > maxSecondary) {
      maxSecondary = score;
      secondaryKey = key as ArchetypeKey;
    }
  }

  return secondaryKey;
}

// ---------------------------------------------------------------------------
// Behavioral Rule Generation
// ---------------------------------------------------------------------------

export function generateBehavioralRule(
  factors: Record<FactorCode, FactorScore>,
  biases: readonly BiasFlag[]
): string {
  const highest = findHighestFactor(factors);
  const lowest = findLowestFactor(factors);
  const topBias = biases.length > 0 ? biases[0] : null;

  const ruleComponents: string[] = [];

  if (highest) {
    ruleComponents.push(getHighFactorRule(highest));
  }

  if (lowest) {
    ruleComponents.push(getLowFactorRule(lowest));
  }

  if (topBias && topBias.severity >= 2) {
    ruleComponents.push(getBiasRule(topBias));
  }

  if (ruleComponents.length === 0) {
    return "Maintain consistent investment discipline and review decisions regularly.";
  }

  return ruleComponents.join(" ");
}

function findHighestFactor(factors: Record<FactorCode, FactorScore>): FactorCode | null {
  let max = -Infinity;
  let highestKey: FactorCode | null = null;

  for (const factor of Object.values(factors)) {
    if (factor.normalized > max) {
      max = factor.normalized;
      highestKey = factor.code;
    }
  }

  return max >= 60 ? highestKey : null;
}

function findLowestFactor(factors: Record<FactorCode, FactorScore>): FactorCode | null {
  let min = Infinity;
  let lowestKey: FactorCode | null = null;

  for (const factor of Object.values(factors)) {
    if (factor.normalized < min) {
      min = factor.normalized;
      lowestKey = factor.code;
    }
  }

  return min <= 45 ? lowestKey : null;
}

function getHighFactorRule(factor: FactorCode): string {
  const rules: Record<FactorCode, string> = {
    RP: "Leverage your willingness to take calculated risks, but set clear exit criteria to avoid overexposure.",
    DS: "Your decisiveness is a strength; use a pre-commitment checklist to prevent impulsive moves.",
    CN: "Your control orientation means you excel with hands-on management; build a clear monitoring routine.",
    TO: "Your long-term focus is an asset; stay committed to your plan during short-term volatility.",
    SI: "Your social awareness is valuable; balance peer insights with independent judgment.",
    ES: "Your emotional composure is a strength; use it to support others and maintain discipline.",
    SP: "Your preference for structure is powerful; codify your rules to prevent deviation during stress.",
    IP: "Your analytical depth is your edge; use data to back every major decision.",
  };

  return rules[factor] || "Use this strength to guide your investment decisions.";
}

function getLowFactorRule(factor: FactorCode): string {
  const rules: Record<FactorCode, string> = {
    RP: "Your risk aversion suggests a conservative portfolio; consider your true risk capacity alongside your comfort level.",
    DS: "You deliberate carefully; set decision deadlines to avoid analysis paralysis.",
    CN: "You prefer delegating; select trusted advisors and verify their recommendations.",
    TO: "You focus on the present; remind yourself that long-term goals require patience.",
    SI: "Your independence is strength; occasionally validate your views with a trusted source.",
    ES: "Market stress may trigger avoidance; have a response plan for volatility.",
    SP: "Your flexibility is an advantage; add guardrails to prevent drift when conditions change.",
    IP: "You trust intuition over data; document your reasoning to catch blind spots.",
  };

  return rules[factor] || "Be aware of this potential blind spot and design safeguards accordingly.";
}

function getBiasRule(bias: BiasFlag): string {
  const rules: Record<BiasKey, string> = {
    loss_aversion: "Your loss sensitivity is acute; diversify to reduce the sting of downturns.",
    myopic_loss_aversion: "You feel gains and losses too acutely; lengthen your review frequency.",
    disposition_effect: "You hold losers too long and sell winners too fast; reverse that instinct.",
    anchoring: "You lock onto past prices; update your views based on new data.",
    regret_avoidance: "Fear of regret can paralyze you; act on your best judgment and move forward.",
    overconfidence: "You may overestimate your skill; regularly test your assumptions against benchmarks.",
    recency_bias: "Recent events disproportionately influence you; zoom out and look at longer trends.",
    herding: "You follow the crowd; pause and ask if the trend matches your actual goals.",
    fomo: "Fear of missing out drives some decisions; write down why you passed on something before you regret it.",
    confirmation_bias: "You seek confirming views; actively seek out the best counterargument.",
    inertia: "You avoid making changes even when warranted; set annual rebalance triggers.",
    mental_accounting: "You treat buckets of money differently; consolidate and think holistically.",
    sunk_cost: "You hold onto positions because of past losses; make decisions based on forward value only.",
    availability_heuristic: "You overweight recent or vivid events; lean on historical data.",
    present_bias: "You prioritize short-term comfort; revisit your long-term goals regularly.",
    narrative_bias: "You construct stories to explain markets; separate fact from interpretation.",
  };

  return rules[bias.bias] || "Be aware of this bias and design guardrails to counteract it.";
}

// ---------------------------------------------------------------------------
// Strengths Generation
// ---------------------------------------------------------------------------

export function generateStrengths(factors: Record<FactorCode, FactorScore>): readonly string[] {
  const factorEntries = Object.values(factors).filter((f) => f.normalized > 60);

  factorEntries.sort((a, b) => b.normalized - a.normalized);

  const top = factorEntries.slice(0, 3);

  return top.map((factor) => {
    const description = getFactorStrengthDescription(factor.code);
    return `${getFactorName(factor.code)} (${Math.round(factor.normalized)}): ${description}`;
  });
}

function getFactorName(code: FactorCode): string {
  const names: Record<FactorCode, string> = {
    RP: "Risk Posture",
    DS: "Decision Speed",
    CN: "Control Need",
    TO: "Time Orientation",
    SI: "Social Influence",
    ES: "Emotional Steadiness",
    SP: "Structure Preference",
    IP: "Information Processing",
  };
  return names[code] || code;
}

function getFactorStrengthDescription(code: FactorCode): string {
  const descriptions: Record<FactorCode, string> = {
    RP: "You tolerate risk appropriately and can capitalize on opportunities others avoid.",
    DS: "You move decisively when conditions warrant action.",
    CN: "You maintain control over your portfolio and understand your positions deeply.",
    TO: "You maintain a long-term perspective even in volatile markets.",
    SI: "You balance social signals with independent thinking.",
    ES: "You remain calm under pressure and make rational decisions during stress.",
    SP: "You build and follow disciplined processes that keep you consistent.",
    IP: "You dig into data and base decisions on evidence rather than emotion.",
  };

  return descriptions[code] || "You excel in this area.";
}

// ---------------------------------------------------------------------------
// Vulnerabilities Generation
// ---------------------------------------------------------------------------

export function generateVulnerabilities(
  factors: Record<FactorCode, FactorScore>,
  biases: readonly BiasFlag[]
): readonly string[] {
  const vulnerabilityList: string[] = [];

  // Add bottom 2 factors below 45
  const lowFactors = Object.values(factors)
    .filter((f) => f.normalized < 45)
    .sort((a, b) => a.normalized - b.normalized)
    .slice(0, 2);

  for (const factor of lowFactors) {
    const name = getFactorName(factor.code);
    const warning = getFactorVulnerabilityWarning(factor.code);
    vulnerabilityList.push(`${name} (${Math.round(factor.normalized)}): ${warning}`);
  }

  // Add top bias with severity >= 2
  const severeBias = biases.find((b) => b.severity >= 2);
  if (severeBias) {
    vulnerabilityList.push(`Bias: ${severeBias.label} -- ${severeBias.behavioralSignature}`);
  }

  if (vulnerabilityList.length === 0) {
    return ["No significant vulnerabilities detected."];
  }

  return vulnerabilityList;
}

function getFactorVulnerabilityWarning(code: FactorCode): string {
  const warnings: Record<FactorCode, string> = {
    RP: "Low risk tolerance can lead to overly conservative positioning and missing growth opportunities.",
    DS: "You deliberate extensively, which can cause analysis paralysis and missed timing windows.",
    CN: "Reluctance to control may cause you to over-delegate or ignore portfolio drift.",
    TO: "Short-term focus creates reactivity to noise and can trigger panic selling.",
    SI: "Independence can isolate you from useful second opinions and create blind spots.",
    ES: "Market stress may trigger avoidance behaviors that hurt long-term outcomes.",
    SP: "Flexibility without guardrails can lead to drift and inconsistent decision-making.",
    IP: "Reliance on intuition over data can hide logical blind spots.",
  };

  return warnings[code] || "This may be an area to monitor and strengthen.";
}
