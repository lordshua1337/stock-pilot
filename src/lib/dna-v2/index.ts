// Investor Identity v2 -- Public API barrel export and master computation function

// Re-export types
export type {
  FactorCode,
  SubFactorCode,
  FactorPole,
  TriadItem,
  Triad,
  TriadResponse,
  FactorScore,
  SubFactorScore,
  FactorScores,
  SocialDesirabilityIndex,
  ContradictionFlag,
  ConfidenceScoresV2,
  BiasKey,
  BiasFlag,
  MarketMoodState,
  MarketMood,
  ArchetypeKey,
  ArchetypeResult,
  FrictionTrigger,
  BehaviorFlags,
  MicroModuleKey,
  DNAProfileV2,
  AssessmentSession,
} from "./types";

export { FACTOR_CODES, SUB_FACTOR_CODES } from "./types";

// Re-export factors
export type { FactorDefinition, SubFactorDefinition } from "./factors";
export {
  PRIMARY_FACTORS,
  FACTOR_MAP,
  SUB_FACTORS,
  SUB_FACTOR_MAP,
  getSubFactorsForFactor,
  V1_TO_V2_MAPPING,
} from "./factors";

// Re-export triads
export { TRIADS, TRIAD_MAP, CONTRADICTION_PAIRS, getFactorAppearances } from "./triads";

// Re-export scoring functions
export {
  computeFactorScores,
  computeConfidence,
  detectContradictions,
  computeResponseStats,
  computeSocialDesirabilityIndex,
} from "./scoring";

// Re-export bias/mood functions
export {
  detectBiases,
  computeMarketMood,
  extractBehaviorFlags,
  extractFrictionTriggers,
} from "./bias-detection";

// Re-export archetype functions
export {
  ARCHETYPE_INFO,
  classifyArchetype,
  generateBehavioralRule,
  generateStrengths,
  generateVulnerabilities,
} from "./archetypes";

// Re-export storage functions
export type { StoredDNAProfileV2, DNAHistoryEntryV2 } from "./storage";
export {
  saveV2Profile,
  loadV2Profile,
  deleteV2Profile,
  getV2History,
  appendToV2History,
  saveV2AnswersInProgress,
  loadV2AnswersInProgress,
  clearV2AnswersInProgress,
  hasCompletedDNAV2,
  hasV1Profile,
} from "./storage";

// Re-export context functions
export { buildDNAContextV2, buildQuickContextV2 } from "./context";

// ---------------------------------------------------------------------------
// Master computation function
// ---------------------------------------------------------------------------

import type { DNAProfileV2, TriadResponse, FactorCode, FactorScore, MicroModuleKey } from "./types";
import { computeFactorScores, computeConfidence } from "./scoring";
import {
  detectBiases,
  computeMarketMood,
  extractBehaviorFlags,
  extractFrictionTriggers,
} from "./bias-detection";
import {
  classifyArchetype,
  generateBehavioralRule,
  generateStrengths,
  generateVulnerabilities,
} from "./archetypes";
import { TRIADS } from "./triads";

export function computeFullProfileV2(
  responses: readonly TriadResponse[]
): DNAProfileV2 {
  // 1. Compute factor scores (primary + sub-factors)
  const factorScores = computeFactorScores(responses);

  // 2. Compute confidence metrics (SDI, contradictions, timing)
  const confidence = computeConfidence(responses);

  // 3. Detect biases from factor profiles
  const biasFlags = detectBiases(factorScores.primary);

  // 4. Compute market mood
  const marketMood = computeMarketMood(factorScores.primary);

  // 5. Classify archetype
  const archetype = classifyArchetype(factorScores.primary, biasFlags);

  // 6. Extract behavior flags
  const behaviorFlags = extractBehaviorFlags(factorScores.primary);

  // 7. Extract friction triggers
  const frictionTriggers = extractFrictionTriggers(factorScores.primary, biasFlags);

  // 8. Generate behavioral rule
  const behavioralRule = generateBehavioralRule(factorScores.primary, biasFlags);

  // 9. Generate strengths and vulnerabilities
  const strengths = generateStrengths(factorScores.primary);
  const vulnerabilities = generateVulnerabilities(factorScores.primary, biasFlags);

  // 10. Compute triggered modules
  const triggeredModules = computeTriggeredModules(
    factorScores.primary,
    biasFlags,
    behaviorFlags
  );

  // 11. Calculate total completion time from responses
  const completionTime = responses.length > 0
    ? responses[responses.length - 1].endTime - responses[0].startTime
    : 0;

  return {
    version: 2,
    factors: factorScores,
    confidence,
    biasFlags,
    marketMood,
    archetype,
    frictionTriggers,
    behaviorFlags,
    triggeredModules,
    behavioralRule,
    strengths,
    vulnerabilities,
    completionTime,
    triadCount: TRIADS.length,
    timestamp: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Micro-module trigger logic
// ---------------------------------------------------------------------------

function computeTriggeredModules(
  factors: Record<FactorCode, FactorScore>,
  biasFlags: readonly { bias: string; severity: number }[],
  behaviorFlags: { checksOften: boolean; panicSellTendency: boolean }
): readonly MicroModuleKey[] {
  const modules: MicroModuleKey[] = [];

  // volatility_coping: low emotional steadiness or low risk posture
  if (factors.ES.normalized < 40 || factors.RP.normalized < 35) {
    modules.push("volatility_coping");
  }

  // plan_discipline: low structure or very high decision speed (impulsive)
  if (factors.SP.normalized < 45 || factors.DS.normalized > 65) {
    modules.push("plan_discipline");
  }

  // delegation_trust: very high control need or severe herding
  const hasSevereHerding = biasFlags.some(
    (b) => b.bias === "herding" && b.severity >= 2
  );
  if (factors.CN.normalized > 75 || hasSevereHerding) {
    modules.push("delegation_trust");
  }

  // bias_deep_dive: any bias with severity >= 2
  if (biasFlags.some((b) => b.severity >= 2)) {
    modules.push("bias_deep_dive");
  }

  // goal_clarity: low time orientation or high social influence
  if (factors.TO.normalized < 40 || factors.SI.normalized > 70) {
    modules.push("goal_clarity");
  }

  // Deduplicate and cap at 2
  return [...new Set(modules)].slice(0, 2);
}
