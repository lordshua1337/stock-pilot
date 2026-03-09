import { adminClient } from "@/lib/supabase/client";
import {
  fetchYahooBatch,
  getCacheTTLMinutes,
  type YahooQuote,
} from "./yahoo";

export type CachedStock = {
  ticker: string;
  price: number;
  change_amount: number;
  change_percent: number;
  volume: number;
  market_cap: number | null;
  pe_ratio: number | null;
  week_52_high: number | null;
  week_52_low: number | null;
  raw_data: Record<string, unknown>;
  last_refreshed: string;
};

/**
 * Get all cached prices, returning only rows that are within TTL.
 */
export async function getAllCachedPrices(): Promise<Map<string, CachedStock>> {
  const { data } = await adminClient
    .from("stock_cache")
    .select("*")
    .order("ticker");

  const results = new Map<string, CachedStock>();
  if (!data) return results;

  const ttlMs = getCacheTTLMinutes() * 60 * 1000;
  const now = Date.now();

  for (const row of data) {
    const age = now - new Date(row.last_refreshed).getTime();
    if (age <= ttlMs) {
      results.set(row.ticker, row as CachedStock);
    }
  }

  return results;
}

/**
 * Get cached price for a single ticker. Returns null if stale or missing.
 */
export async function getCachedPrice(
  ticker: string
): Promise<CachedStock | null> {
  const { data } = await adminClient
    .from("stock_cache")
    .select("*")
    .eq("ticker", ticker.toUpperCase())
    .single();

  if (!data) return null;

  const ttlMs = getCacheTTLMinutes() * 60 * 1000;
  const age = Date.now() - new Date(data.last_refreshed).getTime();

  if (age > ttlMs) return null;

  return data as CachedStock;
}

/**
 * Write a batch of Yahoo quotes to the Supabase cache.
 */
async function writeCacheRows(
  quotes: Map<string, YahooQuote>
): Promise<number> {
  if (quotes.size === 0) return 0;

  const rows = Array.from(quotes.values()).map((q) => ({
    ticker: q.ticker,
    price: q.price,
    change_amount: q.changeAmount,
    change_percent: q.changePercent,
    volume: q.volume,
    market_cap: q.marketCap,
    pe_ratio: q.peRatio,
    week_52_high: q.fiftyTwoHigh,
    week_52_low: q.fiftyTwoLow,
    raw_data: {},
    last_refreshed: new Date().toISOString(),
  }));

  // Upsert in chunks of 50 to avoid payload limits
  let written = 0;
  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50);
    const { error } = await adminClient
      .from("stock_cache")
      .upsert(chunk, { onConflict: "ticker" });

    if (error) {
      console.error("Cache write failed:", error.message);
    } else {
      written += chunk.length;
    }
  }

  return written;
}

/**
 * Refresh all given tickers via Yahoo Finance and update the cache.
 * Returns the count of successfully refreshed instruments.
 */
export async function batchRefresh(
  tickers: string[]
): Promise<{ refreshed: number; failed: number }> {
  const quotes = await fetchYahooBatch(tickers);
  const refreshed = await writeCacheRows(quotes);
  const failed = tickers.length - refreshed;

  return { refreshed, failed };
}

/**
 * Smart refresh: checks which tickers are stale, only fetches those.
 * Returns a merged map of all current prices (cached + freshly fetched).
 */
export async function smartRefresh(
  tickers: string[]
): Promise<Map<string, CachedStock>> {
  // 1. Get all currently cached data
  const cached = await getAllCachedPrices();

  // 2. Find stale or missing tickers
  const stale = tickers.filter((t) => !cached.has(t.toUpperCase()));

  // 3. If nothing is stale, return cached data
  if (stale.length === 0) return cached;

  // 4. Fetch stale tickers from Yahoo
  const freshQuotes = await fetchYahooBatch(stale);

  // 5. Write fresh data to cache
  await writeCacheRows(freshQuotes);

  // 6. Merge fresh into cached and return
  for (const [ticker, quote] of freshQuotes) {
    cached.set(ticker, {
      ticker: quote.ticker,
      price: quote.price,
      change_amount: quote.changeAmount,
      change_percent: quote.changePercent,
      volume: quote.volume,
      market_cap: quote.marketCap,
      pe_ratio: quote.peRatio,
      week_52_high: quote.fiftyTwoHigh,
      week_52_low: quote.fiftyTwoLow,
      raw_data: {},
      last_refreshed: new Date().toISOString(),
    });
  }

  return cached;
}

/**
 * Get or refresh a single ticker price.
 */
export async function getOrRefreshPrice(
  ticker: string
): Promise<CachedStock | null> {
  const cached = await getCachedPrice(ticker);
  if (cached) return cached;

  const result = await batchRefresh([ticker]);
  if (result.refreshed === 0) return null;

  return getCachedPrice(ticker);
}
