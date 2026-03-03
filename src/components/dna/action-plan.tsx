"use client";

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
  type LucideIcon,
} from "lucide-react";
import type { CoreDimensions, DimKey } from "@/lib/financial-dna";
import type { BiasFlag, MicroModuleKey } from "@/lib/dna-scoring";

// ---------------------------------------------------------------------------
// Action item type
// ---------------------------------------------------------------------------

interface ActionItem {
  icon: LucideIcon;
  title: string;
  description: string;
  why: string;
}

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
  },
  fomo: {
    icon: Eye,
    title: "72-hour cooling period on trending picks",
    description:
      "When you feel the urge to buy something everyone is talking about, add it to a watchlist instead. Review it in 3 days.",
    why: "Your FOMO response is strong. A waiting period separates excitement from analysis.",
  },
  overconfidence: {
    icon: AlertTriangle,
    title: 'Add a "what could go wrong?" checklist',
    description:
      "Before any new position over 5% of your portfolio, list 3 specific risks and their probability.",
    why: "You tend to overestimate your edge. Forced bear-case thinking balances the scales.",
  },
  herding: {
    icon: BookOpen,
    title: "Write 3 reasons a crowd trade could fail",
    description:
      "Before following any popular trade, independently document why it might not work.",
    why: "Social proof pulls you in. Independent analysis is your best defense.",
  },
  recency_bias: {
    icon: TrendingDown,
    title: "Pull up the 5-year chart before acting",
    description:
      "Whenever current events drive an urge to trade, zoom out to the 5-year view first.",
    why: "Recent events dominate your thinking. Historical context provides balance.",
  },
  disposition_effect: {
    icon: Target,
    title: "Set exit prices before entering positions",
    description:
      "Before buying any stock, write down your target sell price (both up and down). Review quarterly.",
    why: "You tend to sell winners too early and hold losers too long. Pre-set rules fix this.",
  },
  present_bias: {
    icon: Calendar,
    title: "Automate your monthly contributions",
    description:
      "Set up automatic transfers to your investment account on payday. Remove the manual step.",
    why: "Your natural focus on the present makes long-term habits harder. Automation does it for you.",
  },
  inertia: {
    icon: Repeat,
    title: "Schedule a quarterly 30-minute portfolio review",
    description:
      "Put it on your calendar right now. Review your holdings, rebalance if needed, and document changes.",
    why: "You tend to avoid change even when your current approach is suboptimal. Scheduled reviews overcome inertia.",
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
  },
  plan_discipline: {
    icon: Calendar,
    title: "Create a simple investment checklist",
    description:
      "Write 3 rules you must follow before any trade (e.g., check thesis, check position size, sleep on it). Tape it to your monitor.",
    why: "Your discipline score is low. External structure compensates for internal follow-through.",
  },
  delegation_trust: {
    icon: BookOpen,
    title: "Identify one area to delegate",
    description:
      "Pick one aspect of your finances (tax optimization, rebalancing, research) to hand off to a tool or advisor.",
    why: "Your high control need may be costing you time and creating blind spots.",
  },
  bias_deep_dive: {
    icon: Eye,
    title: "Journal your next 5 investment decisions",
    description:
      "Write down what you decided, why, and how you felt. Review after 30 days to spot patterns.",
    why: "Multiple strong biases were detected. Self-awareness through journaling is the fastest fix.",
  },
  goal_clarity: {
    icon: Target,
    title: "Define 3 specific financial goals with deadlines",
    description:
      'Write down exactly what you want (e.g., "$50K emergency fund by Dec 2027") and map your portfolio to each goal.',
    why: "Your short horizon and present bias suggest your goals need more structure.",
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
    },
    C: {
      icon: BookOpen,
      title: "Find one trusted source of financial advice",
      description:
        "Rather than consuming everything, pick one analyst or advisor whose methodology you understand.",
      why: "Low control confidence means you may be vulnerable to conflicting opinions.",
    },
    H: {
      icon: Calendar,
      title: "Set up a compound interest visualization",
      description:
        "Use a compound interest calculator to see what your current contributions grow to in 10, 20, and 30 years.",
      why: "Seeing the long-term numbers makes short-term patience feel more rewarding.",
    },
    D: {
      icon: Repeat,
      title: "Automate one investment habit this week",
      description:
        "Set up auto-deposit, auto-rebalance, or a calendar reminder. Pick the one you struggle with most.",
      why: "Discipline improves dramatically when you remove manual steps from the process.",
    },
    E: {
      icon: Shield,
      title: "Write your personal 'market crash' plan",
      description:
        "Decide now what you will do if markets drop 20%. Write it down and sign it as a commitment.",
      why: "Emotional regulation improves when decisions are pre-made, not made under stress.",
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

export function ActionPlan({
  dimensions,
  biasFlags,
  triggeredModules,
  accentColor = "#00C853",
}: {
  dimensions: CoreDimensions;
  biasFlags: BiasFlag[];
  triggeredModules: MicroModuleKey[];
  accentColor?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const actions = buildActions(dimensions, biasFlags, triggeredModules);

  if (actions.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div
        className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold mb-1"
        style={{ color: accentColor }}
      >
        <Target className="w-3.5 h-3.5" />
        Your Action Plan
      </div>
      <h2 className="text-xl font-bold mb-2">
        What to Do Next
      </h2>
      <p className="text-sm text-text-secondary mb-5">
        Concrete steps tailored to your behavioral profile. Start with #1 and
        work your way down.
      </p>

      <div className="space-y-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{
                opacity: prefersReducedMotion ? 1 : 0,
                x: prefersReducedMotion ? 0 : -8,
              }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="flex items-start gap-3 bg-surface-alt rounded-lg p-4"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      color: accentColor,
                      backgroundColor: `${accentColor}15`,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold">{action.title}</span>
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
    </div>
  );
}
