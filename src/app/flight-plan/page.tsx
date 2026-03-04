'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, RefreshCw, Zap, TrendingUp, TrendingDown, Eye, BarChart3, Search } from 'lucide-react'

type FlightPlanItem = {
  action: string
  ticker: string
  rationale: string
  urgency: string
  archetype_fit: string
}

type FlightPlan = {
  id: string
  plan_date: string
  items: FlightPlanItem[]
  archetype: string
}

const ACTION_STYLES: Record<string, { bg: string; text: string; icon: typeof TrendingUp }> = {
  BUY: { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-400', icon: TrendingUp },
  SELL: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', icon: TrendingDown },
  WATCH: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', icon: Eye },
  REBALANCE: { bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-400', icon: BarChart3 },
  RESEARCH: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', icon: Search },
}

const URGENCY_COLORS: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-zinc-500',
}

export default function FlightPlanPage() {
  const [plan, setPlan] = useState<FlightPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(d => {
        setAuthenticated(d.authenticated)
        if (d.authenticated) fetchPlan()
      })
  }, [])

  async function fetchPlan() {
    const res = await fetch('/api/ai/flight-plan')
    if (res.ok) {
      const data = await res.json()
      if (data.plan) setPlan(data.plan)
    }
  }

  async function generatePlan() {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/ai/flight-plan', { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setPlan(data.plan)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to generate plan')
    }
    setLoading(false)
  }

  if (authenticated === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Zap className="w-12 h-12 text-[#00C853] mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-3">Flight Plan</h1>
        <p className="text-zinc-400 mb-6">
          Your daily personalized action items. Sign in to unlock AI-powered recommendations
          tailored to your Investor Identity archetype.
        </p>
        <Link href="/auth"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#00C853] text-black font-semibold rounded-lg hover:bg-[#00E676] transition-colors">
          Sign In to Get Started <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-[#00C853]" />
            Flight Plan
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {plan ? `Generated for ${plan.plan_date}` : "Your daily personalized action items"}
          </p>
        </div>
        <button onClick={generatePlan} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#00C853] text-black text-sm font-semibold rounded-lg hover:bg-[#00E676] transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generating...' : plan ? 'Refresh' : 'Generate'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-sm text-red-400">
          {error}
        </div>
      )}

      {plan && plan.items && (
        <div className="space-y-4">
          {(plan.items as FlightPlanItem[]).map((item, i) => {
            const style = ACTION_STYLES[item.action] || ACTION_STYLES.WATCH
            const Icon = style.icon
            return (
              <div key={i} className={`${style.bg} border rounded-xl p-5 transition-all hover:scale-[1.01]`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${style.text}`} />
                    </div>
                    <div>
                      <span className={`text-xs font-bold ${style.text} uppercase`}>{item.action}</span>
                      <h3 className="text-lg font-bold text-white font-mono">{item.ticker}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${URGENCY_COLORS[item.urgency] || URGENCY_COLORS.low}`} />
                    <span className="text-xs text-zinc-500 capitalize">{item.urgency}</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-300 mb-2">{item.rationale}</p>
                <p className="text-xs text-zinc-500 italic">{item.archetype_fit}</p>
              </div>
            )
          })}
        </div>
      )}

      {!plan && !loading && !error && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Zap className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">No Flight Plan for today yet.</p>
          <button onClick={generatePlan}
            className="px-6 py-2.5 bg-[#00C853] text-black font-semibold rounded-lg hover:bg-[#00E676] transition-colors text-sm">
            Generate Today&apos;s Plan
          </button>
        </div>
      )}
    </div>
  )
}
