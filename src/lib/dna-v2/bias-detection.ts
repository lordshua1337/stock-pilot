import type {
  FactorCode, FactorScore, BiasKey, BiasFlag, MarketMood, MarketMoodState,
  BehaviorFlags, FrictionTrigger,
} from "./types";
import { FACTOR_CODES } from "./types";

// Bias detection rules: factor combinations that trigger each bias
interface BiasRule {
  readonly factorConditions: Array<{ factor: FactorCode; threshold: number; direction: "below" | "above" }>;
  readonly label: string;
  readonly behavioralSignature: string;
}

export const BIAS_RULES: Record<BiasKey, BiasRule> = {
  loss_aversion: {
    factorConditions: [
      { factor: "RP", threshold: 35, direction: "below" },
      { factor: "ES", threshold: 40, direction: "below" },
      { factor: "TO", threshold: 45, direction: "below" },
    ],
    label: "Loss Aversion",
    behavioralSignature:
      "Excessive focus on avoiding losses rather than pursuing gains. Holds losing positions longer than winning positions. Avoids necessary risk-taking.",
  },

  fomo: {
    factorConditions: [
      { factor: "SI", threshold: 65, direction: "above" },
      { factor: "DS", threshold: 60, direction: "above" },
      { factor: "ES", threshold: 45, direction: "below" },
    ],
    label: "Fear of Missing Out",
    behavioralSignature:
      "Chases trending investments out of anxiety about missing gains. Acts impulsively on tips and social pressure. Struggles with sitting on cash.",
  },

  overconfidence: {
    factorConditions: [
      { factor: "CN", threshold: 70, direction: "above" },
      { factor: "RP", threshold: 65, direction: "above" },
      { factor: "IP", threshold: 40, direction: "below" },
    ],
    label: "Overconfidence",
    behavioralSignature:
      "Overestimates investment skill and predictive ability. Trades too frequently and takes excessive concentration risk. Dismisses contrary evidence.",
  },

  herding: {
    factorConditions: [
      { factor: "SI", threshold: 65, direction: "above" },
      { factor: "CN", threshold: 40, direction: "below" },
      { factor: "IP", threshold: 45, direction: "below" },
    ],
    label: "Herding",
    behavioralSignature:
      "Follows the crowd into and out of investments. Adopts consensus views without independent analysis. Panics when majority sentiment shifts.",
  },

  anchoring: {
    factorConditions: [
      { factor: "SP", threshold: 60, direction: "above" },
      { factor: "DS", threshold: 40, direction: "below" },
      { factor: "TO", threshold: 45, direction: "below" },
    ],
    label: "Anchoring",
    behavioralSignature:
      "Relies on historical price levels to make decisions. Reluctant to exit positions at losses. Sets rigid price targets and holds regardless of conditions.",
  },

  disposition_effect: {
    factorConditions: [
      { factor: "RP", threshold: 40, direction: "below" },
      { factor: "ES", threshold: 40, direction: "below" },
      { factor: "SP", threshold: 40, direction: "below" },
    ],
    label: "Disposition Effect",
    behavioralSignature:
      "Sells winners too quickly and holds losers too long. Driven by discomfort with unrealized losses. Misses compounding opportunities.",
  },

  present_bias: {
    factorConditions: [
      { factor: "TO", threshold: 35, direction: "below" },
      { factor: "DS", threshold: 55, direction: "above" },
      { factor: "SP", threshold: 45, direction: "below" },
    ],
    label: "Present Bias",
    behavioralSignature:
      "Prioritizes immediate results over long-term wealth building. Skips necessary planning. Changes strategies due to short-term noise.",
  },

  confirmation_bias: {
    factorConditions: [
      { factor: "IP", threshold: 40, direction: "below" },
      { factor: "CN", threshold: 60, direction: "above" },
      { factor: "SI", threshold: 40, direction: "below" },
    ],
    label: "Confirmation Bias",
    behavioralSignature:
      "Seeks information that confirms existing views, avoids contradictory evidence. Rationalizes failed bets. Resistant to changing positions.",
  },

  inertia: {
    factorConditions: [
      { factor: "DS", threshold: 35, direction: "below" },
      { factor: "SP", threshold: 40, direction: "below" },
      { factor: "ES", threshold: 45, direction: "below" },
    ],
    label: "Inertia",
    behavioralSignature:
      "Fails to rebalance or update portfolio despite changed circumstances. Procrastinates on necessary adjustments. Remains in default positions.",
  },

  regret_avoidance: {
    factorConditions: [
      { factor: "ES", threshold: 40, direction: "below" },
      { factor: "DS", threshold: 40, direction: "below" },
      { factor: "RP", threshold: 45, direction: "below" },
    ],
    label: "Regret Avoidance",
    behavioralSignature:
      "Fear of wrong decisions leads to paralysis or excessive consensus-seeking. Blames external factors when positions underperform. Avoids accountability.",
  },

  recency_bias: {
    factorConditions: [
      { factor: "DS", threshold: 60, direction: "above" },
      { factor: "IP", threshold: 40, direction: "below" },
      { factor: "TO", threshold: 45, direction: "below" },
    ],
    label: "Recency Bias",
    behavioralSignature:
      "Overweights recent market moves when forecasting future performance. Buys after big gains, sells after declines. Extrapolates trends.",
  },

  sunk_cost: {
    factorConditions: [
      { factor: "RP", threshold: 40, direction: "below" },
      { factor: "SP", threshold: 55, direction: "above" },
      { factor: "TO", threshold: 45, direction: "below" },
    ],
    label: "Sunk Cost Fallacy",
    behavioralSignature:
      "Holds losing positions to recover past losses rather than cut losses. Adds to losers despite deteriorating fundamentals. Blames temporary setbacks.",
  },

  mental_accounting: {
    factorConditions: [
      { factor: "IP", threshold: 40, direction: "below" },
      { factor: "SP", threshold: 40, direction: "below" },
      { factor: "TO", threshold: 45, direction: "below" },
    ],
    label: "Mental Accounting",
    behavioralSignature:
      "Treats different accounts or goals with inconsistent logic. Uses separate standards for decisions. Separates portfolio decisions arbitrarily.",
  },

  narrative_bias: {
    factorConditions: [
      { factor: "IP", threshold: 35, direction: "below" },
      { factor: "SI", threshold: 55, direction: "above" },
      { factor: "DS", threshold: 55, direction: "above" },
    ],
    label: "Narrative Bias",
    behavioralSignature:
      "Makes decisions based on compelling stories rather than data. Prefers simple explanations over nuanced analysis. Susceptible to persuasive pitches.",
  },

  myopic_loss_aversion: {
    factorConditions: [
      { factor: "RP", threshold: 35, direction: "below" },
      { factor: "TO", threshold: 35, direction: "below" },
      { factor: "ES", threshold: 40, direction: "below" },
    ],
    label: "Myopic Loss Aversion",
    behavioralSignature:
      "Excessive reaction to short-term losses combined with short time horizon. Portfolio monitoring creates false sense of urgency. Takes excessive defensive action.",
  },

  availability_heuristic: {
    factorConditions: [
      { factor: "IP", threshold: 40, direction: "below" },
      { factor: "DS", threshold: 55, direction: "above" },
      { factor: "SI", threshold: 55, direction: "above" },
    ],
    label: "Availability Heuristic",
    behavioralSignature:
      "Overweights easily recalled recent events or popular companies. Invests based on media coverage rather than fundamentals. Creates concentrated bets.",
  },
};

// Helper: Check if a factor value meets a condition
function meetsCondition(
  factorValue: number,
  threshold: number,
  direction: "below" | "above"
): boolean {
  if (direction === "below") {
    return factorValue < threshold;
  } else {
    return factorValue > threshold;
  }
}

// Helper: Calculate severity based on how many conditions are met
function calculateSeverity(
  factors: Record<FactorCode, FactorScore>,
  conditions: BiasRule["factorConditions"]
): number {
  const metCount = conditions.filter(cond =>
    meetsCondition(factors[cond.factor].normalized, cond.threshold, cond.direction)
  ).length;

  const totalCount = conditions.length;

  // Check if barely missing (within 5 points of threshold)
  const barelyMissing = conditions.some(cond => {
    const value = factors[cond.factor].normalized;
    const threshold = cond.threshold;
    const distance = cond.direction === "below"
      ? threshold - value
      : value - threshold;
    return distance >= 0 && distance <= 5 && !meetsCondition(value, threshold, cond.direction);
  });

  if (metCount === totalCount) {
    return 3; // All conditions met
  } else if (metCount >= totalCount - 1) {
    return 2; // 2 of 3 conditions met
  } else if (barelyMissing) {
    return 1; // Barely missing
  } else {
    return 0; // Not triggered
  }
}

export function detectBiases(factors: Record<FactorCode, FactorScore>): readonly BiasFlag[] {
  const flags: BiasFlag[] = [];

  for (const [biasKey, rule] of Object.entries(BIAS_RULES)) {
    const severity = calculateSeverity(factors, rule.factorConditions);

    if (severity > 0) {
      const factorEvidence = rule.factorConditions
        .map(cond => `${cond.factor}=${factors[cond.factor].normalized.toFixed(0)}`)
        .join(", ");

      flags.push({
        bias: biasKey as BiasKey,
        severity,
        label: rule.label,
        behavioralSignature: rule.behavioralSignature,
        factorEvidence,
      });
    }
  }

  return flags;
}

export function computeMarketMood(factors: Record<FactorCode, FactorScore>): MarketMood {
  // Sigmoid model using 8 factors
  const rp = factors.RP.normalized;
  const ds = factors.DS.normalized;
  const cn = factors.CN.normalized;
  const to = factors.TO.normalized;
  const si = factors.SI.normalized;
  const es = factors.ES.normalized;
  const sp = factors.SP.normalized;
  const ip = factors.IP.normalized;

  // Panic probability: low ES + low RP + low SP (defensive mindset)
  const panicScore = (40 - es) / 40 + (40 - rp) / 40 + (40 - sp) / 40;
  const panicProbability = Math.min(1, Math.max(0, panicScore / 3));

  // FOMO probability: high SI + high DS + low TO (chasing, impatient, social)
  const fomoScore = (si - 35) / 65 + (ds - 35) / 65 + (45 - to) / 45;
  const fomoProbability = Math.min(1, Math.max(0, fomoScore / 3));

  // Impulse trade probability: high DS + low SP + low ES (reactive, unstructured, emotional)
  const impulseScore = (ds - 35) / 65 + (40 - sp) / 40 + (40 - es) / 40;
  const impulseTradeProbability = Math.min(1, Math.max(0, impulseScore / 3));

  // Reassurance dependency: low CN + high SI + low ES (wants guidance, social, anxious)
  const reassuranceScore = (40 - cn) / 40 + (si - 35) / 65 + (40 - es) / 40;
  const reassuranceDependency = Math.min(1, Math.max(0, reassuranceScore / 3));

  // Determine state based on probabilities
  let state: MarketMoodState = "steady";
  if (panicProbability >= 0.7) {
    state = "panicked";
  } else if (fomoProbability >= 0.7) {
    state = "euphoric";
  } else if (panicProbability >= 0.45) {
    state = "reactive";
  } else if (reassuranceDependency >= 0.35) {
    state = "concerned";
  }

  return {
    state,
    panicProbability,
    fomoProbability,
    impulseTradeProbability,
    reassuranceDependency,
  };
}

export function extractBehaviorFlags(factors: Record<FactorCode, FactorScore>): BehaviorFlags {
  const es = factors.ES.normalized;
  const rp = factors.RP.normalized;
  const sp = factors.SP.normalized;
  const ds = factors.DS.normalized;
  const si = factors.SI.normalized;
  const ip = factors.IP.normalized;

  return {
    checksOften: es < 35,
    panicSellTendency: rp < 30 && es < 35,
    trendChase: si > 70 && ds > 60,
    missingGainsStress: si > 55 && rp > 50 && es < 45,
    avoidancePattern: ds < 30 && es < 40,
  };
}

export function extractFrictionTriggers(
  factors: Record<FactorCode, FactorScore>,
  biases: readonly BiasFlag[]
): readonly FrictionTrigger[] {
  const triggers: FrictionTrigger[] = [];
  const rp = factors.RP.normalized;
  const es = factors.ES.normalized;
  const cn = factors.CN.normalized;
  const si = factors.SI.normalized;
  const ds = factors.DS.normalized;
  const sp = factors.SP.normalized;
  const ip = factors.IP.normalized;

  // loss_headlines: triggered by low RP or low ES
  if (rp < 40 || es < 40) {
    triggers.push("loss_headlines");
  }

  // authority_conflict: triggered by high CN
  if (cn > 70) {
    triggers.push("authority_conflict");
  }

  // peer_comparison: triggered by high SI
  if (si > 60) {
    triggers.push("peer_comparison");
  }

  // time_pressure: triggered by high DS and low SP
  if (ds > 65 && sp < 40) {
    triggers.push("time_pressure");
  }

  // complexity_overload: triggered by low IP and low SP
  if (ip < 35 && sp < 40) {
    triggers.push("complexity_overload");
  }

  return triggers;
}
