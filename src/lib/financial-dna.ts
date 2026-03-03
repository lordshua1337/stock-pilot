// Investor Identity Assessment -- 25-question behavioral intelligence engine
// Grounded in prospect theory, disposition effect, myopic loss aversion
// Each answer updates multiple weighted behavioral vectors simultaneously

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export const DIMENSION_KEYS = ["R", "C", "H", "D", "E"] as const;
export type DimKey = (typeof DIMENSION_KEYS)[number];

export interface CoreDimensions {
  R: number; // Risk Orientation -- volatility tolerance, loss tolerance, ambiguity comfort
  C: number; // Control vs Delegation -- autonomy need, trust calibration (high = wants control)
  H: number; // Time Horizon Bias -- present bias vs compounding mindset (high = long-term)
  D: number; // Execution Discipline -- planning cadence, habit friction, rule adherence
  E: number; // Emotional Regulation -- stress reactivity, reassurance dependence (high = regulated)
}

export type BiasKey =
  | "loss_aversion"
  | "myopic_loss_aversion"
  | "disposition_effect"
  | "anchoring"
  | "regret_avoidance"
  | "overconfidence"
  | "recency_bias"
  | "herding"
  | "fomo"
  | "confirmation_bias"
  | "inertia"
  | "mental_accounting"
  | "sunk_cost"
  | "availability_heuristic"
  | "present_bias"
  | "narrative_bias";

export type FrictionTrigger =
  | "loss_headlines"
  | "authority_conflict"
  | "peer_comparison"
  | "time_pressure"
  | "complexity_overload";

export type ArchetypeKey =
  | "systems_builder"
  | "reassurance_seeker"
  | "analytical_skeptic"
  | "diy_controller"
  | "collaborative_partner"
  | "big_picture_optimist"
  | "trend_sensitive_explorer"
  | "avoider_under_stress"
  | "action_first_decider"
  | "values_anchored_steward";

export type MarketMoodState =
  | "panicked"
  | "reactive"
  | "euphoric"
  | "concerned"
  | "steady";

export type ClusterKey = "A" | "B" | "C" | "D" | "E";

export interface AnswerOption {
  label: string;
  vector: [number, number, number, number, number]; // [R, C, H, D, E]
  biases: Partial<Record<BiasKey, number>>; // bias key -> increment (1 = +, 2 = ++)
  frictionTrigger?: FrictionTrigger;
  aiNote?: string;
  flags?: string[];
}

export interface DNAQuestion {
  id: string; // e.g. "A1", "B3", "E5"
  cluster: ClusterKey;
  clusterLabel: string;
  text: string;
  options: AnswerOption[];
}

// ---------------------------------------------------------------------------
// Cluster labels
// ---------------------------------------------------------------------------

export const CLUSTER_LABELS: Record<ClusterKey, string> = {
  A: "Volatility & Loss Scenarios",
  B: "Time Horizon & Goal Tradeoffs",
  C: "Execution & Decision Systems",
  D: "Control, Trust & Communication",
  E: "Bias Vignettes & Social Triggers",
};

// ---------------------------------------------------------------------------
// The 25 questions -- exact weight vectors from spec
// ---------------------------------------------------------------------------

export const DNA_QUESTIONS: DNAQuestion[] = [
  // =========================================================================
  // CLUSTER A -- Volatility & Loss Scenarios
  // =========================================================================
  {
    id: "A1",
    cluster: "A",
    clusterLabel: CLUSTER_LABELS.A,
    text: "Your portfolio drops ~20% in 3 weeks. What do you do first?",
    options: [
      {
        label: "Sell now, get to safety",
        vector: [-2, +1, -1, +1, -2],
        biases: { loss_aversion: 2 },
        flags: ["panic_sell_flag"],
        aiNote:
          "High panic probability. Use calming framing during drawdowns. Never lead with loss numbers.",
      },
      {
        label: "Reduce risk, wait for clarity",
        vector: [-1, +1, 0, +1, -1],
        biases: { loss_aversion: 1 },
      },
      {
        label: "Hold and review against original rules",
        vector: [+1, 0, +1, +2, +1],
        biases: {},
        aiNote: "Thesis-driven under stress. Strong behavioral foundation.",
      },
      {
        label: "Buy more -- this is an opportunity",
        vector: [+2, 0, +1, +1, +1],
        biases: { overconfidence: 1 },
        aiNote:
          "Aggressive contrarian. Monitor for overconfidence in high-stress scenarios.",
      },
    ],
  },
  {
    id: "A2",
    cluster: "A",
    clusterLabel: CLUSTER_LABELS.A,
    text: "A holding is down 30%. You believe the company is still strong. You...",
    options: [
      {
        label: "Sell -- stop the pain",
        vector: [-2, 0, -1, +1, -2],
        biases: { loss_aversion: 2, disposition_effect: 1 },
      },
      {
        label: "Wait for a bounce, then sell",
        vector: [-1, 0, 0, 0, -1],
        biases: { sunk_cost: 1, anchoring: 1 },
      },
      {
        label: "Re-check thesis and time horizon, then decide",
        vector: [+1, 0, +1, +2, +1],
        biases: {},
        aiNote: "Thesis-first decision making. High execution discipline signal.",
      },
      {
        label: "Add more because it's cheaper now",
        vector: [+2, 0, +1, +1, +1],
        biases: { overconfidence: 1 },
      },
    ],
  },
  {
    id: "A3",
    cluster: "A",
    clusterLabel: CLUSTER_LABELS.A,
    text: "A friend says 'Markets are crashing, get out.' You...",
    options: [
      {
        label: "Follow the friend",
        vector: [-2, 0, -1, 0, -2],
        biases: { herding: 2 },
        frictionTrigger: "peer_comparison",
        flags: ["social_proof_sensitivity"],
      },
      {
        label: "Panic-check the news first",
        vector: [-1, 0, 0, 0, -1],
        biases: { availability_heuristic: 1, recency_bias: 1 },
        frictionTrigger: "loss_headlines",
      },
      {
        label: "Consult your plan, then decide",
        vector: [+1, 0, +1, +2, +1],
        biases: {},
      },
      {
        label: "Ignore entirely",
        vector: [+1, +1, 0, -1, +1],
        biases: {},
        aiNote: "High autonomy. May resist guidance even when warranted.",
      },
    ],
  },
  {
    id: "A4",
    cluster: "A",
    clusterLabel: CLUSTER_LABELS.A,
    text: "During volatility, I prefer to check my account...",
    options: [
      {
        label: "Hourly",
        vector: [-1, 0, -2, -1, -2],
        biases: { myopic_loss_aversion: 2 },
        frictionTrigger: "loss_headlines",
        aiNote: "Hyper-monitoring confirmed. High correlation with reactive decisions.",
      },
      {
        label: "Daily",
        vector: [-1, 0, -1, 0, -1],
        biases: { myopic_loss_aversion: 1 },
      },
      {
        label: "Monthly",
        vector: [+1, 0, +1, +1, +1],
        biases: {},
      },
      {
        label: "Quarterly or less",
        vector: [+1, 0, +2, +2, +1],
        biases: {},
      },
    ],
  },
  {
    id: "A5",
    cluster: "A",
    clusterLabel: CLUSTER_LABELS.A,
    text: "If a diversified plan is still on track, a short-term drop should...",
    options: [
      {
        label: "Change the plan immediately",
        vector: [-2, 0, -2, -1, -2],
        biases: { recency_bias: 2, loss_aversion: 1 },
      },
      {
        label: "Make me wait until it calms down (no rules)",
        vector: [-1, 0, -1, 0, -1],
        biases: { inertia: 1 },
      },
      {
        label: "Trigger a rules-based review",
        vector: [+1, 0, +1, +2, +1],
        biases: {},
      },
      {
        label: "Be basically irrelevant",
        vector: [+1, 0, +2, +1, +1],
        biases: {},
      },
    ],
  },

  // =========================================================================
  // CLUSTER B -- Time Horizon & Goal Tradeoffs
  // =========================================================================
  {
    id: "B1",
    cluster: "B",
    clusterLabel: CLUSTER_LABELS.B,
    text: "Pick one: smaller gains with fewer surprises OR bigger gains with more surprise.",
    options: [
      {
        label: "Smaller and steady",
        vector: [-1, 0, 0, 0, +1],
        biases: { loss_aversion: 1 },
      },
      {
        label: "Bigger with volatility",
        vector: [+2, 0, 0, 0, 0],
        biases: {},
      },
      {
        label: "Depends on the goal bucket",
        vector: [+1, 0, +2, +2, +1],
        biases: {},
        aiNote: "Goal-segmented thinking -- most sophisticated response.",
      },
      {
        label: "Don't know",
        vector: [0, 0, 0, 0, -1],
        biases: {},
        flags: ["low_confidence_horizon"],
      },
    ],
  },
  {
    id: "B2",
    cluster: "B",
    clusterLabel: CLUSTER_LABELS.B,
    text: "How far ahead do you naturally think when investing?",
    options: [
      {
        label: "Less than 1 year",
        vector: [0, 0, -2, 0, -1],
        biases: { present_bias: 2, myopic_loss_aversion: 1 },
      },
      {
        label: "1-3 years",
        vector: [0, 0, -1, 0, 0],
        biases: { present_bias: 1 },
      },
      {
        label: "3-10 years",
        vector: [0, 0, +1, +1, +1],
        biases: {},
      },
      {
        label: "10+ years",
        vector: [0, 0, +2, +2, +1],
        biases: {},
      },
    ],
  },
  {
    id: "B3",
    cluster: "B",
    clusterLabel: CLUSTER_LABELS.B,
    text: "You get an unexpected bonus. You most likely...",
    options: [
      {
        label: "Spend it",
        vector: [0, 0, -1, -2, 0],
        biases: { mental_accounting: 2, present_bias: 1 },
      },
      {
        label: "Treat yourself with part, then decide",
        vector: [0, 0, 0, -1, 0],
        biases: { mental_accounting: 1 },
      },
      {
        label: "Allocate it to existing goals",
        vector: [0, 0, +2, +2, +1],
        biases: {},
      },
      {
        label: "Invest it aggressively -- market opportunity",
        vector: [+1, 0, +1, +1, 0],
        biases: { overconfidence: 1, recency_bias: 1 },
      },
    ],
  },
  {
    id: "B4",
    cluster: "B",
    clusterLabel: CLUSTER_LABELS.B,
    text: "You hear 'this sector is about to boom.' Your first thought is...",
    options: [
      {
        label: "Buy now before it runs",
        vector: [+1, 0, -1, -2, -1],
        biases: { fomo: 2, herding: 1, recency_bias: 1 },
      },
      {
        label: "Ask for evidence before deciding",
        vector: [0, 0, +1, +1, +1],
        biases: {},
      },
      {
        label: "Compare it to my existing plan",
        vector: [0, 0, +2, +2, +1],
        biases: {},
      },
      {
        label: "Ignore all trends entirely",
        vector: [-1, +1, +1, 0, 0],
        biases: {},
        aiNote: "May indicate rigidity.",
      },
    ],
  },
  {
    id: "B5",
    cluster: "B",
    clusterLabel: CLUSTER_LABELS.B,
    text: "I'd rather set a plan and stick to it OR adjust frequently to new info.",
    options: [
      {
        label: "Adjust frequently -- I like being active",
        vector: [0, +1, -1, -2, -1],
        biases: { overconfidence: 1 },
      },
      {
        label: "Mostly adjust, but with some structure",
        vector: [0, +1, 0, -1, 0],
        biases: {},
      },
      {
        label: "Stick to rules with scheduled reviews",
        vector: [0, 0, +2, +2, +1],
        biases: {},
      },
      {
        label: "Stick strictly even if it seems wrong",
        vector: [0, -1, +1, +1, 0],
        biases: { inertia: 1 },
      },
    ],
  },

  // =========================================================================
  // CLUSTER C -- Execution & Decision Systems
  // =========================================================================
  {
    id: "C1",
    cluster: "C",
    clusterLabel: CLUSTER_LABELS.C,
    text: "How often do you review goals and contributions?",
    options: [
      {
        label: "Never",
        vector: [0, 0, -1, -2, 0],
        biases: {},
        flags: ["habit_formation_module_trigger"],
      },
      {
        label: "Only when stressed",
        vector: [0, 0, -1, -1, -1],
        biases: { availability_heuristic: 1 },
        frictionTrigger: "loss_headlines",
      },
      {
        label: "Quarterly",
        vector: [0, 0, +1, +2, +1],
        biases: {},
      },
      {
        label: "Monthly",
        vector: [0, 0, +1, +2, +1],
        biases: {},
      },
    ],
  },
  {
    id: "C2",
    cluster: "C",
    clusterLabel: CLUSTER_LABELS.C,
    text: "Do you use rules like rebalancing or automatic contributions?",
    options: [
      {
        label: "No rules",
        vector: [0, 0, 0, -2, 0],
        biases: { inertia: 2 },
      },
      {
        label: "Loose, informal rules",
        vector: [0, 0, 0, -1, 0],
        biases: { inertia: 1 },
      },
      {
        label: "Clear written rules",
        vector: [0, 0, +1, +2, +1],
        biases: {},
      },
      {
        label: "Clear rules plus regular review",
        vector: [0, 0, +1, +2, +1],
        biases: {},
        aiNote: "Pre-commitment rule usage. Highest execution discipline signal.",
      },
    ],
  },
  {
    id: "C3",
    cluster: "C",
    clusterLabel: CLUSTER_LABELS.C,
    text: "When facing a hard financial decision, you...",
    options: [
      {
        label: "Avoid deciding as long as possible",
        vector: [0, 0, -1, -2, -1],
        biases: { regret_avoidance: 2, inertia: 1 },
      },
      {
        label: "Decide fast -- delay costs money",
        vector: [0, +1, 0, -1, -1],
        biases: { overconfidence: 1 },
        frictionTrigger: "time_pressure",
      },
      {
        label: "Gather information, then decide",
        vector: [0, 0, +1, +1, +1],
        biases: {},
      },
      {
        label: "Ask for help early",
        vector: [0, -1, +1, +1, +1],
        biases: {},
      },
    ],
  },
  {
    id: "C4",
    cluster: "C",
    clusterLabel: CLUSTER_LABELS.C,
    text: "If a plan is boring but effective, you feel...",
    options: [
      {
        label: "Hate it, want more action",
        vector: [+1, 0, 0, -2, -1],
        biases: { overconfidence: 1 },
      },
      {
        label: "Dislike it but tolerate it",
        vector: [0, 0, 0, -1, 0],
        biases: {},
      },
      {
        label: "Fine with it -- that's what works",
        vector: [0, 0, +1, +2, +1],
        biases: {},
      },
      {
        label: "Love it -- I want systems not drama",
        vector: [-1, 0, +1, +2, +1],
        biases: {},
      },
    ],
  },
  {
    id: "C5",
    cluster: "C",
    clusterLabel: CLUSTER_LABELS.C,
    text: "Big unexpected expenses hit. Your first response is...",
    options: [
      {
        label: "Panic -- this derails everything",
        vector: [0, 0, -1, -2, -2],
        biases: { loss_aversion: 1 },
        frictionTrigger: "complexity_overload",
      },
      {
        label: "Ignore it and hope it resolves",
        vector: [0, 0, -1, -1, -1],
        biases: { inertia: 1 },
      },
      {
        label: "Re-plan immediately with real numbers",
        vector: [0, 0, +1, +2, +1],
        biases: {},
      },
      {
        label: "Ask partner or advisor for help",
        vector: [0, -1, +1, +1, +1],
        biases: {},
      },
    ],
  },

  // =========================================================================
  // CLUSTER D -- Control, Trust & Communication Style
  // =========================================================================
  {
    id: "D1",
    cluster: "D",
    clusterLabel: CLUSTER_LABELS.D,
    text: "With an advisor or AI, I want...",
    options: [
      {
        label: "Tell me exactly what to do",
        vector: [0, -2, 0, +1, +1],
        biases: {},
      },
      {
        label: "Give me options with a recommendation",
        vector: [0, -1, +1, +1, +1],
        biases: {},
      },
      {
        label: "Collaborate -- think through it with me",
        vector: [0, 0, +1, +2, +1],
        biases: {},
      },
      {
        label: "I decide -- just give me information",
        vector: [0, +2, +1, 0, 0],
        biases: {},
      },
    ],
  },
  {
    id: "D2",
    cluster: "D",
    clusterLabel: CLUSTER_LABELS.D,
    text: "When advice conflicts with your instincts, you...",
    options: [
      {
        label: "Reject the advice -- trust my gut",
        vector: [0, +2, 0, -1, -1],
        biases: { overconfidence: 1, confirmation_bias: 1 },
        frictionTrigger: "authority_conflict",
      },
      {
        label: "Argue until convinced",
        vector: [0, +1, 0, 0, 0],
        biases: {},
        frictionTrigger: "authority_conflict",
      },
      {
        label: "Ask for evidence, then decide",
        vector: [0, 0, +1, +1, +1],
        biases: {},
      },
      {
        label: "Defer quickly -- they know better",
        vector: [0, -2, 0, +1, +1],
        biases: {},
      },
    ],
  },
  {
    id: "D3",
    cluster: "D",
    clusterLabel: CLUSTER_LABELS.D,
    text: "When evaluating an investment, you prefer...",
    options: [
      {
        label: "Charts and visuals",
        vector: [0, 0, 0, 0, 0],
        biases: {},
      },
      {
        label: "Short plain-language summary",
        vector: [0, 0, 0, +1, +1],
        biases: {},
      },
      {
        label: "Deep detail -- all the data",
        vector: [0, 0, +1, +1, 0],
        biases: {},
      },
      {
        label: "Stories and real examples",
        vector: [0, 0, +1, 0, +1],
        biases: { narrative_bias: 1 },
      },
    ],
  },
  {
    id: "D4",
    cluster: "D",
    clusterLabel: CLUSTER_LABELS.D,
    text: "In meetings or AI interactions, you prefer...",
    options: [
      {
        label: "Fast decisions -- get to the point",
        vector: [0, +1, 0, -1, -1],
        biases: {},
        frictionTrigger: "time_pressure",
      },
      {
        label: "Calm reassurance first, then analysis",
        vector: [0, -1, 0, 0, +2],
        biases: {},
      },
      {
        label: "Structured agenda with clear outputs",
        vector: [0, 0, +1, +2, +1],
        biases: {},
      },
      {
        label: "Minimal interaction -- I'll reach out if I need something",
        vector: [0, +2, 0, -1, 0],
        biases: {},
      },
    ],
  },
  {
    id: "D5",
    cluster: "D",
    clusterLabel: CLUSTER_LABELS.D,
    text: "The most stressful part of investing for me is...",
    options: [
      {
        label: "Losing money",
        vector: [-1, 0, 0, 0, -2],
        biases: { loss_aversion: 2 },
      },
      {
        label: "Missing gains",
        vector: [+1, 0, 0, 0, -1],
        biases: { fomo: 2, regret_avoidance: 1 },
      },
      {
        label: "Not knowing what to do",
        vector: [0, 0, 0, -1, -2],
        biases: {},
      },
      {
        label: "Conflict with a partner or advisor",
        vector: [0, 0, 0, 0, -2],
        biases: {},
        frictionTrigger: "authority_conflict",
      },
    ],
  },

  // =========================================================================
  // CLUSTER E -- Bias Vignettes & Social Triggers
  // =========================================================================
  {
    id: "E1",
    cluster: "E",
    clusterLabel: CLUSTER_LABELS.E,
    text: "A stock you own doubles. You feel tempted to...",
    options: [
      {
        label: "Sell it immediately -- lock in the gain",
        vector: [0, 0, 0, -1, 0],
        biases: { disposition_effect: 2 },
      },
      {
        label: "Hold forever -- let it run",
        vector: [0, 0, +1, 0, 0],
        biases: { overconfidence: 1 },
      },
      {
        label: "Rebalance to target allocation",
        vector: [0, 0, +1, +2, +1],
        biases: {},
        aiNote: "Rules-based rebalancing -- strongest discipline signal in Cluster E.",
      },
      {
        label: "Buy more because it's proven itself",
        vector: [+1, 0, 0, -1, 0],
        biases: { recency_bias: 2 },
      },
    ],
  },
  {
    id: "E2",
    cluster: "E",
    clusterLabel: CLUSTER_LABELS.E,
    text: "You bought at $100, it's now $70. 'I'll sell when it gets back to $100.' Do you agree?",
    options: [
      {
        label: "Strongly agree",
        vector: [-1, 0, -1, -2, -1],
        biases: { anchoring: 2, sunk_cost: 2 },
      },
      {
        label: "Somewhat agree",
        vector: [-1, 0, 0, -1, 0],
        biases: { anchoring: 1, sunk_cost: 1 },
      },
      {
        label: "Disagree -- I use thesis validity, not price",
        vector: [+1, 0, +1, +2, +1],
        biases: {},
      },
      {
        label: "Disagree -- I'd sell now if the thesis is broken",
        vector: [-1, 0, 0, +1, 0],
        biases: {},
      },
    ],
  },
  {
    id: "E3",
    cluster: "E",
    clusterLabel: CLUSTER_LABELS.E,
    text: "Everyone is talking about a specific sector or asset. You...",
    options: [
      {
        label: "Jump in -- this is real momentum",
        vector: [+1, 0, -1, -2, -1],
        biases: { herding: 2, fomo: 2 },
      },
      {
        label: "Make a small test position",
        vector: [+1, 0, 0, -1, 0],
        biases: { fomo: 1, herding: 1 },
      },
      {
        label: "Compare to my plan and constraints first",
        vector: [0, 0, +1, +2, +1],
        biases: {},
      },
      {
        label: "Avoid it specifically because of the hype",
        vector: [-1, 0, +1, +1, 0],
        biases: {},
        flags: ["contrarian_flag"],
      },
    ],
  },
  {
    id: "E4",
    cluster: "E",
    clusterLabel: CLUSTER_LABELS.E,
    text: "You sold too early once and missed a big gain. Now you tend to...",
    options: [
      {
        label: "Hold winners too long to avoid repeating that regret",
        vector: [0, 0, 0, -1, 0],
        biases: { regret_avoidance: 2, disposition_effect: 1 },
      },
      {
        label: "Make bigger bets to compensate",
        vector: [+1, 0, -1, -2, -1],
        biases: { regret_avoidance: 1, overconfidence: 1 },
      },
      {
        label: "Use pre-commitment rules to take emotion out of selling",
        vector: [0, 0, +1, +2, +1],
        biases: {},
      },
      {
        label: "I've stopped investing -- it's too stressful",
        vector: [-2, 0, -2, -2, -2],
        biases: {},
        flags: ["immediate_stress_regulation_trigger", "e4_stopped_investing"],
      },
    ],
  },
  {
    id: "E5",
    cluster: "E",
    clusterLabel: CLUSTER_LABELS.E,
    text: "How confident are you in your ability to beat professional investors consistently?",
    options: [
      {
        label: "Very confident",
        vector: [+1, 0, 0, -2, 0],
        biases: { overconfidence: 2 },
      },
      {
        label: "Somewhat confident",
        vector: [+1, 0, 0, -1, 0],
        biases: { overconfidence: 1 },
      },
      {
        label: "Not confident -- markets are hard",
        vector: [0, 0, +1, +1, +1],
        biases: {},
      },
      {
        label: "Unsure -- I haven't thought about it",
        vector: [0, 0, 0, 0, -1],
        biases: {},
        flags: ["low_confidence_execution"],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper: question bank indexed by ID for fast lookup
// ---------------------------------------------------------------------------

export const QUESTION_BANK: Record<string, DNAQuestion> = Object.fromEntries(
  DNA_QUESTIONS.map((q) => [q.id, q])
);
