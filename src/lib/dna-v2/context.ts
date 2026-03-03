// Investor Identity v2 -- System prompt builder for AI chatbot personalization
// Creates behavioral context that AI uses to tailor stock recommendations

import type { DNAProfileV2, FactorCode, BiasFlag } from "./types";
import { FACTOR_MAP } from "./factors";
import { ARCHETYPE_INFO } from "./archetypes";

// Build comprehensive context for system prompt injection
export function buildDNAContextV2(profile: DNAProfileV2): string {
  const archetypeInfo = ARCHETYPE_INFO[profile.archetype.primary];

  const lines: string[] = [];

  // 1. Archetype header
  lines.push(`User's Investor Identity: ${archetypeInfo.name} — ${archetypeInfo.tagline}`);
  lines.push("");

  // 2. Communication rule
  lines.push(`Communication approach: ${archetypeInfo.communicationRule}`);
  lines.push("");

  // 3. Factor profile summary (all 8 factors)
  lines.push("Behavioral Profile:");
  for (const factor of Object.values(profile.factors.primary)) {
    const definition = FACTOR_MAP[factor.code];
    const label = factor.normalized > 60 ? definition.highLabel : factor.normalized < 40 ? definition.lowLabel : "Balanced";
    lines.push(`  • ${definition.name}: ${Math.round(factor.normalized)}/100 (${label})`);
  }
  lines.push("");

  // 4. Top 3 sub-factor highlights
  lines.push("Strongest Signals:");
  const subFactorsSorted = Object.values(profile.factors.sub).sort(
    (a, b) => Math.abs(b.normalized - 50) - Math.abs(a.normalized - 50)
  );
  const topThreeSub = subFactorsSorted.slice(0, 3);
  for (const subFactor of topThreeSub) {
    const direction = subFactor.normalized > 55 ? "High" : "Low";
    lines.push(`  • ${subFactor.code}: ${direction} (${Math.round(subFactor.normalized)})`);
  }
  lines.push("");

  // 5. Active biases with severity
  const activeBiases = profile.biasFlags.filter((b) => b.severity >= 1);
  if (activeBiases.length > 0) {
    lines.push("Active Biases (by severity):");
    for (const bias of activeBiases) {
      const severityLabel = bias.severity === 3 ? "Critical" : bias.severity === 2 ? "Moderate" : "Light";
      lines.push(`  • ${bias.label} (${severityLabel}): ${bias.behavioralSignature}`);
    }
    lines.push("");
  }

  // 6. Market mood and probabilities
  const mood = profile.marketMood;
  lines.push(`Market Mood Profile:`);
  lines.push(`  • Current state: ${mood.state}`);
  lines.push(`  • Panic probability: ${Math.round(mood.panicProbability * 100)}%`);
  lines.push(`  • FOMO probability: ${Math.round(mood.fomoProbability * 100)}%`);
  lines.push(`  • Impulse trade probability: ${Math.round(mood.impulseTradeProbability * 100)}%`);
  lines.push(`  • Reassurance dependency: ${Math.round(mood.reassuranceDependency * 100)}%`);
  lines.push("");

  // 7. Behavioral rule
  lines.push(`Golden Rule: ${profile.behavioralRule}`);
  lines.push("");

  // 8. Strengths
  if (profile.strengths.length > 0) {
    lines.push("Strengths:");
    for (const strength of profile.strengths) {
      lines.push(`  • ${strength}`);
    }
    lines.push("");
  }

  // 9. Vulnerabilities
  if (profile.vulnerabilities.length > 0) {
    lines.push("Vulnerabilities:");
    for (const vuln of profile.vulnerabilities) {
      lines.push(`  • ${vuln}`);
    }
    lines.push("");
  }

  // 10. Confidence caveat if needed
  if (profile.confidence.overall < 60 || profile.confidence.socialDesirability.flagged) {
    lines.push("Assessment Caveat:");
    if (profile.confidence.overall < 60) {
      lines.push(
        `  • Overall confidence is ${Math.round(profile.confidence.overall)}% — use insights as directional, not definitive.`
      );
    }
    if (profile.confidence.socialDesirability.flagged) {
      lines.push(
        `  • Social desirability bias detected (${Math.round(profile.confidence.socialDesirability.score)}%). Responses may have been optimized for presentation.`
      );
    }
  }

  return lines.join("\n");
}

// Shorter version for tight context windows
export function buildQuickContextV2(profile: DNAProfileV2): string {
  const archetypeInfo = ARCHETYPE_INFO[profile.archetype.primary];
  const topBias = profile.biasFlags.find((b) => b.severity >= 2);
  const primaryFactor = Object.values(profile.factors.primary).reduce((a, b) =>
    Math.abs(b.normalized - 50) > Math.abs(a.normalized - 50) ? b : a
  );

  const lines: string[] = [];

  lines.push(
    `${archetypeInfo.name} (${archetypeInfo.tagline}). ${archetypeInfo.communicationRule} Primary strength: ${primaryFactor.code}. ${topBias ? `Key bias: ${topBias.label}. ` : ""}Golden rule: ${profile.behavioralRule}`
  );

  return lines.join(" ");
}
