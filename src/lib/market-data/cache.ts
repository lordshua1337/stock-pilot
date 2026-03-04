import { adminClient } from '@/lib/supabase/client'
import { fetchQuote, fetchOverview, rateLimitedFetch, type QuoteData } from './alpha-vantage'

export type CachedStock = {
  ticker: string
  price: number
  change_amount: number
  change_percent: number
  volume: number
  market_cap: number | null
  pe_ratio: number | null
  week_52_high: number | null
  week_52_low: number | null
  raw_data: Record<string, unknown>
  last_refreshed: string
}

const CACHE_TTL_HOURS = 24

export async function getCachedPrice(ticker: string): Promise<CachedStock | null> {
  const { data } = await adminClient
    .from('stock_cache')
    .select('*')
    .eq('ticker', ticker.toUpperCase())
    .single()

  if (!data) return null

  // Check if cache is stale
  const lastRefreshed = new Date(data.last_refreshed)
  const hoursOld = (Date.now() - lastRefreshed.getTime()) / (1000 * 60 * 60)

  if (hoursOld > CACHE_TTL_HOURS) return null

  return data as CachedStock
}

export async function refreshStockCache(ticker: string): Promise<CachedStock | null> {
  const upperTicker = ticker.toUpperCase()

  // Try to fetch live data
  const quote = await rateLimitedFetch(() => fetchQuote(upperTicker))
  if (!quote) return null

  const overview = await rateLimitedFetch(() => fetchOverview(upperTicker))

  const cacheRow = {
    ticker: upperTicker,
    price: quote.price,
    change_amount: quote.changeAmount,
    change_percent: quote.changePercent,
    volume: quote.volume,
    market_cap: overview?.marketCap as number ?? null,
    pe_ratio: overview?.peRatio as number ?? null,
    week_52_high: overview?.week52High as number ?? null,
    week_52_low: overview?.week52Low as number ?? null,
    raw_data: overview ?? {},
    last_refreshed: new Date().toISOString(),
  }

  const { data, error } = await adminClient
    .from('stock_cache')
    .upsert(cacheRow, { onConflict: 'ticker' })
    .select()
    .single()

  if (error) {
    console.error(`Failed to cache ${upperTicker}:`, error.message)
    return null
  }

  return data as CachedStock
}

export async function getOrRefreshPrice(ticker: string): Promise<CachedStock | null> {
  const cached = await getCachedPrice(ticker)
  if (cached) return cached

  return refreshStockCache(ticker)
}

export async function batchRefresh(tickers: string[]): Promise<{ refreshed: number; failed: number }> {
  let refreshed = 0
  let failed = 0

  for (const ticker of tickers) {
    const result = await refreshStockCache(ticker)
    if (result) {
      refreshed++
    } else {
      failed++
    }
    // Rate limit spacing: wait 12s between calls to stay under 5/min
    if (tickers.indexOf(ticker) < tickers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 12500))
    }
  }

  return { refreshed, failed }
}
