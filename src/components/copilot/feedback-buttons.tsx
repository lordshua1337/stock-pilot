"use client";

import { useState, useCallback } from "react";
import { ThumbsUp, ThumbsDown, Bookmark } from "lucide-react";
import {
  loadCoachingMemory,
  recordFeedback,
  type FeedbackAction,
} from "@/lib/ai/coaching-memory";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FeedbackButtonsProps {
  readonly insightId: string;
  readonly pageId: string;
  readonly insightType: string;
  readonly insightTitle: string;
  readonly onFeedback?: (action: FeedbackAction) => void;
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FeedbackButtons({
  insightId,
  pageId,
  insightType,
  insightTitle,
  onFeedback,
  className = "",
}: FeedbackButtonsProps) {
  const [selected, setSelected] = useState<FeedbackAction | null>(null);

  const handleFeedback = useCallback(
    (action: FeedbackAction) => {
      if (selected) return; // Already gave feedback

      const state = loadCoachingMemory();
      recordFeedback(state, {
        insightId,
        pageId,
        insightType,
        insightTitle,
        action,
      });

      setSelected(action);
      onFeedback?.(action);
    },
    [selected, insightId, pageId, insightType, insightTitle, onFeedback]
  );

  if (selected) {
    const labels: Record<FeedbackAction, string> = {
      acted: "Noted as helpful",
      dismissed: "Dismissed",
      saved: "Saved for later",
    };
    return (
      <span className={`text-[10px] text-text-muted ${className}`}>
        {labels[selected]}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => handleFeedback("acted")}
        className="p-1 rounded text-text-muted hover:text-green hover:bg-green/10 transition-colors"
        title="This was helpful"
      >
        <ThumbsUp className="w-3 h-3" />
      </button>
      <button
        onClick={() => handleFeedback("saved")}
        className="p-1 rounded text-text-muted hover:text-blue hover:bg-blue/10 transition-colors"
        title="Save for later"
      >
        <Bookmark className="w-3 h-3" />
      </button>
      <button
        onClick={() => handleFeedback("dismissed")}
        className="p-1 rounded text-text-muted hover:text-red hover:bg-red/10 transition-colors"
        title="Not relevant"
      >
        <ThumbsDown className="w-3 h-3" />
      </button>
    </div>
  );
}
