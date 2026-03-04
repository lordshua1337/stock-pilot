import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/auth/server'
import { adminClient } from '@/lib/supabase/client'

const WatchlistSchema = z.object({
  watchlist_name: z.string().min(1).max(100).optional(),
  tickers: z.array(z.string().min(1).max(10)),
})

export async function GET() {
  try {
    const user = await requireUser()

    const { data: watchlists } = await adminClient
      .from('watchlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ watchlists: watchlists ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Sign in to view watchlists' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const body = await request.json()
    const parsed = WatchlistSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { data: watchlist, error } = await adminClient
      .from('watchlists')
      .insert({
        user_id: user.id,
        watchlist_name: parsed.data.watchlist_name ?? 'My Watchlist',
        tickers: parsed.data.tickers.map(t => t.toUpperCase()),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ watchlist }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Sign in to create watchlists' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
