import { NextRequest, NextResponse } from 'next/server'
import { getOrRefreshPrice } from '@/lib/market-data/cache'

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'ticker parameter required' }, { status: 400 })
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
