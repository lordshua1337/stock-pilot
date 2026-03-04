"use client";

import { useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { stocks, type Stock } from "@/lib/stock-data";
import type { PortfolioItem } from "../page";
import { formatCurrency } from "../page";
import {
  analyzePortfolioDividends,
  type DividendSummary,
  type StockDividend,
} from "@/lib/dividend-calculator";

interface DividendTabProps {
  portfolio: PortfolioItem[];
  portfolioStocks: Stock[];
  totalInvestment: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function buildStockMap(allStocks: Stock[]): Map<string, Stock> {
  const map = new Map<string, Stock>();
  for (const s of allStocks) {
    map.set(s.ticker, s);
  }
  return map;
}

// ─── Sub-components ───────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-surface-alt rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 text-text-muted text-xs mb-2">
        {icon}
        {label}
      </div>
      <p className="text-xl font-semibold tracking-tight text-text-primary">
        {value}
      </p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  );
}

function DividendRow({ item }: { item: StockDividend }) {
  return (
    <tr className="border-t border-border/50 hover:bg-surface-alt/50 transition-colors">
      <td className="py-3 px-3">
        <span className="font-mono text-sm font-medium text-text-primary">
          {item.ticker}
        </span>
      </td>
      <td className="py-3 px-3 text-sm text-text-secondary text-right">
        {item.allocation}%
      </td>
      <td className="py-3 px-3 text-sm text-text-secondary text-right">
        {formatCurrency(item.investedAmount)}
      </td>
      <td className="py-3 px-3 text-sm text-right">
        <span
          className={
            item.yieldPercent > 0
              ? "text-green font-medium"
              : "text-text-muted"
          }
        >
          {item.yieldPercent.toFixed(2)}%
        </span>
      </td>
      <td className="py-3 px-3 text-sm text-right font-medium text-text-primary">
        {item.annualDividend > 0
          ? formatCurrency(item.annualDividend)
          : "--"}
      </td>
      <td className="py-3 px-3 text-sm text-right text-text-secondary">
        {item.monthlyDividend > 0
          ? formatCurrency(item.monthlyDividend)
          : "--"}
      </td>
    </tr>
  );
}

function ContributorBar({
  item,
  maxDividend,
}: {
  item: StockDividend;
  maxDividend: number;
}) {
  const width = maxDividend > 0 ? (item.annualDividend / maxDividend) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs w-12 text-text-secondary">
        {item.ticker}
      </span>
      <div className="flex-1 h-5 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-green/70 rounded-full transition-all duration-500"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-xs font-medium text-text-primary w-16 text-right">
        {formatCurrency(item.annualDividend)}
      </span>
    </div>
  );
}

function ProjectionChart({
  projections,
}: {
  projections: DividendSummary["projection"];
}) {
  if (projections.length === 0) return null;

  const maxIncome = Math.max(...projections.map((p) => p.annualIncome));
  const chartHeight = 120;

  return (
    <div className="bg-surface-alt rounded-xl border border-border p-4">
      <h3 className="text-sm font-medium text-text-primary mb-1">
        5-Year Income Projection
      </h3>
      <p className="text-xs text-text-muted mb-4">
        Assuming 5% annual dividend growth rate
      </p>

      <div className="flex items-end gap-2 h-[120px]">
        {projections.map((p) => {
          const height =
            maxIncome > 0
              ? (p.annualIncome / maxIncome) * chartHeight
              : 0;

          return (
            <div
              key={p.year}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-[10px] font-medium text-green">
                {formatCurrency(p.annualIncome)}
              </span>
              <div
                className="w-full bg-green/30 rounded-t-md transition-all duration-500"
                style={{ height: `${height}px` }}
              />
              <span className="text-[10px] text-text-muted">
                Yr {p.year}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border/50 flex justify-between text-xs">
        <span className="text-text-muted">5-Year Cumulative</span>
        <span className="text-green font-medium">
          {formatCurrency(projections[projections.length - 1]?.income ?? 0)}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

export function DividendTab({
  portfolio,
  portfolioStocks,
  totalInvestment,
}: DividendTabProps) {
  const stockMap = useMemo(() => buildStockMap(stocks), []);

  const summary = useMemo(
    () => analyzePortfolioDividends(portfolio, stockMap, totalInvestment),
    [portfolio, stockMap, totalInvestment]
  );

  const payerCount = summary.stocks.filter(
    (s) => s.annualDividend > 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Annual Income"
          value={formatCurrency(summary.totalAnnualIncome)}
          sub={`${payerCount} of ${summary.stocks.length} stocks pay dividends`}
          icon={<DollarSign className="w-3.5 h-3.5" />}
        />
        <SummaryCard
          label="Monthly Income"
          value={formatCurrency(summary.totalMonthlyIncome)}
          sub="Estimated average"
          icon={<Calendar className="w-3.5 h-3.5" />}
        />
        <SummaryCard
          label="Portfolio Yield"
          value={`${summary.portfolioYield.toFixed(2)}%`}
          sub="Weighted average"
          icon={<TrendingUp className="w-3.5 h-3.5" />}
        />
        <SummaryCard
          label="Non-Payers"
          value={`${summary.nonPayers.length}`}
          sub={
            summary.nonPayers.length > 0
              ? summary.nonPayers.slice(0, 3).join(", ") +
                (summary.nonPayers.length > 3 ? "..." : "")
              : "All stocks pay dividends"
          }
          icon={<AlertCircle className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Two column: Contributors + Projection */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Top contributors bar chart */}
        <div className="bg-surface-alt rounded-xl border border-border p-4">
          <h3 className="text-sm font-medium text-text-primary mb-4">
            Top Dividend Contributors
          </h3>
          {summary.topContributors.filter((c) => c.annualDividend > 0)
            .length === 0 ? (
            <p className="text-xs text-text-muted">
              No dividend-paying stocks in portfolio
            </p>
          ) : (
            <div className="space-y-2">
              {summary.topContributors
                .filter((c) => c.annualDividend > 0)
                .map((c) => (
                  <ContributorBar
                    key={c.ticker}
                    item={c}
                    maxDividend={
                      summary.topContributors[0]?.annualDividend ?? 0
                    }
                  />
                ))}
            </div>
          )}
        </div>

        {/* 5-year projection */}
        <ProjectionChart projections={summary.projection} />
      </div>

      {/* Full breakdown table */}
      <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-medium text-text-primary">
            Full Dividend Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-text-muted">
                <th className="text-left py-2 px-3 font-medium">Ticker</th>
                <th className="text-right py-2 px-3 font-medium">Alloc</th>
                <th className="text-right py-2 px-3 font-medium">Invested</th>
                <th className="text-right py-2 px-3 font-medium">Yield</th>
                <th className="text-right py-2 px-3 font-medium">
                  Annual
                </th>
                <th className="text-right py-2 px-3 font-medium">
                  Monthly
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.stocks.map((s) => (
                <DividendRow key={s.ticker} item={s} />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-surface/50">
                <td className="py-3 px-3 text-sm font-medium text-text-primary">
                  Total
                </td>
                <td className="py-3 px-3 text-sm text-right text-text-secondary">
                  {portfolio.reduce((s, p) => s + p.allocation, 0)}%
                </td>
                <td className="py-3 px-3 text-sm text-right text-text-secondary">
                  {formatCurrency(totalInvestment)}
                </td>
                <td className="py-3 px-3 text-sm text-right text-green font-medium">
                  {summary.portfolioYield.toFixed(2)}%
                </td>
                <td className="py-3 px-3 text-sm text-right text-green font-medium">
                  {formatCurrency(summary.totalAnnualIncome)}
                </td>
                <td className="py-3 px-3 text-sm text-right text-green font-medium">
                  {formatCurrency(summary.totalMonthlyIncome)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
