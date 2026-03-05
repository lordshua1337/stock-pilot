// Copilot Context -- gathers user state from all product areas
// into a structured context string for the AI system prompt.
// Client-side only (reads localStorage).

import { loadV2Profile, type StoredDNAProfileV2 } from "@/lib/dna-v2/storage";
import { loadPortfolio, type StoredPortfolio } from "@/lib/portfolio-storage";
import {
  loadJournal,
  getAnalytics,
  detectPatterns,
  type JournalState,
  type JournalAnalytics,
  type JournalInsight,
} from "@/lib/journal-data";
import {
  loadCoachingMemory,
  buildMemoryContext,
} from "@/lib/ai/coaching-memory";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CopilotContext {
  readonly dna: DNAContext | null;
  readonly portfolio: PortfolioContext | null;
  readonly journal: JournalContext | null;
  readonly currentPage: string;
  readonly timestamp: string;
}

export interface DNAContext {
  readonly archetype: string;
  readonly secondaryArchetype: string | null;
  readonly behavioralRule: string;
  readonly strengths: readonly string[];
  readonly vulnerabilities: readonly string[];
  readonly topBias: string | null;
  readonly topFrictionTrigger: string | null;
  readonly coachingContract: readonly string[];
}

export interface PortfolioContext {
  readonly tickers: readonly string[];
  readonly totalInvestment: number;
  readonly allocationMap: Record<string, number>;
  readonly savedAt: string;
}

export interface JournalContext {
  readonly totalEntries: number;
  readonly ruleFollowRate: number;
  readonly calmTradeRate: number;
  readonly streakDays: number;
  readonly recentActions: readonly string[];
  readonly patterns: readonly string[];
}

// ---------------------------------------------------------------------------
// Gatherers
// ---------------------------------------------------------------------------

function gatherDNA(): DNAContext | null {
  const profile: StoredDNAProfileV2 | null = loadV2Profile();
  if (!profile) return null;

  const topBias =
    profile.biasFlags.length > 0
      ? profile.biasFlags.reduce((a, b) =>
          b.severity > a.severity ? b : a
        ).label
      : null;

  return {
    archetype: profile.archetype.primary,
    secondaryArchetype: profile.archetype.secondary,
    behavioralRule: profile.behavioralRule,
    strengths: [...profile.strengths],
    vulnerabilities: [...profile.vulnerabilities],
    topBias,
    topFrictionTrigger:
      profile.frictionTriggers.length > 0
        ? profile.frictionTriggers[0]
        : null,
    coachingContract: [...profile.coachingContract],
  };
}

function gatherPortfolio(): PortfolioContext | null {
  const portfolio: StoredPortfolio | null = loadPortfolio();
  if (!portfolio || portfolio.items.length === 0) return null;

  const allocationMap: Record<string, number> = {};
  for (const item of portfolio.items) {
    allocationMap[item.ticker] = item.allocation;
  }

  return {
    tickers: portfolio.items.map((i) => i.ticker),
    totalInvestment: portfolio.investment,
    allocationMap,
    savedAt: portfolio.savedAt,
  };
}

function gatherJournal(): JournalContext | null {
  const journal: JournalState | null = loadJournal();
  if (!journal || journal.entries.length === 0) return null;

  const analytics: JournalAnalytics = getAnalytics(journal);
  const insights: readonly JournalInsight[] = detectPatterns(journal);

  const recentActions = journal.entries.slice(0, 5).map(
    (e) => `${e.action.toUpperCase()} ${e.ticker} (${e.emotionalState})`
  );

  return {
    totalEntries: analytics.totalEntries,
    ruleFollowRate: Math.round(analytics.ruleFollowRate * 100),
    calmTradeRate: Math.round(analytics.calmTradeRate * 100),
    streakDays: analytics.streakDays,
    recentActions,
    patterns: insights.map((i) => `[${i.type}] ${i.title}: ${i.description}`),
  };
}

// ---------------------------------------------------------------------------
// Main gatherer
// ---------------------------------------------------------------------------

export function gatherCopilotContext(currentPage: string): CopilotContext {
  return {
    dna: gatherDNA(),
    portfolio: gatherPortfolio(),
    journal: gatherJournal(),
    currentPage,
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

export function buildSystemPromptContext(ctx: CopilotContext): string {
  const sections: string[] = [];

  sections.push(
    `You are the StockPilot AI Copilot -- a personalized investment thinking partner.`,
    `You are NOT a financial advisor. You help investors think more clearly about their decisions.`,
    `Be concise, direct, and personality-aware. Use the investor's archetype to frame advice.`,
    `Current page: ${ctx.currentPage}`,
    `Current time: ${ctx.timestamp}`,
  );

  if (ctx.dna) {
    sections.push(
      `\n--- INVESTOR IDENTITY ---`,
      `Archetype: ${ctx.dna.archetype}${ctx.dna.secondaryArchetype ? ` (secondary: ${ctx.dna.secondaryArchetype})` : ""}`,
      `Behavioral Rule: "${ctx.dna.behavioralRule}"`,
      `Strengths: ${ctx.dna.strengths.join(", ")}`,
      `Vulnerabilities: ${ctx.dna.vulnerabilities.join(", ")}`,
      ctx.dna.topBias ? `Top Bias Risk: ${ctx.dna.topBias}` : "",
      ctx.dna.topFrictionTrigger
        ? `Top Friction Trigger: ${ctx.dna.topFrictionTrigger}`
        : "",
      `Coaching Contract: ${ctx.dna.coachingContract.join(" | ")}`,
    );
  } else {
    sections.push(
      `\nThe investor has not completed their Identity assessment yet. Encourage them to take it for personalized advice.`,
    );
  }

  if (ctx.portfolio) {
    const allocations = Object.entries(ctx.portfolio.allocationMap)
      .map(([ticker, pct]) => `${ticker}: ${pct}%`)
      .join(", ");
    sections.push(
      `\n--- PORTFOLIO ---`,
      `Holdings: ${allocations}`,
      `Total Investment: $${ctx.portfolio.totalInvestment.toLocaleString()}`,
      `Last Updated: ${ctx.portfolio.savedAt}`,
    );
  } else {
    sections.push(`\nNo portfolio built yet.`);
  }

  if (ctx.journal) {
    sections.push(
      `\n--- JOURNAL ANALYTICS ---`,
      `Total Entries: ${ctx.journal.totalEntries}`,
      `Rule Follow Rate: ${ctx.journal.ruleFollowRate}%`,
      `Calm Trade Rate: ${ctx.journal.calmTradeRate}%`,
      `Journaling Streak: ${ctx.journal.streakDays} days`,
      `Recent Actions: ${ctx.journal.recentActions.join(" | ")}`,
    );
    if (ctx.journal.patterns.length > 0) {
      sections.push(`Detected Patterns: ${ctx.journal.patterns.join(" | ")}`);
    }
  } else {
    sections.push(`\nNo journal entries yet.`);
  }

  // Coaching memory context (feedback loop + preferences)
  const coachingMemory = loadCoachingMemory();
  const memoryContext = buildMemoryContext(coachingMemory);
  if (memoryContext) {
    sections.push(memoryContext);
  }

  sections.push(
    `\n--- GUIDELINES ---`,
    `- Reference the investor's archetype and behavioral rule when relevant`,
    `- Flag potential bias risks when discussing trades`,
    `- Be encouraging but honest -- never sugarcoat risks`,
    `- Keep responses under 200 words unless asked for detail`,
    `- If on a specific stock page, focus advice on that ticker`,
    `- Never give specific buy/sell price targets -- help them think, not decide`,
    `- Adapt insight types based on coaching memory -- emphasize what the user acts on, reduce what they dismiss`,
  );

  return sections.filter(Boolean).join("\n");
}
