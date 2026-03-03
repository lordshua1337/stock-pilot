// Investor Identity v2 -- Factor and Sub-Factor Definitions
// 8 primary behavioral factors + 24 sub-factors (3 per primary)

import type { FactorCode, SubFactorCode } from "./types";

// ---------------------------------------------------------------------------
// Primary factor definition
// ---------------------------------------------------------------------------

export interface FactorDefinition {
  readonly code: FactorCode;
  readonly name: string;
  readonly lowLabel: string;         // label for the low end (0)
  readonly highLabel: string;        // label for the high end (100)
  readonly description: string;      // what this factor measures
  readonly lowDescription: string;   // what a low score means
  readonly highDescription: string;  // what a high score means
}

// ---------------------------------------------------------------------------
// Sub-factor definition
// ---------------------------------------------------------------------------

export interface SubFactorDefinition {
  readonly code: SubFactorCode;
  readonly parentFactor: FactorCode;
  readonly name: string;
  readonly description: string;
}

// ---------------------------------------------------------------------------
// 8 Primary Factors
// ---------------------------------------------------------------------------

export const PRIMARY_FACTORS: readonly FactorDefinition[] = [
  {
    code: "RP",
    name: "Risk Posture",
    lowLabel: "Protective",
    highLabel: "Aggressive",
    description:
      "Volatility comfort, loss tolerance, and ability to handle ambiguity in financial decisions.",
    lowDescription:
      "You prefer stability and predictability. Capital preservation matters more than chasing higher returns. Drawdowns feel threatening, not opportunistic.",
    highDescription:
      "You have a higher tolerance for volatility and uncertainty. You see drawdowns as buying opportunities and are comfortable with portfolio swings.",
  },
  {
    code: "DS",
    name: "Decision Speed",
    lowLabel: "Deliberate",
    highLabel: "Instinctive",
    description:
      "How quickly you pull the trigger on financial decisions, from careful analysis to gut-driven action.",
    lowDescription:
      "You take your time with decisions. You gather data, weigh options, and prefer to be thorough rather than fast. Analysis paralysis is a risk.",
    highDescription:
      "You decide quickly and trust your instincts. Speed feels like an advantage, but you may sometimes act before fully evaluating the risks.",
  },
  {
    code: "CN",
    name: "Control Need",
    lowLabel: "Delegating",
    highLabel: "Commanding",
    description:
      "Your need to personally drive every financial decision versus trusting others to execute on your behalf.",
    lowDescription:
      "You are comfortable delegating decisions. You value expert guidance and prefer clear recommendations over raw data.",
    highDescription:
      "You want to be in the driver's seat. You trust your own judgment and need to be the final decision-maker on everything.",
  },
  {
    code: "TO",
    name: "Time Orientation",
    lowLabel: "Present-focused",
    highLabel: "Future-focused",
    description:
      "Whether you naturally think in near-term results or long-term compounding when making financial decisions.",
    lowDescription:
      "You think in shorter timeframes. Near-term results matter to you, and you want to see progress sooner rather than later.",
    highDescription:
      "You naturally think in decades. Short-term noise does not faze you because you are focused on compounding over time.",
  },
  {
    code: "SI",
    name: "Social Influence",
    lowLabel: "Independent",
    highLabel: "Consensus-driven",
    description:
      "How much the actions, opinions, and trends of others affect your financial decisions.",
    lowDescription:
      "You make decisions independently. Social proof, trending tickers, and peer behavior have little influence on your choices.",
    highDescription:
      "You pay attention to what others are doing. Market momentum, social signals, and peer behavior significantly influence your decisions.",
  },
  {
    code: "ES",
    name: "Emotional Steadiness",
    lowLabel: "Reactive",
    highLabel: "Composed",
    description:
      "Your stress response and emotional volatility during market turbulence and financial uncertainty.",
    lowDescription:
      "Market movements affect you emotionally. You may check your portfolio more often during volatility and feel strong urges to act.",
    highDescription:
      "You stay calm under pressure. Market swings do not trigger impulsive decisions, and you can separate feelings from actions.",
  },
  {
    code: "SP",
    name: "Structure Preference",
    lowLabel: "Flexible",
    highLabel: "Systematic",
    description:
      "Your need for rules, plans, and routines versus an improvisational approach to investing.",
    lowDescription:
      "You prefer flexibility. Rigid plans feel constraining, and you adjust your approach based on how things feel in the moment.",
    highDescription:
      "You follow rules and systems. When you make a plan, you stick to it. You use automation and scheduled reviews to stay on track.",
  },
  {
    code: "IP",
    name: "Information Processing",
    lowLabel: "Intuitive",
    highLabel: "Analytical",
    description:
      "Whether you rely on gut feel and narratives versus data and numbers when evaluating investments.",
    lowDescription:
      "You trust your instincts and respond to stories. Compelling narratives about companies and sectors drive your decisions more than spreadsheets.",
    highDescription:
      "You are data-driven. You want to see the numbers, the methodology, and the evidence before making any financial decision.",
  },
] as const;

// ---------------------------------------------------------------------------
// Factor lookup map
// ---------------------------------------------------------------------------

export const FACTOR_MAP: Record<FactorCode, FactorDefinition> = Object.fromEntries(
  PRIMARY_FACTORS.map((f) => [f.code, f])
) as Record<FactorCode, FactorDefinition>;

// ---------------------------------------------------------------------------
// 24 Sub-Factors (3 per primary)
// ---------------------------------------------------------------------------

export const SUB_FACTORS: readonly SubFactorDefinition[] = [
  // Risk Posture
  {
    code: "RP_LS",
    parentFactor: "RP",
    name: "Loss Sensitivity",
    description: "How much losses hurt relative to equivalent gains",
  },
  {
    code: "RP_VT",
    parentFactor: "RP",
    name: "Volatility Tolerance",
    description: "Comfort with portfolio value swings over short periods",
  },
  {
    code: "RP_AC",
    parentFactor: "RP",
    name: "Ambiguity Comfort",
    description: "Ability to act with incomplete information and uncertainty",
  },

  // Decision Speed
  {
    code: "DS_AT",
    parentFactor: "DS",
    name: "Analysis Threshold",
    description: "How much data is enough before you feel ready to act",
  },
  {
    code: "DS_RF",
    parentFactor: "DS",
    name: "Reversal Frequency",
    description: "How often you change your mind after making a decision",
  },
  {
    code: "DS_OR",
    parentFactor: "DS",
    name: "Opportunity Responsiveness",
    description: "Speed of reaction to new information or market events",
  },

  // Control Need
  {
    code: "CN_DC",
    parentFactor: "CN",
    name: "Delegation Comfort",
    description: "Willingness to let others execute on your behalf",
  },
  {
    code: "CN_AR",
    parentFactor: "CN",
    name: "Authority Requirement",
    description: "Need to be the final decision-maker in every situation",
  },
  {
    code: "CN_TC",
    parentFactor: "CN",
    name: "Trust Calibration",
    description: "How quickly you trust expert recommendations and guidance",
  },

  // Time Orientation
  {
    code: "TO_PD",
    parentFactor: "TO",
    name: "Patience Under Drawdown",
    description: "Ability to hold through losses without acting impulsively",
  },
  {
    code: "TO_CA",
    parentFactor: "TO",
    name: "Compounding Awareness",
    description: "Understanding and appreciation of time-value dynamics",
  },
  {
    code: "TO_GC",
    parentFactor: "TO",
    name: "Goal Concreteness",
    description: "Specificity and clarity of long-term financial targets",
  },

  // Social Influence
  {
    code: "SI_PS",
    parentFactor: "SI",
    name: "Peer Sensitivity",
    description: "Weight given to what friends, family, and peers are doing",
  },
  {
    code: "SI_TR",
    parentFactor: "SI",
    name: "Trend Responsiveness",
    description: "How much market momentum and trending assets drive decisions",
  },
  {
    code: "SI_CC",
    parentFactor: "SI",
    name: "Contrarian Capacity",
    description: "Ability to go against the consensus when your analysis disagrees",
  },

  // Emotional Steadiness
  {
    code: "ES_SR",
    parentFactor: "ES",
    name: "Stress Reactivity",
    description: "Emotional volatility during market turbulence",
  },
  {
    code: "ES_RS",
    parentFactor: "ES",
    name: "Recovery Speed",
    description: "How fast you return to baseline after a financial shock",
  },
  {
    code: "ES_IC",
    parentFactor: "ES",
    name: "Impulse Control",
    description: "Ability to override emotional urges with logic and rules",
  },

  // Structure Preference
  {
    code: "SP_RA",
    parentFactor: "SP",
    name: "Rule Adherence",
    description: "Consistency of following your own investment rules and systems",
  },
  {
    code: "SP_PD",
    parentFactor: "SP",
    name: "Planning Depth",
    description: "Detail level of your investment strategy and documentation",
  },
  {
    code: "SP_RD",
    parentFactor: "SP",
    name: "Review Discipline",
    description: "Regularity and consistency of portfolio review routines",
  },

  // Information Processing
  {
    code: "IP_DA",
    parentFactor: "IP",
    name: "Data Appetite",
    description: "Volume of information consumed before making decisions",
  },
  {
    code: "IP_NN",
    parentFactor: "IP",
    name: "Narrative vs Numbers",
    description: "Preference for stories and themes versus spreadsheets and metrics",
  },
  {
    code: "IP_SD",
    parentFactor: "IP",
    name: "Source Diversity",
    description: "Breadth of information sources consulted before deciding",
  },
] as const;

// ---------------------------------------------------------------------------
// Sub-factor lookup map
// ---------------------------------------------------------------------------

export const SUB_FACTOR_MAP: Record<SubFactorCode, SubFactorDefinition> =
  Object.fromEntries(
    SUB_FACTORS.map((sf) => [sf.code, sf])
  ) as Record<SubFactorCode, SubFactorDefinition>;

// ---------------------------------------------------------------------------
// Sub-factors grouped by parent
// ---------------------------------------------------------------------------

export function getSubFactorsForFactor(
  factorCode: FactorCode
): readonly SubFactorDefinition[] {
  return SUB_FACTORS.filter((sf) => sf.parentFactor === factorCode);
}

// ---------------------------------------------------------------------------
// V1 dimension mapping (for migration context)
// Maps old 5D keys to approximate V2 factor equivalents
// ---------------------------------------------------------------------------

export const V1_TO_V2_MAPPING: Record<string, FactorCode[]> = {
  R: ["RP"],           // Risk Orientation -> Risk Posture
  C: ["CN"],           // Control vs Delegation -> Control Need
  H: ["TO"],           // Time Horizon -> Time Orientation
  D: ["SP", "DS"],     // Execution Discipline -> Structure Preference + Decision Speed
  E: ["ES"],           // Emotional Regulation -> Emotional Steadiness
} as const;
