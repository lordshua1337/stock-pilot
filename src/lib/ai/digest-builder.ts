// Weekly Digest Builder -- aggregates all product areas into a digest prompt
// Covers portfolio, journal, simulator, personality, and market data

import type { CopilotContext } from "./copilot-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WeeklyDigest {
  readonly headline: string;
  readonly portfolioSection: string;
  readonly journalSection: string;
  readonly behaviorScore: BehaviorScore;
  readonly weeklyTip: string;
  readonly generatedAt: string;
}

export interface BehaviorScore {
  readonly score: number; // 0-100
  readonly label: string;
  readonly factors: readonly string[];
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

export function buildDigestPrompt(ctx: CopilotContext): {
  system: string;
  user: string;
} {
  const system = [
    "You are the StockPilot AI writing a weekly investor digest.",
    "Write in second person. Be encouraging but honest.",
    "Return ONLY valid JSON with these exact fields:",
    '- headline: string (catchy 5-8 word summary of the week, e.g. "A Disciplined Week With Room to Grow")',
    "- portfolioSection: string (3-4 sentences about portfolio activity and market context)",
    "- journalSection: string (2-3 sentences about journaling habits and emotional patterns)",
    "- behaviorScore: { score: number (0-100), label: string (e.g. 'Disciplined Investor'), factors: string[] (3 factors that influenced the score) }",
    "- weeklyTip: string (1-2 sentences, one actionable thing to focus on next week)",
    "",
    "Rules:",
    "- Make the headline memorable and personality-aware",
    "- Behavior score weighs: rule following (40%), calm trading (30%), journaling consistency (20%), bias awareness (10%)",
    "- If data is sparse, acknowledge it positively ('Getting started is the hardest part')",
    "- Connect everything back to their archetype and growth",
    "- Keep total under 300 words",
  ].join("\n");

  const parts: string[] = [];
  parts.push(`Date: ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`);

  if (ctx.dna) {
    parts.push(`Archetype: ${ctx.dna.archetype}`);
    parts.push(`Rule: "${ctx.dna.behavioralRule}"`);
    parts.push(`Strengths: ${ctx.dna.strengths.join(", ")}`);
    parts.push(`Vulnerabilities: ${ctx.dna.vulnerabilities.join(", ")}`);
  } else {
    parts.push("No personality profile yet.");
  }

  if (ctx.portfolio) {
    parts.push(`Portfolio: ${ctx.portfolio.tickers.join(", ")}`);
    parts.push(`Investment: $${ctx.portfolio.totalInvestment.toLocaleString()}`);
  } else {
    parts.push("No portfolio built yet.");
  }

  if (ctx.journal) {
    parts.push(`Journal entries: ${ctx.journal.totalEntries}`);
    parts.push(`Rule follow rate: ${ctx.journal.ruleFollowRate}%`);
    parts.push(`Calm trade rate: ${ctx.journal.calmTradeRate}%`);
    parts.push(`Streak: ${ctx.journal.streakDays} days`);
    if (ctx.journal.recentActions.length > 0) {
      parts.push(`Recent: ${ctx.journal.recentActions.join(", ")}`);
    }
    if (ctx.journal.patterns.length > 0) {
      parts.push(`Patterns: ${ctx.journal.patterns.join("; ")}`);
    }
  } else {
    parts.push("No journal entries yet.");
  }

  return { system, user: parts.join("\n") };
}

export function parseDigestResponse(text: string): WeeklyDigest {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in digest response");

  const parsed = JSON.parse(match[0]);
  return {
    headline: String(parsed.headline || "Your Weekly Digest"),
    portfolioSection: String(parsed.portfolioSection || ""),
    journalSection: String(parsed.journalSection || ""),
    behaviorScore: {
      score: Number(parsed.behaviorScore?.score ?? 50),
      label: String(parsed.behaviorScore?.label || "Investor"),
      factors: Array.isArray(parsed.behaviorScore?.factors)
        ? parsed.behaviorScore.factors.map(String)
        : [],
    },
    weeklyTip: String(parsed.weeklyTip || ""),
    generatedAt: new Date().toISOString(),
  };
}
