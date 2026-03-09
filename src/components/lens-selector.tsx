"use client";

import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";
import {
  PERSONA_LIST,
  type PersonaKey,
  type InvestorPersona,
} from "@/lib/lens-scoring";

interface LensSelectorProps {
  selected: PersonaKey[];
  onSelect: (keys: PersonaKey[]) => void;
}

const PERSONA_INITIALS: Record<PersonaKey, string> = {
  buffett: "WB",
  graham: "BG",
  lynch: "PL",
  wood: "CW",
  dalio: "RD",
  bogle: "JB",
  soros: "GS",
};

const PERSONA_COLORS: Record<PersonaKey, string> = {
  buffett: "#1B5E20",
  graham: "#4A148C",
  lynch: "#E65100",
  wood: "#AD1457",
  dalio: "#01579B",
  bogle: "#37474F",
  soros: "#BF360C",
};

export function LensSelector({ selected, onSelect }: LensSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [isOpen]);

  function toggle(key: PersonaKey) {
    if (selected.includes(key)) {
      onSelect(selected.filter((k) => k !== key));
    } else {
      onSelect([...selected, key]);
    }
  }

  function clearAll() {
    onSelect([]);
  }

  const hasSelection = selected.length > 0;
  const activeLabel =
    selected.length === 1
      ? PERSONA_LIST.find((p) => p.key === selected[0])?.name ?? ""
      : selected.length > 1
        ? `${selected.length} Lenses`
        : "";

  return (
    <div ref={panelRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-medium transition-all ${
          hasSelection
            ? "bg-green/10 text-green border border-green/20"
            : "bg-surface border border-border text-text-secondary hover:text-text-primary"
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        {hasSelection ? (
          <>
            Lens: {activeLabel}
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="ml-1 p-0.5 rounded hover:bg-green/20 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          "Investor Lens"
        )}
      </button>

      {/* Stacked persona avatars (shown when closed with selection) */}
      {!isOpen && hasSelection && (
        <div className="flex -space-x-1.5 mt-2">
          {selected.map((key) => (
            <div
              key={key}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-surface"
              style={{ backgroundColor: PERSONA_COLORS[key] }}
              title={PERSONA_LIST.find((p) => p.key === key)?.fullName}
            >
              {PERSONA_INITIALS[key]}
            </div>
          ))}
        </div>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-xl shadow-black/10 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">Investor Lens</p>
            <p className="text-xs text-text-muted mt-0.5">
              Score instruments through legendary investor philosophies.
              {selected.length > 1 && " Stacked lenses blend their perspectives."}
            </p>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {PERSONA_LIST.map((persona) => (
              <PersonaRow
                key={persona.key}
                persona={persona}
                isSelected={selected.includes(persona.key)}
                onToggle={() => toggle(persona.key)}
              />
            ))}
          </div>

          {hasSelection && (
            <div className="px-4 py-2.5 border-t border-border bg-surface-alt">
              <button
                onClick={clearAll}
                className="text-xs text-text-muted hover:text-red transition-colors"
              >
                Clear all lenses
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PersonaRow({
  persona,
  isSelected,
  onToggle,
}: {
  persona: InvestorPersona;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-surface-alt ${
        isSelected ? "bg-green/5" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
        style={{ backgroundColor: PERSONA_COLORS[persona.key] }}
      >
        {PERSONA_INITIALS[persona.key]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{persona.fullName}</span>
          <span className="text-[10px] text-text-muted font-mono">{persona.era}</span>
        </div>
        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
          {persona.philosophy}
        </p>
        <p className="text-[10px] text-text-muted mt-1 italic truncate">
          &ldquo;{persona.famousQuote}&rdquo;
        </p>
      </div>

      {/* Check */}
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border transition-colors ${
          isSelected
            ? "bg-green border-green text-white"
            : "border-border bg-surface"
        }`}
      >
        {isSelected && <Check className="w-3 h-3" />}
      </div>
    </button>
  );
}
