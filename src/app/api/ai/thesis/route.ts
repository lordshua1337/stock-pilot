import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/auth/server'
import { adminClient } from '@/lib/supabase/client'
import { analyzeStock } from '@/lib/ai/claude'
import { getOrRefreshPrice } from '@/lib/market-data/cache'
import { logError } from '@/lib/error-logger'

const ThesisSchema = z.object({
  ticker: z.string().min(1).max(10),
})

// Rate limit: 10 analyses per day per user
async function checkRateLimit(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]
  const { count } = await adminClient
    .from('ai_analyses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`)

  return (count ?? 0) < 10
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()

    const body = await request.json()
    const parsed = ThesisSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid ticker' }, { status: 400 })
    }

    const { ticker } = parsed.data
    const upperTicker = ticker.toUpperCase()

    // Check for cached analysis (7-day TTL)
    const { data: cached } = await adminClient
      .from('ai_analyses')
      .select('result, created_at')
      .eq('user_id', user.id)
      .eq('ticker', upperTicker)
      .eq('analysis_type', 'thesis')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (cached) {
      return NextResponse.json({ thesis: cached.result, cached: true })
    }

    // Rate limit check
    const allowed = await checkRateLimit(user.id)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Daily analysis limit reached (10/day). Try again tomorrow.' },
        { status: 429 }
      )
    }

    // Get market data for context
    const stockData = await getOrRefreshPrice(upperTicker)
    const stockContext = stockData
      ? { price: stockData.price, change: stockData.change_percent, pe: stockData.pe_ratio, cap: stockData.market_cap }
      : { ticker: upperTicker }

    // Get user archetype if available
    const { data: personality } = await adminClient
      .from('personality_results')
      .select('archetype')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const thesis = await analyzeStock(upperTicker, stockContext, personality?.archetype)

    // Cache the result
    await adminClient.from('ai_analyses').insert({
      user_id: user.id,
      ticker: upperTicker,
      analysis_type: 'thesis',
      result: thesis,
      archetype_context: personality?.archetype ?? null,
    })

    return NextResponse.json({ thesis, cached: false })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Sign in to use AI analysis' }, { status: 401 })
    }
    logError('/api/ai/thesis', error, { ticker: 'unknown' })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
