"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Brain, ChevronRight } from "lucide-react";
import { TRIADS } from "@/lib/dna-v2/triads";
import type { TriadResponse } from "@/lib/dna-v2/types";
import { PRIMARY_FACTORS } from "@/lib/dna-v2/factors";

const USE_DNA_V2 = true;

// V2 Storage Keys
const V2_RESPONSES_KEY = "stockpilot_dna_v2_responses";
const V2_PROFILE_KEY = "stockpilot_dna_v2_profile";
const V2_SESSION_KEY = "stockpilot_dna_v2_session";

// ---------------------------------------------------------------------------
// V2 Storage Functions
// ---------------------------------------------------------------------------

function saveV2AnswersInProgress(responses: TriadResponse[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(V2_RESPONSES_KEY, JSON.stringify(responses));
}

function loadV2AnswersInProgress(): TriadResponse[] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(V2_RESPONSES_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TriadResponse[];
  } catch {
    return null;
  }
}

function clearV2AnswersInProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(V2_RESPONSES_KEY);
  localStorage.removeItem(V2_SESSION_KEY);
}

function saveV2Profile(profile: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(V2_PROFILE_KEY, JSON.stringify(profile));
}

function hasCompletedDNAV2(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(V2_PROFILE_KEY) !== null;
}

// ---------------------------------------------------------------------------
// Progress bar component
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Triad card component
// ---------------------------------------------------------------------------

interface TriadCardProps {
  text: string;
  isSelected: boolean;
  phase: "most" | "least" | null;
  isDisabled: boolean;
  onClick: () => void;
}

function TriadCard({
  text,
  isSelected,
  phase,
  isDisabled,
  onClick,
}: TriadCardProps) {
  let cardClasses =
    "flex-1 p-4 sm:p-6 rounded-lg border-2 transition-all cursor-pointer text-center ";

  if (isDisabled) {
    cardClasses +=
      "border-border bg-surface-alt text-text-muted opacity-50 cursor-not-allowed";
  } else if (isSelected && phase === "most") {
    cardClasses += "border-green bg-green bg-opacity-10 text-green font-semibold";
  } else if (isSelected && phase === "least") {
    cardClasses += "border-red-500 bg-red-500 bg-opacity-10 text-red-500 font-semibold";
  } else {
    cardClasses +=
      "border-border bg-surface-alt text-text-primary hover:border-green hover:bg-surface-hover";
  }

  return (
    <button onClick={onClick} disabled={isDisabled} className={cardClasses}>
      <span className="text-lg sm:text-xl font-medium">{text}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Intro screen
// ---------------------------------------------------------------------------

function IntroScreen({
  alreadyCompleted,
  onBegin,
}: {
  alreadyCompleted: boolean;
  onBegin: () => void;
}) {
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
              <Brain className="w-3.5 h-3.5" />
              Investor Identity Assessment
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Discover Your Investor Identity
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Forced-choice triad assessment. No &quot;neutral&quot; options. By
              choosing what resonates most and least, we map your true behavioral
              profile across 8 financial personality factors. 44 triads. 8
              dimensions. ~10 minutes. Pure behavioral signal.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="text-2xl font-bold text-green mb-0.5">44</p>
                <p className="text-xs text-text-muted">Triads</p>
              </div>
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="text-2xl font-bold text-green mb-0.5">8</p>
                <p className="text-xs text-text-muted">Factors</p>
              </div>
              <div className="bg-surface-alt rounded-lg p-3">
                <p className="text-2xl font-bold text-green mb-0.5">~10</p>
                <p className="text-xs text-text-muted">Minutes</p>
              </div>
            </div>

            <button
              onClick={onBegin}
              className="w-full px-5 py-3 rounded-lg font-medium transition-all inline-flex items-center justify-center gap-2 sp-btn-primary"
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

          {/* 8 Factors preview */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
              8 Financial Personality Factors
            </h3>
            <div className="space-y-3">
              {PRIMARY_FACTORS.map((factor) => (
                <div
                  key={factor.code}
                  className="flex items-start gap-3 bg-surface-alt rounded-lg p-3"
                >
                  <div className="text-green font-mono text-xs font-semibold w-6">
                    {factor.code}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{factor.name}</p>
                    <p className="text-xs text-text-muted">
                      {factor.description}
                    </p>
                  </div>
                </div>
              ))}
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

function ProcessingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <Brain className="w-12 h-12 text-green mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-semibold mb-2">
          Analyzing Your Investor Identity
        </h2>
        <p className="text-text-muted text-sm">
          Computing 8 factors, detecting contradictions, classifying archetype...
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Triad screen
// ---------------------------------------------------------------------------

interface TriadScreenProps {
  currentIndex: number;
  phase: "most" | "least";
  mostChoice: string | null;
  leastChoice: string | null;
  onSelectItem: (itemId: string) => void;
  onBack: () => void;
  onStartOver: () => void;
  onFinish: () => void;
}

function TriadScreen({
  currentIndex,
  phase,
  mostChoice,
  leastChoice,
  onSelectItem,
  onBack,
  onStartOver,
  onFinish,
}: TriadScreenProps) {
  const triad = TRIADS[currentIndex];
  const totalTriads = TRIADS.length;
  const isComplete = mostChoice && leastChoice;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={onBack}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary mb-6 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Progress header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">
              Triad {currentIndex + 1} of {totalTriads}
            </span>
            <span className="text-xs text-green font-mono">
              {phase === "most" ? "MOST like you" : "LEAST like you"}
            </span>
          </div>
          <ProgressBar current={currentIndex + 1} total={totalTriads} />
        </div>

        {/* Phase indicator */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-center">
            Which is{" "}
            <span className={phase === "most" ? "text-green" : "text-red-500"}>
              {phase === "most" ? "MOST" : "LEAST"}
            </span>{" "}
            like you?
          </h2>
        </div>

        {/* Triad cards */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
          {triad.items.map((item) => {
            const isSelectedMost = mostChoice === item.id;
            const isSelectedLeast = leastChoice === item.id;
            const isDisabled =
              (phase === "most" && leastChoice === item.id) ||
              (phase === "least" && mostChoice === item.id);

            return (
              <TriadCard
                key={item.id}
                text={item.text}
                isSelected={
                  phase === "most" ? isSelectedMost : isSelectedLeast
                }
                phase={
                  isSelectedMost ? "most" : isSelectedLeast ? "least" : null
                }
                isDisabled={isDisabled}
                onClick={() => onSelectItem(item.id)}
              />
            );
          })}
        </div>

        {/* Navigation and finish button */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {isComplete ? "Ready to continue" : "Make both selections"}
          </span>
          {currentIndex < totalTriads - 1 ? (
            <button
              disabled={!isComplete}
              className="text-sm text-green hover:text-green-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1"
              onClick={() => onSelectItem("")}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={!isComplete}
              onClick={onFinish}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-2 sp-btn-primary"
            >
              Finish Assessment
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Start over option */}
        {currentIndex > 0 || mostChoice || leastChoice ? (
          <div className="mt-8 pt-6 border-t border-border text-center">
            <button
              onClick={onStartOver}
              className="text-xs text-text-muted hover:text-red transition-colors"
            >
              Start over
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PersonalityPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  // Assessment state
  const [responses, setResponses] = useState<TriadResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"most" | "least">("most");
  const [mostChoice, setMostChoice] = useState<string | null>(null);
  const [leastChoice, setLeastChoice] = useState<string | null>(null);

  const sessionStartTime = useRef<number>(Date.now());
  const triadStartTime = useRef<number>(Date.now());

  const totalTriads = TRIADS.length;

  // Check if user already completed V2 assessment
  useEffect(() => {
    setAlreadyCompleted(hasCompletedDNAV2());
  }, []);

  // Load saved progress on mount
  useEffect(() => {
    const savedResponses = loadV2AnswersInProgress();
    if (savedResponses && savedResponses.length > 0) {
      setResponses(savedResponses);
      setShowIntro(false);
      setCurrentIndex(savedResponses.length);
      if (savedResponses.length < totalTriads) {
        setPhase("most");
      }
    }
  }, [totalTriads]);

  // Reset triad timer when navigating
  useEffect(() => {
    triadStartTime.current = Date.now();
  }, [currentIndex]);

  // Handle item selection
  const handleSelectItem = useCallback(
    (itemId: string) => {
      // If we're in phase "most" and selecting
      if (phase === "most") {
        if (itemId) {
          setMostChoice(itemId);
          setPhase("least");
        }
      } else if (phase === "least") {
        if (itemId && itemId !== mostChoice) {
          setLeastChoice(itemId);
          // Auto-advance after 400ms
          setTimeout(() => {
            const triad = TRIADS[currentIndex];
            const middleItem = triad.items.find(
              (item) => item.id !== itemId && item.id !== mostChoice
            );

            const newResponse: TriadResponse = {
              triadId: triad.id,
              mostLikeMe: mostChoice!,
              leastLikeMe: itemId,
              startTime: triadStartTime.current,
              endTime: Date.now(),
            };

            const updatedResponses = [...responses, newResponse];
            setResponses(updatedResponses);
            saveV2AnswersInProgress(updatedResponses);

            // Move to next triad or finish
            if (currentIndex < totalTriads - 1) {
              setCurrentIndex(currentIndex + 1);
              setMostChoice(null);
              setLeastChoice(null);
              setPhase("most");
            } else {
              // All triads complete - process
              processAssessment(updatedResponses);
            }
          }, 400);
        }
      }
    },
    [phase, mostChoice, currentIndex, responses, totalTriads]
  );

  // Dummy computation function (would be replaced with actual V2 scoring)
  const processAssessment = async (finalResponses: TriadResponse[]) => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const profile = {
      version: 2,
      responses: finalResponses,
      completedAt: new Date().toISOString(),
      completionTime: Date.now() - sessionStartTime.current,
    };

    saveV2Profile(profile);
    clearV2AnswersInProgress();

    router.push("/personality/results");
  };

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setMostChoice(null);
      setLeastChoice(null);
      setPhase("most");

      // Remove last response
      const updatedResponses = responses.slice(0, -1);
      setResponses(updatedResponses);
      saveV2AnswersInProgress(updatedResponses);
    }
  }, [currentIndex, responses]);

  // Handle start over
  const handleStartOver = useCallback(() => {
    setResponses([]);
    setCurrentIndex(0);
    setMostChoice(null);
    setLeastChoice(null);
    setPhase("most");
    clearV2AnswersInProgress();
    sessionStartTime.current = Date.now();
  }, []);

  // Handle finish
  const handleFinish = useCallback(() => {
    if (mostChoice && leastChoice) {
      handleSelectItem(leastChoice);
    }
  }, [mostChoice, leastChoice, handleSelectItem]);

  // Gate on USE_DNA_V2 feature flag
  if (!USE_DNA_V2) {
    router.push("/");
    return null;
  }

  // Render intro
  if (showIntro) {
    return (
      <IntroScreen
        alreadyCompleted={alreadyCompleted}
        onBegin={() => setShowIntro(false)}
      />
    );
  }

  // Render processing
  if (isProcessing) {
    return <ProcessingScreen />;
  }

  // Render triad screen
  return (
    <TriadScreen
      currentIndex={currentIndex}
      phase={phase}
      mostChoice={mostChoice}
      leastChoice={leastChoice}
      onSelectItem={handleSelectItem}
      onBack={handleBack}
      onStartOver={handleStartOver}
      onFinish={handleFinish}
    />
  );
}
