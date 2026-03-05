// Personality-aware copy variants -- keyed by archetype
// Returns personalized headlines, subtitles, and CTAs for users who've taken the quiz
// Falls back to default copy for users without a profile

import type { ArchetypeKey } from "./financial-dna";

export interface PersonalityCopy {
  readonly heroHeadline: string;
  readonly heroHighlight: string;
  readonly heroSubtitle: string;
  readonly heroCta: string;
  readonly researchIntro: string;
  readonly stockFitLabel: string;
}

const COPY: Record<ArchetypeKey, PersonalityCopy> = {
  systems_builder: {
    heroHeadline: "Your System,",
    heroHighlight: "Your Edge",
    heroSubtitle: "Rules-based research tools for investors who build systems, not follow hunches. Every stock analyzed with the methodology you demand.",
    heroCta: "Refine Your System",
    researchIntro: "Stocks that fit a systematic, rules-based approach. Consistent performers with predictable metrics.",
    stockFitLabel: "System-compatible",
  },
  reassurance_seeker: {
    heroHeadline: "Invest with",
    heroHighlight: "Confidence",
    heroSubtitle: "Validated research with clear risk metrics. Every recommendation comes with the margin of safety you need before making a move.",
    heroCta: "Build with Certainty",
    researchIntro: "Stable, well-researched stocks with strong safety margins. The kind of picks you can sleep on.",
    stockFitLabel: "Safety-validated",
  },
  analytical_skeptic: {
    heroHeadline: "Cut Through the",
    heroHighlight: "Noise",
    heroSubtitle: "Evidence-first research for investors who question everything. No hype, no consensus chasing -- just data.",
    heroCta: "See the Evidence",
    researchIntro: "Stocks backed by rigorous data analysis, not market sentiment. Contrarian picks with real evidence.",
    stockFitLabel: "Evidence-backed",
  },
  diy_controller: {
    heroHeadline: "Your Research,",
    heroHighlight: "Your Way",
    heroSubtitle: "Professional-grade tools for self-directed investors. The data and analysis you need -- no hand-holding required.",
    heroCta: "Start Researching",
    researchIntro: "Research tools designed for independent analysis. Your thesis, your conviction, your portfolio.",
    stockFitLabel: "DIY-ready",
  },
  collaborative_partner: {
    heroHeadline: "Better Decisions,",
    heroHighlight: "Together",
    heroSubtitle: "AI-powered insights to sharpen your conversations with advisors, partners, and fellow investors. Smarter together.",
    heroCta: "Explore Together",
    researchIntro: "Stocks and analysis designed to fuel great conversations with your advisor or investment group.",
    stockFitLabel: "Discussion-worthy",
  },
  big_picture_optimist: {
    heroHeadline: "See the",
    heroHighlight: "Big Picture",
    heroSubtitle: "Long-term growth stories and emerging trends for visionary investors. The next decade starts with today's research.",
    heroCta: "Spot Opportunities",
    researchIntro: "Growth stories and emerging sectors for investors who think in decades, not quarters.",
    stockFitLabel: "Growth-aligned",
  },
  trend_sensitive_explorer: {
    heroHeadline: "Stay Ahead of",
    heroHighlight: "Every Trend",
    heroSubtitle: "Real-time sector analysis and momentum tracking for investors who move with the market. Be first, not last.",
    heroCta: "Track Momentum",
    researchIntro: "Trending sectors and momentum plays for investors who thrive on market movement.",
    stockFitLabel: "Trending",
  },
  avoider_under_stress: {
    heroHeadline: "Invest Without",
    heroHighlight: "The Stress",
    heroSubtitle: "Clear, calm research that separates signal from noise. No panic, no FOMO -- just steady progress toward your goals.",
    heroCta: "Start Steady",
    researchIntro: "Low-volatility, steady performers for investors who value peace of mind over excitement.",
    stockFitLabel: "Stress-tested",
  },
  action_first_decider: {
    heroHeadline: "Research Fast,",
    heroHighlight: "Move Faster",
    heroSubtitle: "Quick-hit analysis and clear signals for investors who don't wait for perfect information. The best move is the one you make.",
    heroCta: "Take Action",
    researchIntro: "High-conviction picks with clear catalysts. For investors who act on good-enough information.",
    stockFitLabel: "Action-ready",
  },
  values_anchored_steward: {
    heroHeadline: "Invest in What",
    heroHighlight: "Matters",
    heroSubtitle: "Purpose-driven research for investors who align their portfolio with their values. Returns and responsibility, together.",
    heroCta: "Invest Responsibly",
    researchIntro: "Companies with strong governance, social impact, and sustainable business models.",
    stockFitLabel: "Values-aligned",
  },
};

export function getPersonalityCopy(archetype: ArchetypeKey | null): PersonalityCopy | null {
  if (!archetype) return null;
  return COPY[archetype] ?? null;
}
