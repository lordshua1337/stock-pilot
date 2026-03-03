// Investment Pipeline -- types and localStorage persistence
// Tracks stocks through a Kanban-style funnel:
// Discovery -> Researching -> Watchlist -> Portfolio -> Exited

export type PipelineStage =
  | "discovery"
  | "researching"
  | "watchlist"
  | "portfolio"
  | "exited";

export const PIPELINE_STAGES: readonly PipelineStage[] = [
  "discovery",
  "researching",
  "watchlist",
  "portfolio",
  "exited",
] as const;

export const STAGE_META: Record<
  PipelineStage,
  { label: string; color: string; description: string }
> = {
  discovery: {
    label: "Discovery",
    color: "#448AFF",
    description: "Stocks on your radar",
  },
  researching: {
    label: "Researching",
    color: "#FFD740",
    description: "Actively evaluating",
  },
  watchlist: {
    label: "Watchlist",
    color: "#E040FB",
    description: "Waiting for entry point",
  },
  portfolio: {
    label: "Portfolio",
    color: "#00C853",
    description: "Currently holding",
  },
  exited: {
    label: "Exited",
    color: "#FF5252",
    description: "Sold or passed",
  },
};

export interface PipelineEntry {
  readonly ticker: string;
  readonly stage: PipelineStage;
  readonly addedAt: string; // ISO date when added to pipeline
  readonly stageEnteredAt: string; // ISO date when entered current stage
  readonly notes: string;
}

// ---------------------------------------------------------------------------
// LocalStorage persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = "stockpilot_pipeline";

export function loadPipeline(): readonly PipelineEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as PipelineEntry[];
  } catch {
    return [];
  }
}

export function savePipeline(entries: readonly PipelineEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ---------------------------------------------------------------------------
// Pipeline operations (all return new arrays, never mutate)
// ---------------------------------------------------------------------------

export function addToPipeline(
  entries: readonly PipelineEntry[],
  ticker: string,
  stage: PipelineStage = "discovery",
  notes: string = ""
): readonly PipelineEntry[] {
  // Don't add duplicates
  if (entries.some((e) => e.ticker === ticker)) return entries;

  const now = new Date().toISOString();
  const newEntry: PipelineEntry = {
    ticker,
    stage,
    addedAt: now,
    stageEnteredAt: now,
    notes,
  };

  return [...entries, newEntry];
}

export function moveStage(
  entries: readonly PipelineEntry[],
  ticker: string,
  newStage: PipelineStage
): readonly PipelineEntry[] {
  return entries.map((entry) =>
    entry.ticker === ticker
      ? { ...entry, stage: newStage, stageEnteredAt: new Date().toISOString() }
      : entry
  );
}

export function removeFromPipeline(
  entries: readonly PipelineEntry[],
  ticker: string
): readonly PipelineEntry[] {
  return entries.filter((e) => e.ticker !== ticker);
}

export function updateNotes(
  entries: readonly PipelineEntry[],
  ticker: string,
  notes: string
): readonly PipelineEntry[] {
  return entries.map((entry) =>
    entry.ticker === ticker ? { ...entry, notes } : entry
  );
}

// ---------------------------------------------------------------------------
// Analytics helpers
// ---------------------------------------------------------------------------

export function getDaysInStage(entry: PipelineEntry): number {
  const entered = new Date(entry.stageEnteredAt).getTime();
  const now = Date.now();
  return Math.max(1, Math.round((now - entered) / (1000 * 60 * 60 * 24)));
}

export function getDaysInPipeline(entry: PipelineEntry): number {
  const added = new Date(entry.addedAt).getTime();
  const now = Date.now();
  return Math.max(1, Math.round((now - added) / (1000 * 60 * 60 * 24)));
}

export function getPipelineMetrics(entries: readonly PipelineEntry[]) {
  const total = entries.length;
  const inPortfolio = entries.filter((e) => e.stage === "portfolio").length;
  const exited = entries.filter((e) => e.stage === "exited").length;
  const active = total - exited;

  const portfolioEntries = entries.filter((e) => e.stage === "portfolio");
  const avgDaysToPortfolio =
    portfolioEntries.length > 0
      ? Math.round(
          portfolioEntries.reduce((sum, e) => sum + getDaysInPipeline(e), 0) /
            portfolioEntries.length
        )
      : 0;

  const conversionRate =
    total > 0 ? Math.round((inPortfolio / total) * 100) : 0;

  return {
    total,
    active,
    inPortfolio,
    exited,
    avgDaysToPortfolio,
    conversionRate,
  };
}
