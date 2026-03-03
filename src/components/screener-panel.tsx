"use client";

import { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, X, RotateCcw } from "lucide-react";
import {
  type ScreenerFilters,
  EMPTY_FILTERS,
  ALL_RATINGS,
  SCREENER_PRESETS,
  applyPreset,
  countActiveFilters,
  saveFilters,
  loadFilters,
} from "@/lib/screener-utils";

interface ScreenerPanelProps {
  filters: ScreenerFilters;
  onChange: (filters: ScreenerFilters) => void;
}

function RangeInput({
  label,
  min,
  max,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
  step,
  prefix,
  suffix,
}: {
  label: string;
  min: number;
  max: number;
  valueMin: number | null;
  valueMax: number | null;
  onChangeMin: (v: number | null) => void;
  onChangeMax: (v: number | null) => void;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-xs text-text-muted block mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {prefix && (
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">
              {prefix}
            </span>
          )}
          <input
            type="number"
            placeholder={`${min}`}
            value={valueMin ?? ""}
            onChange={(e) =>
              onChangeMin(e.target.value === "" ? null : Number(e.target.value))
            }
            min={min}
            max={max}
            step={step ?? 1}
            className={`w-full bg-surface border border-border rounded-lg py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/40 transition-colors ${prefix ? "pl-6 pr-2" : "px-2.5"}`}
          />
        </div>
        <span className="text-text-muted text-xs">to</span>
        <div className="relative flex-1">
          {prefix && (
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">
              {prefix}
            </span>
          )}
          <input
            type="number"
            placeholder={`${max}`}
            value={valueMax ?? ""}
            onChange={(e) =>
              onChangeMax(e.target.value === "" ? null : Number(e.target.value))
            }
            min={min}
            max={max}
            step={step ?? 1}
            className={`w-full bg-surface border border-border rounded-lg py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/40 transition-colors ${prefix ? "pl-6 pr-2" : "px-2.5"}`}
          />
          {suffix && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">
              {suffix}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MinInput({
  label,
  min,
  max,
  value,
  onChange,
  step,
  suffix,
}: {
  label: string;
  min: number;
  max: number;
  value: number | null;
  onChange: (v: number | null) => void;
  step?: number;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-xs text-text-muted block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          placeholder={`${min}`}
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
          min={min}
          max={max}
          step={step ?? 1}
          className="w-full bg-surface border border-border rounded-lg px-2.5 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/40 transition-colors"
        />
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function MaxInput({
  label,
  min,
  max,
  value,
  onChange,
  step,
}: {
  label: string;
  min: number;
  max: number;
  value: number | null;
  onChange: (v: number | null) => void;
  step?: number;
}) {
  return (
    <div>
      <label className="text-xs text-text-muted block mb-1.5">{label}</label>
      <input
        type="number"
        placeholder={`${max}`}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        min={min}
        max={max}
        step={step ?? 1}
        className="w-full bg-surface border border-border rounded-lg px-2.5 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green/40 transition-colors"
      />
    </div>
  );
}

export default function ScreenerPanel({
  filters,
  onChange,
}: ScreenerPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  // Load persisted filters on mount
  useEffect(() => {
    const saved = loadFilters();
    if (saved && countActiveFilters(saved) > 0) {
      onChange(saved);
      setIsOpen(true);
    }
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change
  useEffect(() => {
    saveFilters(filters);
  }, [filters]);

  const updateFilter = useCallback(
    <K extends keyof ScreenerFilters>(key: K, value: ScreenerFilters[K]) => {
      onChange({ ...filters, [key]: value });
    },
    [filters, onChange]
  );

  const toggleRating = useCallback(
    (rating: string) => {
      const next = new Set(filters.analystRatings);
      if (next.has(rating)) {
        next.delete(rating);
      } else {
        next.add(rating);
      }
      onChange({ ...filters, analystRatings: next });
    },
    [filters, onChange]
  );

  const clearAll = useCallback(() => {
    onChange({ ...EMPTY_FILTERS, analystRatings: new Set() });
  }, [onChange]);

  return (
    <div className="mb-4">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-colors ${
          isOpen || activeCount > 0
            ? "bg-green-bg text-green font-medium"
            : "text-text-muted hover:text-text-secondary border border-border"
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Screener
        {activeCount > 0 && (
          <span className="bg-green text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="mt-3 bg-surface border border-border rounded-xl p-4 animate-fade-in">
          {/* Presets row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-text-muted">Quick:</span>
            {SCREENER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onChange(applyPreset(preset))}
                title={preset.description}
                className="text-xs px-2.5 py-1 rounded-md border border-border text-text-secondary hover:text-green hover:border-green/30 transition-colors"
              >
                {preset.label}
              </button>
            ))}
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="text-xs px-2.5 py-1 rounded-md text-red hover:bg-red-bg transition-colors flex items-center gap-1 ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text-secondary p-1 ml-auto"
              aria-label="Close screener"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <RangeInput
              label="Price"
              min={0}
              max={1100}
              valueMin={filters.priceMin}
              valueMax={filters.priceMax}
              onChangeMin={(v) => updateFilter("priceMin", v)}
              onChangeMax={(v) => updateFilter("priceMax", v)}
              step={5}
              prefix="$"
            />

            <RangeInput
              label="AI Score"
              min={0}
              max={100}
              valueMin={filters.aiScoreMin}
              valueMax={filters.aiScoreMax}
              onChangeMin={(v) => updateFilter("aiScoreMin", v)}
              onChangeMax={(v) => updateFilter("aiScoreMax", v)}
            />

            <MaxInput
              label="P/E Ratio (max)"
              min={0}
              max={300}
              value={filters.peRatioMax}
              onChange={(v) => updateFilter("peRatioMax", v)}
              step={5}
            />

            <MinInput
              label="Dividend Yield (min)"
              min={0}
              max={10}
              value={filters.dividendYieldMin}
              onChange={(v) => updateFilter("dividendYieldMin", v)}
              step={0.25}
              suffix="%"
            />

            <RangeInput
              label="Beta"
              min={0}
              max={3}
              valueMin={filters.betaMin}
              valueMax={filters.betaMax}
              onChangeMin={(v) => updateFilter("betaMin", v)}
              onChangeMax={(v) => updateFilter("betaMax", v)}
              step={0.1}
            />

            {/* Analyst Rating multi-select */}
            <div>
              <label className="text-xs text-text-muted block mb-1.5">
                Analyst Rating
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_RATINGS.map((rating) => {
                  const isActive = filters.analystRatings.has(rating);
                  const colorClass =
                    rating === "Strong Buy" || rating === "Buy"
                      ? isActive
                        ? "bg-green-bg text-green border-green/30"
                        : ""
                      : rating === "Hold"
                        ? isActive
                          ? "bg-blue-bg text-blue border-blue/30"
                          : ""
                        : isActive
                          ? "bg-red-bg text-red border-red/30"
                          : "";
                  return (
                    <button
                      key={rating}
                      onClick={() => toggleRating(rating)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                        isActive
                          ? `font-medium ${colorClass}`
                          : "border-border text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      {rating}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active filter summary */}
          {activeCount > 0 && (
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-text-secondary">
              <span>
                {activeCount} filter{activeCount !== 1 ? "s" : ""} active
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
