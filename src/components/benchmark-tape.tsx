"use client";

import { useState, useRef, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { benchmarks, type BenchmarkPeriod } from "@/lib/stock-data";

const PERIODS: BenchmarkPeriod[] = ["YTD", "QTR", "MONTH", "WEEK", "DAY", "LIVE"];

export function BenchmarkTape() {
  const [period, setPeriod] = useState<BenchmarkPeriod>("YTD");
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);

  // Auto-scroll animation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const speed = 0.5; // pixels per frame

    function tick() {
      if (!pausedRef.current && el) {
        offsetRef.current += speed;
        // When we've scrolled past half the content (the duplicated set), reset
        const halfWidth = el.scrollWidth / 2;
        if (offsetRef.current >= halfWidth) {
          offsetRef.current = 0;
        }
        el.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Duplicate benchmarks for seamless loop
  const items = [...benchmarks, ...benchmarks];

  return (
    <section className="border-y border-border bg-surface">
      {/* Period selector */}
      <div className="flex items-center justify-center gap-1 py-2 border-b border-border">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded transition-colors ${
              period === p
                ? "bg-green text-white"
                : "text-text-muted hover:text-text-secondary hover:bg-surface-hover"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Scrolling tape */}
      <div
        className="overflow-hidden py-2.5 cursor-default"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        <div
          ref={scrollRef}
          className="flex items-center gap-8 whitespace-nowrap will-change-transform"
          style={{ width: "max-content" }}
        >
          {items.map((b, i) => {
            const ret = b.returns[period];
            const isUp = ret >= 0;
            return (
              <div key={`${b.ticker}-${i}`} className="flex items-center gap-2 text-sm">
                <span className="font-mono font-semibold text-text-primary text-xs">
                  {b.shortName}
                </span>
                <span className="font-mono text-text-muted text-xs">
                  {b.value >= 1000 ? b.value.toLocaleString("en-US", { maximumFractionDigits: 0 }) : b.value.toFixed(2)}
                </span>
                <span
                  className={`font-mono text-xs flex items-center gap-0.5 ${
                    isUp ? "text-green" : "text-red"
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {isUp ? "+" : ""}
                  {ret.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
