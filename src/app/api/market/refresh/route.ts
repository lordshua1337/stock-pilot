import { NextResponse } from 'next/server'
import { batchRefresh } from '@/lib/market-data/cache'
import { stocks } from '@/lib/stock-data'

export async function POST() {
  // Server-only batch refresh for all tracked stocks
  const tickers = stocks.map(s => s.ticker)
  const result = await batchRefresh(tickers)

  return NextResponse.json({
    message: `Refreshed ${result.refreshed} stocks, ${result.failed} failed`,
    ...result,
    total: tickers.length,
  })
}
