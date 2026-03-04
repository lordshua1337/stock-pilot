const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || ''
const BASE_URL = 'https://www.alphavantage.co/query'

export type QuoteData = {
  ticker: string
  price: number
  changeAmount: number
  changePercent: number
  volume: number
  previousClose: number
}

export async function fetchQuote(ticker: string): Promise<QuoteData | null> {
  if (!API_KEY) return null

  const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${API_KEY}`

  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) return null

  const data = await res.json()
  const quote = data['Global Quote']

  if (!quote || !quote['05. price']) return null

  return {
    ticker,
    price: parseFloat(quote['05. price']),
    changeAmount: parseFloat(quote['09. change']),
    changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
    volume: parseInt(quote['06. volume'] || '0', 10),
    previousClose: parseFloat(quote['08. previous close'] || '0'),
  }
}

export async function fetchOverview(ticker: string): Promise<Record<string, unknown> | null> {
  if (!API_KEY) return null

  const url = `${BASE_URL}?function=OVERVIEW&symbol=${encodeURIComponent(ticker)}&apikey=${API_KEY}`

  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) return null

  const data = await res.json()
  if (!data['MarketCapitalization']) return null

  return {
    marketCap: parseFloat(data['MarketCapitalization'] || '0'),
    peRatio: parseFloat(data['PERatio'] || '0'),
    week52High: parseFloat(data['52WeekHigh'] || '0'),
    week52Low: parseFloat(data['52WeekLow'] || '0'),
    eps: parseFloat(data['EPS'] || '0'),
    dividendYield: parseFloat(data['DividendYield'] || '0'),
    sector: data['Sector'] || '',
    industry: data['Industry'] || '',
  }
}

// Rate limiter: 5 calls per minute for free tier
let callTimestamps: number[] = []
const MAX_CALLS_PER_MINUTE = 5

export async function rateLimitedFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  const now = Date.now()
  callTimestamps = callTimestamps.filter(t => now - t < 60000)

  if (callTimestamps.length >= MAX_CALLS_PER_MINUTE) {
    return null
  }

  callTimestamps.push(now)
  return fn()
}
