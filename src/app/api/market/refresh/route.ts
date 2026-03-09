import { NextRequest, NextResponse } from "next/server";
import { batchRefresh } from "@/lib/market-data/cache";
import { stocks } from "@/lib/stock-data";

/**
 * POST /api/market/refresh
 * Triggers a full refresh of all instruments via Yahoo Finance.
 * Protected by CRON_SECRET for scheduled use, or callable internally.
 */
export async function POST(request: NextRequest) {
  // Optional auth for cron jobs
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickers = stocks.map((s) => s.ticker);
  const result = await batchRefresh(tickers);

  return NextResponse.json({
    message: `Refreshed ${result.refreshed}/${tickers.length} instruments`,
    ...result,
    total: tickers.length,
    timestamp: new Date().toISOString(),
  });
}
