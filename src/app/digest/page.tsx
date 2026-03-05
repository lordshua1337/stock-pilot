"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Newspaper,
  Briefcase,
  BookOpen,
  Brain,
  Lightbulb,
  RefreshCw,
  Loader2,
  Trophy,
} from "lucide-react";
import { gatherCopilotContext } from "@/lib/ai/copilot-context";
import {
  buildDigestPrompt,
  parseDigestResponse,
  type WeeklyDigest,
} from "@/lib/ai/digest-builder";

// ---------------------------------------------------------------------------
// Cache (24hr in localStorage)
// ---------------------------------------------------------------------------

const DIGEST_CACHE_KEY = "stockpilot_weekly_digest";
const DIGEST_TTL = 24 * 60 * 60 * 1000;

function getCachedDigest(): WeeklyDigest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DIGEST_CACHE_KEY);
    if (!raw) return null;
    const { digest, expiresAt } = JSON.parse(raw);
    if (new Date(expiresAt).getTime() < Date.now()) return null;
    return digest as WeeklyDigest;
  } catch {
    return null;
  }
}

function cacheDigest(digest: WeeklyDigest): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      DIGEST_CACHE_KEY,
      JSON.stringify({
        digest,
        expiresAt: new Date(Date.now() + DIGEST_TTL).toISOString(),
      })
    );
  } catch {
    // Storage full
  }
}

// ---------------------------------------------------------------------------
// Score Ring
// ---------------------------------------------------------------------------

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80
      ? "text-green"
      : score >= 60
        ? "text-gold"
        : score >= 40
          ? "text-blue"
          : "text-red";
  const bg =
    score >= 80
      ? "bg-green/10"
      : score >= 60
        ? "bg-gold/10"
        : score >= 40
          ? "bg-blue/10"
          : "bg-red/10";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-20 h-20 rounded-full ${bg} flex items-center justify-center`}
      >
        <span className={`text-3xl font-bold font-mono ${color}`}>
          {score}
        </span>
      </div>
      <p className="text-sm font-medium text-text-primary">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section Card
// ---------------------------------------------------------------------------

function DigestSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-green/10 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="text-sm text-text-secondary leading-relaxed">
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DigestPage() {
  const [digest, setDigest] = useState<WeeklyDigest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCachedDigest();
    if (cached) {
      setDigest(cached);
    } else {
      generateDigest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateDigest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const ctx = gatherCopilotContext("digest");
      const { system, user } = buildDigestPrompt(ctx);

      const res = await fetch("/api/ai/digest", {
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
      const parsed = parseDigestResponse(data.text);
      cacheDigest(parsed);
      setDigest(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate digest");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    localStorage.removeItem(DIGEST_CACHE_KEY);
    generateDigest();
  }, [generateDigest]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-green" />
                Weekly Digest
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                AI-generated summary of your investing week
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg text-text-muted hover:text-green hover:bg-green/10 transition-colors disabled:opacity-40"
            title="Regenerate digest"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Loading state */}
        {loading && !digest && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-green animate-spin" />
            <p className="text-sm text-text-muted">
              Analyzing your week...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !digest && (
          <div className="bg-red/10 border border-red/20 rounded-xl p-6 text-center">
            <p className="text-sm text-red mb-3">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Digest content */}
        {digest && (
          <div className="space-y-4">
            {/* Headline banner */}
            <div className="bg-surface border border-green/20 rounded-xl p-6 text-center">
              <p className="text-xs text-green font-medium mb-2 uppercase tracking-wider">
                This Week
              </p>
              <h2 className="text-lg font-semibold text-text-primary">
                {digest.headline}
              </h2>
              {digest.generatedAt && (
                <p className="text-[10px] text-text-muted mt-2">
                  Generated{" "}
                  {new Date(digest.generatedAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>

            {/* Behavior Score */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-green" />
                <h3 className="text-sm font-semibold">Behavioral Scorecard</h3>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreRing
                  score={digest.behaviorScore.score}
                  label={digest.behaviorScore.label}
                />
                <div className="flex-1">
                  <p className="text-xs text-text-muted mb-2">
                    Score factors:
                  </p>
                  <ul className="space-y-1">
                    {digest.behaviorScore.factors.map((factor, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green shrink-0" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Portfolio Section */}
            <DigestSection
              icon={<Briefcase className="w-4 h-4 text-green" />}
              title="Portfolio"
            >
              {digest.portfolioSection}
            </DigestSection>

            {/* Journal Section */}
            <DigestSection
              icon={<BookOpen className="w-4 h-4 text-green" />}
              title="Journal & Behavior"
            >
              {digest.journalSection}
            </DigestSection>

            {/* Weekly Tip */}
            <DigestSection
              icon={<Lightbulb className="w-4 h-4 text-green" />}
              title="Focus for Next Week"
            >
              {digest.weeklyTip}
            </DigestSection>

            {/* Disclaimer */}
            <p className="text-[10px] text-text-muted text-center pt-4">
              AI-generated digest based on your activity. Not financial advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
