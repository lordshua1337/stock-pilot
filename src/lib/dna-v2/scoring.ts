import type {
  FactorCode, SubFactorCode, FactorScore, SubFactorScore, FactorScores,
  TriadResponse, SocialDesirabilityIndex, ContradictionFlag, ConfidenceScoresV2,
} from "./types";
import { FACTOR_CODES, SUB_FACTOR_CODES } from "./types";
import { TRIADS, TRIAD_MAP, CONTRADICTION_PAIRS, getFactorAppearances } from "./triads";

// Constants for scoring calculation
const MOST_LIKE_WEIGHT = 2;
const LEAST_LIKE_WEIGHT = -1;

// Constants for normalization
const SDI_THRESHOLD = 70;
const RAPID_COMPLETION_MS = 5000; // 5 seconds per triad
const CONFIDENCE_PENALTY_RAPID = 15;
const CONFIDENCE_PENALTY_SDI = 20;
const CONFIDENCE_PENALTY_CONTRADICTION = 10;

// Helper: Get the triad for a given ID
function getTriad(triadId: string) {
  return TRIAD_MAP[triadId];
}

// Helper: Find an item by ID across all triads
function findItem(itemId: string) {
  for (const triad of TRIADS) {
    for (const item of triad.items) {
      if (item.id === itemId) {
        return item;
      }
    }
  }
  return undefined;
}

// Helper: Apply score to a factor, respecting pole direction
function applyScore(
  baseScore: number,
  weight: number,
  pole: "high" | "low"
): number {
  // For high pole: +2 adds to score, -1 subtracts
  // For low pole: +2 subtracts from score, -1 adds (inverted logic)
  if (pole === "high") {
    return baseScore + weight;
  } else {
    return baseScore - weight;
  }
}

// Initialize raw scores for all factors and sub-factors
function initializeScores() {
  const factorScores: Record<FactorCode, number> = {
    RP: 0, DS: 0, CN: 0, TO: 0, SI: 0, ES: 0, SP: 0, IP: 0,
  };
  const subFactorScores: Record<SubFactorCode, number> = {} as Record<SubFactorCode, number>;
  for (const code of SUB_FACTOR_CODES) {
    subFactorScores[code] = 0;
  }
  return { factorScores, subFactorScores };
}

// Process responses to accumulate raw scores
function accumulateScores(responses: readonly TriadResponse[]) {
  const { factorScores, subFactorScores } = initializeScores();

  for (const response of responses) {
    const triad = getTriad(response.triadId);
    if (!triad) continue;

    const mostItem = findItem(response.mostLikeMe);
    const leastItem = findItem(response.leastLikeMe);

    if (mostItem) {
      factorScores[mostItem.factor] = applyScore(
        factorScores[mostItem.factor],
        MOST_LIKE_WEIGHT,
        mostItem.pole
      );
      if (mostItem.subFactor) {
        subFactorScores[mostItem.subFactor] = applyScore(
          subFactorScores[mostItem.subFactor],
          MOST_LIKE_WEIGHT,
          mostItem.pole
        );
      }
    }

    if (leastItem) {
      factorScores[leastItem.factor] = applyScore(
        factorScores[leastItem.factor],
        LEAST_LIKE_WEIGHT,
        leastItem.pole
      );
      if (leastItem.subFactor) {
        subFactorScores[leastItem.subFactor] = applyScore(
          subFactorScores[leastItem.subFactor],
          LEAST_LIKE_WEIGHT,
          leastItem.pole
        );
      }
    }
  }

  return { factorScores, subFactorScores };
}

// Normalize a raw score to 0-100 based on theoretical min/max
function normalizeScore(rawScore: number, appearances: number): number {
  // Theoretical min: all "least like me" (-1 per appearance)
  // Theoretical max: all "most like me" (+2 per appearance)
  const theoreticalMin = -1 * appearances;
  const theoreticalMax = 2 * appearances;
  const range = theoreticalMax - theoreticalMin;

  if (range === 0) return 50; // Shouldn't happen with valid data

  // Normalize: 0 = theoreticalMin, 100 = theoreticalMax
  const normalized = ((rawScore - theoreticalMin) / range) * 100;
  return Math.max(0, Math.min(100, normalized));
}

// Count factor appearances in the triad set
function countFactorAppearances(responses: readonly TriadResponse[]): Record<FactorCode, number> {
  const appearances: Record<FactorCode, number> = {
    RP: 0, DS: 0, CN: 0, TO: 0, SI: 0, ES: 0, SP: 0, IP: 0,
  };

  const seenTriads = new Set<string>();
  for (const response of responses) {
    if (!seenTriads.has(response.triadId)) {
      seenTriads.add(response.triadId);
      const triad = getTriad(response.triadId);
      if (triad) {
        for (const item of triad.items) {
          appearances[item.factor]++;
        }
      }
    }
  }

  return appearances;
}

// Count sub-factor appearances
function countSubFactorAppearances(responses: readonly TriadResponse[]): Record<SubFactorCode, number> {
  const appearances: Record<SubFactorCode, number> = {} as Record<SubFactorCode, number>;
  for (const code of SUB_FACTOR_CODES) {
    appearances[code] = 0;
  }

  const seenTriads = new Set<string>();
  for (const response of responses) {
    if (!seenTriads.has(response.triadId)) {
      seenTriads.add(response.triadId);
      const triad = getTriad(response.triadId);
      if (triad) {
        for (const item of triad.items) {
          if (item.subFactor) {
            appearances[item.subFactor]++;
          }
        }
      }
    }
  }

  return appearances;
}

export function computeFactorScores(responses: readonly TriadResponse[]): FactorScores {
  const { factorScores: rawFactors, subFactorScores: rawSubFactors } = accumulateScores(responses);
  const factorAppearances = countFactorAppearances(responses);
  const subFactorAppearances = countSubFactorAppearances(responses);

  const primary: Record<FactorCode, FactorScore> = {} as Record<FactorCode, FactorScore>;
  for (const code of FACTOR_CODES) {
    const appearances = factorAppearances[code];
    const raw = rawFactors[code];
    primary[code] = {
      code,
      raw,
      normalized: normalizeScore(raw, appearances),
      appearances,
      confidence: 0, // Set later in confidence calculation
    };
  }

  const sub: Record<SubFactorCode, SubFactorScore> = {} as Record<SubFactorCode, SubFactorScore>;
  for (const code of SUB_FACTOR_CODES) {
    const parentFactor = code.split("_")[0] as FactorCode;
    const appearances = subFactorAppearances[code];
    const raw = rawSubFactors[code];
    sub[code] = {
      code,
      parentFactor,
      raw,
      normalized: appearances > 0 ? normalizeScore(raw, appearances) : 50,
      appearances,
    };
  }

  return { primary, sub };
}

export function computeSocialDesirabilityIndex(
  responses: readonly TriadResponse[]
): SocialDesirabilityIndex {
  let highDesirabilityCount = 0;

  for (const response of responses) {
    const triad = getTriad(response.triadId);
    if (!triad) continue;

    // Find which item has the highest desirability
    let maxDesirability = -Infinity;
    let maxItem = triad.items[0];
    for (const item of triad.items) {
      if (item.desirability > maxDesirability) {
        maxDesirability = item.desirability;
        maxItem = item;
      }
    }

    // Check if the participant chose the highest-desirability item as "most"
    if (response.mostLikeMe === maxItem.id) {
      highDesirabilityCount++;
    }
  }

  const totalTriads = responses.length;
  const score = totalTriads > 0 ? (highDesirabilityCount / totalTriads) * 100 : 0;

  return {
    score,
    flagged: score > SDI_THRESHOLD,
    highDesirabilityCount,
    totalTriads,
  };
}

export function detectContradictions(
  responses: readonly TriadResponse[]
): readonly ContradictionFlag[] {
  const { factorScores: rawFactors } = accumulateScores(responses);
  const flags: ContradictionFlag[] = [];

  for (const [triadAId, triadBId] of CONTRADICTION_PAIRS) {
    const triadA = getTriad(triadAId);
    const triadB = getTriad(triadBId);
    if (!triadA || !triadB) continue;

    // Find which factor is shared by both triads
    const factorsA = new Set(triadA.items.map(i => i.factor));
    const factorsB = new Set(triadB.items.map(i => i.factor));
    const sharedFactors = Array.from(factorsA).filter(f => factorsB.has(f));

    for (const factor of sharedFactors) {
      const responseA = responses.find(r => r.triadId === triadAId);
      const responseB = responses.find(r => r.triadId === triadBId);

      if (!responseA || !responseB) continue;

      // Get the items for this factor in each triad
      const itemsA = triadA.items.filter(i => i.factor === factor);
      const itemsB = triadB.items.filter(i => i.factor === factor);

      if (itemsA.length === 0 || itemsB.length === 0) continue;

      // Determine direction of triadA response
      const mostA = findItem(responseA.mostLikeMe);
      const leastA = findItem(responseA.leastLikeMe);
      let directionA = 0;
      if (mostA && mostA.factor === factor) {
        directionA = mostA.pole === "high" ? 1 : -1;
      } else if (leastA && leastA.factor === factor) {
        directionA = leastA.pole === "high" ? -1 : 1;
      }

      // Determine direction of triadB response
      const mostB = findItem(responseB.mostLikeMe);
      const leastB = findItem(responseB.leastLikeMe);
      let directionB = 0;
      if (mostB && mostB.factor === factor) {
        directionB = mostB.pole === "high" ? 1 : -1;
      } else if (leastB && leastB.factor === factor) {
        directionB = leastB.pole === "high" ? -1 : 1;
      }

      // Flag if directions are opposite
      if (directionA !== 0 && directionB !== 0 && directionA !== directionB) {
        flags.push({
          triadA: triadAId,
          triadB: triadBId,
          factor,
          description: `Contradictory responses on ${factor}: ${triadAId} pushes ${directionA > 0 ? "high" : "low"}, ${triadBId} pushes ${directionB > 0 ? "high" : "low"}`,
        });
      }
    }
  }

  return flags;
}

export function computeResponseStats(responses: readonly TriadResponse[]): {
  avgTime: number;
  totalTime: number;
  rapidCount: number;
} {
  if (responses.length === 0) {
    return { avgTime: 0, totalTime: 0, rapidCount: 0 };
  }

  let totalTime = 0;
  let rapidCount = 0;

  for (const response of responses) {
    const duration = response.endTime - response.startTime;
    totalTime += duration;
    if (duration < RAPID_COMPLETION_MS) {
      rapidCount++;
    }
  }

  const avgTime = totalTime / responses.length;

  return { avgTime, totalTime, rapidCount };
}

export function computeConfidence(responses: readonly TriadResponse[]): ConfidenceScoresV2 {
  const factors = computeFactorScores(responses);
  const sdi = computeSocialDesirabilityIndex(responses);
  const contradictions = detectContradictions(responses);
  const stats = computeResponseStats(responses);

  let overallConfidence = 100;

  // Penalty for rapid completion
  if (stats.avgTime < RAPID_COMPLETION_MS) {
    overallConfidence -= CONFIDENCE_PENALTY_RAPID;
  }

  // Penalty for high SDI
  if (sdi.flagged) {
    overallConfidence -= CONFIDENCE_PENALTY_SDI;
  }

  // Penalty for contradictions
  overallConfidence -= contradictions.length * CONFIDENCE_PENALTY_CONTRADICTION;

  // Per-factor confidence based on variance
  const perFactor: Record<FactorCode, number> = {} as Record<FactorCode, number>;
  for (const code of FACTOR_CODES) {
    let confidence = 100;

    const factor = factors.primary[code];

    // Penalty based on factor's sub-factor variance
    const subFactorCodes = SUB_FACTOR_CODES.filter(
      sf => sf.startsWith(code)
    ) as SubFactorCode[];

    if (subFactorCodes.length > 0) {
      const subFactorScores = subFactorCodes.map(sf => factors.sub[sf].normalized);
      const mean = subFactorScores.reduce((a, b) => a + b, 0) / subFactorScores.length;
      const variance =
        subFactorScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
        subFactorScores.length;
      const stdDev = Math.sqrt(variance);

      // High variance = low confidence
      confidence -= Math.min(30, stdDev * 0.5);
    }

    // Penalty if factor appears rarely
    if (factor.appearances < 3) {
      confidence -= (3 - factor.appearances) * 10;
    }

    perFactor[code] = Math.max(0, Math.min(100, confidence));
  }

  // Apply per-factor confidence to overall
  const avgFactorConfidence =
    Object.values(perFactor).reduce((a, b) => a + b, 0) / FACTOR_CODES.length;
  overallConfidence = (overallConfidence + avgFactorConfidence) / 2;

  return {
    overall: Math.max(0, Math.min(100, overallConfidence)),
    perFactor,
    socialDesirability: sdi,
    contradictions,
    rapidCompletion: stats.avgTime < RAPID_COMPLETION_MS,
  };
}
