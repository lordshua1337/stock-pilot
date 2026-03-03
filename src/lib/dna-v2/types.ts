// Investor Identity v2 -- Forced Choice Triad Type Definitions
// 8 primary factors, 24 sub-factors, ipsative scoring model

// ---------------------------------------------------------------------------
// Factor codes and keys
// ---------------------------------------------------------------------------

export const FACTOR_CODES = [
  "RP", "DS", "CN", "TO", "SI", "ES", "SP", "IP",
] as const;

export type FactorCode = (typeof FACTOR_CODES)[number];

export const SUB_FACTOR_CODES = [
  // Risk Posture
  "RP_LS", "RP_VT", "RP_AC",
  // Decision Speed
  "DS_AT", "DS_RF", "DS_OR",
  // Control Need
  "CN_DC", "CN_AR", "CN_TC",
  // Time Orientation
  "TO_PD", "TO_CA", "TO_GC",
  // Social Influence
  "SI_PS", "SI_TR", "SI_CC",
  // Emotional Steadiness
  "ES_SR", "ES_RS", "ES_IC",
  // Structure Preference
  "SP_RA", "SP_PD", "SP_RD",
  // Information Processing
  "IP_DA", "IP_NN", "IP_SD",
] as const;

export type SubFactorCode = (typeof SUB_FACTOR_CODES)[number];

// ---------------------------------------------------------------------------
// Factor pole -- which end of the spectrum an item measures
// ---------------------------------------------------------------------------

export type FactorPole = "high" | "low";

// ---------------------------------------------------------------------------
// Triad item -- a single word/phrase inside a triad
// ---------------------------------------------------------------------------

export interface TriadItem {
  readonly id: string;                // e.g. "T01_A"
  readonly text: string;              // the word or short phrase shown to the user
  readonly factor: FactorCode;        // which primary factor this item measures
  readonly pole: FactorPole;          // which end of the spectrum
  readonly subFactor?: SubFactorCode; // optional sub-factor granularity
  readonly desirability: number;      // 1-5 social desirability rating (for SDI)
}

// ---------------------------------------------------------------------------
// Triad -- a group of 3 items the participant must rank
// ---------------------------------------------------------------------------

export interface Triad {
  readonly id: string;                // e.g. "T01"
  readonly items: readonly [TriadItem, TriadItem, TriadItem];
  readonly contradictionPairId?: string; // ID of another triad that tests consistency
}

// ---------------------------------------------------------------------------
// Response -- what the participant chose for one triad
// ---------------------------------------------------------------------------

export interface TriadResponse {
  readonly triadId: string;
  readonly mostLikeMe: string;    // item ID chosen as "most like me"
  readonly leastLikeMe: string;   // item ID chosen as "least like me"
  readonly startTime: number;     // timestamp when triad was shown
  readonly endTime: number;       // timestamp when both selections were made
}

// ---------------------------------------------------------------------------
// Scoring types
// ---------------------------------------------------------------------------

export interface FactorScore {
  readonly code: FactorCode;
  readonly raw: number;           // accumulated raw score from ipsative scoring
  readonly normalized: number;    // 0-100 normalized score
  readonly appearances: number;   // how many triads included this factor
  readonly confidence: number;    // 0-100 per-factor confidence
}

export interface SubFactorScore {
  readonly code: SubFactorCode;
  readonly parentFactor: FactorCode;
  readonly raw: number;
  readonly normalized: number;
  readonly appearances: number;
}

export interface FactorScores {
  readonly primary: Record<FactorCode, FactorScore>;
  readonly sub: Record<SubFactorCode, SubFactorScore>;
}

// ---------------------------------------------------------------------------
// Social Desirability Index
// ---------------------------------------------------------------------------

export interface SocialDesirabilityIndex {
  readonly score: number;          // 0-100 (higher = more "performing")
  readonly flagged: boolean;       // true if above threshold
  readonly highDesirabilityCount: number; // how many "most" picks were the highest-desirability item
  readonly totalTriads: number;
}

// ---------------------------------------------------------------------------
// Contradiction detection
// ---------------------------------------------------------------------------

export interface ContradictionFlag {
  readonly triadA: string;         // first triad ID
  readonly triadB: string;         // paired triad ID
  readonly factor: FactorCode;     // the factor being contradicted
  readonly description: string;    // human-readable explanation
}

// ---------------------------------------------------------------------------
// Confidence scores
// ---------------------------------------------------------------------------

export interface ConfidenceScoresV2 {
  readonly overall: number;
  readonly perFactor: Record<FactorCode, number>;
  readonly socialDesirability: SocialDesirabilityIndex;
  readonly contradictions: readonly ContradictionFlag[];
  readonly rapidCompletion: boolean;
}

// ---------------------------------------------------------------------------
// Bias types (kept from V1, detection logic changes)
// ---------------------------------------------------------------------------

export type BiasKey =
  | "loss_aversion"
  | "myopic_loss_aversion"
  | "disposition_effect"
  | "anchoring"
  | "regret_avoidance"
  | "overconfidence"
  | "recency_bias"
  | "herding"
  | "fomo"
  | "confirmation_bias"
  | "inertia"
  | "mental_accounting"
  | "sunk_cost"
  | "availability_heuristic"
  | "present_bias"
  | "narrative_bias";

export interface BiasFlag {
  readonly bias: BiasKey;
  readonly severity: number;            // 0-3
  readonly label: string;
  readonly behavioralSignature: string;
  readonly factorEvidence: string;      // which factor combo triggered it
}

// ---------------------------------------------------------------------------
// Market mood (kept from V1)
// ---------------------------------------------------------------------------

export type MarketMoodState =
  | "panicked"
  | "reactive"
  | "euphoric"
  | "concerned"
  | "steady";

export interface MarketMood {
  readonly state: MarketMoodState;
  readonly panicProbability: number;
  readonly fomoProbability: number;
  readonly impulseTradeProbability: number;
  readonly reassuranceDependency: number;
}

// ---------------------------------------------------------------------------
// Archetype (kept from V1, classification logic changes)
// ---------------------------------------------------------------------------

export type ArchetypeKey =
  | "systems_builder"
  | "reassurance_seeker"
  | "analytical_skeptic"
  | "diy_controller"
  | "collaborative_partner"
  | "big_picture_optimist"
  | "trend_sensitive_explorer"
  | "avoider_under_stress"
  | "action_first_decider"
  | "values_anchored_steward";

export interface ArchetypeResult {
  readonly primary: ArchetypeKey;
  readonly secondary: ArchetypeKey | null;
  readonly scores: Record<ArchetypeKey, number>;
}

// ---------------------------------------------------------------------------
// Friction triggers (kept from V1)
// ---------------------------------------------------------------------------

export type FrictionTrigger =
  | "loss_headlines"
  | "authority_conflict"
  | "peer_comparison"
  | "time_pressure"
  | "complexity_overload";

// ---------------------------------------------------------------------------
// Behavior flags (kept from V1, derived differently)
// ---------------------------------------------------------------------------

export interface BehaviorFlags {
  readonly checksOften: boolean;
  readonly panicSellTendency: boolean;
  readonly trendChase: boolean;
  readonly missingGainsStress: boolean;
  readonly avoidancePattern: boolean;
}

// ---------------------------------------------------------------------------
// Micro-module triggers (kept from V1)
// ---------------------------------------------------------------------------

export type MicroModuleKey =
  | "volatility_coping"
  | "plan_discipline"
  | "delegation_trust"
  | "bias_deep_dive"
  | "goal_clarity";

// ---------------------------------------------------------------------------
// Full V2 Profile -- the master output
// ---------------------------------------------------------------------------

export interface DNAProfileV2 {
  readonly version: 2;
  readonly factors: FactorScores;
  readonly confidence: ConfidenceScoresV2;
  readonly biasFlags: readonly BiasFlag[];
  readonly marketMood: MarketMood;
  readonly archetype: ArchetypeResult;
  readonly frictionTriggers: readonly FrictionTrigger[];
  readonly behaviorFlags: BehaviorFlags;
  readonly triggeredModules: readonly MicroModuleKey[];
  readonly behavioralRule: string;
  readonly strengths: readonly string[];
  readonly vulnerabilities: readonly string[];
  readonly completionTime: number;    // total ms to complete assessment
  readonly triadCount: number;        // how many triads were presented
  readonly timestamp: number;         // when the assessment was completed
}

// ---------------------------------------------------------------------------
// Response collection (what gets stored during the quiz)
// ---------------------------------------------------------------------------

export interface AssessmentSession {
  readonly responses: readonly TriadResponse[];
  readonly startedAt: number;
  readonly completedAt?: number;
}
