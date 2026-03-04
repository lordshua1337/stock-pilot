export type PortfolioMetrics = {
  totalValue: number
  totalCost: number
  totalPnL: number
  totalPnLPercent: number
  dailyChange: number
  diversificationScore: number
  topHolding: { ticker: string; weight: number } | null
  sectorBreakdown: Record<string, number>
}

type HoldingWithPrice = {
  ticker: string
  shares: number
  purchasePrice: number
  currentPrice: number
  sector?: string
}

export function calculateMetrics(holdings: HoldingWithPrice[]): PortfolioMetrics {
  if (holdings.length === 0) {
    return {
      totalValue: 0,
      totalCost: 0,
      totalPnL: 0,
      totalPnLPercent: 0,
      dailyChange: 0,
      diversificationScore: 0,
      topHolding: null,
      sectorBreakdown: {},
    }
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.shares * h.purchasePrice, 0)
  const totalPnL = totalValue - totalCost
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

  // Diversification score (Herfindahl-Hirschman Index inverted)
  const weights = holdings.map(h => (h.shares * h.currentPrice) / totalValue)
  const hhi = weights.reduce((sum, w) => sum + w * w, 0)
  const diversificationScore = Math.round((1 - hhi) * 100)

  // Top holding
  let topHolding: { ticker: string; weight: number } | null = null
  let maxWeight = 0
  holdings.forEach((h, i) => {
    if (weights[i] > maxWeight) {
      maxWeight = weights[i]
      topHolding = { ticker: h.ticker, weight: Math.round(weights[i] * 100) }
    }
  })

  // Sector breakdown
  const sectorBreakdown: Record<string, number> = {}
  holdings.forEach((h, i) => {
    const sector = h.sector || 'Unknown'
    sectorBreakdown[sector] = (sectorBreakdown[sector] || 0) + weights[i] * 100
  })

  return {
    totalValue,
    totalCost,
    totalPnL,
    totalPnLPercent,
    dailyChange: 0,
    diversificationScore,
    topHolding,
    sectorBreakdown,
  }
}
