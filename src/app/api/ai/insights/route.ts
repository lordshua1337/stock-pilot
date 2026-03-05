import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/server";
import { adminClient } from "@/lib/supabase/client";
import { logError } from "@/lib/error-logger";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || "";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const InsightRequestSchema = z.object({
  systemPrompt: z.string().min(1).max(4000),
  userPrompt: z.string().min(1).max(3000),
  pageId: z.string().min(1).max(50),
});

// ---------------------------------------------------------------------------
// Rate limiting: 20 insight requests per day per user
// ---------------------------------------------------------------------------

async function checkInsightRateLimit(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];
  const { count, error } = await adminClient
    .from("ai_chat_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", `${today}T00:00:00`);

  if (error) return false;
  return (count ?? 0) < 50; // shared pool with chat (50 total)
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const body = await request.json();
    const parsed = InsightRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { systemPrompt, userPrompt, pageId } = parsed.data;

    const allowed = await checkInsightRateLimit(user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: "Daily AI limit reached. Try again tomorrow." },
        { status: 429 }
      );
    }

    if (!CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
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
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      logError("/api/ai/insights", new Error(`Claude: ${claudeRes.status}`), {
        response: errText,
        pageId,
      });
      return NextResponse.json(
        { error: "AI service error" },
        { status: 502 }
      );
    }

    // Record usage after successful call
    adminClient
      .from("ai_chat_usage")
      .insert({ user_id: user.id })
      .then(() => {});

    const data = await claudeRes.json();
    const content = data.content?.[0];
    if (content?.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected AI response" },
        { status: 502 }
      );
    }

    return NextResponse.json({ text: content.text });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Insight generation failed";
    if (message === "Unauthorized") {
      return NextResponse.json(
        { error: "Sign in for AI insights" },
        { status: 401 }
      );
    }
    logError("/api/ai/insights", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
