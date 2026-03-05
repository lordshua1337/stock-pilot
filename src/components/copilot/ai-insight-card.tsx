"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { gatherCopilotContext } from "@/lib/ai/copilot-context";
import {
  buildInsightPrompt,
  parseInsightResponse,
  type AIInsight,
  type PageId,
} from "@/lib/ai/insight-generator";
import {
  getCachedInsight,
  cacheInsight,
  isDismissed,
  dismissInsight,
  clearDismissal,
  invalidateCache,
  buildCacheKey,
} from "@/lib/ai/insight-cache";
import { FeedbackButtons } from "@/components/copilot/feedback-buttons";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AIInsightCardProps {
  readonly pageId: PageId;
  readonly ticker?: string;
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Style config per insight type
// ---------------------------------------------------------------------------

const TYPE_CONFIG = {
  opportunity: {
    icon: TrendingUp,
    bg: "bg-green/5",
    border: "border-green/20",
    iconColor: "text-green",
    label: "Opportunity",
    labelBg: "bg-green/10 text-green",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-gold/5",
    border: "border-gold/20",
    iconColor: "text-gold",
    label: "Watch Out",
    labelBg: "bg-gold/10 text-gold",
  },
  tip: {
    icon: Lightbulb,
    bg: "bg-blue/5",
    border: "border-blue/20",
    iconColor: "text-blue",
    label: "Tip",
    labelBg: "bg-blue/10 text-blue",
  },
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AIInsightCard({
  pageId,
  ticker,
  className = "",
}: AIInsightCardProps) {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState(false);

  const cacheKey = buildCacheKey(pageId, ticker);

  // Check cache + dismissed state on mount
  useEffect(() => {
    if (isDismissed(pageId)) {
      setDismissed(true);
      return;
    }

    const cached = getCachedInsight(cacheKey);
    if (cached) {
      setInsight(cached);
      return;
    }

    // Auto-fetch if no cache
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, pageId]);

  const fetchInsight = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const ctx = gatherCopilotContext(pageId);
      const { system, user } = buildInsightPrompt(pageId, ctx, ticker);

      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: system,
          userPrompt: user,
          pageId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch insight");
      }

      const data = await res.json();
      const parsed = parseInsightResponse(data.text, pageId);

      cacheInsight(cacheKey, parsed);
      setInsight(parsed);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [pageId, ticker, cacheKey]);

  const handleDismiss = useCallback(() => {
    dismissInsight(pageId);
    setDismissed(true);
  }, [pageId]);

  const handleRefresh = useCallback(() => {
    invalidateCache(cacheKey);
    clearDismissal(pageId);
    setDismissed(false);
    fetchInsight();
  }, [cacheKey, pageId, fetchInsight]);

  // Don't render if dismissed, errored with no insight, or loading with no insight
  if (dismissed) return null;
  if (error && !insight) return null;

  // Loading state (only show if no cached insight)
  if (loading && !insight) {
    return (
      <div
        className={`rounded-lg border border-border bg-surface-alt px-4 py-3 flex items-center gap-3 ${className}`}
      >
        <Loader2 className="w-4 h-4 text-green animate-spin shrink-0" />
        <span className="text-sm text-text-muted">
          Generating personalized insight...
        </span>
      </div>
    );
  }

  if (!insight) return null;

  const config = TYPE_CONFIG[insight.type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`rounded-lg border ${config.border} ${config.bg} px-4 py-3 ${className}`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}
          >
            <Icon className={`w-4 h-4 ${config.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.labelBg}`}
              >
                {config.label}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-text-muted">
                <Sparkles className="w-3 h-3" />
                AI Copilot
              </div>
            </div>
            <p className="text-sm font-medium text-text-primary mb-0.5">
              {insight.title}
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              {insight.body}
            </p>
            <FeedbackButtons
              insightId={`${pageId}_${insight.type}_${Date.now()}`}
              pageId={pageId}
              insightType={insight.type}
              insightTitle={insight.title}
              className="mt-2"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors"
              title="Refresh insight"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
