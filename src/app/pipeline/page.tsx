"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  X,
  Search,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Clock,
  TrendingUp,
  Target,
  ArrowRightLeft,
  MessageSquare,
} from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";
import {
  type PipelineEntry,
  type PipelineStage,
  PIPELINE_STAGES,
  STAGE_META,
  loadPipeline,
  savePipeline,
  addToPipeline,
  moveStage,
  removeFromPipeline,
  getDaysInStage,
  getPipelineMetrics,
} from "@/lib/pipeline-data";
import { loadDNAProfile, type StoredDNAProfile } from "@/lib/dna-storage";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";

// ---------------------------------------------------------------------------
// Personality fit scoring
// ---------------------------------------------------------------------------

function getPersonalityFit(
  stock: Stock,
  profile: StoredDNAProfile | null
): "great" | "caution" | "anti" | "unknown" {
  if (!profile) return "unknown";

  const { R, H, D } = profile.dimensions;
  let score = 0;

  // Risk tolerance vs beta
  if (R >= 65 && stock.beta >= 1.2) score += 2;
  else if (R < 40 && stock.beta < 0.9) score += 2;
  else if (R < 40 && stock.beta >= 1.5) score -= 2;
  else if (R >= 65 && stock.beta < 0.6) score -= 1;

  // Horizon vs growth/dividend
  if (H >= 65 && stock.dividendYield < 1 && stock.aiScore >= 75) score += 1;
  else if (H < 40 && stock.dividendYield >= 2) score += 1;
  else if (H < 40 && stock.peRatio > 60) score -= 1;

  // Diversification preference vs sector concentration
  if (D >= 70) score += 1; // diversifiers get a neutral bonus

  // AI score boost
  if (stock.aiScore >= 80) score += 1;
  if (stock.aiScore < 50) score -= 1;

  if (score >= 3) return "great";
  if (score <= -1) return "anti";
  if (score >= 1) return "caution";
  return "caution";
}

const FIT_COLORS = {
  great: { bg: "rgba(0, 109, 216, 0.12)", text: "#006DD8", label: "Great Fit" },
  caution: {
    bg: "rgba(255, 215, 64, 0.12)",
    text: "#FFD740",
    label: "Caution",
  },
  anti: {
    bg: "rgba(255, 82, 82, 0.12)",
    text: "#FF5252",
    label: "Anti-Match",
  },
  unknown: {
    bg: "rgba(160, 160, 160, 0.12)",
    text: "#A0A0A0",
    label: "No Profile",
  },
};

// ---------------------------------------------------------------------------
// Coaching text by archetype
// ---------------------------------------------------------------------------

function getCoachingText(
  profile: StoredDNAProfile | null,
  metrics: ReturnType<typeof getPipelineMetrics>
): string {
  if (!profile) {
    return "Take the Investor Identity quiz to get personalized pipeline coaching.";
  }

  const arch = profile.communicationArchetype;
  const info = ARCHETYPE_INFO[arch];

  const coachingMap: Partial<Record<typeof arch, string>> = {
    action_first_decider: `As a ${info?.name ?? "First Mover"}, you move fast -- make sure you're not skipping due diligence before promoting stocks to your portfolio.`,
    systems_builder: `As a ${info?.name ?? "Systems Builder"}, build your pipeline process once, then trust it. Don't over-optimize every card.`,
    analytical_skeptic: `As a ${info?.name ?? "Analytical Skeptic"}, your research phase will be thorough -- but watch for analysis paralysis keeping stocks stuck too long.`,
    reassurance_seeker: `As a ${info?.name ?? "Steady Hand"}, lean on your AI scores and analyst ratings for the validation you need to move stocks forward.`,
    diy_controller: `As a ${info?.name ?? "DIY Controller"}, you want to run your own analysis -- this pipeline gives you the structure to do that without losing track.`,
    collaborative_partner: `As a ${info?.name ?? "Collaborative Partner"}, discuss your pipeline with your advisor or community before making big moves.`,
    big_picture_optimist: `As a ${info?.name ?? "Big Picture Optimist"}, your long horizon is an asset -- don't rush stocks through the pipeline. Let your thesis develop.`,
    trend_sensitive_explorer: `As a ${info?.name ?? "Trend Explorer"}, you spot trends early -- but make sure each pipeline stock has fundamentals, not just momentum.`,
    avoider_under_stress: `As a ${info?.name ?? "Stress Avoider"}, use this pipeline to make decisions when calm -- not when the market is dropping.`,
    values_anchored_steward: `As a ${info?.name ?? "Values Steward"}, make sure each stock in your pipeline aligns with your values, not just your returns targets.`,
  };

  return (
    coachingMap[arch] ??
    "Track your investment ideas from discovery to portfolio with this visual pipeline."
  );
}

// ---------------------------------------------------------------------------
// Add Stock Modal
// ---------------------------------------------------------------------------

function AddStockModal({
  existingTickers,
  onAdd,
  onClose,
}: {
  readonly existingTickers: ReadonlySet<string>;
  readonly onAdd: (ticker: string, stage: PipelineStage) => void;
  readonly onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<PipelineStage>("discovery");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return stocks.filter((s) => !existingTickers.has(s.ticker)).slice(0, 20);
    return stocks
      .filter(
        (s) =>
          !existingTickers.has(s.ticker) &&
          (s.ticker.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.sector.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [query, existingTickers]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-surface border border-border rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold">Add to Pipeline</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stage selector */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs text-text-muted mb-2">Add to stage:</p>
          <div className="flex gap-1.5 flex-wrap">
            {PIPELINE_STAGES.filter((s) => s !== "exited").map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                style={{
                  background:
                    selectedStage === stage
                      ? STAGE_META[stage].color + "20"
                      : "transparent",
                  color:
                    selectedStage === stage
                      ? STAGE_META[stage].color
                      : "#A0A0A0",
                  border: `1px solid ${
                    selectedStage === stage
                      ? STAGE_META[stage].color + "40"
                      : "#2A2A2A"
                  }`,
                }}
              >
                {STAGE_META[stage].label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-border">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ticker, name, or sector..."
              className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="px-5 pb-4 max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">
              {query
                ? "No matching stocks found"
                : "All stocks are already in your pipeline"}
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {filtered.map((stock) => (
                <button
                  key={stock.ticker}
                  onClick={() => onAdd(stock.ticker, selectedStage)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-alt transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-xs font-mono font-bold flex-shrink-0">
                    {stock.ticker.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold">
                        {stock.ticker}
                      </span>
                      <span className="text-xs text-text-muted truncate">
                        {stock.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span>{stock.sector}</span>
                      <span>AI: {stock.aiScore}</span>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-text-muted" />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pipeline Card
// ---------------------------------------------------------------------------

function PipelineCard({
  entry,
  stock,
  fit,
  onMoveLeft,
  onMoveRight,
  onRemove,
  canMoveLeft,
  canMoveRight,
}: {
  readonly entry: PipelineEntry;
  readonly stock: Stock | undefined;
  readonly fit: "great" | "caution" | "anti" | "unknown";
  readonly onMoveLeft: () => void;
  readonly onMoveRight: () => void;
  readonly onRemove: () => void;
  readonly canMoveLeft: boolean;
  readonly canMoveRight: boolean;
}) {
  if (!stock) return null;

  const fitStyle = FIT_COLORS[fit];
  const daysInStage = getDaysInStage(entry);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-surface border border-border rounded-xl p-3 card-hover group"
    >
      {/* Header: ticker + remove */}
      <div className="flex items-center justify-between mb-2">
        <Link
          href={`/research/${stock.ticker.toLowerCase()}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-surface-alt flex items-center justify-center text-[10px] font-mono font-bold">
            {stock.ticker.slice(0, 2)}
          </div>
          <div>
            <div className="text-sm font-mono font-bold">{stock.ticker}</div>
            <div className="text-[10px] text-text-muted truncate max-w-[100px]">
              {stock.name}
            </div>
          </div>
        </Link>
        <button
          onClick={onRemove}
          className="p-1 rounded text-text-muted opacity-0 group-hover:opacity-100 hover:text-red hover:bg-red-bg transition-all"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* AI Score + Fit badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono text-text-muted">
          AI {stock.aiScore}
        </span>
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
          style={{ background: fitStyle.bg, color: fitStyle.text }}
        >
          {fitStyle.label}
        </span>
      </div>

      {/* Days in stage */}
      <div className="flex items-center gap-1 text-[10px] text-text-muted mb-3">
        <Clock className="w-3 h-3" />
        <span>
          {daysInStage} day{daysInStage !== 1 ? "s" : ""} in stage
        </span>
      </div>

      {/* Move buttons */}
      <div className="flex items-center gap-1">
        {canMoveLeft && (
          <button
            onClick={onMoveLeft}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium rounded-lg bg-surface-alt text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Back
          </button>
        )}
        {canMoveRight && (
          <button
            onClick={onMoveRight}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium rounded-lg bg-surface-alt text-text-muted hover:text-green hover:bg-green-bg transition-colors"
          >
            Forward
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Stage Column
// ---------------------------------------------------------------------------

function StageColumn({
  stage,
  entries,
  stockMap,
  profile,
  onMove,
  onRemove,
}: {
  readonly stage: PipelineStage;
  readonly entries: readonly PipelineEntry[];
  readonly stockMap: ReadonlyMap<string, Stock>;
  readonly profile: StoredDNAProfile | null;
  readonly onMove: (ticker: string, newStage: PipelineStage) => void;
  readonly onRemove: (ticker: string) => void;
}) {
  const meta = STAGE_META[stage];
  const stageIndex = PIPELINE_STAGES.indexOf(stage);

  return (
    <div className="flex-1 min-w-[220px] max-w-[280px]">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: meta.color }}
        />
        <h3 className="text-xs font-semibold text-text-primary">
          {meta.label}
        </h3>
        <span className="text-[10px] text-text-muted font-mono">
          {entries.length}
        </span>
      </div>

      <p className="text-[10px] text-text-muted mb-3 px-1">
        {meta.description}
      </p>

      {/* Cards */}
      <div className="flex flex-col gap-2 min-h-[120px]">
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => {
            const stock = stockMap.get(entry.ticker);
            const fit = stock ? getPersonalityFit(stock, profile) : "unknown";

            return (
              <PipelineCard
                key={entry.ticker}
                entry={entry}
                stock={stock}
                fit={fit}
                canMoveLeft={stageIndex > 0}
                canMoveRight={stageIndex < PIPELINE_STAGES.length - 1}
                onMoveLeft={() =>
                  onMove(entry.ticker, PIPELINE_STAGES[stageIndex - 1])
                }
                onMoveRight={() =>
                  onMove(entry.ticker, PIPELINE_STAGES[stageIndex + 1])
                }
                onRemove={() => onRemove(entry.ticker)}
              />
            );
          })}
        </AnimatePresence>

        {entries.length === 0 && (
          <div className="flex items-center justify-center h-[120px] border border-dashed border-border rounded-xl">
            <p className="text-[10px] text-text-muted">No stocks</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metric Card
// ---------------------------------------------------------------------------

function MetricCard({
  icon,
  label,
  value,
  sub,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string | number;
  readonly sub?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-text-muted flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-lg font-bold font-mono">{value}</p>
        {sub && <p className="text-[10px] text-text-muted">{sub}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PipelinePage() {
  const [entries, setEntries] = useState<readonly PipelineEntry[]>([]);
  const [profile, setProfile] = useState<StoredDNAProfile | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setEntries(loadPipeline());
    setProfile(loadDNAProfile());
    setLoaded(true);
  }, []);

  // Persist on every change (skip initial empty state)
  useEffect(() => {
    if (loaded) {
      savePipeline(entries);
    }
  }, [entries, loaded]);

  // Stock lookup map
  const stockMap = useMemo(() => {
    const map = new Map<string, Stock>();
    for (const s of stocks) {
      map.set(s.ticker, s);
    }
    return map;
  }, []);

  // Existing tickers set
  const existingTickers = useMemo(
    () => new Set(entries.map((e) => e.ticker)),
    [entries]
  );

  // Entries grouped by stage
  const grouped = useMemo(() => {
    const result: Record<PipelineStage, PipelineEntry[]> = {
      discovery: [],
      researching: [],
      watchlist: [],
      portfolio: [],
      exited: [],
    };
    for (const entry of entries) {
      result[entry.stage].push(entry);
    }
    return result;
  }, [entries]);

  const metrics = useMemo(() => getPipelineMetrics(entries), [entries]);

  const handleAdd = useCallback(
    (ticker: string, stage: PipelineStage) => {
      setEntries((prev) => addToPipeline(prev, ticker, stage));
      setShowAdd(false);
    },
    []
  );

  const handleMove = useCallback(
    (ticker: string, newStage: PipelineStage) => {
      setEntries((prev) => moveStage(prev, ticker, newStage));
    },
    []
  );

  const handleRemove = useCallback((ticker: string) => {
    setEntries((prev) => removeFromPipeline(prev, ticker));
  }, []);

  const coaching = useMemo(
    () => getCoachingText(profile, metrics),
    [profile, metrics]
  );

  if (!loaded) {
    return (
      <div className="min-h-screen pt-20 px-4 max-w-7xl mx-auto">
        <div className="animate-shimmer h-8 w-48 rounded-lg mb-6" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-shimmer h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-2xl mx-auto text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-6">
            <ArrowRightLeft className="w-8 h-8 text-text-muted" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Investment Pipeline</h1>
          <p className="text-sm text-text-muted mb-2 max-w-md mx-auto">
            Track stocks from discovery to portfolio. Move them through stages
            as your conviction grows.
          </p>
          <p className="text-xs text-text-muted mb-8 max-w-sm mx-auto">
            {profile
              ? coaching
              : "Take the Investor Identity quiz for personalized coaching."}
          </p>

          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-green text-black hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Your First Stock
          </button>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/research"
              className="text-xs text-text-muted hover:text-green transition-colors"
            >
              Browse Research
            </Link>
            {!profile && (
              <Link
                href="/personality"
                className="text-xs text-text-muted hover:text-green transition-colors"
              >
                Take Identity Quiz
              </Link>
            )}
          </div>

          {showAdd && (
            <AddStockModal
              existingTickers={existingTickers}
              onAdd={handleAdd}
              onClose={() => setShowAdd(false)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Investment Pipeline</h1>
              <p className="text-xs text-text-muted">
                Track your investment ideas from discovery to portfolio
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-green/10 text-green border border-green/20 hover:bg-green/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Stock
          </button>
        </div>

        {/* Coaching bar */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-bg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-blue" />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {coaching}
          </p>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <MetricCard
            icon={<BarChart3 className="w-4 h-4" />}
            label="Total Tracked"
            value={metrics.total}
            sub={`${metrics.active} active`}
          />
          <MetricCard
            icon={<Target className="w-4 h-4" />}
            label="In Portfolio"
            value={metrics.inPortfolio}
            sub={`${metrics.conversionRate}% conversion`}
          />
          <MetricCard
            icon={<Clock className="w-4 h-4" />}
            label="Avg Days to Portfolio"
            value={metrics.avgDaysToPortfolio || "--"}
            sub="from discovery"
          />
          <MetricCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Exited"
            value={metrics.exited}
            sub="sold or passed"
          />
        </div>

        {/* Kanban board */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-4 min-w-max">
            {PIPELINE_STAGES.map((stage) => (
              <StageColumn
                key={stage}
                stage={stage}
                entries={grouped[stage]}
                stockMap={stockMap}
                profile={profile}
                onMove={handleMove}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>

        {/* Stage flow indicator */}
        <div className="flex items-center justify-center gap-2 mt-6 mb-4">
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: STAGE_META[stage].color }}
                />
                <span className="text-[10px] text-text-muted font-medium">
                  {STAGE_META[stage].label}
                </span>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <ChevronRight className="w-3 h-3 text-text-muted/50" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <AddStockModal
          existingTickers={existingTickers}
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
