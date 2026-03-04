// Market briefing generator.
// Builds personalized daily briefing from stock data, portfolio, and archetype.
// All pure functions -- no API calls, no side effects.

import type { Stock } from "./stock-data";
import type { ArchetypeKey } from "./financial-dna";
import { ARCHETYPE_INFO } from "./dna-scoring";

export interface BriefingSection {
  title: string;
  items: BriefingItem[];
}

export interface BriefingItem {
  ticker?: string;
  text: string;
  type: "positive" | "negative" | "neutral" | "alert";
}

export interface MarketBriefing {
  headline: string;
  sections: BriefingSection[];
  generatedAt: string;
}

export function generateBriefing(
  allStocks: ReadonlyArray<Stock>,
  portfolio?: ReadonlyArray<{ ticker: string; allocation: number }>,
  archetype?: ArchetypeKey
): MarketBriefing {
  const sections: BriefingSection[] = [];

  // 1. Market Overview
  sections.push(buildMarketOverview(allStocks));

  // 2. Portfolio movers (if portfolio exists)
  if (portfolio && portfolio.length > 0) {
    sections.push(buildPortfolioMovers(allStocks, portfolio));
  }

  // 3. Sector trends
  sections.push(buildSectorTrends(allStocks));

  // 4. Near 52-week extremes
  sections.push(buildExtremes(allStocks));

  // 5. Archetype-flavored insight (if archetype exists)
  if (archetype) {
    sections.push(buildArchetypeInsight(allStocks, archetype, portfolio));
  }

  // Headline
  const gainers = allStocks.filter((s) => s.changePercent > 0).length;
  const total = allStocks.length;
  const ratio = gainers / total;
  const headline =
    ratio >= 0.7
      ? "Broad market strength -- most stocks advancing"
      : ratio >= 0.5
        ? "Mixed session -- market split between gainers and losers"
        : ratio >= 0.3
          ? "Cautious day -- sellers in control across sectors"
          : "Red day -- broad selling pressure across the board";

  return {
    headline,
    sections,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Section Builders ─────────────────────────────────────────────────

function buildMarketOverview(stocks: ReadonlyArray<Stock>): BriefingSection {
  const sorted = [...stocks].sort(
    (a, b) => b.changePercent - a.changePercent
  );
  const topGainers = sorted.slice(0, 5);
  const topLosers = sorted.slice(-5).reverse();

  const items: BriefingItem[] = [
    ...topGainers.map(
      (s): BriefingItem => ({
        ticker: s.ticker,
        text: `${s.ticker} +${s.changePercent.toFixed(2)}% ($${s.price.toFixed(2)})`,
        type: "positive",
      })
    ),
    ...topLosers.map(
      (s): BriefingItem => ({
        ticker: s.ticker,
        text: `${s.ticker} ${s.changePercent.toFixed(2)}% ($${s.price.toFixed(2)})`,
        type: "negative",
      })
    ),
  ];

  return { title: "Top Movers", items };
}

function buildPortfolioMovers(
  allStocks: ReadonlyArray<Stock>,
  portfolio: ReadonlyArray<{ ticker: string; allocation: number }>
): BriefingSection {
  const stockMap = new Map(allStocks.map((s) => [s.ticker, s]));

  const movers = portfolio
    .map((p) => {
      const stock = stockMap.get(p.ticker);
      if (!stock) return null;
      return { ...stock, allocation: p.allocation };
    })
    .filter((x): x is Stock & { allocation: number } => x !== null)
    .sort(
      (a, b) =>
        Math.abs(b.changePercent) - Math.abs(a.changePercent)
    );

  const items: BriefingItem[] = movers.slice(0, 5).map(
    (s): BriefingItem => ({
      ticker: s.ticker,
      text: `${s.ticker} (${s.allocation}% of portfolio) ${s.changePercent >= 0 ? "+" : ""}${s.changePercent.toFixed(2)}%`,
      type:
        s.changePercent >= 1
          ? "positive"
          : s.changePercent <= -1
            ? "negative"
            : "neutral",
    })
  );

  return { title: "Your Portfolio Movers", items };
}

function buildSectorTrends(
  stocks: ReadonlyArray<Stock>
): BriefingSection {
  const sectorMap = new Map<
    string,
    { total: number; count: number }
  >();

  for (const s of stocks) {
    const existing = sectorMap.get(s.sector) ?? {
      total: 0,
      count: 0,
    };
    sectorMap.set(s.sector, {
      total: existing.total + s.changePercent,
      count: existing.count + 1,
    });
  }

  const sectors = Array.from(sectorMap.entries())
    .map(([sector, data]) => ({
      sector,
      avgChange: data.total / data.count,
    }))
    .sort((a, b) => b.avgChange - a.avgChange);

  const items: BriefingItem[] = sectors.map(
    (s): BriefingItem => ({
      text: `${s.sector}: ${s.avgChange >= 0 ? "+" : ""}${s.avgChange.toFixed(2)}% avg`,
      type:
        s.avgChange >= 0.5
          ? "positive"
          : s.avgChange <= -0.5
            ? "negative"
            : "neutral",
    })
  );

  return { title: "Sector Performance", items };
}

function buildExtremes(
  stocks: ReadonlyArray<Stock>
): BriefingSection {
  const items: BriefingItem[] = [];

  // Near 52-week highs
  const nearHighs = stocks.filter((s) => {
    const range = s.fiftyTwoHigh - s.fiftyTwoLow;
    if (range === 0) return false;
    return (s.price - s.fiftyTwoLow) / range >= 0.9;
  });

  if (nearHighs.length > 0) {
    items.push({
      text: `Near 52-week highs: ${nearHighs.slice(0, 5).map((s) => s.ticker).join(", ")}`,
      type: "positive",
    });
  }

  // Near 52-week lows
  const nearLows = stocks.filter((s) => {
    const range = s.fiftyTwoHigh - s.fiftyTwoLow;
    if (range === 0) return false;
    return (s.price - s.fiftyTwoLow) / range <= 0.1;
  });

  if (nearLows.length > 0) {
    items.push({
      text: `Near 52-week lows: ${nearLows.slice(0, 5).map((s) => s.ticker).join(", ")}`,
      type: "alert",
    });
  }

  // Highest AI conviction
  const highAI = [...stocks]
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 3);
  items.push({
    text: `Highest AI conviction: ${highAI.map((s) => `${s.ticker} (${s.aiScore})`).join(", ")}`,
    type: "neutral",
  });

  return { title: "Key Levels", items };
}

function buildArchetypeInsight(
  stocks: ReadonlyArray<Stock>,
  archetype: ArchetypeKey,
  portfolio?: ReadonlyArray<{ ticker: string; allocation: number }>
): BriefingSection {
  const info = ARCHETYPE_INFO[archetype];
  const items: BriefingItem[] = [];

  // Archetype-specific lens
  switch (archetype) {
    case "avoider_under_stress": {
      const volatileCount = stocks.filter(
        (s) => Math.abs(s.changePercent) > 3
      ).length;
      items.push({
        text:
          volatileCount > 10
            ? "High volatility day. Consider pausing before making decisions."
            : "Relatively calm market conditions today.",
        type: volatileCount > 10 ? "alert" : "positive",
      });
      break;
    }
    case "trend_sensitive_explorer": {
      const trending = stocks.filter((s) => s.changePercent > 2);
      if (trending.length > 0) {
        items.push({
          text: `Momentum opportunities: ${trending.slice(0, 4).map((s) => `${s.ticker} +${s.changePercent.toFixed(1)}%`).join(", ")}`,
          type: "positive",
        });
      }
      break;
    }
    case "big_picture_optimist": {
      const strongBuy = stocks.filter(
        (s) => s.analystRating === "Strong Buy" && s.aiScore >= 80
      );
      items.push({
        text: `Long-term conviction picks: ${strongBuy.slice(0, 4).map((s) => s.ticker).join(", ")}`,
        type: "positive",
      });
      break;
    }
    default: {
      items.push({
        text: `As a ${info.name}: "${info.tagline}"`,
        type: "neutral",
      });
      break;
    }
  }

  return { title: `${info.name} Lens`, items };
}
