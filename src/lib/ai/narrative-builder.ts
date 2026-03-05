// Portfolio Narrative Builder -- generates AI-written portfolio analysis
// Replaces static report text with personality-aware storytelling

import type { CopilotContext } from "./copilot-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PortfolioNarrative {
  readonly summary: string;
  readonly sectorStory: string;
  readonly riskProfile: string;
  readonly opportunities: string;
  readonly behavioralNote: string;
  readonly generatedAt: string;
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

export function buildNarrativePrompt(
  ctx: CopilotContext,
  portfolioMetrics: PortfolioMetrics
): { system: string; user: string } {
  const system = [
    "You are the StockPilot AI writing a portfolio analysis narrative.",
    "Write in second person ('your portfolio'). Be direct and insightful.",
    "Return ONLY valid JSON with these exact fields:",
    "- summary: string (3-4 sentences overall portfolio assessment)",
    "- sectorStory: string (2-3 sentences about sector allocation and what it means)",
    "- riskProfile: string (2-3 sentences about risk characteristics and fit with personality)",
    "- opportunities: string (2-3 sentences about actionable opportunities or gaps)",
    "- behavioralNote: string (1-2 sentences connecting portfolio to investor personality)",
    "",
    "Rules:",
    "- Reference specific tickers and percentages",
    "- Connect observations to their archetype when relevant",
    "- Flag concentration risk if any position > 25%",
    "- Never give specific buy/sell recommendations",
    "- Keep total response under 250 words",
  ].join("\n");

  const parts: string[] = [];

  if (ctx.portfolio) {
    const allocations = Object.entries(ctx.portfolio.allocationMap)
      .map(([t, p]) => `${t}: ${p}%`)
      .join(", ");
    parts.push(`Portfolio: ${allocations}`);
    parts.push(`Total investment: $${ctx.portfolio.totalInvestment.toLocaleString()}`);
  }

  if (portfolioMetrics.sectors.length > 0) {
    parts.push(`Sectors: ${portfolioMetrics.sectors.map((s) => `${s.name} ${s.pct}%`).join(", ")}`);
  }

  parts.push(`Weighted beta: ${portfolioMetrics.weightedBeta.toFixed(2)}`);
  parts.push(`Weighted dividend yield: ${portfolioMetrics.weightedDividend.toFixed(2)}%`);
  parts.push(`Average AI score: ${portfolioMetrics.avgAiScore}`);

  if (ctx.dna) {
    parts.push(`Archetype: ${ctx.dna.archetype}`);
    parts.push(`Rule: "${ctx.dna.behavioralRule}"`);
    parts.push(`Strengths: ${ctx.dna.strengths.join(", ")}`);
    parts.push(`Vulnerabilities: ${ctx.dna.vulnerabilities.join(", ")}`);
  }

  return { system, user: parts.join("\n") };
}

export function parseNarrativeResponse(text: string): PortfolioNarrative {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in narrative response");

  const parsed = JSON.parse(match[0]);
  return {
    summary: String(parsed.summary || ""),
    sectorStory: String(parsed.sectorStory || ""),
    riskProfile: String(parsed.riskProfile || ""),
    opportunities: String(parsed.opportunities || ""),
    behavioralNote: String(parsed.behavioralNote || ""),
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Portfolio metrics input type
// ---------------------------------------------------------------------------

export interface PortfolioMetrics {
  readonly sectors: readonly { name: string; pct: number }[];
  readonly weightedBeta: number;
  readonly weightedDividend: number;
  readonly avgAiScore: number;
  readonly positionCount: number;
}
