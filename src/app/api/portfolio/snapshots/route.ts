import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/server'
import { adminClient } from '@/lib/supabase/client'
import { calculateMetrics } from '@/lib/portfolio/metrics'
import { getCachedPrice } from '@/lib/market-data/cache'

export async function GET() {
  try {
    const user = await requireUser()

    const { data: snapshots } = await adminClient
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('snapshot_date', { ascending: false })
      .limit(30)

    return NextResponse.json({ snapshots: snapshots ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Sign in to view snapshots' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Create today's snapshot
export async function POST() {
  try {
    const user = await requireUser()

    const { data: portfolios } = await adminClient
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)

    if (!portfolios || portfolios.length === 0) {
      return NextResponse.json({ error: 'No portfolio found' }, { status: 404 })
    }

    const results = []

    for (const portfolio of portfolios) {
      const { data: holdings } = await adminClient
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolio.id)

      if (!holdings || holdings.length === 0) continue

      // Get current prices
      const holdingsWithPrices = await Promise.all(
        holdings.map(async (h) => {
          const cached = await getCachedPrice(h.ticker)
          return {
            ticker: h.ticker,
            shares: Number(h.shares),
            purchasePrice: Number(h.purchase_price),
            currentPrice: cached?.price ?? Number(h.purchase_price),
          }
        })
      )

      const metrics = calculateMetrics(holdingsWithPrices)

      const { data: snapshot, error } = await adminClient
        .from('portfolio_snapshots')
        .upsert({
          portfolio_id: portfolio.id,
          user_id: user.id,
          snapshot_date: new Date().toISOString().split('T')[0],
          total_value: metrics.totalValue,
          total_cost: metrics.totalCost,
          daily_change: metrics.dailyChange,
          holdings_snapshot: holdingsWithPrices,
        }, { onConflict: 'portfolio_id,snapshot_date' })
        .select()
        .single()

      if (!error && snapshot) results.push(snapshot)
    }

    return NextResponse.json({ snapshots: results })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Sign in to create snapshots' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
