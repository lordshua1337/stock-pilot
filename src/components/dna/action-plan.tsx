"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  BookOpen,
  Calendar,
  TrendingDown,
  Repeat,
  Eye,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  type LucideIcon,
} from "lucide-react";
import type { CoreDimensions, DimKey, ArchetypeKey } from "@/lib/financial-dna";
import type { BiasFlag, MicroModuleKey } from "@/lib/dna-scoring";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";

// ---------------------------------------------------------------------------
// Action item type
// ---------------------------------------------------------------------------

type Priority = "this_week" | "this_month" | "ongoing";
type Difficulty = "easy" | "moderate" | "challenging";

interface ActionItem {
  icon: LucideIcon;
  title: string;
  description: string;
  why: string;
  priority: Priority;
  timeEstimate: string;
  difficulty: Difficulty;
}

const PRIORITY_LABELS: Record<Priority, { label: string; color: string }> = {
  this_week: { label: "Do This Week", color: "#006DD8" },
  this_month: { label: "Do This Month", color: "#FFD740" },
  ongoing: { label: "Ongoing Habit", color: "#448AFF" },
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
};

// ---------------------------------------------------------------------------
// Bias countermeasures
// ---------------------------------------------------------------------------

const BIAS_COUNTERMEASURES: Record<string, ActionItem> = {
  loss_aversion: {
    icon: Shield,
    title: "Set a 48-hour decision buffer",
    description:
      "Before making any portfolio change triggered by news, wait 48 hours. Write down your reasoning now and revisit it later.",
    why: "Your loss sensitivity is heightened. Forcing a pause prevents fear-driven decisions.",
    priority: "this_week",
    timeEstimate: "5 minutes per trade",
    difficulty: "easy",
  },
  fomo: {
    icon: Eye,
    title: "72-hour cooling period on trending picks",
    description:
      "When you feel the urge to buy something everyone is talking about, add it to a watchlist instead. Review it in 3 days.",
    why: "Your FOMO response is strong. A waiting period separates excitement from analysis.",
    priority: "this_week",
    timeEstimate: "5 minutes",
    difficulty: "moderate",
  },
  overconfidence: {
    icon: AlertTriangle,
    title: 'Add a "what could go wrong?" checklist',
    description:
      "Before any new position over 5% of your portfolio, list 3 specific risks and their probability.",
    why: "You tend to overestimate your edge. Forced bear-case thinking balances the scales.",
    priority: "this_week",
    timeEstimate: "10 minutes per trade",
    difficulty: "moderate",
  },
  herding: {
    icon: BookOpen,
    title: "Write 3 reasons a crowd trade could fail",
    description:
      "Before following any popular trade, independently document why it might not work.",
    why: "Social proof pulls you in. Independent analysis is your best defense.",
    priority: "this_month",
    timeEstimate: "15 minutes",
    difficulty: "moderate",
  },
  recency_bias: {
    icon: TrendingDown,
    title: "Pull up the 5-year chart before acting",
    description:
      "Whenever current events drive an urge to trade, zoom out to the 5-year view first.",
    why: "Recent events dominate your thinking. Historical context provides balance.",
    priority: "this_week",
    timeEstimate: "2 minutes",
    difficulty: "easy",
  },
  disposition_effect: {
    icon: Target,
    title: "Set exit prices before entering positions",
    description:
      "Before buying any stock, write down your target sell price (both up and down). Review quarterly.",
    why: "You tend to sell winners too early and hold losers too long. Pre-set rules fix this.",
    priority: "this_month",
    timeEstimate: "10 minutes per position",
    difficulty: "moderate",
  },
  present_bias: {
    icon: Calendar,
    title: "Automate your monthly contributions",
    description:
      "Set up automatic transfers to your investment account on payday. Remove the manual step.",
    why: "Your natural focus on the present makes long-term habits harder. Automation does it for you.",
    priority: "this_week",
    timeEstimate: "15 minutes (one-time)",
    difficulty: "easy",
  },
  inertia: {
    icon: Repeat,
    title: "Schedule a quarterly 30-minute portfolio review",
    description:
      "Put it on your calendar right now. Review your holdings, rebalance if needed, and document changes.",
    why: "You tend to avoid change even when your current approach is suboptimal. Scheduled reviews overcome inertia.",
    priority: "this_week",
    timeEstimate: "5 minutes to schedule",
    difficulty: "easy",
  },
};

// ---------------------------------------------------------------------------
// Module-based actions
// ---------------------------------------------------------------------------

const MODULE_ACTIONS: Record<MicroModuleKey, ActionItem> = {
  volatility_coping: {
    icon: Shield,
    title: "Build your volatility playbook",
    description:
      "Write a 3-step plan for what you will do when your portfolio drops 10%, 20%, and 30%. Keep it visible.",
    why: "Having a pre-written plan prevents emotional decisions during market stress.",
    priority: "this_week",
    timeEstimate: "30 minutes",
    difficulty: "moderate",
  },
  plan_discipline: {
    icon: Calendar,
    title: "Create a simple investment checklist",
    description:
      "Write 3 rules you must follow before any trade (e.g., check thesis, check position size, sleep on it). Tape it to your monitor.",
    why: "Your discipline score is low. External structure compensates for internal follow-through.",
    priority: "this_week",
    timeEstimate: "15 minutes",
    difficulty: "easy",
  },
  delegation_trust: {
    icon: BookOpen,
    title: "Identify one area to delegate",
    description:
      "Pick one aspect of your finances (tax optimization, rebalancing, research) to hand off to a tool or advisor.",
    why: "Your high control need may be costing you time and creating blind spots.",
    priority: "this_month",
    timeEstimate: "30 minutes",
    difficulty: "challenging",
  },
  bias_deep_dive: {
    icon: Eye,
    title: "Journal your next 5 investment decisions",
    description:
      "Write down what you decided, why, and how you felt. Review after 30 days to spot patterns.",
    why: "Multiple strong biases were detected. Self-awareness through journaling is the fastest fix.",
    priority: "ongoing",
    timeEstimate: "5 minutes per decision",
    difficulty: "easy",
  },
  goal_clarity: {
    icon: Target,
    title: "Define 3 specific financial goals with deadlines",
    description:
      'Write down exactly what you want (e.g., "$50K emergency fund by Dec 2027") and map your portfolio to each goal.',
    why: "Your short horizon and present bias suggest your goals need more structure.",
    priority: "this_week",
    timeEstimate: "30 minutes",
    difficulty: "moderate",
  },
};

// ---------------------------------------------------------------------------
// Dimension-based portfolio action
// ---------------------------------------------------------------------------

function getDimensionAction(dims: CoreDimensions): ActionItem {
  // Find the lowest dimension and offer targeted advice
  const entries = (["R", "C", "H", "D", "E"] as DimKey[]).map((k) => ({
    key: k,
    value: dims[k],
  }));
  const lowest = [...entries].sort((a, b) => a.value - b.value)[0];

  const actions: Record<DimKey, ActionItem> = {
    R: {
      icon: Shield,
      title: "Reduce portfolio check frequency",
      description:
        "Move from daily checks to weekly. Each time you check, your loss sensitivity gets a fresh trigger.",
      why: "Lowering your exposure to price noise directly reduces anxiety and bad trades.",
      priority: "this_week",
      timeEstimate: "2 minutes to set up",
      difficulty: "easy",
    },
    C: {
      icon: BookOpen,
      title: "Find one trusted source of financial advice",
      description:
        "Rather than consuming everything, pick one analyst or advisor whose methodology you understand.",
      why: "Low control confidence means you may be vulnerable to conflicting opinions.",
      priority: "this_month",
      timeEstimate: "30 minutes",
      difficulty: "moderate",
    },
    H: {
      icon: Calendar,
      title: "Set up a compound interest visualization",
      description:
        "Use a compound interest calculator to see what your current contributions grow to in 10, 20, and 30 years.",
      why: "Seeing the long-term numbers makes short-term patience feel more rewarding.",
      priority: "this_week",
      timeEstimate: "10 minutes",
      difficulty: "easy",
    },
    D: {
      icon: Repeat,
      title: "Automate one investment habit this week",
      description:
        "Set up auto-deposit, auto-rebalance, or a calendar reminder. Pick the one you struggle with most.",
      why: "Discipline improves dramatically when you remove manual steps from the process.",
      priority: "this_week",
      timeEstimate: "15 minutes",
      difficulty: "easy",
    },
    E: {
      icon: Shield,
      title: "Write your personal 'market crash' plan",
      description:
        "Decide now what you will do if markets drop 20%. Write it down and sign it as a commitment.",
      why: "Emotional regulation improves when decisions are pre-made, not made under stress.",
      priority: "this_week",
      timeEstimate: "20 minutes",
      difficulty: "moderate",
    },
  };

  return actions[lowest.key];
}

// ---------------------------------------------------------------------------
// Build the action list from profile data
// ---------------------------------------------------------------------------

function buildActions(
  dims: CoreDimensions,
  biasFlags: BiasFlag[],
  triggeredModules: MicroModuleKey[]
): ActionItem[] {
  const items: ActionItem[] = [];
  const usedTitles = new Set<string>();

  function addUnique(item: ActionItem): boolean {
    if (usedTitles.has(item.title)) return false;
    usedTitles.add(item.title);
    items.push(item);
    return true;
  }

  // 1. Top 2 bias countermeasures
  const topBiases = [...biasFlags]
    .filter((f) => f.severity >= 2)
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 2);

  for (const bias of topBiases) {
    const action = BIAS_COUNTERMEASURES[bias.bias];
    if (action) addUnique(action);
  }

  // 2. Triggered module actions
  for (const mod of triggeredModules.slice(0, 2)) {
    const action = MODULE_ACTIONS[mod];
    if (action) addUnique(action);
  }

  // 3. Dimension-based action
  if (items.length < 5) {
    addUnique(getDimensionAction(dims));
  }

  // 4. Fill to 4 minimum with lower-severity bias actions
  if (items.length < 4) {
    const lowerBiases = [...biasFlags]
      .filter((f) => f.severity >= 1)
      .sort((a, b) => b.severity - a.severity);
    for (const bias of lowerBiases) {
      if (items.length >= 5) break;
      const action = BIAS_COUNTERMEASURES[bias.bias];
      if (action) addUnique(action);
    }
  }

  return items.slice(0, 5);
}

// ---------------------------------------------------------------------------
// ActionPlan component
// ---------------------------------------------------------------------------

function ActionCheckbox({
  checked,
  onToggle,
  accentColor,
}: {
  checked: boolean;
  onToggle: () => void;
  accentColor: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
      aria-label={checked ? "Mark as incomplete" : "Mark as complete"}
    >
      {checked ? (
        <CheckCircle2 className="w-5 h-5" style={{ color: accentColor }} />
      ) : (
        <Circle className="w-5 h-5 text-text-muted" />
      )}
    </button>
  );
}

export function ActionPlan({
  dimensions,
  biasFlags,
  triggeredModules,
  archetypeKey,
  accentColor = "#006DD8",
}: {
  dimensions: CoreDimensions;
  biasFlags: BiasFlag[];
  triggeredModules: MicroModuleKey[];
  archetypeKey?: ArchetypeKey;
  accentColor?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const actions = buildActions(dimensions, biasFlags, triggeredModules);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  if (actions.length === 0) return null;

  const archetype = archetypeKey ? ARCHETYPE_INFO[archetypeKey] : null;
  const topAction = actions[0];

  function toggleCheck(index: number) {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div
        className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold mb-1"
        style={{ color: accentColor }}
      >
        <Target className="w-3.5 h-3.5" />
        Your 30-Day Investor Action Plan
      </div>
      <h2 className="text-xl font-bold mb-2">
        What to Do Next
      </h2>
      <p className="text-sm text-text-secondary mb-4">
        Concrete steps tailored to your behavioral profile. Check them off as
        you go.
      </p>

      {/* Priority summary box */}
      {archetype && topAction && (
        <div
          className="rounded-lg p-4 mb-5 border"
          style={{
            borderColor: `${accentColor}30`,
            backgroundColor: `${accentColor}08`,
          }}
        >
          <p className="text-xs text-text-muted mb-1">
            Based on your profile as {archetype.name}, your #1 priority is:
          </p>
          <p className="text-sm font-semibold" style={{ color: accentColor }}>
            {topAction.title}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          const isChecked = checked[i] ?? false;
          const priority = PRIORITY_LABELS[action.priority];

          return (
            <motion.div
              key={action.title}
              initial={{
                opacity: prefersReducedMotion ? 1 : 0,
                x: prefersReducedMotion ? 0 : -8,
              }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className={`flex items-start gap-3 rounded-lg p-4 transition-colors ${
                isChecked ? "bg-surface-alt/50 opacity-70" : "bg-surface-alt"
              }`}
            >
              <ActionCheckbox
                checked={isChecked}
                onToggle={() => toggleCheck(i)}
                accentColor={accentColor}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      color: accentColor,
                      backgroundColor: `${accentColor}15`,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-sm font-semibold ${isChecked ? "line-through" : ""}`}>
                    {action.title}
                  </span>
                </div>

                {/* Priority / time / difficulty badges */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                    style={{
                      color: priority.color,
                      backgroundColor: `${priority.color}15`,
                    }}
                  >
                    {priority.label}
                  </span>
                  <span className="text-[9px] text-text-muted flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {action.timeEstimate}
                  </span>
                  <span className="text-[9px] text-text-muted flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5" />
                    {DIFFICULTY_LABELS[action.difficulty]}
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed mb-1.5">
                  {action.description}
                </p>
                <p
                  className="text-[11px] italic"
                  style={{ color: accentColor }}
                >
                  Why this matters for you: {action.why}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion summary */}
      {Object.values(checked).some(Boolean) && (
        <div className="mt-4 text-center text-xs text-text-muted">
          {Object.values(checked).filter(Boolean).length} of {actions.length} completed
        </div>
      )}
    </div>
  );
}
