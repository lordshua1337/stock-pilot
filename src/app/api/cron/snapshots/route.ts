import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/client";

// Cron endpoint: creates daily portfolio snapshots for ALL users.
// Protected by a shared secret (CRON_SECRET env var).
// Called by pg_cron or an external scheduler.

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all portfolios with their holdings
    const { data: portfolios, error: portfolioError } = await adminClient
      .from("portfolios")
      .select("id, user_id");

    if (portfolioError || !portfolios) {
      return NextResponse.json(
        { error: "Failed to fetch portfolios" },
        { status: 500 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    let snapshotCount = 0;

    for (const portfolio of portfolios) {
      const { data: holdings } = await adminClient
        .from("holdings")
        .select("ticker, shares, purchase_price")
        .eq("portfolio_id", portfolio.id);

      if (!holdings || holdings.length === 0) continue;

      // Look up current prices from stock_cache
      const tickers = holdings.map((h) => h.ticker);
      const { data: prices } = await adminClient
        .from("stock_cache")
        .select("ticker, price, change_amount")
        .in("ticker", tickers);

      const priceMap = new Map(
        (prices ?? []).map((p) => [p.ticker, p])
      );

      let totalValue = 0;
      let totalCost = 0;
      let dailyChange = 0;
      const holdingsSnapshot = [];

      for (const h of holdings) {
        const shares = Number(h.shares);
        const purchasePrice = Number(h.purchase_price);
        const cached = priceMap.get(h.ticker);
        const currentPrice = cached ? Number(cached.price) : purchasePrice;
        const change = cached ? Number(cached.change_amount) : 0;

        totalValue += shares * currentPrice;
        totalCost += shares * purchasePrice;
        dailyChange += shares * change;

        holdingsSnapshot.push({
          ticker: h.ticker,
          shares,
          purchasePrice,
          currentPrice,
        });
      }

      const { error: upsertError } = await adminClient
        .from("portfolio_snapshots")
        .upsert(
          {
            portfolio_id: portfolio.id,
            user_id: portfolio.user_id,
            snapshot_date: today,
            total_value: totalValue,
            total_cost: totalCost,
            daily_change: dailyChange,
            holdings_snapshot: holdingsSnapshot,
          },
          { onConflict: "portfolio_id,snapshot_date" }
        );

      if (!upsertError) snapshotCount++;
    }

    return NextResponse.json({
      success: true,
      date: today,
      portfoliosProcessed: portfolios.length,
      snapshotsCreated: snapshotCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron snapshot failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
