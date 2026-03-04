// Approximate correlation calculator for portfolio stocks.
// Uses sector similarity, beta proximity, and market cap tier as proxies
// since we don't have historical price data for real correlation.

import type { Stock } from "./stock-data";

export interface CorrelationPair {
  tickerA: string;
  tickerB: string;
  correlation: number; // -0.3 to 1.0 (approximated)
}

export interface CorrelationMatrix {
  tickers: string[];
  grid: number[][]; // NxN matrix
  mostCorrelated: CorrelationPair | null;
  leastCorrelated: CorrelationPair | null;
  diversificationScore: number; // 0-100
}

// Parse market cap string to numeric tier for comparison
function marketCapTier(cap: string): number {
  const clean = cap.replace(/[$,]/g, "");
  if (clean.endsWith("T")) return 4; // trillion
  if (clean.endsWith("B")) {
    const val = parseFloat(clean);
    if (val >= 200) return 3; // mega cap
    if (val >= 10) return 2; // large cap
    return 1; // mid cap
  }
  return 0; // small cap
}

export function approximateCorrelation(
  stockA: Stock,
  stockB: Stock
): number {
  if (stockA.ticker === stockB.ticker) return 1;

  let correlation = 0;

  // Same sector: high base correlation (0.4)
  if (stockA.sector === stockB.sector) {
    correlation += 0.4;
  } else {
    correlation += 0.1; // different sectors still have some market correlation
  }

  // Beta proximity: similar beta = more correlated
  const betaDiff = Math.abs(stockA.beta - stockB.beta);
  if (betaDiff < 0.2) {
    correlation += 0.25;
  } else if (betaDiff < 0.5) {
    correlation += 0.15;
  } else {
    correlation += 0.05;
  }

  // Market cap tier: same tier = more correlated
  const tierA = marketCapTier(stockA.marketCap);
  const tierB = marketCapTier(stockB.marketCap);
  if (tierA === tierB) {
    correlation += 0.15;
  } else if (Math.abs(tierA - tierB) <= 1) {
    correlation += 0.08;
  }

  // Same change direction amplifies correlation
  if (
    (stockA.changePercent > 0 && stockB.changePercent > 0) ||
    (stockA.changePercent < 0 && stockB.changePercent < 0)
  ) {
    correlation += 0.1;
  } else {
    correlation -= 0.1;
  }

  // Clamp to reasonable range
  return Math.max(-0.3, Math.min(1, correlation));
}

export function buildCorrelationMatrix(
  items: ReadonlyArray<{ ticker: string }>,
  stockMap: ReadonlyMap<string, Stock>
): CorrelationMatrix {
  const resolvedTickers = items
    .filter((i) => stockMap.has(i.ticker))
    .map((i) => i.ticker);

  const n = resolvedTickers.length;
  const grid: number[][] = Array.from({ length: n }, () =>
    Array(n).fill(0)
  );

  let mostCorrelated: CorrelationPair | null = null;
  let leastCorrelated: CorrelationPair | null = null;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const stockA = stockMap.get(resolvedTickers[i])!;
      const stockB = stockMap.get(resolvedTickers[j])!;
      const corr = approximateCorrelation(stockA, stockB);
      grid[i][j] = Math.round(corr * 100) / 100;

      // Track extremes (only off-diagonal)
      if (i < j) {
        const pair: CorrelationPair = {
          tickerA: resolvedTickers[i],
          tickerB: resolvedTickers[j],
          correlation: grid[i][j],
        };

        if (
          !mostCorrelated ||
          pair.correlation > mostCorrelated.correlation
        ) {
          mostCorrelated = pair;
        }
        if (
          !leastCorrelated ||
          pair.correlation < leastCorrelated.correlation
        ) {
          leastCorrelated = pair;
        }
      }
    }
  }

  // Diversification score: lower average off-diagonal correlation = better
  let totalCorr = 0;
  let pairCount = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      totalCorr += grid[i][j];
      pairCount++;
    }
  }
  const avgCorr = pairCount > 0 ? totalCorr / pairCount : 0;
  // Score: 0 avg corr = 100, 1 avg corr = 0
  const diversificationScore = Math.round(
    Math.max(0, (1 - avgCorr) * 100)
  );

  return {
    tickers: resolvedTickers,
    grid,
    mostCorrelated,
    leastCorrelated,
    diversificationScore,
  };
}
