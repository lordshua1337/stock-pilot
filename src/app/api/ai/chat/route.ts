import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/server";
import { adminClient } from "@/lib/supabase/client";
import { logError } from "@/lib/error-logger";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || "";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(MessageSchema).max(50).default([]),
  systemContext: z.string().max(6000),
});

// ---------------------------------------------------------------------------
// Rate limiting: 30 chat messages per day per user
// ---------------------------------------------------------------------------

async function checkChatRateLimit(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];
  const { count, error } = await adminClient
    .from("ai_chat_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", `${today}T00:00:00`);

  // Deny on query failure to prevent bypass
  if (error) return false;

  return (count ?? 0) < 30;
}

async function recordChatUsage(userId: string): Promise<void> {
  await adminClient.from("ai_chat_usage").insert({ user_id: userId });
}

// ---------------------------------------------------------------------------
// Streaming SSE handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { message, history, systemContext } = parsed.data;

    // Rate limit check
    const allowed = await checkChatRateLimit(user.id);
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: "Daily chat limit reached (30/day). Try again tomorrow.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!CLAUDE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build conversation messages (history + new message)
    const messages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: message },
    ];

    // Call Claude with streaming
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        stream: true,
        system: systemContext,
        messages,
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      logError("/api/ai/chat", new Error(`Claude API: ${claudeRes.status}`), {
        response: errText,
      });
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Record usage only after successful Claude connection
    recordChatUsage(user.id);

    // Stream SSE response back to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = claudeRes.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Parse SSE events from buffer
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();

              if (data === "[DONE]") continue;

              try {
                const event = JSON.parse(data);

                if (
                  event.type === "content_block_delta" &&
                  event.delta?.type === "text_delta"
                ) {
                  const chunk = event.delta.text;
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
                  );
                }

                if (event.type === "message_stop") {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
                  );
                }
              } catch {
                // Skip unparseable events
              }
            }
          }
        } catch (err) {
          logError("/api/ai/chat", err, { phase: "streaming" });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Chat request failed";
    if (message === "Unauthorized") {
      return new Response(
        JSON.stringify({ error: "Sign in to use the AI Copilot" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    logError("/api/ai/chat", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
