"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Search,
  SlidersHorizontal,
  Briefcase,
  Brain,
  BarChart3,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const STORAGE_KEY = "stockpilot-onboarding-seen";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  link?: { href: string; label: string };
}

const STEPS: Step[] = [
  {
    icon: <BarChart3 className="w-8 h-8 text-green" />,
    title: "Welcome to StockPilot",
    description:
      "AI-powered stock research, sector analysis, and portfolio building. Every recommendation comes with a thesis, risks, and catalysts -- not just a price target.",
  },
  {
    icon: <Search className="w-8 h-8 text-green" />,
    title: "AI Research on 85+ Stocks",
    description:
      "Each stock gets an AI Score (1-100), investment thesis, risk factors, and catalysts. Expand any stock card to see the full breakdown, or click through for the deep-dive page.",
    link: { href: "/research", label: "Go to Research" },
  },
  {
    icon: <SlidersHorizontal className="w-8 h-8 text-green" />,
    title: "Stock Screener",
    description:
      "Filter stocks by price, AI score, P/E ratio, dividend yield, beta, and analyst rating. Use quick presets like Growth Picks or Value Plays, or set your own criteria. Filters persist across sessions.",
    link: { href: "/research", label: "Try the Screener" },
  },
  {
    icon: <Briefcase className="w-8 h-8 text-green" />,
    title: "Portfolio Builder",
    description:
      "Build a diversified portfolio with target allocations. See sector breakdown, risk exposure, dividend projections, and AI-powered insights on your selections.",
    link: { href: "/portfolio", label: "Build a Portfolio" },
  },
  {
    icon: <Brain className="w-8 h-8 text-green" />,
    title: "Investor Identity Quiz",
    description:
      "44 triads, 10 minutes. Discover which of 10 investor personality types fits you -- from The Money Architect to The Wave Rider. Get stock picks and strategies matched to your type.",
    link: { href: "/personality", label: "Take the Quiz" },
  },
];

export default function GettingStarted() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setIsVisible(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // localStorage unavailable
    }
  }, []);

  const next = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      dismiss();
    }
  }, [currentStep, dismiss]);

  const prev = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-text-muted hover:text-text-secondary p-1 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep
                    ? "bg-green w-6"
                    : i < currentStep
                      ? "bg-green/40"
                      : "bg-border"
                }`}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-green-bg flex items-center justify-center mx-auto mb-5">
            {step.icon}
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold mb-3">{step.title}</h2>

          {/* Description */}
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {currentStep > 0 ? (
              <button
                onClick={prev}
                className="flex-1 bg-surface-alt border border-border text-text-primary px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-surface-hover transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <button
                onClick={dismiss}
                className="flex-1 text-text-muted text-sm hover:text-text-secondary transition-colors py-2.5"
              >
                Skip
              </button>
            )}

            <button
              onClick={next}
              className="flex-1 text-black px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 sp-btn-gradient"
            >
              {isLast ? "Get Started" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step counter */}
        <div className="border-t border-border px-8 py-3 text-center">
          <span className="text-xs text-text-muted">
            {currentStep + 1} of {STEPS.length}
          </span>
        </div>
      </div>
    </div>
  );
}
