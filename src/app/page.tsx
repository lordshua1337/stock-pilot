import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Search,
  Zap,
  Shield,
  Brain,
} from "lucide-react";
import { stocks, sectors, getSectorMetrics } from "@/lib/stock-data";

function StockRow({ stock }: { stock: (typeof stocks)[0] }) {
  const isUp = stock.change >= 0;
  return (
    <Link
      href={`/research/${stock.ticker.toLowerCase()}`}
      className="flex items-center justify-between py-3 px-4 card-hover rounded-lg group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-alt flex items-center justify-center text-xs font-mono font-bold text-text-primary">
          {stock.ticker.slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-medium">{stock.ticker}</p>
          <p className="text-xs text-text-muted">{stock.name}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-mono font-medium">
          ${stock.price.toFixed(2)}
        </p>
        <p
          className={`text-xs font-mono ${isUp ? "text-green" : "text-red"}`}
        >
          {isUp ? "+" : ""}
          {stock.changePercent.toFixed(2)}%
        </p>
      </div>
    </Link>
  );
}

function AIScoreCard({ stock }: { stock: (typeof stocks)[0] }) {
  const scoreColor =
    stock.aiScore >= 80
      ? "text-green"
      : stock.aiScore >= 60
        ? "text-gold"
        : "text-red";

  return (
    <Link
      href={`/research/${stock.ticker.toLowerCase()}`}
      className="bg-surface border border-border rounded-xl p-4 card-hover block"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm">{stock.ticker}</span>
          <span className="text-xs text-text-muted">{stock.sector}</span>
        </div>
        <div className={`text-lg font-mono font-bold ${scoreColor}`}>
          {stock.aiScore}
        </div>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
        {stock.thesis}
      </p>
      <div className="flex items-center gap-2 mt-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            stock.analystRating === "Strong Buy"
              ? "bg-green-bg text-green"
              : stock.analystRating === "Buy"
                ? "bg-green-bg text-green"
                : stock.analystRating === "Hold"
                  ? "bg-blue-bg text-blue"
                  : "bg-red-bg text-red"
          }`}
        >
          {stock.analystRating}
        </span>
        <span className="text-xs text-text-muted">
          P/E {stock.peRatio}
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const topMovers = [...stocks]
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 5);

  const topAiScores = [...stocks]
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-bg text-green px-3 py-1 rounded-full text-xs font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Research
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-5">
            Invest Smarter,{" "}
            <span className="text-green">Not Harder</span>
          </h1>

          <p className="text-text-secondary text-lg max-w-xl mx-auto mb-4">
            AI-driven stock research, sector analysis, and portfolio building.
            Every recommendation comes with a thesis, risks, and catalysts.
          </p>

          <p className="text-text-muted text-sm max-w-lg mx-auto mb-8">
            Not financial advice. Educational tool for informed decision-making.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/portfolio"
              className="bg-green text-black px-6 py-2.5 rounded-lg font-medium hover:bg-green-light transition-colors inline-flex items-center justify-center gap-2"
            >
              Build Portfolio
              <Briefcase className="w-4 h-4" />
            </Link>
            <Link
              href="/research"
              className="bg-surface border border-border text-text-primary px-6 py-2.5 rounded-lg font-medium hover:bg-surface-hover transition-colors inline-flex items-center justify-center gap-2"
            >
              Research Stocks
              <Search className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Market overview ticker strip */}
      <section className="border-y border-border bg-surface py-3 px-4 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center gap-8 min-w-max">
          {stocks.slice(0, 6).map((s) => (
            <div key={s.ticker} className="flex items-center gap-2 text-sm">
              <span className="font-mono font-medium">{s.ticker}</span>
              <span className="font-mono text-text-muted">
                ${s.price.toFixed(2)}
              </span>
              <span
                className={`font-mono text-xs flex items-center gap-0.5 ${
                  s.change >= 0 ? "text-green" : "text-red"
                }`}
              >
                {s.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {s.change >= 0 ? "+" : ""}
                {s.changePercent.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4 bg-surface">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-semibold text-green font-mono">
              {stocks.length}
            </p>
            <p className="text-xs text-text-muted mt-1">Stocks Analyzed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-semibold font-mono">
              {new Set(stocks.map((s) => s.sector)).size}
            </p>
            <p className="text-xs text-text-muted mt-1">
              <Link
                href="/sectors"
                className="hover:text-green transition-colors"
              >
                Sectors Covered
              </Link>
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-semibold text-green font-mono">
              {Math.round(
                stocks.reduce((sum, s) => sum + s.aiScore, 0) / stocks.length
              )}
            </p>
            <p className="text-xs text-text-muted mt-1">Avg AI Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-semibold font-mono">$0</p>
            <p className="text-xs text-text-muted mt-1">Cost to Use</p>
          </div>
        </div>
      </section>

      {/* Sector Heatmap */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-green uppercase tracking-widest font-medium">
                Market Map
              </p>
              <h2 className="text-xl font-semibold">Sector Heatmap</h2>
            </div>
            <Link
              href="/sectors"
              className="text-xs text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1"
            >
              Full analysis <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {getSectorMetrics().map((s) => {
              const isUp = s.avgChange >= 0;
              return (
                <Link
                  key={s.name}
                  href="/sectors"
                  className="rounded-lg p-3 card-hover block text-center"
                  style={{
                    backgroundColor: isUp
                      ? `rgba(0, 255, 136, ${Math.min(0.15, s.avgChange / 20)})`
                      : `rgba(255, 59, 48, ${Math.min(0.15, Math.abs(s.avgChange) / 20)})`,
                    border: `1px solid ${isUp ? "rgba(0,255,136,0.15)" : "rgba(255,59,48,0.15)"}`,
                  }}
                >
                  <p className="text-xs font-medium truncate">{s.name}</p>
                  <p className={`text-lg font-mono font-bold ${isUp ? "text-green" : "text-red"}`}>
                    {isUp ? "+" : ""}{s.avgChange}%
                  </p>
                  <p className="text-[10px] text-text-muted">
                    AI: {s.avgAiScore} | {s.stockCount} stocks
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top AI scores + Movers */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* AI Top Picks */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-green uppercase tracking-widest font-medium">
                  AI Research
                </p>
                <h2 className="text-xl font-semibold">Top AI Scores</h2>
              </div>
              <Link
                href="/research"
                className="text-xs text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topAiScores.map((s) => (
                <AIScoreCard key={s.ticker} stock={s} />
              ))}
            </div>
          </div>

          {/* Top Movers */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <p className="text-xs text-green uppercase tracking-widest font-medium">
                Market
              </p>
              <h2 className="text-xl font-semibold">Top Movers</h2>
            </div>

            <div className="bg-surface border border-border rounded-xl divide-y divide-border">
              {topMovers.map((s) => (
                <StockRow key={s.ticker} stock={s} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-green uppercase tracking-widest font-medium mb-2">
              How It Works
            </p>
            <h2 className="text-2xl font-semibold">Research-Driven Investing</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-green-bg flex items-center justify-center mb-4">
                <Search className="w-5 h-5 text-green" />
              </div>
              <h3 className="text-base font-semibold mb-2">AI Research</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Every stock gets an AI thesis, risk assessment, and
                catalyst analysis. Scores from 1-100.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-green-bg flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5 text-green" />
              </div>
              <h3 className="text-base font-semibold mb-2">Portfolio Builder</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Build a diversified portfolio with sector allocation,
                risk exposure, and dividend projections.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-green-bg flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-green" />
              </div>
              <h3 className="text-base font-semibold mb-2">Risk Analysis</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Every pick includes specific risks and what could go
                wrong. No hype. Just honest analysis.
              </p>
            </div>

            <Link
              href="/personality"
              className="bg-surface border border-border rounded-xl p-5 card-hover block group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-bg flex items-center justify-center mb-4">
                <Brain className="w-5 h-5 text-green" />
              </div>
              <h3 className="text-base font-semibold mb-2">Investor DNA</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                20 questions to discover your investor personality type.
                6 archetypes. 3 minutes.
              </p>
              <span className="text-green text-xs font-medium mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Take the Quiz <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Dividend Leaders */}
      <section className="py-10 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-green uppercase tracking-widest font-medium">
                Income
              </p>
              <h2 className="text-xl font-semibold">Top Dividend Yields</h2>
            </div>
            <Link
              href="/research"
              className="text-xs text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1"
            >
              All stocks <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[...stocks]
              .filter((s) => s.dividendYield > 0)
              .sort((a, b) => b.dividendYield - a.dividendYield)
              .slice(0, 5)
              .map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/research/${stock.ticker.toLowerCase()}`}
                  className="bg-surface border border-border rounded-lg p-4 card-hover block text-center"
                >
                  <p className="text-sm font-mono font-bold">{stock.ticker}</p>
                  <p className="text-xl font-mono font-bold text-green mt-1">
                    {stock.dividendYield.toFixed(2)}%
                  </p>
                  <p className="text-[10px] text-text-muted mt-1">
                    ${(stock.price * stock.dividendYield / 100).toFixed(2)}/share
                  </p>
                  <p className="text-xs text-text-muted mt-1 truncate">{stock.name}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Gainers vs Losers */}
      <section className="py-10 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-xs text-green uppercase tracking-widest font-medium mb-1">
              Today
            </p>
            <h2 className="text-xl font-semibold">Gainers vs. Losers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gainers */}
            <div className="bg-surface border border-green/10 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green" />
                <span className="text-sm font-semibold text-green">Top Gainers</span>
              </div>
              <div className="divide-y divide-border">
                {[...stocks]
                  .sort((a, b) => b.changePercent - a.changePercent)
                  .slice(0, 3)
                  .map((stock) => (
                    <Link
                      key={stock.ticker}
                      href={`/research/${stock.ticker.toLowerCase()}`}
                      className="flex items-center justify-between px-4 py-3 card-hover"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm">{stock.ticker}</span>
                        <span className="text-xs text-text-muted truncate max-w-[100px]">{stock.name}</span>
                      </div>
                      <span className="font-mono text-sm font-medium text-green">
                        +{stock.changePercent.toFixed(2)}%
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
            {/* Losers */}
            <div className="bg-surface border border-red/10 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red" />
                <span className="text-sm font-semibold text-red">Top Losers</span>
              </div>
              <div className="divide-y divide-border">
                {[...stocks]
                  .sort((a, b) => a.changePercent - b.changePercent)
                  .slice(0, 3)
                  .map((stock) => (
                    <Link
                      key={stock.ticker}
                      href={`/research/${stock.ticker.toLowerCase()}`}
                      className="flex items-center justify-between px-4 py-3 card-hover"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm">{stock.ticker}</span>
                        <span className="text-xs text-text-muted truncate max-w-[100px]">{stock.name}</span>
                      </div>
                      <span className="font-mono text-sm font-medium text-red">
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-xl mx-auto text-center">
          <BarChart3 className="w-8 h-8 text-green mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-3">
            Start Building Your Portfolio
          </h2>
          <p className="text-text-secondary text-sm mb-8">
            Select stocks, set allocations, and get AI-powered insights on
            your portfolio composition and risk exposure.
          </p>
          <Link
            href="/portfolio"
            className="bg-green text-black px-8 py-3 rounded-lg font-medium hover:bg-green-light transition-colors inline-flex items-center gap-2"
          >
            Build Portfolio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <BarChart3 className="w-4 h-4" />
            StockPilot
          </div>
          <p className="text-text-muted text-xs text-center">
            Educational tool only. Not financial advice. Past performance does
            not guarantee future results. Always do your own research.
          </p>
        </div>
      </footer>
    </div>
  );
}
