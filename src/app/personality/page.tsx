"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  ChevronRight,
  Shield,
  Target,
  Zap,
  Eye,
  BookOpen,
} from "lucide-react";
import {
  quizQuestions,
  archetypes,
  calculateResult,
  type QuizResult,
} from "@/lib/personality-quiz";

const dimensionLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  risk: { label: "Risk Tolerance", icon: <Zap className="w-4 h-4" /> },
  horizon: { label: "Time Horizon", icon: <Target className="w-4 h-4" /> },
  style: { label: "Investment Style", icon: <Eye className="w-4 h-4" /> },
  behavior: { label: "Emotional Discipline", icon: <Brain className="w-4 h-4" /> },
  knowledge: { label: "Financial Knowledge", icon: <BookOpen className="w-4 h-4" /> },
};

function ProgressBar({ current, total }: { current: number; total: number }) {
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

function ScoreBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const pct = (value / 5) * 100;
  const descriptor =
    value <= 1.5
      ? "Very Low"
      : value <= 2.5
        ? "Low"
        : value <= 3.5
          ? "Moderate"
          : value <= 4.5
            ? "High"
            : "Very High";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-text-secondary text-xs">
          {icon}
          {label}
        </div>
        <span className="text-xs font-mono text-text-muted">{descriptor}</span>
      </div>
      <div className="w-full bg-surface-alt rounded-full h-2">
        <div
          className="bg-green h-2 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function AllocationBar({
  segments,
}: {
  segments: { label: string; pct: number; color: string }[];
}) {
  return (
    <div>
      <div className="flex rounded-lg overflow-hidden h-6 mb-2">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center justify-center text-[10px] font-mono text-black font-medium"
            style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
            title={`${seg.label}: ${seg.pct}%`}
          >
            {seg.pct >= 15 ? `${seg.pct}%` : ""}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-text-muted">
              {seg.label} ({seg.pct}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: QuizResult }) {
  const { archetype, scores } = result;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main result card */}
      <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 text-center">
        <div className="inline-flex items-center gap-2 text-green text-xs uppercase tracking-widest font-medium mb-4">
          <Shield className="w-3.5 h-3.5" />
          Your Investor Personality Type
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">{archetype.name}</h2>
        <p className="text-text-secondary text-lg italic mb-6">
          &ldquo;{archetype.tagline}&rdquo;
        </p>
        <p className="text-text-secondary text-sm leading-relaxed max-w-xl mx-auto">
          {archetype.description}
        </p>
      </div>

      {/* Score breakdown */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
          Your Profile
        </h3>
        <div className="space-y-4">
          {Object.entries(scores).map(([key, value]) => {
            const dim = dimensionLabels[key];
            return (
              <ScoreBar
                key={key}
                label={dim.label}
                value={value}
                icon={dim.icon}
              />
            );
          })}
        </div>
      </div>

      {/* Strengths & blind spots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-green">
            Strengths
          </h3>
          <ul className="space-y-2">
            {archetype.strengths.map((s, i) => (
              <li
                key={i}
                className="text-sm text-text-secondary flex items-start gap-2"
              >
                <span className="text-green mt-0.5 flex-shrink-0">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-gold">
            Blind Spots
          </h3>
          <ul className="space-y-2">
            {archetype.blindSpots.map((s, i) => (
              <li
                key={i}
                className="text-sm text-text-secondary flex items-start gap-2"
              >
                <span className="text-gold mt-0.5 flex-shrink-0">!</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested allocation */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
          Suggested Allocation
        </h3>
        <AllocationBar segments={archetype.idealAllocation} />
        <p className="text-xs text-text-muted mt-3">
          This is a starting point, not financial advice. Adjust based on your
          specific goals, timeline, and tax situation.
        </p>
      </div>

      {/* Famous example */}
      <div className="bg-surface-alt rounded-xl p-5 text-center">
        <p className="text-xs text-text-muted mb-1">Famous investor like you</p>
        <p className="text-sm text-text-secondary italic">
          {archetype.famousExample}
        </p>
      </div>

      {/* Compatible types */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">
          Compatible Types
        </h3>
        <div className="flex flex-wrap gap-2">
          {archetype.compatibleWith.map((id) => {
            const compat = archetypes.find((a) => a.id === id);
            if (!compat) return null;
            return (
              <span
                key={id}
                className="text-xs bg-green-bg text-green px-3 py-1.5 rounded-lg font-medium"
              >
                {compat.name}
              </span>
            );
          })}
        </div>
        <p className="text-xs text-text-muted mt-2">
          Investors with these profiles make good sounding boards for your ideas.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/research"
          className="flex-1 bg-green text-black px-5 py-3 rounded-lg font-medium text-center hover:bg-green-light transition-colors inline-flex items-center justify-center gap-2"
        >
          Explore Stocks
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/portfolio"
          className="flex-1 bg-surface border border-border px-5 py-3 rounded-lg font-medium text-center hover:border-green/30 transition-colors inline-flex items-center justify-center gap-2"
        >
          Build Portfolio
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function PersonalityQuizPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const question = quizQuestions[currentQuestion];
  const totalQuestions = quizQuestions.length;
  const answeredCount = Object.keys(answers).length;

  const result = useMemo(
    () => (showResult ? calculateResult(answers) : null),
    [showResult, answers]
  );

  const handleAnswer = (score: number) => {
    const updated = { ...answers, [question.id]: score };
    setAnswers(updated);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinish = () => {
    if (answeredCount >= totalQuestions) {
      setShowResult(true);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResult(false);
  };

  if (showResult && result) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleRetake}
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retake Quiz
          </button>
          <ResultCard result={result} />
        </div>
      </div>
    );
  }

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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-green mb-2">
            <Brain className="w-4 h-4" />
            <p className="text-xs uppercase tracking-widest font-medium">
              Investor Personality Type
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-3">
            What Kind of Investor Are You?
          </h1>
          <p className="text-text-secondary text-sm">
            20 questions. 6 archetypes. Discover your investing DNA -- your risk
            tolerance, time horizon, decision-making style, and behavioral
            patterns. Takes about 3 minutes.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
            <span className="text-xs text-text-muted">
              {answeredCount} answered
            </span>
          </div>
          <ProgressBar current={answeredCount} total={totalQuestions} />
        </div>

        {/* Question */}
        <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-green font-mono font-medium uppercase tracking-wider">
              {question.dimension === "risk" && "Risk Tolerance"}
              {question.dimension === "horizon" && "Time Horizon"}
              {question.dimension === "style" && "Investment Style"}
              {question.dimension === "behavior" && "Behavioral Patterns"}
              {question.dimension === "knowledge" && "Financial Knowledge"}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold mb-6">
            {question.text}
          </h2>
          <div className="space-y-2">
            {question.options.map((option) => {
              const isSelected = answers[question.id] === option.score;
              return (
                <button
                  key={option.score}
                  onClick={() => handleAnswer(option.score)}
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
            disabled={currentQuestion === 0}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentQuestion < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
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
              See My Type
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick archetype previews */}
        {currentQuestion === 0 && answeredCount === 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
              6 Archetypes
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {archetypes.map((arch) => (
                <div
                  key={arch.id}
                  className="bg-surface border border-border rounded-lg p-3"
                >
                  <p className="text-sm font-semibold mb-0.5">{arch.name}</p>
                  <p className="text-xs text-text-muted">{arch.tagline}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
