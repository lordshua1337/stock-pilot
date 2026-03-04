import { NextRequest, NextResponse } from 'next/server'
import { getOrRefreshPrice } from '@/lib/market-data/cache'

const TICKER_PATTERN = /^[A-Z]{1,10}$/

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'ticker parameter required' }, { status: 400 })
  }

  if (!TICKER_PATTERN.test(ticker.toUpperCase())) {
    return NextResponse.json({ error: 'Invalid ticker format' }, { status: 400 })
  }

  const data = await getOrRefreshPrice(ticker)

  if (!data) {
    return NextResponse.json(
      { error: 'Unable to fetch price. API limit may be reached.', ticker },
      { status: 503 }
    )
  }

  return NextResponse.json({ stock: data })
}
