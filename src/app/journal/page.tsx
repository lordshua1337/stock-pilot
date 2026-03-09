"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  X,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Eye,
  Target,
  AlertTriangle,
  CheckCircle2,
  Info,
  Trash2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Brain,
  Flame,
  Calendar,
  Filter,
} from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";
import { loadDNAProfile, type StoredDNAProfile } from "@/lib/dna-storage";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import { AIInsightCard } from "@/components/copilot/ai-insight-card";
import {
  type JournalState,
  type JournalEntry,
  type JournalAction,
  type EmotionalState,
  type BiasTag,
  EMOTIONAL_STATES,
  BIAS_INFO,
  ACTION_INFO,
  loadJournal,
  saveJournal,
  createJournal,
  addEntry,
  updateOutcome,
  deleteEntry,
  getAnalytics,
  detectPatterns,
  type JournalInsight,
} from "@/lib/journal-data";

// ---------------------------------------------------------------------------
// Archetype coaching
// ---------------------------------------------------------------------------

function getJournalCoaching(profile: StoredDNAProfile | null): string {
  if (!profile) {
    return "Your investment journal captures the WHY behind every decision. Track emotions, spot biases, and become a better investor through self-awareness.";
  }

  const arch = profile.communicationArchetype;
  const info = ARCHETYPE_INFO[arch];
  const name = info?.name ?? arch;

  const map: Partial<Record<typeof arch, string>> = {
    action_first_decider: `As a ${name}, your speed is your edge -- but also your risk. This journal helps you see when fast decisions paid off and when pausing would have been better.`,
    systems_builder: `As a ${name}, your journal IS part of the system. Track inputs, outputs, and refine your decision-making framework with every entry.`,
    analytical_skeptic: `As a ${name}, your best trades come from deep research. Entries with detailed thesis notes perform 20% better -- use this journal to prove it.`,
    trend_sensitive_explorer: `As a ${name}, you ride momentum. Journal your entry timing -- are you catching waves early or chasing them late?`,
    avoider_under_stress: `As a ${name}, journaling creates a buffer between feeling and action. Write before you trade, especially when stressed.`,
    big_picture_optimist: `As a ${name}, use your journal to stay convicted during drawdowns. Your past entries will remind you why you bought in the first place.`,
    reassurance_seeker: `As a ${name}, your journal becomes your evidence base. When doubt creeps in, review your original thesis instead of seeking external validation.`,
    diy_controller: `As a ${name}, you trust your own process. This journal documents that process so you can refine it with hard data, not gut feel.`,
    collaborative_partner: `As a ${name}, share journal insights in your investment discussions. Your documented reasoning makes group decisions sharper.`,
    values_anchored_steward: `As a ${name}, journal entries help you verify your investments still align with your values. Purpose-driven investing requires reflection.`,
  };

  return map[arch] ?? "Track your investment decisions and emotions to become a more self-aware investor.";
}

// ---------------------------------------------------------------------------
// New Entry Modal
// ---------------------------------------------------------------------------

function NewEntryModal({
  onAdd,
  onClose,
}: {
  readonly onAdd: (entry: Omit<JournalEntry, "id" | "timestamp">) => void;
  readonly onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [action, setAction] = useState<JournalAction>("buy");
  const [thesis, setThesis] = useState("");
  const [emotion, setEmotion] = useState<EmotionalState>("calm");
  const [biases, setBiases] = useState<ReadonlySet<BiasTag>>(new Set());
  const [followedRule, setFollowedRule] = useState(true);

  const filtered = search.length > 0
    ? stocks.filter(
        (s) =>
          s.ticker.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 8)
    : [];

  function toggleBias(b: BiasTag) {
    setBiases((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      return next;
    });
  }

  function handleSubmit() {
    if (!selectedStock || !thesis.trim()) return;
    onAdd({
      ticker: selectedStock.ticker,
      action,
      thesis: thesis.trim(),
      emotionalState: emotion,
      biases: Array.from(biases),
      followedRule,
      priceAtEntry: selectedStock.price,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="font-semibold">
            {step === 1 && "Select Stock"}
            {step === 2 && "What Are You Doing?"}
            {step === 3 && "How Are You Feeling?"}
            {step === 4 && "Write Your Thesis"}
          </h3>
          <button onClick={onClose} className="p-1 hover:opacity-60 transition-opacity">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Step 1: Stock selection */}
          {step === 1 && (
            <div>
              <input
                type="text"
                placeholder="Search by ticker or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--blue)]"
                autoFocus
              />
              <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
                {filtered.map((s) => (
                  <button
                    key={s.ticker}
                    onClick={() => { setSelectedStock(s); setStep(2); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-alt)] transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-alt)] flex items-center justify-center text-xs font-bold font-mono">
                      {s.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <span className="text-sm font-medium">{s.ticker}</span>
                      <span className="text-xs text-[var(--text-muted)] ml-2">{s.name}</span>
                    </div>
                    <span className="ml-auto text-sm font-mono">${s.price.toFixed(2)}</span>
                  </button>
                ))}
                {search.length > 0 && filtered.length === 0 && (
                  <p className="text-xs text-[var(--text-muted)] text-center py-4">No stocks found</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Action */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-alt)] flex items-center justify-center text-xs font-bold font-mono">
                  {selectedStock?.ticker.slice(0, 2)}
                </div>
                <span className="font-medium">{selectedStock?.ticker}</span>
                <span className="text-sm text-[var(--text-muted)]">${selectedStock?.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-3">What action are you taking?</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(ACTION_INFO) as [JournalAction, { label: string; color: string }][]).map(
                  ([key, info]) => (
                    <button
                      key={key}
                      onClick={() => { setAction(key); setStep(3); }}
                      className="px-3 py-3 rounded-lg border text-sm font-medium transition-all"
                      style={{
                        borderColor: action === key ? info.color : "var(--border)",
                        background: action === key ? `${info.color}15` : "transparent",
                        color: action === key ? info.color : "var(--text-primary)",
                      }}
                    >
                      {info.label}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Step 3: Emotion */}
          {step === 3 && (
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-3">
                How are you feeling right now? Be honest -- this is for your growth.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  Object.entries(EMOTIONAL_STATES) as [
                    EmotionalState,
                    { label: string; color: string },
                  ][]
                ).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => { setEmotion(key); setStep(4); }}
                    className="flex items-center gap-2 px-3 py-3 rounded-lg border text-sm transition-all text-left"
                    style={{
                      borderColor: emotion === key ? info.color : "var(--border)",
                      background: emotion === key ? `${info.color}15` : "transparent",
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: info.color }}
                    />
                    <span>{info.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Thesis + biases + rule */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  Why are you making this decision?
                </label>
                <textarea
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  placeholder="Write your investment thesis... What's the reasoning? What signals are you acting on?"
                  className="w-full px-3 py-2 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--blue)] resize-none"
                  rows={4}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] mb-2 block">
                  Any biases you suspect? (optional, select all that apply)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.entries(BIAS_INFO) as [BiasTag, { label: string }][]).map(
                    ([key, info]) => (
                      <button
                        key={key}
                        onClick={() => toggleBias(key)}
                        className="px-2.5 py-1 rounded-full text-xs border transition-all"
                        style={{
                          borderColor: biases.has(key) ? "#FFD740" : "var(--border)",
                          background: biases.has(key) ? "rgba(255,215,64,0.12)" : "transparent",
                          color: biases.has(key) ? "#FFD740" : "var(--text-muted)",
                        }}
                      >
                        {info.label}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-[var(--border)]">
                <label className="text-xs text-[var(--text-muted)]">
                  Did you follow your behavioral rule?
                </label>
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => setFollowedRule(true)}
                    className="px-3 py-1 rounded-lg text-xs font-medium border transition-all"
                    style={{
                      borderColor: followedRule ? "#2E8BEF" : "var(--border)",
                      background: followedRule ? "rgba(0,200,83,0.12)" : "transparent",
                      color: followedRule ? "#2E8BEF" : "var(--text-muted)",
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setFollowedRule(false)}
                    className="px-3 py-1 rounded-lg text-xs font-medium border transition-all"
                    style={{
                      borderColor: !followedRule ? "#FF5252" : "var(--border)",
                      background: !followedRule ? "rgba(255,82,82,0.12)" : "transparent",
                      color: !followedRule ? "#FF5252" : "var(--text-muted)",
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] flex items-center gap-2">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="w-2 h-2 rounded-full transition-colors"
                style={{
                  background: s <= step ? "var(--blue)" : "var(--border)",
                }}
              />
            ))}
          </div>
          <div className="flex-1" />
          {step === 4 && (
            <button
              onClick={handleSubmit}
              disabled={!thesis.trim()}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
              style={{
                background: "var(--blue)",
                color: "#fff",
              }}
            >
              Save Entry
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Journal Entry Card
// ---------------------------------------------------------------------------

function EntryCard({
  entry,
  stock,
  onUpdateOutcome,
  onDelete,
}: {
  readonly entry: JournalEntry;
  readonly stock: Stock | undefined;
  readonly onUpdateOutcome: (outcome: string) => void;
  readonly onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingOutcome, setEditingOutcome] = useState(false);
  const [outcomeText, setOutcomeText] = useState(entry.outcome ?? "");

  const actionInfo = ACTION_INFO[entry.action];
  const emotionInfo = EMOTIONAL_STATES[entry.emotionalState];
  const date = new Date(entry.timestamp);
  const relativeDate = getRelativeDate(date);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-[var(--surface-alt)] transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3">
          {/* Ticker badge */}
          <div className="w-9 h-9 rounded-lg bg-[var(--surface-alt)] flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">
            {entry.ticker.slice(0, 2)}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{entry.ticker}</span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-semibold"
                style={{
                  background: `${actionInfo.color}18`,
                  color: actionInfo.color,
                }}
              >
                {actionInfo.label}
              </span>
              <span
                className="px-2 py-0.5 rounded text-[10px]"
                style={{
                  background: `${emotionInfo.color}18`,
                  color: emotionInfo.color,
                }}
              >
                {emotionInfo.label}
              </span>
              {entry.followedRule && (
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green)]" />
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
              {entry.thesis}
            </p>
          </div>

          {/* Right side */}
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-[var(--text-muted)]">{relativeDate}</p>
            <p className="text-xs font-mono text-[var(--text-muted)]">
              ${entry.priceAtEntry.toFixed(2)}
            </p>
          </div>

          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)] pt-3">
              {/* Full thesis */}
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Thesis
                </p>
                <p className="text-sm leading-relaxed">{entry.thesis}</p>
              </div>

              {/* Biases */}
              {entry.biases.length > 0 && (
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Suspected Biases
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.biases.map((b) => (
                      <span
                        key={b}
                        className="px-2 py-0.5 rounded-full text-[10px] border border-[#FFD740] text-[#FFD740] bg-[rgba(255,215,64,0.08)]"
                        title={BIAS_INFO[b].description}
                      >
                        {BIAS_INFO[b].label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rule following */}
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  Followed Rule
                </p>
                {entry.followedRule ? (
                  <span className="text-[10px] text-[var(--green)]">Yes</span>
                ) : (
                  <span className="text-[10px] text-[var(--red)]">No</span>
                )}
              </div>

              {/* Outcome / Reflection */}
              <div>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Reflection
                </p>
                {editingOutcome ? (
                  <div className="flex gap-2">
                    <textarea
                      value={outcomeText}
                      onChange={(e) => setOutcomeText(e.target.value)}
                      className="flex-1 px-2 py-1.5 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg text-xs resize-none focus:outline-none focus:border-[var(--blue)]"
                      rows={2}
                      placeholder="How did this play out? What would you do differently?"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        onUpdateOutcome(outcomeText);
                        setEditingOutcome(false);
                      }}
                      className="px-3 py-1 text-xs bg-[var(--blue)] text-white rounded-lg self-end"
                    >
                      Save
                    </button>
                  </div>
                ) : entry.outcome ? (
                  <p
                    className="text-xs text-[var(--text-secondary)] cursor-pointer hover:opacity-80"
                    onClick={() => setEditingOutcome(true)}
                  >
                    {entry.outcome}
                  </p>
                ) : (
                  <button
                    onClick={() => setEditingOutcome(true)}
                    className="text-xs text-[var(--blue)] hover:underline"
                  >
                    + Add reflection
                  </button>
                )}
              </div>

              {/* Delete */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Insight Card
// ---------------------------------------------------------------------------

function InsightCard({ insight }: { readonly insight: JournalInsight }) {
  const colorMap = {
    warning: { bg: "rgba(255,215,64,0.08)", border: "#FFD740", icon: <AlertTriangle className="w-4 h-4" /> },
    positive: { bg: "rgba(0,200,83,0.08)", border: "#2E8BEF", icon: <CheckCircle2 className="w-4 h-4" /> },
    neutral: { bg: "rgba(68,138,255,0.08)", border: "#448AFF", icon: <Info className="w-4 h-4" /> },
  };
  const c = colorMap[insight.type];

  return (
    <div
      className="p-3 rounded-xl border"
      style={{ background: c.bg, borderColor: `${c.border}30` }}
    >
      <div className="flex items-start gap-2">
        <div style={{ color: c.border }} className="flex-shrink-0 mt-0.5">
          {c.icon}
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: c.border }}>
            {insight.title}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
            {insight.description}
          </p>
        </div>
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
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[var(--surface-alt)] flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p className="text-lg font-bold font-mono">{value}</p>
        {sub && <p className="text-[10px] text-[var(--text-muted)]">{sub}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const stockMap = new Map(stocks.map((s) => [s.ticker, s]));

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

type FilterMode = "all" | "buy" | "sell" | "hold" | "watchlist" | "exit";

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function JournalPage() {
  const [state, setState] = useState<JournalState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<StoredDNAProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [showInsights, setShowInsights] = useState(true);

  // Load on mount
  useEffect(() => {
    const saved = loadJournal();
    setState(saved ?? createJournal());
    setProfile(loadDNAProfile());
    setLoaded(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (loaded && state) {
      saveJournal(state);
    }
  }, [state, loaded]);

  const handleAdd = useCallback(
    (entry: Omit<JournalEntry, "id" | "timestamp">) => {
      setState((prev) => (prev ? addEntry(prev, entry) : prev));
    },
    []
  );

  const handleOutcome = useCallback((entryId: string, outcome: string) => {
    setState((prev) => (prev ? updateOutcome(prev, entryId, outcome) : prev));
  }, []);

  const handleDelete = useCallback((entryId: string) => {
    setState((prev) => (prev ? deleteEntry(prev, entryId) : prev));
  }, []);

  if (!loaded || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const analytics = getAnalytics(state);
  const insights = detectPatterns(state);
  const coaching = getJournalCoaching(profile);

  const filtered =
    filter === "all"
      ? state.entries
      : state.entries.filter((e) => e.action === filter);

  return (
    <main className="min-h-screen px-4 py-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[var(--blue)]" />
            Investment Journal
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Track decisions, emotions, and biases
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
          style={{ background: "var(--blue)", color: "#fff" }}
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {/* Coaching banner */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 mb-6 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(68,138,255,0.12)" }}>
          <MessageSquare className="w-4 h-4 text-[var(--blue)]" />
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {coaching}
        </p>
      </div>

      <AIInsightCard pageId="journal" className="mb-4" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricCard
          icon={<BookOpen className="w-4 h-4" />}
          label="Total Entries"
          value={analytics.totalEntries}
          sub={`${analytics.thisMonth} this month`}
        />
        <MetricCard
          icon={<Target className="w-4 h-4" />}
          label="Rule Follow Rate"
          value={analytics.totalEntries > 0 ? `${Math.round(analytics.ruleFollowRate * 100)}%` : "--"}
          sub={analytics.ruleFollowRate >= 0.8 ? "Strong discipline" : analytics.totalEntries > 0 ? "Room to improve" : "Start journaling"}
        />
        <MetricCard
          icon={<Brain className="w-4 h-4" />}
          label="Calm Trade Rate"
          value={analytics.totalEntries > 0 ? `${Math.round(analytics.calmTradeRate * 100)}%` : "--"}
          sub="Calm, confident, or disciplined"
        />
        <MetricCard
          icon={<Flame className="w-4 h-4" />}
          label="Streak"
          value={`${analytics.streakDays}d`}
          sub={analytics.streakDays >= 3 ? "Keep it up!" : "Journal daily"}
        />
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowInsights((p) => !p)}
            className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-3 hover:text-[var(--text-primary)] transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Pattern Insights ({insights.length})
            {showInsights ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showInsights && (
            <div className="grid gap-2 md:grid-cols-2">
              {insights.map((ins, i) => (
                <InsightCard key={i} insight={ins} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
        {(["all", "buy", "sell", "hold", "watchlist", "exit"] as FilterMode[]).map((f) => {
          const isActive = filter === f;
          const count = f === "all" ? state.entries.length : state.entries.filter((e) => e.action === f).length;
          const color = f === "all" ? "var(--blue)" : ACTION_INFO[f as JournalAction]?.color ?? "var(--blue)";
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-xs font-medium border transition-all flex-shrink-0"
              style={{
                borderColor: isActive ? color : "var(--border)",
                background: isActive ? `${color}15` : "transparent",
                color: isActive ? color : "var(--text-muted)",
              }}
            >
              {f === "all" ? "All" : ACTION_INFO[f as JournalAction]?.label ?? f} ({count})
            </button>
          );
        })}
      </div>

      {/* Entry list */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                stock={stockMap.get(entry.ticker)}
                onUpdateOutcome={(outcome) => handleOutcome(entry.id, outcome)}
                onDelete={() => handleDelete(entry.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--surface-alt)] flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="font-semibold mb-2">
            {filter === "all" ? "Start Your Journal" : "No entries for this filter"}
          </h3>
          <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto mb-4">
            {filter === "all"
              ? "Record your first investment decision. Track the why, not just the what."
              : "Try a different filter or add a new entry."}
          </p>
          {filter === "all" && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "var(--blue)", color: "#fff" }}
            >
              Write First Entry
            </button>
          )}
        </div>
      )}

      {/* New Entry Modal */}
      <AnimatePresence>
        {showModal && (
          <NewEntryModal onAdd={handleAdd} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}
