// Investor Identity Scoring Engine
// Dimension normalization, bias accumulators, confidence scoring,
// market mood computation, archetype classification, micro-module triggers

import {
  type CoreDimensions,
  type DimKey,
  type BiasKey,
  type ArchetypeKey,
  type MarketMoodState,
  type FrictionTrigger,
  DIMENSION_KEYS,
  QUESTION_BANK,
  DNA_QUESTIONS,
} from "./financial-dna";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BiasFlag {
  bias: BiasKey;
  severity: number; // 0-3
  evidence: number; // raw accumulator count
  label: string;
  behavioral_signature: string;
}

export interface MarketMood {
  state: MarketMoodState;
  panic_probability: number;
  fomo_probability: number;
  impulse_trade_probability: number;
  reassurance_dependency: number;
}

export interface ConfidenceScores {
  overall: number;
  per_trait: Record<DimKey, number>;
}

export interface BehaviorFlags {
  checks_often: boolean;
  panic_sell_tendency: boolean;
  trend_chase: boolean;
  missing_gains_stress: boolean;
  e4_stopped_investing: boolean;
}

export type MicroModuleKey =
  | "volatility_coping"
  | "plan_discipline"
  | "delegation_trust"
  | "bias_deep_dive"
  | "goal_clarity";

export interface DNAProfile {
  dimensions: CoreDimensions;
  confidence: ConfidenceScores;
  biasFlags: BiasFlag[];
  marketMood: MarketMood;
  communicationArchetype: ArchetypeKey;
  secondaryArchetype: ArchetypeKey | null;
  frictionTriggers: FrictionTrigger[];
  aiMemoryNotes: string[];
  behaviorFlags: BehaviorFlags;
  triggeredModules: MicroModuleKey[];
  behavioralRule: string;
  strengths: string[];
  vulnerabilities: string[];
}

// ---------------------------------------------------------------------------
// Trait ranges (theoretical min/max per dimension from the 25 questions)
// ---------------------------------------------------------------------------

// Computed from actual question vectors (per-question min/max sums)
// R: min possible = sum of min R across all 25 Q = -17, max = 18
// C: min = -8, max = 11
// H: min = -19, max = 31
// D: min = -30, max = 44
// E: min = -28, max = 24
const TRAIT_RANGES: Record<DimKey, { min: number; max: number }> = {
  R: { min: -17, max: 18 },
  C: { min: -8, max: 11 },
  H: { min: -19, max: 31 },
  D: { min: -30, max: 44 },
  E: { min: -28, max: 24 },
};

// ---------------------------------------------------------------------------
// Dimension labels for display
// ---------------------------------------------------------------------------

export const DIMENSION_LABELS: Record<DimKey, string> = {
  R: "Risk Orientation",
  C: "Control vs Delegation",
  H: "Time Horizon",
  D: "Execution Discipline",
  E: "Emotional Regulation",
};

export const DIMENSION_DESCRIPTIONS: Record<DimKey, { high: string; low: string }> = {
  R: {
    high: "You have a higher tolerance for volatility and uncertainty. You see drawdowns as opportunities rather than threats.",
    low: "You prefer stability and predictability. Capital preservation matters more to you than chasing higher returns.",
  },
  C: {
    high: "You prefer to maintain control over your financial decisions. You trust your own judgment and want information, not direction.",
    low: "You're comfortable delegating and value expert guidance. You prefer clear recommendations over raw data.",
  },
  H: {
    high: "You naturally think in decades. Short-term noise doesn't faze you because you're focused on compounding over time.",
    low: "You think in shorter timeframes. Near-term results matter to you, and you want to see progress sooner rather than later.",
  },
  D: {
    high: "You follow rules and systems. When you make a plan, you stick to it. You use automation and review schedules to stay on track.",
    low: "You tend to decide in the moment. Rigid plans feel constraining, and you may struggle with follow-through when things get boring.",
  },
  E: {
    high: "You stay calm under pressure. Market swings don't trigger impulsive decisions, and you can separate feelings from actions.",
    low: "Market movements affect you emotionally. You may check your portfolio more often during volatility and feel strong urges to act.",
  },
};

// ---------------------------------------------------------------------------
// Bias detection rules (16 detectors)
// ---------------------------------------------------------------------------

const BIAS_RULES: Record<
  BiasKey,
  {
    label: string;
    behavioral_signature: string;
    severity_thresholds: [number, number, number];
  }
> = {
  loss_aversion: {
    label: "Loss Aversion",
    behavioral_signature: "Feels losses roughly 2x more intensely than equivalent gains",
    severity_thresholds: [1, 2, 3],
  },
  myopic_loss_aversion: {
    label: "Myopic Loss Aversion",
    behavioral_signature: "Checks portfolio too frequently, amplifying loss sensitivity",
    severity_thresholds: [1, 2, 2],
  },
  disposition_effect: {
    label: "Disposition Effect",
    behavioral_signature: "Sells winners too early, holds losers too long",
    severity_thresholds: [1, 2, 2],
  },
  anchoring: {
    label: "Anchoring",
    behavioral_signature: "Fixates on purchase price rather than current thesis validity",
    severity_thresholds: [1, 2, 3],
  },
  regret_avoidance: {
    label: "Regret Avoidance",
    behavioral_signature: "Avoids decisions to prevent future regret, even when action is optimal",
    severity_thresholds: [1, 2, 3],
  },
  overconfidence: {
    label: "Overconfidence",
    behavioral_signature: "Overestimates own ability, underestimates risk and complexity",
    severity_thresholds: [1, 2, 3],
  },
  recency_bias: {
    label: "Recency Bias",
    behavioral_signature: "Gives disproportionate weight to recent events over base rates",
    severity_thresholds: [1, 2, 2],
  },
  herding: {
    label: "Herding / Social Proof",
    behavioral_signature: "Follows crowd behavior rather than independent analysis",
    severity_thresholds: [1, 2, 3],
  },
  fomo: {
    label: "FOMO",
    behavioral_signature: "Fear of missing out drives impulsive entry into trending positions",
    severity_thresholds: [1, 2, 3],
  },
  confirmation_bias: {
    label: "Confirmation Bias",
    behavioral_signature: "Seeks information that confirms existing beliefs, ignores contradictions",
    severity_thresholds: [1, 2, 2],
  },
  inertia: {
    label: "Status Quo / Inertia",
    behavioral_signature: "Avoids change even when current approach is suboptimal",
    severity_thresholds: [1, 2, 3],
  },
  mental_accounting: {
    label: "Mental Accounting",
    behavioral_signature: "Treats money differently based on its source rather than its purpose",
    severity_thresholds: [1, 2, 2],
  },
  sunk_cost: {
    label: "Sunk Cost Fallacy",
    behavioral_signature: "Continues losing positions because of money already invested",
    severity_thresholds: [1, 2, 3],
  },
  availability_heuristic: {
    label: "Availability Heuristic",
    behavioral_signature: "Overweights vivid or recent examples when assessing probability",
    severity_thresholds: [1, 2, 2],
  },
  present_bias: {
    label: "Present Bias",
    behavioral_signature: "Prioritizes immediate rewards over long-term goals",
    severity_thresholds: [1, 2, 3],
  },
  narrative_bias: {
    label: "Narrative Bias",
    behavioral_signature: "Drawn to compelling stories rather than data-driven analysis",
    severity_thresholds: [1, 2, 2],
  },
};

// ---------------------------------------------------------------------------
// Archetype definitions
// ---------------------------------------------------------------------------

export const ARCHETYPE_INFO: Record<
  ArchetypeKey,
  {
    name: string;
    tagline: string;
    description: string;
    communicationRule: string;
  }
> = {
  systems_builder: {
    name: "The Money Architect",
    tagline: "Build the system. Let it compound.",
    description:
      "You don't trade on gut feelings -- you build frameworks and let them run. Investing for you is an engineering problem: design the rules, automate the execution, and review the system on a schedule. While others react to headlines, you're optimizing the machine.",
    communicationRule:
      "Lead with structure. Offer rule-based frameworks. Skip motivational framing.",
  },
  reassurance_seeker: {
    name: "The Steady Hand",
    tagline: "Confidence is built, not borrowed.",
    description:
      "You need solid ground before you move. Market uncertainty creates real anxiety, and you won't commit capital until you feel validated that your thesis holds up. This isn't weakness -- it's the instinct that keeps you from blowing up your portfolio on impulse.",
    communicationRule:
      "Validate before analyzing. Normalize uncertainty before risks. Never lead with loss numbers.",
  },
  analytical_skeptic: {
    name: "The Market Surgeon",
    tagline: "Cut through the noise. Trust the data.",
    description:
      "You question everything Wall Street tells you. Earnings calls, analyst ratings, talking heads -- none of it matters until you've seen the raw numbers yourself. You need methodology, not marketing. Evidence, not enthusiasm.",
    communicationRule:
      "Lead with data and sources. Cite everything. Skip emotional reassurance.",
  },
  diy_controller: {
    name: "The Lone Wolf",
    tagline: "My portfolio, my rules.",
    description:
      "You don't need a financial advisor to hold your hand. You want the best tools, the best data, and the freedom to make your own calls. Nobody else is going to care about your money as much as you do -- and you know it.",
    communicationRule:
      "Provide information efficiently. Do not guide or over-explain. Present options, not recommendations.",
  },
  collaborative_partner: {
    name: "The War Room Strategist",
    tagline: "The best trades start with the best conversations.",
    description:
      "You don't want someone to tell you what to buy. You want a thought partner who will stress-test your ideas, challenge your assumptions, and help you see angles you missed. Your edge comes from dialogue, not directives.",
    communicationRule:
      "Think out loud. Invite user into reasoning. Ask clarifying questions.",
  },
  big_picture_optimist: {
    name: "The Marathon Capitalist",
    tagline: "Time in the market beats timing the market.",
    description:
      "You see what others can't: the long arc. While everyone panics over quarterly earnings, you're thinking about where the world will be in 2035. Short-term noise is just that -- noise. You trust compounding, you trust patience, and you trust the math.",
    communicationRule:
      "Frame in terms of long-term trajectory. Minimize near-term noise.",
  },
  trend_sensitive_explorer: {
    name: "The Wave Rider",
    tagline: "Catch the momentum. Ride it out.",
    description:
      "You're drawn to what's moving. Momentum, trends, social signals, sector rotations -- you see opportunity where others see chaos. You're not afraid to act fast when the wave is forming, but you need to watch for the undertow.",
    communicationRule:
      "Add friction before trend-following. Surface the bear case first for trend plays.",
  },
  avoider_under_stress: {
    name: "The Vault Keeper",
    tagline: "Protect the capital. Weather the storm.",
    description:
      "When markets get ugly, your first instinct is to lock the vault and wait it out. This isn't cowardice -- it's self-preservation. But sitting on the sidelines during a recovery has its own costs. Your challenge: knowing when safety becomes stagnation.",
    communicationRule:
      "Reduce decision complexity. Offer one clear action. Don't present multiple options during stress.",
  },
  action_first_decider: {
    name: "The First Mover",
    tagline: "Speed is the edge. Hesitation is the cost.",
    description:
      "You'd rather act and course-correct than deliberate and miss the window. While others are still reading the earnings report, you've already placed the trade. Speed feels like an advantage -- and sometimes it is. But every fast move needs a faster exit plan.",
    communicationRule:
      "Add explicit decision buffer recommendation. Surface risk before speed.",
  },
  values_anchored_steward: {
    name: "The Legacy Builder",
    tagline: "Wealth is what you leave behind.",
    description:
      "Your financial decisions are grounded in something bigger than returns. Security, freedom, legacy, impact -- money is the tool, never the goal. You invest with purpose, and that purpose makes you more disciplined than most people who chase numbers.",
    communicationRule:
      "Frame everything in terms of their stated goals. Reference their purpose.",
  },
};

// ---------------------------------------------------------------------------
// 1. Compute Dimensions (0-100 normalized)
// ---------------------------------------------------------------------------

export function computeDimensions(
  answers: Record<string, number> // questionId -> option index (0-3)
): CoreDimensions {
  const rawTotals: Record<DimKey, number> = { R: 0, C: 0, H: 0, D: 0, E: 0 };

  for (const [questionId, optionIndex] of Object.entries(answers)) {
    const question = QUESTION_BANK[questionId];
    if (!question) continue;
    const option = question.options[optionIndex];
    if (!option) continue;

    DIMENSION_KEYS.forEach((k, i) => {
      rawTotals[k] += option.vector[i];
    });
  }

  const result = {} as CoreDimensions;
  for (const k of DIMENSION_KEYS) {
    const { min, max } = TRAIT_RANGES[k];
    const normalized = Math.round((100 * (rawTotals[k] - min)) / (max - min));
    result[k] = Math.max(0, Math.min(100, normalized));
  }

  return result;
}

// ---------------------------------------------------------------------------
// 2. Compute Bias Flags
// ---------------------------------------------------------------------------

export function computeBiasFlags(
  answers: Record<string, number>
): BiasFlag[] {
  const accumulators: Record<BiasKey, number> = {
    loss_aversion: 0,
    myopic_loss_aversion: 0,
    disposition_effect: 0,
    anchoring: 0,
    regret_avoidance: 0,
    overconfidence: 0,
    recency_bias: 0,
    herding: 0,
    fomo: 0,
    confirmation_bias: 0,
    inertia: 0,
    mental_accounting: 0,
    sunk_cost: 0,
    availability_heuristic: 0,
    present_bias: 0,
    narrative_bias: 0,
  };

  for (const [questionId, optionIndex] of Object.entries(answers)) {
    const question = QUESTION_BANK[questionId];
    if (!question) continue;
    const option = question.options[optionIndex];
    if (!option) continue;

    for (const [biasKey, increment] of Object.entries(option.biases)) {
      accumulators[biasKey as BiasKey] += increment;
    }
  }

  return (Object.entries(BIAS_RULES) as [BiasKey, (typeof BIAS_RULES)[BiasKey]][]).map(
    ([key, rule]) => {
      const evidence = accumulators[key];
      const [t1, t2, t3] = rule.severity_thresholds;
      let severity = 0;
      if (evidence >= t3) severity = 3;
      else if (evidence >= t2) severity = 2;
      else if (evidence >= t1) severity = 1;

      return {
        bias: key,
        severity,
        evidence,
        label: rule.label,
        behavioral_signature: rule.behavioral_signature,
      };
    }
  );
}

// ---------------------------------------------------------------------------
// 3. Extract Behavior Flags from answers
// ---------------------------------------------------------------------------

export function extractBehaviorFlags(
  answers: Record<string, number>
): BehaviorFlags {
  const allFlags: string[] = [];
  for (const [questionId, optionIndex] of Object.entries(answers)) {
    const question = QUESTION_BANK[questionId];
    if (!question) continue;
    const option = question.options[optionIndex];
    if (!option) continue;
    if (option.flags) {
      allFlags.push(...option.flags);
    }
  }

  // checks_often: A4 answered A (hourly) or B (daily) -- options 0 or 1
  const checksOften = answers["A4"] !== undefined && answers["A4"] <= 1;

  // panic_sell: A1 answered A -- option 0
  const panicSell =
    answers["A1"] === 0 || allFlags.includes("panic_sell_flag");

  // trend_chase: B4 answered A -- option 0
  const trendChase = answers["B4"] === 0;

  // missing_gains_stress: D5 answered B -- option 1
  const missingGainsStress = answers["D5"] === 1;

  // e4_stopped_investing: E4 answered D -- option 3
  const e4Stopped =
    answers["E4"] === 3 || allFlags.includes("e4_stopped_investing");

  return {
    checks_often: checksOften,
    panic_sell_tendency: panicSell,
    trend_chase: trendChase,
    missing_gains_stress: missingGainsStress,
    e4_stopped_investing: e4Stopped,
  };
}

// ---------------------------------------------------------------------------
// 4. Extract Friction Triggers
// ---------------------------------------------------------------------------

export function extractFrictionTriggers(
  answers: Record<string, number>
): FrictionTrigger[] {
  const triggers = new Set<FrictionTrigger>();

  for (const [questionId, optionIndex] of Object.entries(answers)) {
    const question = QUESTION_BANK[questionId];
    if (!question) continue;
    const option = question.options[optionIndex];
    if (!option) continue;
    if (option.frictionTrigger) {
      triggers.add(option.frictionTrigger);
    }
  }

  return [...triggers];
}

// ---------------------------------------------------------------------------
// 5. Extract AI Memory Notes
// ---------------------------------------------------------------------------

export function extractAIMemoryNotes(
  answers: Record<string, number>
): string[] {
  const notes: string[] = [];

  for (const [questionId, optionIndex] of Object.entries(answers)) {
    const question = QUESTION_BANK[questionId];
    if (!question) continue;
    const option = question.options[optionIndex];
    if (!option || !option.aiNote) continue;
    notes.push(`[${questionId}] ${option.aiNote}`);
  }

  return notes;
}

// ---------------------------------------------------------------------------
// 6. Compute Market Mood (sigmoid model)
// ---------------------------------------------------------------------------

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function computeMarketMood(
  dims: CoreDimensions,
  behaviorFlags: BehaviorFlags
): MarketMood {
  const panicInput =
    (1.2 * (100 - dims.E)) / 25 +
    0.8 * (behaviorFlags.checks_often ? 1 : 0) +
    1.0 * (behaviorFlags.panic_sell_tendency ? 1 : 0) +
    (0.5 * (100 - dims.D)) / 25;

  const fomoInput =
    1.1 * (behaviorFlags.trend_chase ? 1 : 0) +
    0.7 * (behaviorFlags.missing_gains_stress ? 1 : 0) +
    (0.4 * (100 - dims.H)) / 25;

  const impulseInput =
    0.8 * (behaviorFlags.trend_chase ? 1 : 0) +
    0.6 * (behaviorFlags.panic_sell_tendency ? 1 : 0) +
    (0.5 * (100 - dims.D)) / 25;

  const panic_probability = sigmoid(panicInput - 1.5);
  const fomo_probability = sigmoid(fomoInput - 1.5);
  const impulse_trade_probability = sigmoid(impulseInput - 1.5);

  let state: MarketMoodState;
  if (panic_probability >= 0.7) state = "panicked";
  else if (panic_probability >= 0.45 && behaviorFlags.checks_often)
    state = "reactive";
  else if (fomo_probability >= 0.7) state = "euphoric";
  else if (panic_probability >= 0.35) state = "concerned";
  else state = "steady";

  return {
    state,
    panic_probability,
    fomo_probability,
    impulse_trade_probability,
    reassurance_dependency:
      (100 - dims.E) * 0.6 + (100 - dims.C) * 0.4,
  };
}

// ---------------------------------------------------------------------------
// 7. Classify Archetype
// ---------------------------------------------------------------------------

export function classifyArchetype(
  dims: CoreDimensions,
  biasFlags: BiasFlag[],
  behaviorFlags: BehaviorFlags,
  answers: Record<string, number>
): { primary: ArchetypeKey; secondary: ArchetypeKey | null } {
  const scores: Record<ArchetypeKey, number> = {
    systems_builder: 0,
    reassurance_seeker: 0,
    analytical_skeptic: 0,
    diy_controller: 0,
    collaborative_partner: 0,
    big_picture_optimist: 0,
    trend_sensitive_explorer: 0,
    avoider_under_stress: 0,
    action_first_decider: 0,
    values_anchored_steward: 0,
  };

  const biasMap = Object.fromEntries(
    biasFlags.map((f) => [f.bias, f.severity])
  ) as Record<BiasKey, number>;

  // systems_builder: High D + high H
  scores.systems_builder = dims.D * 0.5 + dims.H * 0.3 + (dims.D > 70 ? 20 : 0);

  // reassurance_seeker: Low E + high reassurance_dependency
  scores.reassurance_seeker =
    (100 - dims.E) * 0.5 + (100 - dims.C) * 0.3 + (dims.E < 40 ? 20 : 0);

  // analytical_skeptic: High C + analytical triggers
  scores.analytical_skeptic =
    dims.C * 0.5 +
    (answers["D3"] === 2 ? 20 : 0) + // "Deep detail"
    (answers["D2"] === 2 ? 10 : 0); // "Ask for evidence"

  // diy_controller: Very high C, low delegation
  scores.diy_controller =
    dims.C * 0.6 +
    (dims.C > 70 ? 20 : 0) +
    (answers["D1"] === 3 ? 15 : 0); // "I decide"

  // collaborative_partner: Balanced C, collaborative triggers
  scores.collaborative_partner =
    (50 - Math.abs(dims.C - 50)) * 0.4 +
    (answers["D1"] === 2 ? 20 : 0) + // "Collaborate"
    (answers["D4"] === 2 ? 10 : 0); // "Structured agenda"

  // big_picture_optimist: High H + high R, low checking
  scores.big_picture_optimist =
    dims.H * 0.4 +
    dims.R * 0.3 +
    (answers["A4"] !== undefined && answers["A4"] >= 2 ? 15 : 0);

  // trend_sensitive_explorer: High FOMO probability, B4:A pattern
  scores.trend_sensitive_explorer =
    (biasMap.fomo ?? 0) * 15 +
    (biasMap.herding ?? 0) * 10 +
    (behaviorFlags.trend_chase ? 25 : 0);

  // avoider_under_stress: Low D + C3:A + regret_avoidance
  scores.avoider_under_stress =
    (100 - dims.D) * 0.4 +
    (answers["C3"] === 0 ? 25 : 0) + // "Avoid deciding"
    (biasMap.regret_avoidance ?? 0) * 10;

  // action_first_decider: Fast-decision + high C
  scores.action_first_decider =
    dims.C * 0.3 +
    (answers["C3"] === 1 ? 25 : 0) + // "Decide fast"
    (answers["D4"] === 0 ? 15 : 0); // "Fast decisions"

  // values_anchored_steward: High H + goal-clarity + meaning-oriented
  scores.values_anchored_steward =
    dims.H * 0.4 +
    dims.D * 0.2 +
    (answers["B1"] === 2 ? 20 : 0) + // "Depends on the goal bucket"
    (answers["B3"] === 2 ? 10 : 0); // "Allocate to existing goals"

  // Sort by score descending
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a) as [
    ArchetypeKey,
    number,
  ][];

  const primary = sorted[0][0];
  const primaryScore = sorted[0][1];
  const secondaryScore = sorted[1][1];

  // Secondary archetype if within 20% of primary
  const secondary =
    primaryScore > 0 && secondaryScore >= primaryScore * 0.8
      ? sorted[1][0]
      : null;

  return { primary, secondary };
}

// ---------------------------------------------------------------------------
// 8. Compute Confidence Scores
// ---------------------------------------------------------------------------

export function computeConfidence(
  answers: Record<string, number>,
  timings?: Record<string, number> // questionId -> ms
): ConfidenceScores {
  let overall = 100;
  const perTrait: Record<DimKey, number> = { R: 100, C: 100, H: 100, D: 100, E: 100 };

  // Check for rapid completion (< 3 seconds per question on average)
  if (timings) {
    const times = Object.values(timings);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    if (avgTime < 3000) {
      overall -= 15;
      for (const k of DIMENSION_KEYS) perTrait[k] -= 15;
    }
  }

  // Check for repeated same-position answers (low engagement)
  const optionIndices = Object.values(answers);
  const positionCounts: Record<number, number> = {};
  for (const idx of optionIndices) {
    positionCounts[idx] = (positionCounts[idx] || 0) + 1;
  }
  const maxSamePosition = Math.max(...Object.values(positionCounts));
  if (maxSamePosition >= 15) {
    // 60%+ same answer position
    overall -= 20;
    for (const k of DIMENSION_KEYS) perTrait[k] -= 20;
  } else if (maxSamePosition >= 10) {
    overall -= 10;
    for (const k of DIMENSION_KEYS) perTrait[k] -= 10;
  }

  // Check for contradictions between paired constructs
  // A1 (panic sell) vs A5 (rules-based review)
  if (answers["A1"] === 0 && answers["A5"] === 2) {
    // Says "sell to safety" but also "trigger rules-based review"
    perTrait.E -= 15;
    perTrait.R -= 10;
  }

  // B2 (long horizon) vs A4 (check hourly)
  if (
    answers["B2"] !== undefined &&
    answers["B2"] >= 2 &&
    answers["A4"] !== undefined &&
    answers["A4"] <= 1
  ) {
    perTrait.H -= 15;
  }

  // C2 (clear rules) vs C1 (never reviews)
  if (
    answers["C2"] !== undefined &&
    answers["C2"] >= 2 &&
    answers["C1"] === 0
  ) {
    perTrait.D -= 15;
  }

  // Clamp all values
  overall = Math.max(0, Math.min(100, overall));
  for (const k of DIMENSION_KEYS) {
    perTrait[k] = Math.max(0, Math.min(100, perTrait[k]));
  }

  return { overall, per_trait: perTrait };
}

// ---------------------------------------------------------------------------
// 9. Micro-Module Triggers
// ---------------------------------------------------------------------------

export function getTriggeredModules(
  dims: CoreDimensions,
  biasFlags: BiasFlag[],
  confidence: ConfidenceScores,
  behaviorFlags: BehaviorFlags
): MicroModuleKey[] {
  const triggered: MicroModuleKey[] = [];
  const biasMap = Object.fromEntries(
    biasFlags.map((f) => [f.bias, f.severity])
  ) as Record<BiasKey, number>;

  // Score-based triggers
  if (dims.E < 45 || behaviorFlags.panic_sell_tendency)
    triggered.push("volatility_coping");
  if (dims.D < 45 || (biasMap.inertia ?? 0) >= 2)
    triggered.push("plan_discipline");
  if (dims.C > 70 && (biasMap.confirmation_bias ?? 0) >= 1)
    triggered.push("delegation_trust");
  if (biasFlags.filter((f) => f.severity >= 2).length >= 2)
    triggered.push("bias_deep_dive");
  if (dims.H < 40 || (biasMap.present_bias ?? 0) >= 2)
    triggered.push("goal_clarity");

  // Confidence-based triggers
  if (confidence.per_trait.E < 50) triggered.push("volatility_coping");
  if (confidence.per_trait.D < 50) triggered.push("plan_discipline");

  // Immediate triggers
  if (behaviorFlags.e4_stopped_investing)
    triggered.unshift("volatility_coping");

  // Deduplicate, max 2
  return [...new Set(triggered)].slice(0, 2);
}

// ---------------------------------------------------------------------------
// 10. Generate Behavioral Rule
// ---------------------------------------------------------------------------

export function generateBehavioralRule(
  dims: CoreDimensions,
  biasFlags: BiasFlag[]
): string {
  // Find highest and lowest dimensions
  const entries = DIMENSION_KEYS.map((k) => ({ key: k, value: dims[k] }));
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  // Find primary bias (highest severity)
  const topBias = [...biasFlags]
    .filter((f) => f.severity > 0)
    .sort((a, b) => b.severity - a.severity)[0];

  const dimNames: Record<DimKey, string> = {
    R: "risk awareness",
    C: "decision autonomy",
    H: "long-term thinking",
    D: "execution discipline",
    E: "emotional regulation",
  };

  const biasActions: Record<BiasKey, string> = {
    loss_aversion:
      "Create a 48-hour decision buffer before any portfolio change triggered by news.",
    myopic_loss_aversion:
      "Reduce portfolio check frequency to weekly. Set a notification-free period during market hours.",
    disposition_effect:
      "Set target exit prices BEFORE entering any position. Review exits quarterly, not emotionally.",
    anchoring:
      "Never reference your purchase price when evaluating a holding. Focus only on current thesis validity.",
    regret_avoidance:
      "Write down your reasoning before every major decision. Review it instead of the outcome.",
    overconfidence:
      "Add a mandatory 'What could go wrong?' checklist before any new position above 5% of portfolio.",
    recency_bias:
      "Before acting on any market event, pull up the 5-year chart. Context before action.",
    herding:
      "When you feel the urge to follow a crowd trade, write down three reasons it could fail first.",
    fomo:
      "Implement a 72-hour cooling period for any position inspired by social media or news.",
    confirmation_bias:
      "Actively seek one bearish analysis before confirming any bullish thesis.",
    inertia:
      "Schedule a quarterly 30-minute portfolio review. Put it on your calendar now.",
    mental_accounting:
      "Treat all money equally regardless of source. Allocate windfalls using the same rules as salary.",
    sunk_cost:
      "Evaluate every holding as if you were buying it fresh today. If you wouldn't buy it now, consider selling.",
    availability_heuristic:
      "Check base rates before reacting to any dramatic headline. How often does this actually happen?",
    present_bias:
      "Automate your contributions. Make the long-term choice the default, not the exception.",
    narrative_bias:
      "After reading any compelling investment story, check three financial metrics before deciding.",
  };

  const strength = dimNames[highest.key];
  const weakness = dimNames[lowest.key];
  const biasLabel = topBias ? topBias.label.toLowerCase() : "reactive impulses";
  const action = topBias
    ? biasActions[topBias.bias]
    : "Create a simple written plan and review it monthly.";

  return `You are strong in ${strength} but reactive to ${weakness}${topBias ? ` and ${biasLabel}` : ""}. Rule: ${action}`;
}

// ---------------------------------------------------------------------------
// 11. Generate Strengths & Vulnerabilities
// ---------------------------------------------------------------------------

export function generateStrengths(dims: CoreDimensions): string[] {
  const strengths: string[] = [];
  const entries = DIMENSION_KEYS.map((k) => ({
    key: k,
    value: dims[k],
  })).sort((a, b) => b.value - a.value);

  const topTwo = entries.slice(0, 2);

  const strengthDescriptions: Record<DimKey, string> = {
    R: "Comfortable with market volatility -- you see drawdowns as opportunities, not threats",
    C: "Strong decision-making autonomy -- you trust your own analysis and aren't swayed by noise",
    H: "Natural long-term thinker -- you let compounding work and don't chase short-term results",
    D: "Disciplined execution -- you follow your rules and systems consistently",
    E: "Emotionally regulated -- market swings don't trigger impulsive decisions",
  };

  for (const entry of topTwo) {
    if (entry.value >= 50) {
      strengths.push(strengthDescriptions[entry.key]);
    }
  }

  if (strengths.length === 0) {
    strengths.push("Self-awareness -- taking this assessment shows you want to improve your approach");
  }

  return strengths;
}

export function generateVulnerabilities(
  dims: CoreDimensions,
  biasFlags: BiasFlag[]
): string[] {
  const vulnerabilities: string[] = [];
  const entries = DIMENSION_KEYS.map((k) => ({
    key: k,
    value: dims[k],
  })).sort((a, b) => a.value - b.value);

  const bottomTwo = entries.slice(0, 2);

  const vulnDescriptions: Record<DimKey, string> = {
    R: "Loss sensitivity may cause you to exit positions prematurely during normal volatility",
    C: "You may over-rely on others' opinions, making you susceptible to conflicting advice",
    H: "Short-term focus can lead to missed compounding gains and excess trading costs",
    D: "Without structured habits, you may struggle to follow through on your investment plan",
    E: "Emotional reactivity during market stress can lead to panic selling or impulsive trades",
  };

  for (const entry of bottomTwo) {
    if (entry.value < 50) {
      vulnerabilities.push(vulnDescriptions[entry.key]);
    }
  }

  // Add top bias as vulnerability if severe
  const topBias = [...biasFlags]
    .filter((f) => f.severity >= 2)
    .sort((a, b) => b.severity - a.severity)[0];

  if (topBias) {
    vulnerabilities.push(`${topBias.label}: ${topBias.behavioral_signature}`);
  }

  if (vulnerabilities.length === 0) {
    vulnerabilities.push("No critical vulnerabilities detected -- stay vigilant against complacency");
  }

  return vulnerabilities;
}

// ---------------------------------------------------------------------------
// 12. Full Profile Computation
// ---------------------------------------------------------------------------

export function computeFullProfile(
  answers: Record<string, number>,
  timings?: Record<string, number>
): DNAProfile {
  const dimensions = computeDimensions(answers);
  const biasFlags = computeBiasFlags(answers);
  const behaviorFlags = extractBehaviorFlags(answers);
  const frictionTriggers = extractFrictionTriggers(answers);
  const aiMemoryNotes = extractAIMemoryNotes(answers);
  const confidence = computeConfidence(answers, timings);
  const marketMood = computeMarketMood(dimensions, behaviorFlags);
  const { primary, secondary } = classifyArchetype(
    dimensions,
    biasFlags,
    behaviorFlags,
    answers
  );
  const triggeredModules = getTriggeredModules(
    dimensions,
    biasFlags,
    confidence,
    behaviorFlags
  );
  const behavioralRule = generateBehavioralRule(dimensions, biasFlags);
  const strengths = generateStrengths(dimensions);
  const vulnerabilities = generateVulnerabilities(dimensions, biasFlags);

  return {
    dimensions,
    confidence,
    biasFlags,
    marketMood,
    communicationArchetype: primary,
    secondaryArchetype: secondary,
    frictionTriggers,
    aiMemoryNotes,
    behaviorFlags,
    triggeredModules,
    behavioralRule,
    strengths,
    vulnerabilities,
  };
}
