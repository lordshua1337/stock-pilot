"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  ChevronRight,
  Shield,
  Zap,
  Clock,
  Target,
  Heart,
  Compass,
} from "lucide-react";
import {
  DNA_QUESTIONS,
  CLUSTER_LABELS,
  type ClusterKey,
} from "@/lib/financial-dna";
import {
  saveAnswersInProgress,
  loadAnswersInProgress,
  clearAnswersInProgress,
  saveTimings,
  loadTimings,
  saveDNAProfile,
  hasCompletedDNA,
} from "@/lib/dna-storage";
import { computeFullProfile } from "@/lib/dna-scoring";

// ---------------------------------------------------------------------------
// Cluster icons
// ---------------------------------------------------------------------------

const clusterIcons: Record<ClusterKey, React.ReactNode> = {
  A: <Zap className="w-3.5 h-3.5" />,
  B: <Clock className="w-3.5 h-3.5" />,
  C: <Target className="w-3.5 h-3.5" />,
  D: <Compass className="w-3.5 h-3.5" />,
  E: <Heart className="w-3.5 h-3.5" />,
};

// ---------------------------------------------------------------------------
// Progress bar component
// ---------------------------------------------------------------------------

function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = (current / total) * 100;
  return (
    <div className="w-full bg-surface-alt rounded-full h-1.5">
      <div
        className="bg-green h-1.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cluster progress dots
// ---------------------------------------------------------------------------

function ClusterDots({
  answers,
}: {
  answers: Record<string, number>;
}) {
  const clusters: ClusterKey[] = ["A", "B", "C", "D", "E"];
  return (
    <div className="flex items-center gap-3">
      {clusters.map((c) => {
        const clusterQs = DNA_QUESTIONS.filter((q) => q.cluster === c);
        const answered = clusterQs.filter((q) => answers[q.id] !== undefined).length;
        const total = clusterQs.length;
        const complete = answered === total;
        const started = answered > 0;

        return (
          <div key={c} className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                complete
                  ? "bg-green"
                  : started
                    ? "bg-green/40"
                    : "bg-border"
              }`}
            />
            <span className="text-[10px] text-text-muted font-mono">
              {c}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main assessment page
// ---------------------------------------------------------------------------

export default function FinancialDNAPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timings, setTimings] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const questionStartTime = useRef<number>(Date.now());

  const totalQuestions = DNA_QUESTIONS.length;
  const question = DNA_QUESTIONS[currentIndex];
  const answeredCount = Object.keys(answers).length;

  // Check if user already has a DNA profile (client-side only to avoid hydration mismatch)
  useEffect(() => {
    setAlreadyCompleted(hasCompletedDNA());
  }, []);

  // Load saved progress on mount
  useEffect(() => {
    const savedAnswers = loadAnswersInProgress();
    const savedTimings = loadTimings();
    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
      setAnswers(savedAnswers);
      // Resume at first unanswered question
      const firstUnanswered = DNA_QUESTIONS.findIndex(
        (q) => savedAnswers[q.id] === undefined
      );
      if (firstUnanswered >= 0) {
        setCurrentIndex(firstUnanswered);
      }
      setShowIntro(false);
    }
    if (savedTimings) {
      setTimings(savedTimings);
    }
  }, []);

  // Reset question timer when navigating
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [currentIndex]);

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      // Record timing
      const elapsed = Date.now() - questionStartTime.current;
      const newTimings = { ...timings, [question.id]: elapsed };
      setTimings(newTimings);
      saveTimings(newTimings);

      // Record answer
      const updated = { ...answers, [question.id]: optionIndex };
      setAnswers(updated);
      saveAnswersInProgress(updated);

      // Auto-advance after brief delay (use functional setState to avoid stale closure)
      if (currentIndex < totalQuestions - 1) {
        setTimeout(() => {
          setCurrentIndex((prev) =>
            prev === currentIndex ? currentIndex + 1 : prev
          );
        }, 300);
      }
    },
    [answers, timings, currentIndex, question, totalQuestions]
  );

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleFinish = useCallback(async () => {
    if (answeredCount < totalQuestions) return;

    setIsProcessing(true);

    // Yield to browser so the processing screen renders
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Compute the full profile
    const profile = computeFullProfile(answers, timings);

    // Save to localStorage
    saveDNAProfile(profile);
    clearAnswersInProgress();

    // Navigate to results
    router.push("/personality/results");
  }, [answeredCount, totalQuestions, answers, timings, router]);

  const handleStartOver = useCallback(() => {
    setAnswers({});
    setTimings({});
    setCurrentIndex(0);
    clearAnswersInProgress();
    questionStartTime.current = Date.now();
  }, []);

  // ---------------------------------------------------------------------------
  // Intro screen
  // ---------------------------------------------------------------------------

  if (showIntro) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>

          <div className="space-y-6 animate-fade-in">
            {/* Hero */}
            <div className="bg-surface border border-border rounded-xl p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 text-green text-xs uppercase tracking-widest font-medium mb-4">
                <Shield className="w-3.5 h-3.5" />
                Financial DNA Assessment
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                Discover Your Financial DNA
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                This isn&apos;t a risk tolerance questionnaire. It&apos;s a behavioral
                intelligence engine that maps how you make financial decisions
                under pressure, uncertainty, and opportunity. 25 questions. 5
                behavioral dimensions. Personalized AI recommendations that
                actually fit how your brain works.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-surface-alt rounded-lg p-3">
                  <p className="text-2xl font-bold text-green mb-0.5">25</p>
                  <p className="text-xs text-text-muted">Questions</p>
                </div>
                <div className="bg-surface-alt rounded-lg p-3">
                  <p className="text-2xl font-bold text-green mb-0.5">5</p>
                  <p className="text-xs text-text-muted">Dimensions</p>
                </div>
                <div className="bg-surface-alt rounded-lg p-3">
                  <p className="text-2xl font-bold text-green mb-0.5">~4</p>
                  <p className="text-xs text-text-muted">Minutes</p>
                </div>
              </div>

              <button
                onClick={() => setShowIntro(false)}
                className="w-full bg-green text-black px-5 py-3 rounded-lg font-medium hover:bg-green-light transition-colors inline-flex items-center justify-center gap-2"
              >
                {alreadyCompleted ? "Retake Assessment" : "Begin Assessment"}
                <ArrowRight className="w-4 h-4" />
              </button>

              {alreadyCompleted && (
                <Link
                  href="/personality/results"
                  className="block text-center text-sm text-green mt-3 hover:text-green-light transition-colors"
                >
                  View existing results
                </Link>
              )}
            </div>

            {/* 5 dimensions preview */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
                What We Measure
              </h3>
              <div className="space-y-3">
                {(
                  [
                    { key: "R", icon: <Zap className="w-4 h-4" />, name: "Risk Orientation", desc: "How you handle volatility, loss, and ambiguity" },
                    { key: "C", icon: <Compass className="w-4 h-4" />, name: "Control vs Delegation", desc: "Your need for autonomy and trust in guidance" },
                    { key: "H", icon: <Clock className="w-4 h-4" />, name: "Time Horizon", desc: "Present bias vs compounding mindset" },
                    { key: "D", icon: <Target className="w-4 h-4" />, name: "Execution Discipline", desc: "Planning habits, rule adherence, follow-through" },
                    { key: "E", icon: <Heart className="w-4 h-4" />, name: "Emotional Regulation", desc: "Stress reactivity and impulse control under pressure" },
                  ] as const
                ).map((dim) => (
                  <div
                    key={dim.key}
                    className="flex items-start gap-3 bg-surface-alt rounded-lg p-3"
                  >
                    <div className="text-green mt-0.5">{dim.icon}</div>
                    <div>
                      <p className="text-sm font-medium">{dim.name}</p>
                      <p className="text-xs text-text-muted">{dim.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 clusters preview */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
                5 Question Clusters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.entries(CLUSTER_LABELS) as [ClusterKey, string][]).map(
                  ([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 text-sm text-text-secondary"
                    >
                      <span className="text-green font-mono text-xs font-medium w-4">
                        {key}
                      </span>
                      {label}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Processing screen
  // ---------------------------------------------------------------------------

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <Brain className="w-12 h-12 text-green mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">
            Analyzing Your Financial DNA
          </h2>
          <p className="text-text-muted text-sm">
            Computing dimensions, detecting biases, classifying archetype...
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Question screen
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back to intro */}
        <button
          onClick={() => setShowIntro(true)}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Progress header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <ClusterDots answers={answers} />
          </div>
          <ProgressBar current={answeredCount} total={totalQuestions} />
        </div>

        {/* Cluster label */}
        <div className="flex items-center gap-2 text-green text-xs uppercase tracking-widest font-medium mb-3">
          {clusterIcons[question.cluster]}
          <span>
            Cluster {question.cluster} -- {question.clusterLabel}
          </span>
        </div>

        {/* Question card */}
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-6">
            {question.text}
          </h2>
          <div className="space-y-2">
            {question.options.map((option, idx) => {
              const isSelected = answers[question.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all flex items-center gap-3 ${
                    isSelected
                      ? "border-green bg-green-bg text-text-primary"
                      : "border-border bg-surface-alt text-text-secondary hover:border-border-light hover:bg-surface-hover"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? "border-green" : "border-text-muted"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-green" />
                    )}
                  </div>
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              disabled={answers[question.id] === undefined}
              className="text-sm text-green hover:text-green-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={answeredCount < totalQuestions}
              className="bg-green text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              See My DNA
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Start over option */}
        {answeredCount > 0 && (
          <div className="mt-8 pt-6 border-t border-border text-center">
            <button
              onClick={handleStartOver}
              className="text-xs text-text-muted hover:text-red transition-colors"
            >
              Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
