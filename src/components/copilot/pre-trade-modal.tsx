"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  AlertTriangle,
  TrendingUp,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { gatherCopilotContext } from "@/lib/ai/copilot-context";
import {
  buildTradeCheckPrompt,
  parseTradeAdvisory,
  type TradeCheckRequest,
  type TradeAdvisory,
} from "@/lib/ai/trade-advisor";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PreTradeModalProps {
  readonly isOpen: boolean;
  readonly trade: TradeCheckRequest;
  readonly onConfirm: (overrideReason?: string) => void;
  readonly onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Fit Score Ring
// ---------------------------------------------------------------------------

function FitScoreRing({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80
      ? "text-green"
      : score >= 50
        ? "text-gold"
        : "text-red";
  const bg =
    score >= 80
      ? "bg-green/10"
      : score >= 50
        ? "bg-gold/10"
        : "bg-red/10";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-16 h-16 rounded-full ${bg} flex items-center justify-center`}
      >
        <span className={`text-2xl font-bold font-mono ${color}`}>
          {score}
        </span>
      </div>
      <p className={`text-xs font-medium ${color}`}>{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PreTradeModal({
  isOpen,
  trade,
  onConfirm,
  onCancel,
}: PreTradeModalProps) {
  const [advisory, setAdvisory] = useState<TradeAdvisory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [showOverride, setShowOverride] = useState(false);

  // Fetch advisory when modal opens
  useEffect(() => {
    if (!isOpen) {
      setAdvisory(null);
      setError(null);
      setOverrideReason("");
      setShowOverride(false);
      return;
    }

    const fetchAdvisory = async () => {
      setLoading(true);
      setError(null);

      try {
        const ctx = gatherCopilotContext("simulator");
        const { system, user } = buildTradeCheckPrompt(ctx, trade);

        const res = await fetch("/api/ai/trade-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemPrompt: system,
            userPrompt: user,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Failed" }));
          throw new Error(data.error || `Error ${res.status}`);
        }

        const data = await res.json();
        setAdvisory(parseTradeAdvisory(data.text));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to get trade advisory"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisory();
  }, [isOpen, trade]);

  const handleConfirm = useCallback(() => {
    if (showOverride) {
      onConfirm(overrideReason || undefined);
    } else {
      onConfirm();
    }
  }, [showOverride, overrideReason, onConfirm]);

  const tradeTotal = trade.shares * trade.price;
  const needsOverride = advisory ? advisory.fitScore < 50 : false;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-surface border border-border rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green" />
                <h2 className="text-sm font-semibold">Pre-Trade Check</h2>
              </div>
              <button
                onClick={onCancel}
                className="p-1 rounded text-text-muted hover:text-text-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Trade summary */}
            <div className="px-4 py-3 bg-surface-alt border-b border-border">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    trade.action === "buy"
                      ? "bg-green/10 text-green"
                      : "bg-red/10 text-red"
                  }`}
                >
                  {trade.action.toUpperCase()}
                </span>
                <span className="text-sm font-semibold">{trade.ticker}</span>
                <span className="text-xs text-text-muted">
                  {trade.shares} shares @ ${trade.price.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Total: ${tradeTotal.toLocaleString()}
              </p>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <Loader2 className="w-6 h-6 text-green animate-spin" />
                  <p className="text-sm text-text-muted">
                    Analyzing trade against your identity...
                  </p>
                </div>
              )}

              {/* Error */}
              {error && !advisory && (
                <div className="text-center py-6">
                  <p className="text-sm text-red mb-2">{error}</p>
                  <button
                    onClick={() => onConfirm()}
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Proceed without check
                  </button>
                </div>
              )}

              {/* Advisory */}
              {advisory && (
                <div className="space-y-4">
                  {/* Fit score */}
                  <div className="flex items-center gap-4">
                    <FitScoreRing
                      score={advisory.fitScore}
                      label={advisory.fitLabel}
                    />
                    <p className="text-sm text-text-secondary flex-1">
                      {advisory.verdict}
                    </p>
                  </div>

                  {/* Bias warnings */}
                  {advisory.biasWarnings.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-text-muted flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-gold" />
                        Bias Risks
                      </p>
                      {advisory.biasWarnings.map((warning, i) => (
                        <p
                          key={i}
                          className="text-xs text-text-secondary bg-gold/5 border border-gold/10 rounded px-2.5 py-1.5"
                        >
                          {warning}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Portfolio impact */}
                  {advisory.portfolioImpact.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-text-muted flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-blue" />
                        Portfolio Impact
                      </p>
                      {advisory.portfolioImpact.map((impact, i) => (
                        <p
                          key={i}
                          className="text-xs text-text-secondary bg-blue/5 border border-blue/10 rounded px-2.5 py-1.5"
                        >
                          {impact}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Override section for low-fit trades */}
                  {needsOverride && !showOverride && (
                    <button
                      onClick={() => setShowOverride(true)}
                      className="w-full text-xs text-gold hover:text-gold/80 transition-colors py-1"
                    >
                      I want to proceed anyway...
                    </button>
                  )}

                  {showOverride && (
                    <div className="space-y-2">
                      <p className="text-xs text-text-muted">
                        {advisory.overrideQuestion}
                      </p>
                      <textarea
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="Your reason for overriding..."
                        className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/50 resize-none h-16"
                      />
                      <p className="text-[10px] text-text-muted">
                        This will be logged in your journal for future review.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {(advisory || error) && (
              <div className="flex gap-2 p-4 border-t border-border">
                <button
                  onClick={onCancel}
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-text-secondary border border-border hover:bg-surface-alt transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={needsOverride && !showOverride}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    needsOverride && showOverride
                      ? "bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20"
                      : needsOverride
                        ? "bg-surface-alt text-text-muted cursor-not-allowed"
                        : "bg-green text-white hover:bg-green-light"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {needsOverride && showOverride
                    ? "Override & Trade"
                    : "Confirm Trade"}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
