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
import { loadDNAProfile } from "@/lib/dna-storage";

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
              Complete your Financial DNA assessment to include investor personality insights in the report.
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

          {effectiveSections.personality && dnaProfile && (
            <ReportSectionCard title="Investor Personality">
              <p className="text-text-secondary">
                {dnaProfile.communicationArchetype} profile with dimension scores included.
              </p>
            </ReportSectionCard>
          )}

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

          {effectiveSections.personality && dnaProfile && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold border-b border-gray-200 pb-1 mb-3">Investor Personality</h2>
              <p className="text-sm">Archetype: {dnaProfile.communicationArchetype}</p>
            </div>
          )}

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
