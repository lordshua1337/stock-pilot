// Lightweight error logger that persists errors to Supabase.
// Fire-and-forget: never blocks the request, never throws.

import { adminClient } from "@/lib/supabase/client";

interface ErrorMetadata {
  [key: string]: unknown;
}

export function logError(
  route: string,
  error: unknown,
  metadata?: ErrorMetadata,
  userId?: string
): void {
  // Fire and forget -- don't await, don't throw
  const message =
    error instanceof Error ? error.message : String(error);
  const stack =
    error instanceof Error ? error.stack ?? null : null;

  Promise.resolve(
    adminClient
      .from("error_logs")
      .insert({
        route,
        message,
        stack,
        metadata: metadata ?? {},
        user_id: userId ?? null,
      })
  ).then(({ error: insertError }) => {
    if (insertError) {
      console.error("[error-logger] Failed to persist error:", insertError.message);
    }
  }).catch(() => {
    // Swallow -- we tried our best
  });
}
