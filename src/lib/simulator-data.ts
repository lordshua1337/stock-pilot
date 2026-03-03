// Market Simulator -- paper trading engine
// Tracks virtual portfolio with $100k starting balance
// All operations are immutable, returns new state

export interface SimPosition {
  readonly ticker: string;
  readonly shares: number;
  readonly avgCost: number; // per-share average cost basis
  readonly boughtAt: string; // ISO date
}

export interface SimTrade {
  readonly id: string;
  readonly ticker: string;
  readonly action: "buy" | "sell";
  readonly shares: number;
  readonly price: number;
  readonly total: number;
  readonly timestamp: string;
}

export interface SimPortfolio {
  readonly cash: number;
  readonly positions: readonly SimPosition[];
  readonly trades: readonly SimTrade[];
  readonly startedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const STARTING_CASH = 100_000;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createSimPortfolio(): SimPortfolio {
  return {
    cash: STARTING_CASH,
    positions: [],
    trades: [],
    startedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Trade operations (immutable)
// ---------------------------------------------------------------------------

export function buyStock(
  portfolio: SimPortfolio,
  ticker: string,
  shares: number,
  price: number
): SimPortfolio {
  const total = shares * price;
  if (total > portfolio.cash) return portfolio; // insufficient funds
  if (shares <= 0) return portfolio;

  const trade: SimTrade = {
    id: `${Date.now()}-${ticker}-buy`,
    ticker,
    action: "buy",
    shares,
    price,
    total,
    timestamp: new Date().toISOString(),
  };

  const existing = portfolio.positions.find((p) => p.ticker === ticker);
  let newPositions: readonly SimPosition[];

  if (existing) {
    // Update average cost
    const totalShares = existing.shares + shares;
    const totalCost = existing.avgCost * existing.shares + price * shares;
    const newAvgCost = totalCost / totalShares;

    newPositions = portfolio.positions.map((p) =>
      p.ticker === ticker
        ? { ...p, shares: totalShares, avgCost: newAvgCost }
        : p
    );
  } else {
    newPositions = [
      ...portfolio.positions,
      { ticker, shares, avgCost: price, boughtAt: new Date().toISOString() },
    ];
  }

  return {
    ...portfolio,
    cash: portfolio.cash - total,
    positions: newPositions,
    trades: [...portfolio.trades, trade],
  };
}

export function sellStock(
  portfolio: SimPortfolio,
  ticker: string,
  shares: number,
  price: number
): SimPortfolio {
  const existing = portfolio.positions.find((p) => p.ticker === ticker);
  if (!existing || existing.shares < shares) return portfolio;
  if (shares <= 0) return portfolio;

  const total = shares * price;

  const trade: SimTrade = {
    id: `${Date.now()}-${ticker}-sell`,
    ticker,
    action: "sell",
    shares,
    price,
    total,
    timestamp: new Date().toISOString(),
  };

  const remainingShares = existing.shares - shares;
  let newPositions: readonly SimPosition[];

  if (remainingShares === 0) {
    newPositions = portfolio.positions.filter((p) => p.ticker !== ticker);
  } else {
    newPositions = portfolio.positions.map((p) =>
      p.ticker === ticker ? { ...p, shares: remainingShares } : p
    );
  }

  return {
    ...portfolio,
    cash: portfolio.cash + total,
    positions: newPositions,
    trades: [...portfolio.trades, trade],
  };
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export function getPortfolioValue(
  portfolio: SimPortfolio,
  priceMap: ReadonlyMap<string, number>
): number {
  let value = portfolio.cash;
  for (const pos of portfolio.positions) {
    const price = priceMap.get(pos.ticker) ?? pos.avgCost;
    value += pos.shares * price;
  }
  return value;
}

export function getPositionValue(
  pos: SimPosition,
  currentPrice: number
): { value: number; gain: number; gainPct: number } {
  const value = pos.shares * currentPrice;
  const cost = pos.shares * pos.avgCost;
  const gain = value - cost;
  const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
  return { value, gain, gainPct };
}

export function getTotalReturn(
  portfolio: SimPortfolio,
  priceMap: ReadonlyMap<string, number>
): { absolute: number; percent: number } {
  const current = getPortfolioValue(portfolio, priceMap);
  const absolute = current - STARTING_CASH;
  const percent = (absolute / STARTING_CASH) * 100;
  return { absolute, percent };
}

// ---------------------------------------------------------------------------
// LocalStorage persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = "stockpilot_simulator";

export function saveSimPortfolio(portfolio: SimPortfolio): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
}

export function loadSimPortfolio(): SimPortfolio | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SimPortfolio;
  } catch {
    return null;
  }
}

export function resetSimPortfolio(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
