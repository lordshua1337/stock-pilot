"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { FactorCode, FactorScore } from "@/lib/dna-v2/types";

const FACTOR_ORDER: FactorCode[] = ["RP", "DS", "CN", "TO", "SI", "ES", "SP", "IP"];
const FACTOR_LABELS: Record<FactorCode, string> = {
  RP: "Risk",
  DS: "Speed",
  CN: "Control",
  TO: "Time",
  SI: "Social",
  ES: "Emotion",
  SP: "Structure",
  IP: "Info",
};

interface RadarChartV2Props {
  factors: Record<FactorCode, FactorScore>;
  accentColor?: string;
}

// ---------------------------------------------------------------------------
// Geometry helpers (pure functions, no mutation)
// ---------------------------------------------------------------------------

function polarToXY(
  cx: number,
  cy: number,
  radius: number,
  index: number,
  total: number
): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function ringPoints(
  cx: number,
  cy: number,
  radius: number,
  scale: number
): string {
  return FACTOR_ORDER.map((_, i) => {
    const pt = polarToXY(cx, cy, radius * scale, i, 8);
    return `${pt.x},${pt.y}`;
  }).join(" ");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RadarChartV2({ factors, accentColor = "#006DD8" }: RadarChartV2Props) {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 120;
  const prefersReducedMotion = useReducedMotion();

  const gridRings = [0.25, 0.5, 0.75, 1.0];
  const gridValues = [25, 50, 75, 100];

  // Data points for the polygon
  const dataPoints = FACTOR_ORDER.map((code, i) => {
    const value = factors[code].normalized;
    const scale = value / 100;
    const pt = polarToXY(cx, cy, radius * scale, i, 8);
    return { ...pt, value };
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Label positions pushed further out for no clipping
  const labelOffset = radius + 48;
  const labelPositions = FACTOR_ORDER.map((_, i) => polarToXY(cx, cy, labelOffset, i, 8));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[360px] mx-auto">
      {/* Grid rings */}
      {gridRings.map((scale) => (
        <polygon
          key={scale}
          points={ringPoints(cx, cy, radius, scale)}
          fill="none"
          stroke="#e5e5e7"
          strokeWidth="0.5"
          opacity={0.6}
        />
      ))}

      {/* Grid ring value labels (right side of top axis) */}
      {gridRings.map((scale, idx) => {
        const y = cy - radius * scale;
        return (
          <text
            key={`val-${scale}`}
            x={cx + 6}
            y={y + 3}
            fill="#6e6e73"
            fontSize="8"
            fontFamily="Inter, sans-serif"
          >
            {gridValues[idx]}
          </text>
        );
      })}

      {/* Axis lines */}
      {FACTOR_ORDER.map((_, i) => {
        const endPt = polarToXY(cx, cy, radius, i, 8);
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={endPt.x}
            y2={endPt.y}
            stroke="#e5e5e7"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Data polygon with fade + scale animation */}
      <motion.g
        initial={{
          opacity: prefersReducedMotion ? 1 : 0,
          scale: prefersReducedMotion ? 1 : 0.3,
        }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        <polygon
          points={dataPolygon}
          fill={`${accentColor}20`}
          stroke={accentColor}
          strokeWidth="2"
        />
      </motion.g>

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <motion.circle
          key={`dot-${i}`}
          cx={p.x}
          cy={p.y}
          r="4"
          fill={accentColor}
          initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
        />
      ))}

      {/* Labels with factor names */}
      {labelPositions.map((p, i) => (
        <text
          key={`label-${i}`}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#6e6e73"
          fontSize="10"
          fontWeight="500"
          fontFamily="Inter, sans-serif"
        >
          {FACTOR_LABELS[FACTOR_ORDER[i]]}
        </text>
      ))}
    </svg>
  );
}
