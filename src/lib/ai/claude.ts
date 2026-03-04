const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || ''
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!CLAUDE_API_KEY) {
    throw new Error('CLAUDE_API_KEY not configured')
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error: ${res.status} ${err}`)
  }

  const data = await res.json()
  const content = data.content?.[0]
  if (content?.type === 'text') {
    return content.text
  }
  throw new Error('Unexpected Claude response format')
}

function extractJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON found in response')
  return JSON.parse(match[0]) as T
}

export type StockThesis = {
  bull_case: string
  bear_case: string
  catalysts: string[]
  risks: string[]
  verdict: string
  confidence: number
  price_target_low: number
  price_target_high: number
}

export async function analyzeStock(
  ticker: string,
  stockData: Record<string, unknown>,
  archetype?: string
): Promise<StockThesis> {
  const system = `You are a senior equity analyst. Provide objective, data-driven stock analysis.
Return ONLY valid JSON with these exact fields:
- bull_case: string (2-3 sentences)
- bear_case: string (2-3 sentences)
- catalysts: string[] (3-5 near-term catalysts)
- risks: string[] (3-5 key risks)
- verdict: string (BUY / HOLD / SELL / AVOID)
- confidence: number (0-100)
- price_target_low: number
- price_target_high: number

${archetype ? `The investor has a "${archetype}" personality archetype. Tailor risk framing and language to their style.` : ''}`

  const userPrompt = `Analyze ${ticker} for an investment thesis.

Current data: ${JSON.stringify(stockData)}

Provide your analysis as JSON.`

  const response = await callClaude(system, userPrompt)
  return extractJson<StockThesis>(response)
}

export type FlightPlanItem = {
  action: 'BUY' | 'SELL' | 'WATCH' | 'REBALANCE' | 'RESEARCH'
  ticker: string
  rationale: string
  urgency: 'low' | 'medium' | 'high'
  archetype_fit: string
}

export async function generateFlightPlan(
  archetype: string,
  holdings: Array<{ ticker: string; shares: number; purchasePrice: number }>,
  watchlist: string[],
  marketContext: Record<string, unknown>
): Promise<FlightPlanItem[]> {
  const system = `You are a personalized financial advisor creating a daily "Flight Plan" -- 3-5 actionable items.

Return ONLY a JSON array of items, each with:
- action: "BUY" | "SELL" | "WATCH" | "REBALANCE" | "RESEARCH"
- ticker: string
- rationale: string (1-2 sentences, personalized to archetype)
- urgency: "low" | "medium" | "high"
- archetype_fit: string (brief note on why this fits the investor's style)

Tailor recommendations to the "${archetype}" investor archetype.
Consider portfolio concentration, sector balance, and recent market moves.`

  const userPrompt = `Generate today's Flight Plan.

Investor Archetype: ${archetype}
Current Holdings: ${JSON.stringify(holdings)}
Watchlist: ${JSON.stringify(watchlist)}
Market Context: ${JSON.stringify(marketContext)}

Return 3-5 items as a JSON array.`

  const response = await callClaude(system, userPrompt)
  const match = response.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('No JSON array found')
  return JSON.parse(match[0]) as FlightPlanItem[]
}
