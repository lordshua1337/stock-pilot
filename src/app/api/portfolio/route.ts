import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/auth/server'
import { adminClient } from '@/lib/supabase/client'

const CreateHoldingSchema = z.object({
  ticker: z.string().min(1).max(10),
  shares: z.number().positive(),
  purchase_price: z.number().positive(),
  purchase_date: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET() {
  try {
    const user = await requireUser()

    // Get or create default portfolio
    let { data: portfolios } = await adminClient
      .from('portfolios')
      .select('*, holdings(*)')
      .eq('user_id', user.id)

    if (!portfolios || portfolios.length === 0) {
      const { data: newPortfolio } = await adminClient
        .from('portfolios')
        .insert({ user_id: user.id, portfolio_name: 'My Portfolio' })
        .select('*, holdings(*)')
        .single()

      portfolios = newPortfolio ? [newPortfolio] : []
    }

    return NextResponse.json({ portfolios })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Sign in to view portfolio' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const body = await request.json()
    const parsed = CreateHoldingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    // Get or create default portfolio
    let { data: portfolio } = await adminClient
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!portfolio) {
      const { data: newPortfolio } = await adminClient
        .from('portfolios')
        .insert({ user_id: user.id, portfolio_name: 'My Portfolio' })
        .select('id')
        .single()
      portfolio = newPortfolio
    }

    if (!portfolio) {
      return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 })
    }

    const { data: holding, error } = await adminClient
      .from('holdings')
      .insert({
        portfolio_id: portfolio.id,
        user_id: user.id,
        ticker: parsed.data.ticker.toUpperCase(),
        shares: parsed.data.shares,
        purchase_price: parsed.data.purchase_price,
        purchase_date: parsed.data.purchase_date ?? null,
        notes: parsed.data.notes ?? null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ holding }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed'
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Sign in to add holdings' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
