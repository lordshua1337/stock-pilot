"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  BarChart3,
  DollarSign,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { getStockByTicker, getStocksBySector, type Stock } from "@/lib/stock-data";
import {
  computeLensScore,
  computeDimensions,
  loadSelectedPersonas,
  PERSONAS,
  type PersonaKey,
  type DimensionScores,
} from "@/lib/lens-scoring";
import { HoldingInsightCard } from "@/components/insight-card";
import { AIInsightCard } from "@/components/copilot/ai-insight-card";
import { loadDNAProfile } from "@/lib/dna-storage";
import { loadV2Profile } from "@/lib/dna-v2/storage";
import { ARCHETYPE_INFO } from "@/lib/dna-scoring";
import { ARCHETYPE_COLORS } from "@/components/dna/archetype-colors";
import { getPersonalityCopy } from "@/lib/personality-copy";
import { getWhyThisFitsYou } from "@/data/stock-match-reasons";
import { matchStocksToDNA, getStockFitDetails } from "@/lib/dna-stock-matcher";
import type { ArchetypeKey, CoreDimensions } from "@/lib/financial-dna";
import { v2ToDimensions } from "@/lib/dna-v2/compat";

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green"
      : score >= 60
        ? "text-gold"
        : "text-red";
  const bgColor =
    score >= 80
      ? "bg-green-bg"
      : score >= 60
        ? "bg-[rgba(255,215,64,0.1)]"
        : "bg-red-bg";

  return (
    <div
      className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center`}
    >
      <span className={`text-2xl font-bold ${color} font-mono`}>{score}</span>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-text-muted">{icon}</span>
        <span className="text-xs text-text-muted uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-lg font-semibold font-mono">{value}</p>
    </div>
  );
}

function PeerCard({ stock }: { stock: Stock }) {
  const isUp = stock.changePercent >= 0;
  return (
    <Link
      href={`/research/${stock.ticker.toLowerCase()}`}
      className="bg-surface rounded-lg border border-border p-3 card-hover block"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold font-mono">{stock.ticker}</span>
        <span
          className={`text-xs font-mono ${isUp ? "text-green" : "text-red"}`}
        >
          {isUp ? "+" : ""}
          {stock.changePercent.toFixed(2)}%
        </span>
      </div>
      <p className="text-xs text-text-muted truncate">{stock.name}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-text-secondary">
          AI: {stock.aiScore}
        </span>
        <span className="text-xs text-text-muted">{stock.marketCap}</span>
      </div>
    </Link>
  );
}

export default function StockDetailPage() {
  const params = useParams();
  const ticker = (params.ticker as string).toUpperCase();

  const staticStock = useMemo(() => getStockByTicker(ticker), [ticker]);

  // Live price state
  const [livePrice, setLivePrice] = useState<{
    price: number;
    change_amount: number;
    change_percent: number;
  } | null>(null);
  const [priceAge, setPriceAge] = useState("");

  // Fetch live price for this ticker
  useEffect(() => {
    let mounted = true;
    async function fetchPrice() {
      try {
        const res = await fetch(`/api/market?ticker=${ticker}`);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data.stock) {
          setLivePrice({
            price: data.stock.price,
            change_amount: data.stock.change_amount,
            change_percent: data.stock.change_percent,
          });
          const age = Math.round(
            (Date.now() - new Date(data.stock.last_refreshed).getTime()) / 60000
          );
          setPriceAge(age <= 1 ? "just now" : `${age}m ago`);
        }
      } catch {
        // Fall back to static
      }
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(interval); };
  }, [ticker]);

  // Merge live price into static stock data
  const stock = useMemo(() => {
    if (!staticStock) return null;
    if (!livePrice) return staticStock;
    return {
      ...staticStock,
      price: livePrice.price,
      change: livePrice.change_amount,
      changePercent: livePrice.change_percent,
    };
  }, [staticStock, livePrice]);

  const peers = useMemo(() => {
    if (!stock) return [];
    return getStocksBySector(stock.sector).filter(
      (s) => s.ticker !== stock.ticker
    );
  }, [stock]);

  // Lens scoring
  const [selectedLenses] = useState<PersonaKey[]>(() => loadSelectedPersonas());
  const lensResult = useMemo(() => {
    if (!stock || selectedLenses.length === 0) return null;
    return computeLensScore(stock, selectedLenses);
  }, [stock, selectedLenses]);

  const dimensionScores = useMemo(() => {
    if (!stock) return null;
    return computeDimensions(stock);
  }, [stock]);

  const [archetype, setArchetype] = useState<ArchetypeKey | null>(null);
  const [dimensions, setDimensions] = useState<CoreDimensions | null>(null);

  useEffect(() => {
    const v2 = loadV2Profile();
    if (v2) {
      setArchetype(v2.archetype.primary as ArchetypeKey);
      setDimensions(v2ToDimensions(v2));
      return;
    }
    const v1 = loadDNAProfile();
    if (v1) {
      setArchetype(v1.communicationArchetype as ArchetypeKey);
      setDimensions(v1.dimensions);
    }
  }, []);

  if (!stock) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Stock not found</h1>
          <p className="text-text-secondary mb-6">
            {ticker} is not in our research universe.
          </p>
          <Link
            href="/research"
            className="text-green hover:text-green-light transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Research
          </Link>
        </div>
      </div>
    );
  }

  const isUp = stock.changePercent >= 0;
  const ratingColor =
    stock.analystRating === "Strong Buy" || stock.analystRating === "Buy"
      ? "text-green"
      : stock.analystRating === "Hold"
        ? "text-gold"
        : "text-red";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/research"
          className="text-sm text-text-muted hover:text-text-secondary transition-colors inline-flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Stocks
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold font-mono">{stock.ticker}</h1>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${ratingColor} bg-surface border border-border`}
              >
                {stock.analystRating}
              </span>
            </div>
            <p className="text-text-secondary">{stock.name}</p>
            <p className="text-xs text-text-muted mt-1">{stock.sector}</p>
          </div>
          <div className="flex items-center gap-3">
            {lensResult && (
              <div className="text-center">
                <p className="text-[10px] text-text-muted mb-1">Lens</p>
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    lensResult.lensScore >= 80
                      ? "bg-green-bg"
                      : lensResult.lensScore >= 60
                        ? "bg-[rgba(255,215,64,0.1)]"
                        : "bg-red-bg"
                  }`}
                >
                  <span
                    className={`text-xl font-bold font-mono ${
                      lensResult.lensScore >= 80
                        ? "text-green"
                        : lensResult.lensScore >= 60
                          ? "text-gold"
                          : "text-red"
                    }`}
                  >
                    {lensResult.lensScore}
                  </span>
                </div>
                <p className="text-[9px] text-text-muted mt-1">
                  {selectedLenses.map((k) => PERSONAS[k].name).join(" + ")}
                </p>
              </div>
            )}
            <div className="text-center">
              <p className="text-[10px] text-text-muted mb-1">AI Score</p>
              <ScoreRing score={stock.aiScore} />
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="bg-surface rounded-xl border border-border p-5 mb-6">
          {priceAge && (
            <div className="flex items-center gap-2 mb-3 text-[10px] text-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              Live price updated {priceAge}
            </div>
          )}
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold font-mono">
              ${stock.price.toFixed(2)}
            </span>
            <span
              className={`text-lg font-mono flex items-center gap-1 ${
                isUp ? "text-green" : "text-red"
              }`}
            >
              {isUp ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {isUp ? "+" : ""}
              {stock.change.toFixed(2)} ({isUp ? "+" : ""}
              {stock.changePercent.toFixed(2)}%)
            </span>
          </div>
          {/* 52-week range bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-text-muted mb-1">
              <span>${stock.fiftyTwoLow.toFixed(2)}</span>
              <span className="text-text-secondary">52-Week Range</span>
              <span>${stock.fiftyTwoHigh.toFixed(2)}</span>
            </div>
            <div className="relative h-2 bg-surface-alt rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red to-green rounded-full opacity-30"
                style={{ width: "100%" }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-text-primary rounded-full border-2 border-background"
                style={{
                  left: `${Math.min(100, Math.max(0, ((stock.price - stock.fiftyTwoLow) / (stock.fiftyTwoHigh - stock.fiftyTwoLow)) * 100))}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
            <p className="text-xs text-text-muted mt-1 text-center">
              {((stock.price - stock.fiftyTwoLow) / (stock.fiftyTwoHigh - stock.fiftyTwoLow) * 100).toFixed(0)}% of range
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <MetricCard
            label="Market Cap"
            value={stock.marketCap}
            icon={<DollarSign className="w-3.5 h-3.5" />}
          />
          <MetricCard
            label="P/E Ratio"
            value={stock.peRatio.toFixed(1)}
            icon={<BarChart3 className="w-3.5 h-3.5" />}
          />
          <MetricCard
            label="Dividend"
            value={`${stock.dividendYield.toFixed(2)}%`}
            icon={<ArrowUpDown className="w-3.5 h-3.5" />}
          />
          <MetricCard
            label="AI Score"
            value={`${stock.aiScore}/100`}
            icon={<Zap className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Lens Dimension Breakdown */}
        {lensResult && dimensionScores && (
          <div className="bg-surface rounded-xl border border-border p-5 mb-6">
            <h3 className="text-sm font-semibold mb-4">
              Lens Breakdown: {selectedLenses.map((k) => PERSONAS[k].name).join(" + ")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.entries(dimensionScores) as [keyof DimensionScores, number][]).map(
                ([dim, score]) => (
                  <div key={dim} className="text-center">
                    <div className="relative h-1.5 bg-surface-alt rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full ${
                          score >= 70 ? "bg-green" : score >= 45 ? "bg-gold" : "bg-red"
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-text-muted uppercase tracking-wider">
                      {dim}
                    </p>
                    <p className="text-sm font-mono font-semibold">{score}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* AI Copilot Insight */}
        <AIInsightCard pageId="research" ticker={stock.ticker} className="mb-4" />

        {/* Full Insight Card */}
        <div className="mb-6">
          <HoldingInsightCard stock={stock} variant="expanded" />
        </div>

        {/* Personality Fit Score */}
        {stock && archetype && dimensions && (() => {
          const accentColor = ARCHETYPE_COLORS[archetype] ?? "#006DD8";
          const archetypeName = ARCHETYPE_INFO[archetype]?.name ?? archetype;
          const copy = getPersonalityCopy(archetype);
          const whyText = getWhyThisFitsYou(stock, archetype, dimensions);
          const matchedTickers = new Set(
            matchStocksToDNA(dimensions).map((m) => m.stock.ticker)
          );
          const isMatch = matchedTickers.has(stock.ticker);
          const fitDetails = getStockFitDetails(stock, dimensions);
          const fitScore = fitDetails.score;

          // Score ring SVG values
          const ringR = 28;
          const ringC = 2 * Math.PI * ringR;
          const ringOffset = ringC - (fitScore / 100) * ringC;
          const fitColor = fitScore >= 75 ? "#006DD8" : fitScore >= 50 ? "#FFD740" : "#FF5252";

          return (
            <div
              className="rounded-xl border p-5 mb-6"
              style={{ borderColor: `${accentColor}30`, backgroundColor: `${accentColor}06` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                <h3 className="text-sm font-semibold" style={{ color: accentColor }}>
                  Personality Fit Score
                </h3>
                {isMatch && copy && (
                  <span
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded ml-auto"
                    style={{ color: accentColor, backgroundColor: `${accentColor}15` }}
                  >
                    {copy.stockFitLabel}
                  </span>
                )}
              </div>

              {/* Score ring + factors */}
              <div className="flex items-start gap-5">
                {/* Score ring */}
                <div className="relative shrink-0">
                  <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="36" cy="36" r={ringR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                    <circle
                      cx="36" cy="36" r={ringR} fill="none"
                      stroke={fitColor}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={ringC}
                      strokeDashoffset={ringOffset}
                      style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold font-mono" style={{ color: fitColor }}>{fitScore}</span>
                  </div>
                </div>

                {/* Factor breakdown */}
                <div className="flex-1 space-y-2">
                  {fitDetails.factors.map((f) => (
                    <div key={f.label} className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: f.positive ? "#006DD8" : "#FF5252" }}
                      />
                      <div>
                        <span className="text-[10px] text-text-muted uppercase tracking-wider">{f.label}</span>
                        <p className="text-xs text-text-secondary">{f.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Archetype explanation */}
              <div className="mt-4 pt-3 border-t" style={{ borderColor: `${accentColor}15` }}>
                <p className="text-xs text-text-muted mb-1">
                  As {archetypeName}:
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {whyText}
                </p>
                {!isMatch && (
                  <p className="text-xs text-text-muted mt-2 italic">
                    Not in your top personality picks, but may be worth researching.
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Sector Peers */}
        {peers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-text-muted uppercase tracking-wider">
              {stock.sector} Peers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {peers.map((peer) => (
                <PeerCard key={peer.ticker} stock={peer} />
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-surface-alt rounded-xl border border-border p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
              Disclaimer
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            This analysis is for educational purposes only and does not
            constitute investment advice. AI scores and analysis are generated
            from publicly available data and may not reflect current market
            conditions. Always do your own research and consult a financial
            advisor before making investment decisions.
          </p>
        </div>

        {/* Bottom nav */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          <Link
            href="/research"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Stocks
          </Link>
          <Link
            href="/portfolio"
            className="text-sm text-green hover:text-green-light transition-colors inline-flex items-center gap-1"
          >
            Add to Portfolio
            <TrendingUp className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
