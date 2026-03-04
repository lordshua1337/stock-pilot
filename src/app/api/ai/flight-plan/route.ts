import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/server'
import { adminClient } from '@/lib/supabase/client'
import { generateFlightPlan } from '@/lib/ai/claude'
import { logError } from '@/lib/error-logger'

export async function GET() {
  try {
    const user = await requireUser()
    const today = new Date().toISOString().split('T')[0]

    // Check for today's plan
    const { data: existing } = await adminClient
      .from('flight_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_date', today)
      .single()

    if (existing) {
      return NextResponse.json({ plan: existing, cached: true })
    }

    return NextResponse.json({ plan: null, message: 'No plan for today. Generate one with POST.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch plan'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Sign in to view Flight Plan' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST() {
  try {
    const user = await requireUser()
    const today = new Date().toISOString().split('T')[0]

    // Check if already generated today
    const { data: existing } = await adminClient
      .from('flight_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_date', today)
      .single()

    if (existing) {
      return NextResponse.json({ plan: existing, cached: true })
    }

    // Get user's archetype
    const { data: personality } = await adminClient
      .from('personality_results')
      .select('archetype, archetype_label')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const archetype = personality?.archetype ?? 'balanced'

    // Get user's holdings
    const { data: portfolios } = await adminClient
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    let holdings: Array<{ ticker: string; shares: number; purchasePrice: number }> = []
    if (portfolios && portfolios.length > 0) {
      const { data: holdingsData } = await adminClient
        .from('holdings')
        .select('ticker, shares, purchase_price')
        .eq('portfolio_id', portfolios[0].id)

      holdings = (holdingsData ?? []).map(h => ({
        ticker: h.ticker,
        shares: Number(h.shares),
        purchasePrice: Number(h.purchase_price),
      }))
    }

    // Get user's watchlists
    const { data: watchlists } = await adminClient
      .from('watchlists')
      .select('tickers')
      .eq('user_id', user.id)

    const watchlistTickers = (watchlists ?? []).flatMap(w => w.tickers || [])

    // Generate the flight plan
    const items = await generateFlightPlan(archetype, holdings, watchlistTickers, {
      date: today,
      market_hours: true,
    })

    // Store it
    const { data: plan, error } = await adminClient
      .from('flight_plans')
      .insert({
        user_id: user.id,
        plan_date: today,
        items,
        archetype,
        portfolio_context: { holdings_count: holdings.length, watchlist_count: watchlistTickers.length },
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ plan, cached: false })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate plan'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Sign in to generate Flight Plan' }, { status: 401 })
    }
    logError('/api/ai/flight-plan', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
