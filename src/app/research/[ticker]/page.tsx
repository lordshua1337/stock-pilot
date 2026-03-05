"use client";

import { useMemo } from "react";
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
} from "lucide-react";
import { getStockByTicker, getStocksBySector, type Stock } from "@/lib/stock-data";
import { HoldingInsightCard } from "@/components/insight-card";
import { AIInsightCard } from "@/components/copilot/ai-insight-card";

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

  const stock = useMemo(() => getStockByTicker(ticker), [ticker]);
  const peers = useMemo(() => {
    if (!stock) return [];
    return getStocksBySector(stock.sector).filter(
      (s) => s.ticker !== stock.ticker
    );
  }, [stock]);

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
          <ScoreRing score={stock.aiScore} />
        </div>

        {/* Price */}
        <div className="bg-surface rounded-xl border border-border p-5 mb-6">
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

        {/* AI Copilot Insight */}
        <AIInsightCard pageId="research" ticker={stock.ticker} className="mb-4" />

        {/* Full Insight Card */}
        <div className="mb-6">
          <HoldingInsightCard stock={stock} variant="expanded" />
        </div>

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
