// DNA Context Builder -- generates behavioral profile string
// Injected into every AI system prompt for personalized recommendations
// This is the bridge between the assessment and the recommendation engine

import type { StoredDNAProfile } from "./dna-storage";
import { loadDNAProfile } from "./dna-storage";
import { ARCHETYPE_INFO } from "./dna-scoring";
import type { ArchetypeKey, BiasKey, FrictionTrigger } from "./financial-dna";

// ---------------------------------------------------------------------------
// Context builder (per the spec)
// ---------------------------------------------------------------------------

export function buildDNAContext(profile: StoredDNAProfile): string {
  const d = profile.dimensions;
  const m = profile.marketMood;
  const arch = profile.communicationArchetype;

  const archetypeRules: Record<string, string> = {
    analytical_skeptic:
      "Lead with data, sources, methodology. No motivational framing.",
    reassurance_seeker:
      "Validate before analyzing. Normalize uncertainty. Never lead with loss numbers.",
    diy_controller:
      "Provide information efficiently. Do not over-guide.",
    collaborative_partner:
      "Think out loud. Invite user into reasoning.",
    systems_builder:
      "Lead with rules and frameworks. User trusts process over narrative.",
    avoider_under_stress:
      "During stress: one action only. No option menus.",
    action_first_decider:
      "Add decision buffer recommendation before any urgent action.",
    big_picture_optimist:
      "Frame in terms of long-term trajectory. Minimize near-term noise.",
    trend_sensitive_explorer:
      "Add friction before trend-following. Surface the bear case first.",
    values_anchored_steward:
      "Frame everything in terms of their stated goals. Reference their purpose.",
  };

  const biasRules = profile.biasFlags
    .filter((f) => f.severity >= 2)
    .map((f) => {
      const rules: Partial<Record<BiasKey, string>> = {
        anchoring:
          "Never frame recommendations relative to purchase price. Focus on current thesis validity.",
        loss_aversion:
          "Frame potential gains before potential losses. Acknowledge loss sensitivity explicitly.",
        herding:
          "Do not mention what other investors are doing unless it contradicts consensus.",
        fomo: "Surface the bear case before confirming any trend-following action.",
        overconfidence:
          "Add explicit uncertainty framing to any bullish recommendation.",
        recency_bias:
          "Add historical context before recent events. Do not let recent data dominate.",
        sunk_cost:
          "Never reference original purchase price in thesis evaluation.",
        disposition_effect:
          "Evaluate winners and losers with the same thesis-validity framework.",
        present_bias:
          "Always connect near-term actions to long-term goals.",
        myopic_loss_aversion:
          "Discourage frequent checking. Frame performance over longer periods.",
        regret_avoidance:
          "Normalize that all investors miss opportunities. Focus on process quality.",
        confirmation_bias:
          "Proactively present counter-arguments to the user's thesis.",
        inertia:
          "Prompt for action when review dates pass. Make the next step small and concrete.",
        mental_accounting:
          "Treat all money equally regardless of source.",
        availability_heuristic:
          "Provide base rates and historical frequency for any dramatic scenario.",
        narrative_bias:
          "Require data backing for any story-driven recommendation.",
      };
      return rules[f.bias] ? `- ${rules[f.bias]}` : "";
    })
    .filter(Boolean);

  const frictionRules = profile.frictionTriggers
    .map((t: FrictionTrigger) => {
      const rules: Record<FrictionTrigger, string> = {
        loss_headlines:
          "Do not open with negative news. Context first, news second.",
        authority_conflict:
          "When disagreeing with user: validate their view before presenting counter-evidence.",
        peer_comparison:
          "Never mention other investors or crowd behavior.",
        time_pressure:
          "Add explicit slow-down framing before any urgent recommendation.",
        complexity_overload:
          "Reduce options to one clear action. Explain only what is necessary.",
      };
      return rules[t] ? `- ${rules[t]}` : "";
    })
    .filter(Boolean);

  return [
    "BEHAVIORAL PROFILE -- READ BEFORE RESPONDING:",
    "",
    `Dimensions: Risk=${d.R} Control=${d.C} Horizon=${d.H} Discipline=${d.D} Emotion=${d.E}`,
    `Market mood state: ${m.state} (panic_prob=${(m.panic_probability * 100).toFixed(0)}%, fomo_prob=${(m.fomo_probability * 100).toFixed(0)}%)`,
    "",
    `Communication archetype: ${ARCHETYPE_INFO[arch]?.name ?? arch}`,
    archetypeRules[arch] ? `${archetypeRules[arch]}` : "",
    "",
    m.panic_probability > 0.6
      ? "HIGH PANIC RISK: During any drawdown content -- lead with calming frame, then data."
      : "",
    m.fomo_probability > 0.6
      ? "HIGH FOMO RISK: Before confirming trend plays -- surface bear case first."
      : "",
    "",
    "Active bias rules:",
    biasRules.length > 0 ? biasRules.join("\n") : "No high-severity biases active.",
    "",
    "Friction trigger rules:",
    frictionRules.length > 0 ? frictionRules.join("\n") : "No confirmed friction triggers.",
    "",
    "AI memory notes from assessment:",
    profile.aiMemoryNotes.length > 0
      ? profile.aiMemoryNotes.join("\n")
      : "None.",
    "",
    "Coaching contract commitments (user-confirmed rules):",
    profile.coachingContract.length > 0
      ? profile.coachingContract.join("\n")
      : "None set yet.",
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

// ---------------------------------------------------------------------------
// Convenience: load profile and build context in one call
// Returns null if user hasn't completed the assessment
// ---------------------------------------------------------------------------

export function getDNAContextIfAvailable(): string | null {
  const profile = loadDNAProfile();
  if (!profile) return null;
  return buildDNAContext(profile);
}

// ---------------------------------------------------------------------------
// Stock-specific context overlay
// Adds stock-relevant behavioral notes on top of the base context
// ---------------------------------------------------------------------------

export function getStockDNAContext(
  ticker: string,
  stockChange: number
): string | null {
  const profile = loadDNAProfile();
  if (!profile) return null;

  const baseContext = buildDNAContext(profile);
  const overlays: string[] = [];

  // If stock is down and user has high loss aversion
  if (stockChange < -5) {
    const lossAversion = profile.biasFlags.find(
      (f) => f.bias === "loss_aversion"
    );
    if (lossAversion && lossAversion.severity >= 1) {
      overlays.push(
        `This stock is down ${stockChange.toFixed(1)}%. User has loss_aversion severity ${lossAversion.severity}. Frame thesis validity first, not the loss.`
      );
    }
  }

  // If stock is trending and user has FOMO
  if (stockChange > 15) {
    const fomo = profile.biasFlags.find((f) => f.bias === "fomo");
    if (fomo && fomo.severity >= 1) {
      overlays.push(
        `This stock is up ${stockChange.toFixed(1)}%. User has FOMO severity ${fomo.severity}. Present bear case before confirming.`
      );
    }
  }

  // If user has low emotional regulation and stock is volatile
  if (Math.abs(stockChange) > 10 && profile.dimensions.E < 45) {
    overlays.push(
      "High volatility + low emotional regulation. Lead with context and historical perspective."
    );
  }

  if (overlays.length === 0) return baseContext;

  return `${baseContext}\n\nSTOCK-SPECIFIC BEHAVIORAL CONTEXT (${ticker}):\n${overlays.join("\n")}`;
}
