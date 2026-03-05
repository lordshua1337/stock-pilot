// Pre-Trade AI Advisor -- generates personality-fit analysis before trades
// Checks for bias risks, portfolio impact, and alignment with investor identity

import type { CopilotContext } from "@/lib/ai/copilot-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TradeCheckRequest {
  readonly ticker: string;
  readonly action: "buy" | "sell";
  readonly shares: number;
  readonly price: number;
  readonly currentCash: number;
  readonly currentPositions: readonly { ticker: string; shares: number; avgCost: number }[];
}

export interface TradeAdvisory {
  readonly fitScore: number; // 0-100
  readonly fitLabel: string;
  readonly biasWarnings: readonly string[];
  readonly portfolioImpact: readonly string[];
  readonly verdict: string;
  readonly overrideQuestion: string;
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

export function buildTradeCheckPrompt(
  ctx: CopilotContext,
  trade: TradeCheckRequest
): { system: string; user: string } {
  const parts: string[] = [];

  parts.push(
    `You are the StockPilot Pre-Trade Advisor. Your job is to analyze a proposed trade against the investor's personality profile and current portfolio state.`,
    `Be honest, concise, and personality-aware.`,
  );

  if (ctx.dna) {
    parts.push(
      `\n--- INVESTOR IDENTITY ---`,
      `Archetype: ${ctx.dna.archetype}${ctx.dna.secondaryArchetype ? ` (secondary: ${ctx.dna.secondaryArchetype})` : ""}`,
      `Behavioral Rule: "${ctx.dna.behavioralRule}"`,
      `Strengths: ${ctx.dna.strengths.join(", ")}`,
      `Vulnerabilities: ${ctx.dna.vulnerabilities.join(", ")}`,
      ctx.dna.topBias ? `Top Bias Risk: ${ctx.dna.topBias}` : "",
      `Coaching Contract: ${ctx.dna.coachingContract.join(" | ")}`,
    );
  }

  if (ctx.journal) {
    parts.push(
      `\n--- RECENT BEHAVIOR ---`,
      `Rule Follow Rate: ${ctx.journal.ruleFollowRate}%`,
      `Calm Trade Rate: ${ctx.journal.calmTradeRate}%`,
      `Recent Actions: ${ctx.journal.recentActions.join(" | ")}`,
    );
  }

  const system = parts.filter(Boolean).join("\n");

  const positionsSummary = trade.currentPositions.length > 0
    ? trade.currentPositions
        .map((p) => `${p.ticker}: ${p.shares} shares @ $${p.avgCost.toFixed(2)}`)
        .join(", ")
    : "No positions";

  const tradeTotal = trade.shares * trade.price;
  const cashAfter = trade.action === "buy"
    ? trade.currentCash - tradeTotal
    : trade.currentCash + tradeTotal;

  const user = [
    `PROPOSED TRADE: ${trade.action.toUpperCase()} ${trade.shares} shares of ${trade.ticker} @ $${trade.price.toFixed(2)} ($${tradeTotal.toLocaleString()} total)`,
    `Current Cash: $${trade.currentCash.toLocaleString()} -> After: $${cashAfter.toLocaleString()}`,
    `Current Positions: ${positionsSummary}`,
    ``,
    `Respond in this EXACT JSON format:`,
    `{`,
    `  "fitScore": <0-100 how well this trade fits the investor's identity>,`,
    `  "fitLabel": "<one of: Perfect Fit, Good Fit, Neutral, Caution, Red Flag>",`,
    `  "biasWarnings": ["<bias risk 1>", "<bias risk 2>"],`,
    `  "portfolioImpact": ["<impact 1>", "<impact 2>"],`,
    `  "verdict": "<2-3 sentence overall assessment>",`,
    `  "overrideQuestion": "<question to ask if they proceed despite warnings>"`,
    `}`,
    ``,
    `Rules:`,
    `- fitScore 80-100: trade aligns with their archetype and rules`,
    `- fitScore 50-79: trade is acceptable but has some concerns`,
    `- fitScore below 50: trade conflicts with their identity or shows bias risk`,
    `- biasWarnings: specific cognitive biases this trade might trigger (recency bias, FOMO, anchoring, etc.)`,
    `- portfolioImpact: concentration risk, sector imbalance, cash position changes`,
    `- If no DNA profile, fitScore should be 50 with generic advice`,
    `- Maximum 2 bias warnings, 2 portfolio impacts`,
  ].join("\n");

  return { system, user };
}

// ---------------------------------------------------------------------------
// Response parser
// ---------------------------------------------------------------------------

export function parseTradeAdvisory(text: string): TradeAdvisory {
  const defaults: TradeAdvisory = {
    fitScore: 50,
    fitLabel: "Neutral",
    biasWarnings: [],
    portfolioImpact: [],
    verdict: "Unable to analyze trade. Proceed with your own judgment.",
    overrideQuestion: "Why are you making this trade right now?",
  };

  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return defaults;

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      fitScore: typeof parsed.fitScore === "number"
        ? Math.max(0, Math.min(100, parsed.fitScore))
        : 50,
      fitLabel: typeof parsed.fitLabel === "string"
        ? parsed.fitLabel
        : "Neutral",
      biasWarnings: Array.isArray(parsed.biasWarnings)
        ? parsed.biasWarnings.filter((w: unknown) => typeof w === "string").slice(0, 3)
        : [],
      portfolioImpact: Array.isArray(parsed.portfolioImpact)
        ? parsed.portfolioImpact.filter((i: unknown) => typeof i === "string").slice(0, 3)
        : [],
      verdict: typeof parsed.verdict === "string"
        ? parsed.verdict
        : defaults.verdict,
      overrideQuestion: typeof parsed.overrideQuestion === "string"
        ? parsed.overrideQuestion
        : defaults.overrideQuestion,
    };
  } catch {
    return defaults;
  }
}
