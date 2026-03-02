"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Users,
  BarChart3,
  Eye,
  Landmark,
  Activity,
  Shield,
} from "lucide-react";
import type { Stock } from "@/lib/stock-data";
import { generateStockInsight, type StockInsight, type StanceLabel } from "@/lib/insight-data";

// ─── Tooltip Component ──────────────────────────────────────────────────
function Tooltip({ content }: { content: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-text-muted hover:text-text-secondary transition-colors ml-1"
        aria-label="More information"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 max-w-[90vw] bg-[#1a1a2e] border border-border rounded-lg p-3 text-[13px] leading-[1.6] text-text-secondary z-50 shadow-xl animate-fade-in"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a2e] border-r border-b border-border rotate-45 -mt-1" />
          {content}
        </div>
      )}
    </span>
  );
}

// ─── Stance Badge ────────────────────────────────────────────────────────
const stanceColors: Record<StanceLabel, string> = {
  "Strong Conviction": "bg-green-bg text-green border-green/20",
  "Cautious Optimism": "bg-blue-bg text-blue border-blue/20",
  "Conflicted": "bg-[rgba(255,215,64,0.1)] text-gold border-gold/20",
  "Under Review": "bg-[rgba(255,215,64,0.1)] text-gold border-gold/20",
  "Deteriorating": "bg-red-bg text-red border-red/20",
  "Avoid": "bg-red-bg text-red border-red/20",
};

function StanceBadge({ stance }: { stance: StanceLabel }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${stanceColors[stance]}`}>
      {stance}
    </span>
  );
}

// ─── Score Ring ──────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const pct = score / 100;
  const circumference = 2 * Math.PI * 20;
  const dashOffset = circumference * (1 - pct);
  const color = score >= 80 ? "#00C853" : score >= 60 ? "#FFD740" : "#FF5252";

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#2A2A2A" strokeWidth="3" />
        <circle
          cx="24" cy="24" r="20" fill="none"
          stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold font-mono">
        {score}
      </span>
    </div>
  );
}

// ─── Direction Arrow ────────────────────────────────────────────────────
function DirectionIcon({ dir }: { dir: "up" | "down" | "neutral" }) {
  if (dir === "up") return <TrendingUp className="w-3.5 h-3.5 text-green" />;
  if (dir === "down") return <TrendingDown className="w-3.5 h-3.5 text-red" />;
  return <Minus className="w-3.5 h-3.5 text-text-muted" />;
}

// ─── Short Interest Bar ─────────────────────────────────────────────────
function ShortInterestBar({ pct }: { pct: number }) {
  const color = pct >= 25 ? "bg-red" : pct >= 15 ? "bg-[#FF6E40]" : pct >= 5 ? "bg-gold" : "bg-text-muted";
  const label = pct >= 25 ? "High" : pct >= 15 ? "Elevated" : pct >= 5 ? "Moderate" : "Low";
  const width = Math.min(100, (pct / 30) * 100);

  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-text-muted">{pct.toFixed(1)}% of float</span>
        <span className={pct >= 15 ? "text-red" : "text-text-muted"}>{label}</span>
      </div>
      <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

// ─── Rating Block Shell ─────────────────────────────────────────────────
function RatingBlock({ title, icon, tooltip, children }: {
  title: string;
  icon: React.ReactNode;
  tooltip: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-alt rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-text-muted">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</span>
        <Tooltip content={tooltip} />
      </div>
      {children}
    </div>
  );
}

// ─── Licensed Source Placeholder ─────────────────────────────────────────
function DataPendingBlock({ title, icon, tooltip, fields }: {
  title: string;
  icon: React.ReactNode;
  tooltip: string;
  fields: string[];
}) {
  return (
    <RatingBlock title={title} icon={icon} tooltip={tooltip}>
      <div className="space-y-2">
        {fields.map((f) => (
          <div key={f} className="flex justify-between items-center">
            <span className="text-xs text-text-muted">{f}</span>
            <span className="text-xs text-text-muted italic">Data pending</span>
          </div>
        ))}
        <p className="text-[11px] text-text-muted italic mt-2 pt-2 border-t border-border">
          Licensed data source -- structure shown, values pending contract.
        </p>
      </div>
    </RatingBlock>
  );
}

// ─── Signal Row ──────────────────────────────────────────────────────────
function SignalRow({ label, value, direction, interpretation, tooltip }: {
  label: string;
  value: string;
  direction: "up" | "down" | "neutral";
  interpretation: string;
  tooltip: string;
}) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <DirectionIcon dir={direction} />
          <span className="text-xs font-medium text-text-primary">{label}</span>
          <Tooltip content={tooltip} />
        </div>
        <p className="text-[11px] text-text-muted mt-0.5 pl-5">{interpretation}</p>
      </div>
      <span className="text-xs font-mono font-medium text-text-secondary ml-4 flex-shrink-0">{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export function HoldingInsightCard({ stock, variant = "standard" }: {
  stock: Stock;
  variant?: "compact" | "standard" | "expanded";
}) {
  const [signalsOpen, setSignalsOpen] = useState(variant === "expanded");
  const [activeTab, setActiveTab] = useState<"signals" | "redteam">("signals");

  const insight = useMemo(() => generateStockInsight(stock), [stock]);
  const isUp = stock.changePercent >= 0;
  const impliedReturn = ((insight.analystConsensus.avgPriceTarget - stock.price) / stock.price * 100);

  // ─── Layer 1: Headline (always visible) ────────────────────────────
  const headline = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ScoreRing score={stock.aiScore} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-mono">{stock.ticker}</span>
            <StanceBadge stance={insight.stance} />
          </div>
          <p className="text-sm text-text-secondary">{stock.name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold font-mono">${stock.price.toFixed(2)}</p>
        <p className={`text-sm font-mono flex items-center justify-end gap-1 ${isUp ? "text-green" : "text-red"}`}>
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isUp ? "+" : ""}{stock.changePercent.toFixed(2)}%
        </p>
      </div>
    </div>
  );

  if (variant === "compact") {
    return (
      <div className="bg-surface rounded-xl border border-border p-4">
        {headline}
      </div>
    );
  }

  // ─── Layer 2: Ratings Panel (always visible in standard/expanded) ──
  const ratingsPanel = (
    <div className="space-y-3 mt-5">
      {/* Analyst Consensus */}
      <RatingBlock
        title="Analyst Consensus"
        icon={<Users className="w-4 h-4" />}
        tooltip="Analyst ratings represent the opinions of sell-side research analysts at investment banks and independent research firms. Buy = analyst expects the stock to outperform the market over 12 months. Hold = expects market-rate returns. Sell = expects underperformance. Important limitation: Sell ratings are historically rare (~5-6% of all ratings) because analysts have business relationships with the companies they cover. The distribution across many analysts is more meaningful than any single rating."
      >
        {/* Distribution bar */}
        <div className="flex h-3 rounded-full overflow-hidden mb-2">
          <div className="bg-green" style={{ width: `${insight.analystConsensus.buyPct}%` }} />
          <div className="bg-gold" style={{ width: `${insight.analystConsensus.holdPct}%` }} />
          <div className="bg-red" style={{ width: `${insight.analystConsensus.sellPct}%` }} />
        </div>
        <div className="flex justify-between text-[11px] mb-3">
          <span className="text-green">{insight.analystConsensus.buyPct}% Buy</span>
          <span className="text-gold">{insight.analystConsensus.holdPct}% Hold</span>
          <span className="text-red">{insight.analystConsensus.sellPct}% Sell</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">{insight.analystConsensus.totalAnalysts} analysts</span>
          <span className="text-text-secondary">
            PT ${insight.analystConsensus.avgPriceTarget.toFixed(2)}
            <span className={`ml-1 ${impliedReturn >= 0 ? "text-green" : "text-red"}`}>
              ({impliedReturn >= 0 ? "+" : ""}{impliedReturn.toFixed(1)}%)
            </span>
          </span>
        </div>
      </RatingBlock>

      {/* Morningstar */}
      <RatingBlock
        title="Morningstar"
        icon={<BarChart3 className="w-4 h-4" />}
        tooltip="Morningstar's star rating is based on their proprietary fair value estimate compared to the current market price. 5 stars means the stock is trading significantly below fair value (undervalued). 1 star means it's significantly overvalued. This is fundamentals-based, not momentum-based. The Uncertainty rating tells you how confident they are in the fair value estimate itself. The Economic Moat rating represents how durable they believe the company's competitive advantages are."
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-sm ${i < insight.morningstar.stars ? "text-gold" : "text-text-muted"}`}>
                *
              </span>
            ))}
          </div>
          <span className="text-xs text-text-secondary">
            Fair Value: ${insight.morningstar.fairValue.toFixed(2)}
            <span className={`ml-1 ${insight.morningstar.fairValue > stock.price ? "text-green" : "text-red"}`}>
              ({insight.morningstar.fairValue > stock.price ? "Discount" : "Premium"})
            </span>
          </span>
        </div>
        <div className="flex gap-3 text-[11px]">
          <span className="text-text-muted">Uncertainty: <span className="text-text-secondary">{insight.morningstar.uncertainty}</span></span>
          <span className="text-text-muted">Moat: <span className="text-text-secondary">{insight.morningstar.moat}</span></span>
        </div>
      </RatingBlock>

      {/* Short Interest */}
      <RatingBlock
        title="Short Interest"
        icon={<AlertTriangle className="w-4 h-4" />}
        tooltip="Short interest represents the percentage of available shares (float) that investors have borrowed and sold, betting the price will decline. High short interest means a significant portion of the market disagrees with the bull case. Days to cover tells you how many days of average trading volume it would take for all short sellers to buy back their shares. High days-to-cover (>5) creates short squeeze conditions if positive news arrives."
      >
        <ShortInterestBar pct={insight.shortInterest.shortPctFloat} />
        <div className="flex justify-between text-[11px] mt-2">
          <span className="text-text-muted">
            Days to cover: <span className="text-text-secondary">{insight.shortInterest.daysToCover}</span>
          </span>
          <span className={insight.shortInterest.changeVsPrior > 0 ? "text-red" : "text-green"}>
            {insight.shortInterest.changeVsPrior > 0 ? "+" : ""}{insight.shortInterest.changeVsPrior}% vs 2wk ago
          </span>
        </div>
      </RatingBlock>

      {/* Insider Activity */}
      <RatingBlock
        title="Insider Activity (90d)"
        icon={<Eye className="w-4 h-4" />}
        tooltip="Insiders are executives, directors, and major shareholders who must report their trades to the SEC within 2 business days via Form 4 filings. Insider buying is generally a stronger signal than insider selling. Executives buy stock for one reason: they expect it to go up. They sell for many reasons: diversification, taxes, personal liquidity. Cluster buying -- multiple insiders all buying within a short window -- is historically one of the most reliable positive signals."
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            insight.insiderActivity.netDirection === "Net Buyer" ? "bg-green-bg text-green" :
            insight.insiderActivity.netDirection === "Net Seller" ? "bg-red-bg text-red" :
            "bg-surface text-text-muted"
          }`}>
            {insight.insiderActivity.netDirection}
          </span>
          {insight.insiderActivity.clusterSignal && (
            <span className="text-[11px] text-green font-medium">Cluster signal detected</span>
          )}
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-text-muted">
            Buys: <span className="text-green">{insight.insiderActivity.buyCount90d}</span>
            {" "}Sells: <span className="text-red">{insight.insiderActivity.sellCount90d}</span>
          </span>
          {insight.insiderActivity.largestTxn && (
            <span className="text-text-muted">
              {insight.insiderActivity.largestTxn.role} {insight.insiderActivity.largestTxn.type.toLowerCase()} {insight.insiderActivity.largestTxn.amount}
            </span>
          )}
        </div>
      </RatingBlock>

      {/* S&P Global / CFRA */}
      <RatingBlock
        title="S&P Global / CFRA"
        icon={<Shield className="w-4 h-4" />}
        tooltip="S&P Global's CFRA Research provides independent equity research using a quantitative and fundamental methodology. Their STARS system (1-5) predicts total return relative to the S&P 500 over the next 12 months. 5 STARS = expected to significantly outperform. The Quality Ranking is distinct from the recommendation -- it measures the growth and stability of earnings and dividends over the past 10 years. A company can have a strong Buy recommendation with a low Quality Ranking."
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            insight.spCfra.recommendation === "Strong Buy" || insight.spCfra.recommendation === "Buy"
              ? "bg-green-bg text-green"
              : insight.spCfra.recommendation === "Hold"
                ? "bg-[rgba(255,215,64,0.1)] text-gold"
                : "bg-red-bg text-red"
          }`}>
            {insight.spCfra.recommendation}
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-sm ${i < insight.spCfra.starsScore ? "text-gold" : "text-text-muted"}`}>
                *
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-text-muted">
            PT: <span className="text-text-secondary font-mono">${insight.spCfra.priceTarget.toFixed(2)}</span>
          </span>
          <span className="text-text-muted">
            Quality: <span className="text-text-secondary font-mono">{insight.spCfra.qualityRanking}</span>
          </span>
        </div>
      </RatingBlock>

      {/* Refinitiv StarMine */}
      <RatingBlock
        title="Refinitiv StarMine"
        icon={<Activity className="w-4 h-4" />}
        tooltip="StarMine weights analyst estimates by their historical accuracy. An analyst who has consistently made accurate estimates for this company gets more weight. The SmartEstimate is usually a better predictor of actual results than the simple consensus average. Predicted Surprise shows whether StarMine expects the company to beat or miss expectations. Analyst Revision Momentum tracks whether analysts have been raising or lowering estimates recently -- rising estimates (score > 50) suggest improving fundamentals."
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
          <div>
            <span className="text-text-muted">SmartEstimate</span>
            <p className="text-text-secondary font-mono font-medium">${insight.starMine.smartEstimate.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-text-muted">Predicted Surprise</span>
            <p className={`font-mono font-medium ${insight.starMine.predictedSurprise >= 0 ? "text-green" : "text-red"}`}>
              {insight.starMine.predictedSurprise >= 0 ? "+" : ""}{insight.starMine.predictedSurprise}%
            </p>
          </div>
          <div>
            <span className="text-text-muted">Revision Momentum</span>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${insight.starMine.revisionMomentum > 50 ? "bg-green" : "bg-red"}`}
                  style={{ width: `${insight.starMine.revisionMomentum}%` }}
                />
              </div>
              <span className="text-text-secondary font-mono">{insight.starMine.revisionMomentum}</span>
            </div>
          </div>
          <div>
            <span className="text-text-muted">Earnings Quality</span>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${insight.starMine.earningsQuality > 60 ? "bg-green" : insight.starMine.earningsQuality > 40 ? "bg-gold" : "bg-red"}`}
                  style={{ width: `${insight.starMine.earningsQuality}%` }}
                />
              </div>
              <span className="text-text-secondary font-mono">{insight.starMine.earningsQuality}</span>
            </div>
          </div>
        </div>
      </RatingBlock>

      {/* Congressional Disclosures */}
      <RatingBlock
        title="Congressional Disclosures"
        icon={<Landmark className="w-4 h-4" />}
        tooltip="Members of Congress are required to disclose stock trades within 30-45 days under the STOCK Act. Some investors track these disclosures because certain members sit on committees that oversee industries they trade in. Critical limitation: By the time this is disclosed, the trade is at minimum 30 days old and often 45+ days old. This data is useful as confirming context -- interesting if it aligns with other signals -- not as a primary trading input."
      >
        <p className="text-[11px] text-gold mb-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Congressional trades are reported 30-45 days after execution. This data is historical context, not a real-time signal.
        </p>
        {insight.congressional.trades.length > 0 ? (
          <div className="space-y-2">
            {insight.congressional.trades.map((t, i) => (
              <div key={i} className="flex items-start justify-between text-[11px] py-1.5 border-b border-border last:border-0">
                <div>
                  <p className="text-text-secondary font-medium">{t.member}</p>
                  <p className="text-text-muted">{t.committee}</p>
                </div>
                <div className="text-right">
                  <span className={`font-medium ${t.direction === "Buy" ? "text-green" : "text-red"}`}>
                    {t.direction}
                  </span>
                  <p className="text-text-muted">{t.amountRange}</p>
                  <p className="text-text-muted">{t.daysSinceTrade}d ago</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-text-muted italic">No congressional trades reported in past 180 days.</p>
        )}
      </RatingBlock>

      {/* Options Market Sentiment */}
      <RatingBlock
        title="Options Market Sentiment"
        icon={<Activity className="w-4 h-4" />}
        tooltip="The Put/Call ratio compares the volume of put options (bets the stock will fall) to call options (bets it will rise). A ratio above 1.0 means more bearish options activity. Below 1.0 means more bullish. Implied Volatility Rank (IVR) tells you whether options are currently cheap or expensive relative to the past year. IVR of 80 means options are pricing in more uncertainty than 80% of the past year. Unusual options activity -- large blocks at far strikes -- sometimes precedes news."
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] mb-2">
          <div>
            <span className="text-text-muted">Put/Call Ratio</span>
            <p className={`font-mono font-medium ${insight.options.putCallRatio < 0.7 ? "text-green" : insight.options.putCallRatio > 1.0 ? "text-red" : "text-text-secondary"}`}>
              {insight.options.putCallRatio.toFixed(2)}
              <span className="text-text-muted font-normal ml-1">
                ({insight.options.putCallVs30dAvg.toFixed(1)}x avg)
              </span>
            </p>
          </div>
          <div>
            <span className="text-text-muted">IV Rank (0-100)</span>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${insight.options.ivRank > 60 ? "bg-gold" : "bg-text-muted"}`}
                  style={{ width: `${insight.options.ivRank}%` }}
                />
              </div>
              <span className="text-text-secondary font-mono">{insight.options.ivRank}</span>
            </div>
          </div>
          <div>
            <span className="text-text-muted">Smart Money Flow</span>
            <p className={`font-medium ${
              insight.options.smartMoneyFlow === "Bullish" ? "text-green"
                : insight.options.smartMoneyFlow === "Bearish" ? "text-red"
                : "text-text-secondary"
            }`}>
              {insight.options.smartMoneyFlow}
            </p>
          </div>
          <div>
            <span className="text-text-muted">Unusual Activity</span>
            <p className={`font-medium ${insight.options.unusualActivity ? "text-gold" : "text-text-muted"}`}>
              {insight.options.unusualActivity ? "Detected" : "None"}
            </p>
          </div>
        </div>
        {insight.options.unusualActivity && insight.options.unusualDetail && (
          <p className="text-[11px] text-gold pt-2 border-t border-border">
            {insight.options.unusualDetail}
          </p>
        )}
      </RatingBlock>
    </div>
  );

  // ─── Layer 3: Signal Breakdown (expandable) ────────────────────────
  const signalBreakdown = (
    <div className="mt-4">
      <button
        onClick={() => setSignalsOpen(!signalsOpen)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
      >
        <span className="uppercase tracking-wider text-xs">Signal Breakdown</span>
        {signalsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {signalsOpen && (
        <div className="animate-fade-in">
          {/* Tab switcher */}
          <div className="flex gap-1 mb-4">
            <button
              onClick={() => setActiveTab("signals")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeTab === "signals" ? "bg-green text-black" : "text-text-muted hover:bg-surface-hover"
              }`}
            >
              Fundamentals & Technicals
            </button>
            <button
              onClick={() => setActiveTab("redteam")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeTab === "redteam" ? "bg-green text-black" : "text-text-muted hover:bg-surface-hover"
              }`}
            >
              Red Team
            </button>
          </div>

          {activeTab === "signals" && (
            <div className="space-y-4">
              {/* Fundamentals */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">Fundamental Signals</h4>
                <div className="bg-surface-alt rounded-lg border border-border px-3">
                  {insight.fundamentals.map((s) => (
                    <SignalRow key={s.label} {...s} />
                  ))}
                </div>
              </div>

              {/* Technicals */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1">Technical Signals</h4>
                <div className="bg-surface-alt rounded-lg border border-border px-3">
                  {insight.technicals.map((s) => (
                    <SignalRow key={s.label} {...s} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Layer 4: Red Team */}
          {activeTab === "redteam" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Bull Case */}
                <div className="bg-surface-alt rounded-lg border border-green/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-green" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-green">Bull Case</span>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 italic">{insight.bullCase.thesis}</p>
                  <ul className="space-y-1.5 mb-3">
                    {insight.bullCase.claims.map((c, i) => (
                      <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <span className="text-green mt-0.5 flex-shrink-0">+</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-border">
                    <p className="text-[11px] text-text-muted">
                      <span className="font-medium text-text-secondary">Key assumption:</span> {insight.bullCase.keyAssumption}
                    </p>
                    <p className="text-[11px] text-text-muted mt-1">
                      <span className="font-medium text-text-secondary">Confirm in 90d:</span> {insight.bullCase.confirmation90d}
                    </p>
                  </div>
                </div>

                {/* Bear Case */}
                <div className="bg-surface-alt rounded-lg border border-red/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-4 h-4 text-red" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-red">Bear Case</span>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 italic">{insight.bearCase.thesis}</p>
                  <ul className="space-y-1.5 mb-3">
                    {insight.bearCase.claims.map((c, i) => (
                      <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <span className="text-red mt-0.5 flex-shrink-0">-</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-border">
                    <p className="text-[11px] text-text-muted">
                      <span className="font-medium text-text-secondary">Key risk:</span> {insight.bearCase.keyAssumption}
                    </p>
                    <p className="text-[11px] text-text-muted mt-1">
                      <span className="font-medium text-text-secondary">Confirm in 90d:</span> {insight.bearCase.confirmation90d}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skeptic Verdict */}
              <div className="bg-surface-alt rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-gold" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gold">Skeptic Verdict</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{insight.skepticVerdict}</p>
              </div>

              {/* What Would Change My Mind */}
              <div className="bg-surface-alt rounded-lg border border-border p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  What Would Change the Stance
                </h4>
                <ul className="space-y-1.5">
                  {insight.whatWouldChangeMyMind.map((item, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                      <span className="text-gold mt-0.5 flex-shrink-0">{i + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-surface rounded-xl border border-border p-5 sm:p-6">
      {headline}
      {ratingsPanel}
      {signalBreakdown}
    </div>
  );
}
