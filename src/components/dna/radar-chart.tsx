"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { DimKey } from "@/lib/financial-dna";
import type { DNAProfile } from "@/lib/dna-scoring";

const KEYS: DimKey[] = ["R", "C", "H", "D", "E"];
const LABELS = ["Risk", "Control", "Horizon", "Discipline", "Emotion"];

interface RadarChartProps {
  dimensions: DNAProfile["dimensions"];
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
  return KEYS.map((_, i) => {
    const pt = polarToXY(cx, cy, radius * scale, i, 5);
    return `${pt.x},${pt.y}`;
  }).join(" ");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RadarChart({ dimensions, accentColor = "#00C853" }: RadarChartProps) {
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 120;
  const prefersReducedMotion = useReducedMotion();

  const gridRings = [0.25, 0.5, 0.75, 1.0];
  const gridValues = [25, 50, 75, 100];

  // Data points for the polygon
  const dataPoints = KEYS.map((k, i) => {
    const scale = dimensions[k] / 100;
    const pt = polarToXY(cx, cy, radius * scale, i, 5);
    return { ...pt, value: dimensions[k] };
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Label positions pushed further out for no clipping
  const labelOffset = radius + 42;
  const labelPositions = KEYS.map((_, i) => polarToXY(cx, cy, labelOffset, i, 5));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[340px] mx-auto">
      {/* Grid rings */}
      {gridRings.map((scale, idx) => (
        <polygon
          key={scale}
          points={ringPoints(cx, cy, radius, scale)}
          fill="none"
          stroke="#2A2A2A"
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
            fill="#555"
            fontSize="8"
            fontFamily="Inter, sans-serif"
          >
            {gridValues[idx]}
          </text>
        );
      })}

      {/* Axis lines */}
      {KEYS.map((_, i) => {
        const endPt = polarToXY(cx, cy, radius, i, 5);
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={endPt.x}
            y2={endPt.y}
            stroke="#2A2A2A"
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

      {/* Labels with dimension values */}
      {labelPositions.map((p, i) => (
        <g key={`label-${i}`}>
          <text
            x={p.x}
            y={p.y - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#A0A0A0"
            fontSize="11"
            fontWeight="500"
            fontFamily="Inter, sans-serif"
          >
            {LABELS[i]}
          </text>
          <text
            x={p.x}
            y={p.y + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={accentColor}
            fontSize="12"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            {dimensions[KEYS[i]]}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Static version for PDF (no animation, inline styles only)
// ---------------------------------------------------------------------------

export function RadarChartStatic({
  dimensions,
  accentColor = "#00C853",
}: RadarChartProps) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 100;

  const dataPoints = KEYS.map((k, i) => {
    const scale = dimensions[k] / 100;
    const pt = polarToXY(cx, cy, radius * scale, i, 5);
    return { ...pt, value: dimensions[k] };
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const labelOffset = radius + 36;
  const labelPositions = KEYS.map((_, i) => polarToXY(cx, cy, labelOffset, i, 5));

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: "block", margin: "0 auto" }}
    >
      {[0.25, 0.5, 0.75, 1.0].map((scale) => (
        <polygon
          key={scale}
          points={ringPoints(cx, cy, radius, scale)}
          fill="none"
          stroke="#ddd"
          strokeWidth="0.5"
        />
      ))}

      {KEYS.map((_, i) => {
        const endPt = polarToXY(cx, cy, radius, i, 5);
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={endPt.x}
            y2={endPt.y}
            stroke="#ddd"
            strokeWidth="0.5"
          />
        );
      })}

      <polygon
        points={dataPolygon}
        fill={`${accentColor}30`}
        stroke={accentColor}
        strokeWidth="2"
      />

      {dataPoints.map((p, i) => (
        <circle key={`dot-${i}`} cx={p.x} cy={p.y} r="4" fill={accentColor} />
      ))}

      {labelPositions.map((p, i) => (
        <g key={`label-${i}`}>
          <text
            x={p.x}
            y={p.y - 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#555"
            fontSize="10"
            fontWeight="500"
            fontFamily="Inter, sans-serif"
          >
            {LABELS[i]}
          </text>
          <text
            x={p.x}
            y={p.y + 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={accentColor}
            fontSize="11"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            {dimensions[KEYS[i]]}
          </text>
        </g>
      ))}
    </svg>
  );
}
