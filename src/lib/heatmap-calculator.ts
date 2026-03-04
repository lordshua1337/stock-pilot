// Sector heatmap calculator for portfolio visualization.
// Groups portfolio stocks by sector, sizes by allocation, colors by performance.

import type { Stock } from "./stock-data";

export interface HeatmapBlock {
  sector: string;
  allocationPercent: number; // of total portfolio allocation
  dollarValue: number;
  avgChangePercent: number;
  avgAiScore: number;
  stockCount: number;
  stocks: HeatmapStock[];
}

export interface HeatmapStock {
  ticker: string;
  name: string;
  allocation: number;
  changePercent: number;
  aiScore: number;
  dollarValue: number;
}

export function calculateSectorHeatmap(
  items: ReadonlyArray<{ ticker: string; allocation: number }>,
  stockMap: ReadonlyMap<string, Stock>,
  totalInvestment: number
): HeatmapBlock[] {
  const totalAlloc = items.reduce((sum, i) => sum + i.allocation, 0);
  if (totalAlloc === 0) return [];

  const sectorMap = new Map<string, HeatmapStock[]>();

  for (const item of items) {
    const stock = stockMap.get(item.ticker);
    if (!stock) continue;

    const dollarValue = (item.allocation / 100) * totalInvestment;
    const entry: HeatmapStock = {
      ticker: stock.ticker,
      name: stock.name,
      allocation: item.allocation,
      changePercent: stock.changePercent,
      aiScore: stock.aiScore,
      dollarValue,
    };

    const existing = sectorMap.get(stock.sector) ?? [];
    sectorMap.set(stock.sector, [...existing, entry]);
  }

  const blocks: HeatmapBlock[] = [];
  for (const [sector, sectorStocks] of sectorMap) {
    const sectorAlloc = sectorStocks.reduce(
      (s, st) => s + st.allocation,
      0
    );
    const sectorDollars = sectorStocks.reduce(
      (s, st) => s + st.dollarValue,
      0
    );
    const avgChange =
      sectorStocks.reduce((s, st) => s + st.changePercent, 0) /
      sectorStocks.length;
    const avgAi =
      sectorStocks.reduce((s, st) => s + st.aiScore, 0) /
      sectorStocks.length;

    blocks.push({
      sector,
      allocationPercent: (sectorAlloc / totalAlloc) * 100,
      dollarValue: sectorDollars,
      avgChangePercent: avgChange,
      avgAiScore: avgAi,
      stockCount: sectorStocks.length,
      stocks: sectorStocks.sort((a, b) => b.allocation - a.allocation),
    });
  }

  return blocks.sort((a, b) => b.allocationPercent - a.allocationPercent);
}
