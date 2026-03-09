import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export type YahooQuote = {
  ticker: string;
  price: number;
  changeAmount: number;
  changePercent: number;
  volume: number;
  marketCap: number | null;
  peRatio: number | null;
  dividendYield: number | null;
  fiftyTwoHigh: number | null;
  fiftyTwoLow: number | null;
};

/**
 * Fetch a single quote from Yahoo Finance.
 */
export async function fetchYahooQuote(
  ticker: string
): Promise<YahooQuote | null> {
  try {
    const quote = await yahooFinance.quote(ticker);
    if (!quote || !quote.regularMarketPrice) return null;

    return {
      ticker: quote.symbol ?? ticker,
      price: quote.regularMarketPrice,
      changeAmount: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      volume: quote.regularMarketVolume ?? 0,
      marketCap: (quote as Record<string, unknown>).marketCap as number ?? null,
      peRatio: (quote as Record<string, unknown>).trailingPE as number ?? null,
      dividendYield:
        (quote as Record<string, unknown>).dividendYield as number ?? null,
      fiftyTwoHigh:
        (quote as Record<string, unknown>).fiftyTwoWeekHigh as number ?? null,
      fiftyTwoLow:
        (quote as Record<string, unknown>).fiftyTwoWeekLow as number ?? null,
    };
  } catch (err) {
    console.error(`Yahoo quote failed for ${ticker}:`, err);
    return null;
  }
}

/**
 * Fetch quotes for multiple tickers in a single batched request.
 * Yahoo Finance supports up to ~1500 symbols per request.
 */
export async function fetchYahooBatch(
  tickers: string[]
): Promise<Map<string, YahooQuote>> {
  const results = new Map<string, YahooQuote>();

  if (tickers.length === 0) return results;

  try {
    const quotes = await yahooFinance.quote(tickers, {
      return: "object",
    });

    for (const [symbol, quote] of Object.entries(
      quotes as Record<string, Record<string, unknown>>
    )) {
      const price = quote.regularMarketPrice as number | undefined;
      if (!price) continue;

      results.set(symbol, {
        ticker: symbol,
        price,
        changeAmount: (quote.regularMarketChange as number) ?? 0,
        changePercent: (quote.regularMarketChangePercent as number) ?? 0,
        volume: (quote.regularMarketVolume as number) ?? 0,
        marketCap: (quote.marketCap as number) ?? null,
        peRatio: (quote.trailingPE as number) ?? null,
        dividendYield: (quote.dividendYield as number) ?? null,
        fiftyTwoHigh: (quote.fiftyTwoWeekHigh as number) ?? null,
        fiftyTwoLow: (quote.fiftyTwoWeekLow as number) ?? null,
      });
    }
  } catch (err) {
    console.error("Yahoo batch quote failed:", err);

    // Fallback: fetch individually via quoteCombine
    const promises = tickers.map(async (ticker) => {
      const q = await fetchYahooQuote(ticker);
      if (q) results.set(ticker, q);
    });
    await Promise.all(promises);
  }

  return results;
}

/**
 * Check if the US stock market is currently open.
 * Market hours: 9:30 AM - 4:00 PM ET, Monday-Friday.
 */
export function isMarketOpen(): boolean {
  const now = new Date();
  const et = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const day = et.getDay();
  const hours = et.getHours();
  const minutes = et.getMinutes();
  const timeMinutes = hours * 60 + minutes;

  // Weekday check (Mon=1 through Fri=5)
  if (day === 0 || day === 6) return false;

  // Market hours: 9:30 AM (570 min) to 4:00 PM (960 min)
  return timeMinutes >= 570 && timeMinutes <= 960;
}

/**
 * Determine the appropriate cache TTL in minutes based on market state.
 * - Market open: 5 minutes
 * - Pre/post market (weekday): 30 minutes
 * - Weekend/holiday: 360 minutes (6 hours)
 */
export function getCacheTTLMinutes(): number {
  const now = new Date();
  const et = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const day = et.getDay();

  if (day === 0 || day === 6) return 360;

  if (isMarketOpen()) return 5;

  return 30;
}
