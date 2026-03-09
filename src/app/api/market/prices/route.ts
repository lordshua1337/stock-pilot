import { NextResponse } from "next/server";
import { smartRefresh } from "@/lib/market-data/cache";
import { stocks } from "@/lib/stock-data";

/**
 * GET /api/market/prices
 * Returns current prices for all instruments in the universe.
 * Uses smart caching: serves fresh cache if available, fetches stale tickers
 * from Yahoo Finance in the background.
 */
export async function GET() {
  const tickers = stocks.map((s) => s.ticker);
  const prices = await smartRefresh(tickers);

  // Convert Map to a plain object for JSON serialization
  const priceMap: Record<
    string,
    {
      price: number;
      change_amount: number;
      change_percent: number;
      volume: number;
      market_cap: number | null;
      pe_ratio: number | null;
      week_52_high: number | null;
      week_52_low: number | null;
      last_refreshed: string;
    }
  > = {};

  for (const [ticker, data] of prices) {
    priceMap[ticker] = {
      price: data.price,
      change_amount: data.change_amount,
      change_percent: data.change_percent,
      volume: data.volume,
      market_cap: data.market_cap,
      pe_ratio: data.pe_ratio,
      week_52_high: data.week_52_high,
      week_52_low: data.week_52_low,
      last_refreshed: data.last_refreshed,
    };
  }

  return NextResponse.json({
    prices: priceMap,
    count: prices.size,
    total: tickers.length,
    timestamp: new Date().toISOString(),
  });
}

// Prevent caching at the CDN level -- always fresh
export const dynamic = "force-dynamic";
