// AI Insight Generator -- builds page-specific prompts for proactive insights
// Each page gets a tailored system prompt + user context for relevant advice

import type { CopilotContext } from "./copilot-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InsightType = "opportunity" | "warning" | "tip";

export interface AIInsight {
  readonly type: InsightType;
  readonly title: string;
  readonly body: string;
  readonly pageId: string;
  readonly generatedAt: string;
}

export type PageId =
  | "home"
  | "portfolio"
  | "research"
  | "journal"
  | "simulator";

// ---------------------------------------------------------------------------
// Page-specific prompt builders
// ---------------------------------------------------------------------------

function buildHomePrompt(ctx: CopilotContext): string {
  const parts: string[] = [
    "Generate a single proactive insight for the StockPilot home page.",
    "The user just opened the app. Give them ONE actionable observation.",
  ];

  if (ctx.portfolio) {
    parts.push(
      `Their portfolio: ${ctx.portfolio.tickers.join(", ")} ($${ctx.portfolio.totalInvestment.toLocaleString()}).`
    );
  }

  if (ctx.dna) {
    parts.push(`Archetype: ${ctx.dna.archetype}. Rule: "${ctx.dna.behavioralRule}".`);
  }

  if (ctx.journal) {
    parts.push(
      `Journal: ${ctx.journal.totalEntries} entries, ${ctx.journal.ruleFollowRate}% rule follow, ${ctx.journal.streakDays}-day streak.`
    );
  }

  if (!ctx.dna && !ctx.portfolio && !ctx.journal) {
    parts.push(
      "They haven't set up their profile, portfolio, or journal yet. Encourage them to start with the Identity assessment."
    );
  }

  return parts.join(" ");
}

function buildPortfolioPrompt(ctx: CopilotContext): string {
  const parts: string[] = [
    "Generate a single proactive insight about the user's portfolio.",
    "Focus on concentration risk, sector balance, or an actionable improvement.",
  ];

  if (ctx.portfolio) {
    const allocations = Object.entries(ctx.portfolio.allocationMap)
      .map(([t, p]) => `${t}: ${p}%`)
      .join(", ");
    parts.push(`Portfolio: ${allocations}. Total: $${ctx.portfolio.totalInvestment.toLocaleString()}.`);
  } else {
    parts.push("They have no portfolio yet. Encourage them to build one.");
  }

  if (ctx.dna) {
    parts.push(
      `Archetype: ${ctx.dna.archetype}. Vulnerabilities: ${ctx.dna.vulnerabilities.join(", ")}.`
    );
  }

  return parts.join(" ");
}

function buildResearchPrompt(ctx: CopilotContext, ticker?: string): string {
  const parts: string[] = [
    `Generate a single proactive insight about ${ticker ?? "stock research"}.`,
  ];

  if (ticker) {
    parts.push(
      `The user is currently researching ${ticker}. Give a personality-aware observation about how this stock fits their style.`
    );
  }

  if (ctx.dna) {
    parts.push(
      `Archetype: ${ctx.dna.archetype}. Top bias risk: ${ctx.dna.topBias ?? "none detected"}.`
    );
  }

  if (ctx.portfolio) {
    const hasTicker = ticker
      ? ctx.portfolio.tickers.includes(ticker)
      : false;
    parts.push(
      hasTicker
        ? `They already hold ${ticker} at ${ctx.portfolio.allocationMap[ticker!]}% allocation.`
        : `They don't currently hold ${ticker ?? "this stock"}.`
    );
  }

  return parts.join(" ");
}

function buildJournalPrompt(ctx: CopilotContext): string {
  const parts: string[] = [
    "Generate a single proactive insight about the user's trading journal.",
    "Focus on behavioral patterns, emotional trends, or bias detection.",
  ];

  if (ctx.journal) {
    parts.push(
      `Stats: ${ctx.journal.totalEntries} entries, ${ctx.journal.ruleFollowRate}% rule follow rate, ${ctx.journal.calmTradeRate}% calm trade rate, ${ctx.journal.streakDays}-day streak.`
    );
    if (ctx.journal.recentActions.length > 0) {
      parts.push(`Recent: ${ctx.journal.recentActions.join(", ")}.`);
    }
    if (ctx.journal.patterns.length > 0) {
      parts.push(`Patterns: ${ctx.journal.patterns.join("; ")}.`);
    }
  } else {
    parts.push(
      "They have no journal entries yet. Encourage them to log their first trade decision."
    );
  }

  if (ctx.dna) {
    parts.push(`Archetype: ${ctx.dna.archetype}. Rule: "${ctx.dna.behavioralRule}".`);
  }

  return parts.join(" ");
}

function buildSimulatorPrompt(ctx: CopilotContext): string {
  const parts: string[] = [
    "Generate a single proactive insight for the trading simulator.",
    "Give a practice tip, strategy suggestion, or behavioral coaching point.",
  ];

  if (ctx.dna) {
    parts.push(
      `Archetype: ${ctx.dna.archetype}. Strengths: ${ctx.dna.strengths.join(", ")}. Vulnerabilities: ${ctx.dna.vulnerabilities.join(", ")}.`
    );
  }

  if (ctx.portfolio) {
    parts.push(
      `Real portfolio: ${ctx.portfolio.tickers.join(", ")}. They could practice trades on stocks they're considering.`
    );
  }

  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Main prompt builder
// ---------------------------------------------------------------------------

export function buildInsightPrompt(
  pageId: PageId,
  ctx: CopilotContext,
  ticker?: string
): { system: string; user: string } {
  const system = [
    "You are the StockPilot AI Copilot generating a single proactive insight.",
    "Return ONLY valid JSON with these exact fields:",
    '- type: "opportunity" | "warning" | "tip"',
    "- title: string (5-10 words, punchy)",
    "- body: string (1-2 sentences, actionable, personality-aware)",
    "",
    "Rules:",
    "- ONE insight only. Not a list.",
    "- Be specific, not generic. Reference their actual data.",
    "- Opportunities = something they could act on.",
    "- Warnings = a risk or bias pattern to watch.",
    "- Tips = educational coaching moments.",
    "- Never give specific price targets or buy/sell advice.",
    "- Keep body under 40 words.",
  ].join("\n");

  let user: string;
  switch (pageId) {
    case "home":
      user = buildHomePrompt(ctx);
      break;
    case "portfolio":
      user = buildPortfolioPrompt(ctx);
      break;
    case "research":
      user = buildResearchPrompt(ctx, ticker);
      break;
    case "journal":
      user = buildJournalPrompt(ctx);
      break;
    case "simulator":
      user = buildSimulatorPrompt(ctx);
      break;
    default:
      user = buildHomePrompt(ctx);
  }

  return { system, user };
}

// ---------------------------------------------------------------------------
// Parse insight from Claude response
// ---------------------------------------------------------------------------

export function parseInsightResponse(
  text: string,
  pageId: string
): AIInsight {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON found in insight response");
  }

  const parsed = JSON.parse(match[0]);

  const validTypes: InsightType[] = ["opportunity", "warning", "tip"];
  const type = validTypes.includes(parsed.type) ? parsed.type : "tip";

  return {
    type,
    title: String(parsed.title || "Insight"),
    body: String(parsed.body || ""),
    pageId,
    generatedAt: new Date().toISOString(),
  };
}
