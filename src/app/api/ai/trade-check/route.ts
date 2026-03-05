import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/server";
import { adminClient } from "@/lib/supabase/client";
import { logError } from "@/lib/error-logger";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || "";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const TradeCheckSchema = z.object({
  systemPrompt: z.string().min(1).max(5000),
  userPrompt: z.string().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const body = await request.json();
    const parsed = TradeCheckSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!CLAUDE_API_KEY) {
      return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    }

    // Rate limit: shared pool
    const today = new Date().toISOString().split("T")[0];
    const { count, error: countErr } = await adminClient
      .from("ai_chat_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00`);

    if (countErr || (count ?? 0) >= 50) {
      return NextResponse.json(
        { error: "Daily AI limit reached" },
        { status: 429 }
      );
    }

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        system: parsed.data.systemPrompt,
        messages: [{ role: "user", content: parsed.data.userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      logError("/api/ai/trade-check", new Error(`Claude: ${claudeRes.status}`));
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    // Record usage after success
    adminClient.from("ai_chat_usage").insert({ user_id: user.id }).then(() => {});

    const data = await claudeRes.json();
    const content = data.content?.[0];
    if (content?.type !== "text") {
      return NextResponse.json({ error: "Unexpected response" }, { status: 502 });
    }

    return NextResponse.json({ text: content.text });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed";
    if (msg === "Unauthorized") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    logError("/api/ai/trade-check", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
