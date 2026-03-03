"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { sectors, type Stock } from "@/lib/stock-data";
import type { StockSignal } from "@/lib/portfolio-signals";
import type { PortfolioItem } from "../page";
import { formatCurrency } from "../page";
import { loadDNAProfile, type StoredDNAProfile } from "@/lib/dna-storage";
import { ARCHETYPE_INFO, DIMENSION_LABELS } from "@/lib/dna-scoring";
import type { DimKey } from "@/lib/financial-dna";

interface ReportTabProps {
  portfolio: PortfolioItem[];
  portfolioStocks: Stock[];
  totalInvestment: number;
  signals: StockSignal[];
  signalMap: Record<string, StockSignal>;
}

// ─── Section toggle config ─────────────────────────────────────────────

interface ReportSection {
  id: string;
  label: string;
  defaultOn: boolean;
}

const REPORT_SECTIONS: ReportSection[] = [
  { id: "summary", label: "Portfolio Summary", defaultOn: true },
  { id: "sectors", label: "Sector Exposure", defaultOn: true },
  { id: "signals", label: "AI Signal Analysis", defaultOn: true },
  { id: "simulation", label: "Simulation Results", defaultOn: true },
  { id: "scenarios", label: "Scenario Stress Test", defaultOn: true },
  { id: "personality", label: "Investor Personality", defaultOn: true },
  { id: "recommendations", label: "Recommendations", defaultOn: true },
];

// ─── Personality-portfolio alignment ────────────────────────────────────

interface PersonalityInsight {
  label: string;
  detail: string;
  type: "positive" | "warning" | "neutral";
}

function getPersonalityInsights(
  profile: StoredDNAProfile,
  beta: number,
  divYield: number,
  positions: number,
  sectorCount: number
): PersonalityInsight[] {
  const insights: PersonalityInsight[] = [];
  const dims = profile.dimensions;

  // Risk alignment
  if (dims.R < 45 && beta > 1.2) {
    insights.push({
      label: "Volatility Warning",
      detail: `Your risk comfort is low (${dims.R}/100) but your portfolio beta is ${beta.toFixed(2)}. This mismatch may cause anxiety during downturns. Consider adding lower-beta positions.`,
      type: "warning",
    });
  } else if (dims.R >= 60 && beta < 0.8) {
    insights.push({
      label: "Underutilized Risk Capacity",
      detail: `You're comfortable with risk (${dims.R}/100) but your portfolio beta is only ${beta.toFixed(2)}. You may be leaving growth on the table.`,
      type: "neutral",
    });
  } else {
    insights.push({
      label: "Risk Alignment",
      detail: `Your risk orientation (${dims.R}/100) is well-matched to your portfolio beta (${beta.toFixed(2)}).`,
      type: "positive",
    });
  }

  // Discipline alignment
  if (dims.D < 50 && positions > 8) {
    insights.push({
      label: "Complexity vs Discipline",
      detail: `With ${positions} positions and moderate discipline (${dims.D}/100), you may struggle to monitor all holdings. Consider simplifying to 5-7 core positions.`,
      type: "warning",
    });
  } else if (dims.D >= 60 && sectorCount >= 4) {
    insights.push({
      label: "Disciplined Diversification",
      detail: `Your high discipline (${dims.D}/100) supports the ${sectorCount}-sector diversification in this portfolio.`,
      type: "positive",
    });
  }

  // Horizon alignment
  if (dims.H < 45 && divYield < 1) {
    insights.push({
      label: "Income Gap",
      detail: `Your shorter time horizon (${dims.H}/100) pairs better with income-generating stocks. Current dividend yield of ${divYield.toFixed(2)}% is low.`,
      type: "warning",
    });
  } else if (dims.H >= 65) {
    insights.push({
      label: "Long-Term Horizon",
      detail: `Your patience (${dims.H}/100) means short-term volatility matters less. Stay focused on quality over quarterly noise.`,
      type: "positive",
    });
  }

  // Emotional regulation
  if (dims.E < 45 && beta > 1.0) {
    insights.push({
      label: "Emotional Risk",
      detail: `Lower emotional regulation (${dims.E}/100) combined with above-market volatility increases panic-sell risk. Pre-set stop-loss rules or automate rebalancing.`,
      type: "warning",
    });
  }

  // Top biases
  const topBiases = [...profile.biasFlags]
    .filter((b) => b.severity >= 2)
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 2);

  if (topBiases.length > 0) {
    const biasNames = topBiases.map((b) => b.label).join(" and ");
    insights.push({
      label: "Behavioral Watch",
      detail: `Your strongest biases are ${biasNames}. Review this portfolio through that lens -- are any positions driven by these tendencies?`,
      type: "warning",
    });
  }

  return insights;
}

// ─── Component ─────────────────────────────────────────────────────────

export function ReportTab({
  portfolio,
  portfolioStocks,
  totalInvestment,
  signals,
  signalMap,
}: ReportTabProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const sec of REPORT_SECTIONS) {
      initial[sec.id] = sec.defaultOn;
    }
    return initial;
  });

  // Check DNA assessment status
  const dnaProfile = useMemo(() => loadDNAProfile(), []);
  const hasDNA = dnaProfile !== null;

  // If no DNA, disable personality section
  const effectiveSections = useMemo((): Record<string, boolean> => {
    return { ...sections, personality: sections.personality && hasDNA };
  }, [sections, hasDNA]);

  const toggleSection = useCallback((id: string) => {
    setSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Portfolio metrics for the report
  const metrics = useMemo(() => {
    const totalAlloc = portfolio.reduce((s, p) => s + p.allocation, 0);
    if (totalAlloc === 0) return null;

    const norm = totalAlloc > 0 ? 100 / totalAlloc : 1;

    const weightedBeta = portfolio.reduce((sum, item) => {
      const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
      return sum + (stock?.beta ?? 1) * (item.allocation / totalAlloc);
    }, 0);

    const weightedDiv = portfolio.reduce((sum, item) => {
      const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
      return sum + (stock?.dividendYield ?? 0) * (item.allocation / totalAlloc);
    }, 0);

    const avgComposite = signals.reduce((sum, sig) => {
      const item = portfolio.find((p) => p.ticker === sig.ticker);
      return sum + sig.compositeScore * ((item?.allocation ?? 0) / totalAlloc);
    }, 0);

    const weightedPE = portfolio.reduce((sum, item) => {
      const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
      return sum + (stock?.peRatio ?? 0) * (item.allocation / totalAlloc);
    }, 0);

    // Sector breakdown
    const sectorMap: Record<string, number> = {};
    for (const item of portfolio) {
      const stock = portfolioStocks.find((s) => s.ticker === item.ticker);
      if (stock) {
        sectorMap[stock.sector] = (sectorMap[stock.sector] || 0) + item.allocation;
      }
    }

    return {
      positions: portfolio.length,
      totalAlloc,
      beta: weightedBeta,
      divYield: weightedDiv,
      avgScore: avgComposite,
      pe: weightedPE,
      annualDiv: totalInvestment * weightedDiv / 100,
      sectorBreakdown: Object.entries(sectorMap)
        .sort(([, a], [, b]) => b - a)
        .map(([name, alloc]) => ({
          name,
          alloc,
          color: sectors.find((s) => s.name === name)?.color || "#666",
        })),
    };
  }, [portfolio, portfolioStocks, signals, totalInvestment]);

  // PDF generation via window.print()
  const generatePDF = useCallback(async () => {
    setGenerating(true);
    setProgress(0);

    // Simulate progress steps
    for (let i = 1; i <= 5; i++) {
      await new Promise((r) => setTimeout(r, 300));
      setProgress(i * 20);
    }

    // Trigger print dialog (prints only the hidden report div)
    window.print();

    setGenerating(false);
    setProgress(0);
  }, []);

  if (!metrics) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted text-sm">Add stocks to generate a report.</p>
      </div>
    );
  }

  const enabledCount = Object.values(effectiveSections).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Report config */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-green" />
          <h2 className="text-sm font-semibold">Portfolio Report</h2>
        </div>

        <p className="text-xs text-text-secondary mb-4">
          Generate a comprehensive PDF report of your portfolio analysis.
          Toggle sections to customize what's included.
        </p>

        {/* DNA check */}
        {!hasDNA && (
          <div className="mb-4 p-3 bg-[rgba(255,215,64,0.05)] border border-gold/20 rounded-lg">
            <p className="text-xs text-text-secondary mb-2">
              Complete your Investor Identity assessment to include personality-matched insights in the report.
            </p>
            <Link
              href="/personality"
              className="inline-flex items-center gap-1 text-xs text-green hover:text-green-light transition-colors"
            >
              Take Assessment <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Section toggles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
          {REPORT_SECTIONS.map((sec) => {
            const enabled = sec.id === "personality" ? effectiveSections.personality : sections[sec.id];
            const disabled = sec.id === "personality" && !hasDNA;

            return (
              <button
                key={sec.id}
                onClick={() => !disabled && toggleSection(sec.id)}
                disabled={disabled}
                className={`
                  px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-left
                  ${disabled
                    ? "bg-surface-alt border-border text-text-muted/40 cursor-not-allowed"
                    : enabled
                      ? "bg-green/10 border-green/30 text-green"
                      : "bg-surface-alt border-border text-text-muted hover:border-border-light"
                  }
                `}
              >
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Generate button */}
        <div className="flex items-center gap-3">
          <button
            onClick={generatePDF}
            disabled={generating || enabledCount === 0}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${generating || enabledCount === 0
                ? "bg-surface-alt text-text-muted cursor-not-allowed"
                : "bg-green text-background hover:bg-green-dark"
              }
            `}
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Generating ({progress}%)
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate PDF Report
              </>
            )}
          </button>
          <span className="text-[10px] text-text-muted">
            {enabledCount} section{enabledCount !== 1 ? "s" : ""} selected
          </span>
        </div>

        {/* Progress bar */}
        {generating && (
          <div className="mt-3 w-full h-1.5 bg-surface-alt rounded-full overflow-hidden">
            <div
              className="h-full bg-green rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Report preview */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Printer className="w-4 h-4 text-text-muted" />
          Report Preview
        </h3>

        <div className="space-y-4 text-xs">
          {effectiveSections.summary && (
            <ReportSectionCard title="Portfolio Summary">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Positions", value: String(metrics.positions) },
                  { label: "Investment", value: formatCurrency(totalInvestment) },
                  { label: "Portfolio Beta", value: metrics.beta.toFixed(2) },
                  { label: "Avg AI Score", value: Math.round(metrics.avgScore).toString() },
                  { label: "Weighted P/E", value: metrics.pe.toFixed(1) },
                  { label: "Div Yield", value: `${metrics.divYield.toFixed(2)}%` },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-text-muted text-[10px]">{stat.label}</p>
                    <p className="font-mono font-medium">{stat.value}</p>
                  </div>
                ))}
              </div>
            </ReportSectionCard>
          )}

          {effectiveSections.sectors && (
            <ReportSectionCard title="Sector Exposure">
              <div className="space-y-1.5">
                {metrics.sectorBreakdown.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                    <span className="text-text-secondary flex-1">{s.name}</span>
                    <span className="font-mono text-text-muted">{s.alloc}%</span>
                  </div>
                ))}
              </div>
            </ReportSectionCard>
          )}

          {effectiveSections.signals && (
            <ReportSectionCard title="AI Signal Analysis">
              <div className="space-y-2">
                {portfolio.map((item) => {
                  const sig = signalMap[item.ticker];
                  if (!sig) return null;
                  return (
                    <div key={item.ticker} className="flex items-center justify-between">
                      <span className="font-mono text-green">{item.ticker}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-text-muted">{sig.signal.type}</span>
                        <span
                          className={`font-mono font-medium ${
                            sig.compositeScore >= 70 ? "text-green" : sig.compositeScore >= 50 ? "text-gold" : "text-red"
                          }`}
                        >
                          {sig.compositeScore}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ReportSectionCard>
          )}

          {effectiveSections.simulation && (
            <ReportSectionCard title="Simulation Results">
              <p className="text-text-secondary">
                Monte Carlo, backtest, and radar chart data included in full PDF.
              </p>
            </ReportSectionCard>
          )}

          {effectiveSections.scenarios && (
            <ReportSectionCard title="Scenario Stress Test">
              <p className="text-text-secondary">
                4 macro scenarios and 3 historical drawdowns with beta-adjusted estimates.
              </p>
            </ReportSectionCard>
          )}

          {effectiveSections.personality && dnaProfile && (() => {
            const archInfo = ARCHETYPE_INFO[dnaProfile.communicationArchetype];
            const dimKeys: DimKey[] = ["R", "C", "H", "D", "E"];
            const pInsights = getPersonalityInsights(
              dnaProfile,
              metrics.beta,
              metrics.divYield,
              metrics.positions,
              metrics.sectorBreakdown.length
            );
            return (
              <ReportSectionCard title="Investor Personality">
                <div className="space-y-3">
                  {/* Archetype identity */}
                  <div className="flex items-center gap-2">
                    <span className="text-green font-semibold text-sm">
                      {archInfo?.name ?? dnaProfile.communicationArchetype}
                    </span>
                    {archInfo?.tagline && (
                      <span className="text-text-muted text-[10px]">-- {archInfo.tagline}</span>
                    )}
                  </div>

                  {/* Dimension scores */}
                  <div className="grid grid-cols-5 gap-2">
                    {dimKeys.map((k) => (
                      <div key={k} className="text-center">
                        <p className="text-[10px] text-text-muted">{DIMENSION_LABELS[k]}</p>
                        <p className="font-mono font-medium text-sm">{dnaProfile.dimensions[k]}</p>
                      </div>
                    ))}
                  </div>

                  {/* Portfolio-personality alignment */}
                  <div className="space-y-1.5 pt-1 border-t border-border">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                      Portfolio Alignment
                    </p>
                    {pInsights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            insight.type === "positive"
                              ? "bg-green"
                              : insight.type === "warning"
                                ? "bg-gold"
                                : "bg-text-muted"
                          }`}
                        />
                        <div>
                          <span className="font-medium text-[11px]">{insight.label}: </span>
                          <span className="text-text-secondary text-[11px]">{insight.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Behavioral rule */}
                  {dnaProfile.behavioralRule && (
                    <div className="bg-surface-alt rounded-lg p-2.5 mt-1">
                      <p className="text-[10px] text-text-muted mb-0.5">Your behavioral rule:</p>
                      <p className="text-[11px] text-text-secondary italic">
                        "{dnaProfile.behavioralRule}"
                      </p>
                    </div>
                  )}
                </div>
              </ReportSectionCard>
            );
          })()}

          {effectiveSections.recommendations && (
            <ReportSectionCard title="Recommendations">
              <ul className="space-y-1">
                {signals
                  .filter((s) => s.signal.type === "High Volatility" || s.signal.type === "Bearish Divergence")
                  .map((s) => (
                    <li key={s.ticker} className="text-text-secondary">
                      Review <span className="font-mono text-gold">{s.ticker}</span> -- {s.signal.type.toLowerCase()} detected
                    </li>
                  ))}
                {metrics.beta > 1.3 && (
                  <li className="text-text-secondary">
                    Consider adding defensive positions to lower portfolio beta ({metrics.beta.toFixed(2)})
                  </li>
                )}
                {metrics.divYield < 1 && (
                  <li className="text-text-secondary">
                    Dividend yield of {metrics.divYield.toFixed(2)}% is low -- add income positions for stability
                  </li>
                )}
                {metrics.sectorBreakdown.length < 3 && (
                  <li className="text-text-secondary">
                    Only {metrics.sectorBreakdown.length} sector{metrics.sectorBreakdown.length !== 1 ? "s" : ""} represented -- diversify across more sectors
                  </li>
                )}
                {/* Personality-aware recommendations */}
                {dnaProfile && dnaProfile.dimensions.E < 45 && metrics.beta > 1.0 && (
                  <li className="text-text-secondary">
                    With your emotional profile, set pre-defined rebalancing triggers rather than making decisions during volatility
                  </li>
                )}
                {dnaProfile && dnaProfile.dimensions.D < 50 && portfolio.length > 6 && (
                  <li className="text-text-secondary">
                    Simplify to 5-6 core positions -- your discipline score suggests fewer holdings will be easier to manage
                  </li>
                )}
                {dnaProfile && dnaProfile.dimensions.H >= 65 && (
                  <li className="text-text-secondary">
                    Reduce portfolio check frequency to monthly -- your long horizon means daily noise is a distraction
                  </li>
                )}
              </ul>
            </ReportSectionCard>
          )}
        </div>
      </div>

      {/* Hidden print-ready div */}
      <div ref={printRef} className="hidden print:block print:p-8">
        <div className="text-black bg-white">
          <h1 className="text-2xl font-bold mb-1">StockPilot Portfolio Report</h1>
          <p className="text-sm text-gray-500 mb-6">
            Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          {effectiveSections.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold border-b border-gray-200 pb-1 mb-3">Portfolio Summary</h2>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-500">Positions:</span> {metrics.positions}</div>
                <div><span className="text-gray-500">Investment:</span> {formatCurrency(totalInvestment)}</div>
                <div><span className="text-gray-500">Beta:</span> {metrics.beta.toFixed(2)}</div>
                <div><span className="text-gray-500">AI Score:</span> {Math.round(metrics.avgScore)}</div>
                <div><span className="text-gray-500">P/E:</span> {metrics.pe.toFixed(1)}</div>
                <div><span className="text-gray-500">Div Yield:</span> {metrics.divYield.toFixed(2)}%</div>
              </div>
            </div>
          )}

          {effectiveSections.sectors && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold border-b border-gray-200 pb-1 mb-3">Sector Exposure</h2>
              <table className="w-full text-sm">
                <tbody>
                  {metrics.sectorBreakdown.map((s) => (
                    <tr key={s.name}>
                      <td className="py-1">{s.name}</td>
                      <td className="py-1 text-right font-mono">{s.alloc}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {effectiveSections.signals && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold border-b border-gray-200 pb-1 mb-3">AI Signal Analysis</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-1">Ticker</th>
                    <th className="pb-1">Score</th>
                    <th className="pb-1">Signal</th>
                    <th className="pb-1">Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((item) => {
                    const sig = signalMap[item.ticker];
                    if (!sig) return null;
                    return (
                      <tr key={item.ticker}>
                        <td className="py-0.5 font-mono">{item.ticker}</td>
                        <td className="py-0.5 font-mono">{sig.compositeScore}</td>
                        <td className="py-0.5">{sig.signal.type}</td>
                        <td className="py-0.5 font-mono">{item.allocation}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {effectiveSections.personality && dnaProfile && (() => {
            const archInfo = ARCHETYPE_INFO[dnaProfile.communicationArchetype];
            const dimKeys: DimKey[] = ["R", "C", "H", "D", "E"];
            const pInsights = getPersonalityInsights(
              dnaProfile,
              metrics.beta,
              metrics.divYield,
              metrics.positions,
              metrics.sectorBreakdown.length
            );
            return (
              <div className="mb-6">
                <h2 className="text-lg font-semibold border-b border-gray-200 pb-1 mb-3">Investor Personality</h2>
                <p className="text-sm font-medium mb-1">
                  {archInfo?.name ?? dnaProfile.communicationArchetype}
                  {archInfo?.tagline && <span className="text-gray-500 font-normal"> -- {archInfo.tagline}</span>}
                </p>
                <table className="w-full text-sm mb-3">
                  <thead>
                    <tr className="text-gray-500 text-xs">
                      {dimKeys.map((k) => (
                        <th key={k} className="pb-1 text-center font-normal">{DIMENSION_LABELS[k]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {dimKeys.map((k) => (
                        <td key={k} className="text-center font-mono">{dnaProfile.dimensions[k]}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
                <h3 className="text-sm font-medium mb-1">Portfolio Alignment</h3>
                {pInsights.map((insight, i) => (
                  <p key={i} className="text-sm mb-1">
                    <span className="font-medium">{insight.label}:</span> {insight.detail}
                  </p>
                ))}
                {dnaProfile.behavioralRule && (
                  <p className="text-sm italic text-gray-600 mt-2 border-l-2 border-gray-300 pl-3">
                    Behavioral rule: "{dnaProfile.behavioralRule}"
                  </p>
                )}
              </div>
            );
          })()}

          <p className="text-xs text-gray-400 mt-8 border-t border-gray-200 pt-4">
            This report is generated by StockPilot AI analysis and is for informational purposes only.
            It does not constitute financial advice. Past performance and AI scores do not guarantee future results.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Helper component ──────────────────────────────────────────────────

function ReportSectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-surface-alt transition-colors"
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-green" />
          <span className="text-xs font-semibold">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
        )}
      </button>
      {expanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}
