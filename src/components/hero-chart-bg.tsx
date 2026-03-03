"use client";

import { useEffect, useRef } from "react";

// Matrix-meets-Bloomberg animated background for the hero section.
// Draws flowing mini chart lines and falling ticker numbers on a canvas.

interface Column {
  x: number;
  chars: { y: number; char: string; opacity: number; speed: number }[];
  nextSpawn: number;
}

interface ChartLine {
  points: number[];
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  progress: number;
  speed: number;
}

const TICKER_CHARS = "0123456789.$%+-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const GREEN = "0, 200, 83";
const BLUE = "68, 138, 255";
const RED = "255, 82, 82";

function randomChar(): string {
  return TICKER_CHARS[Math.floor(Math.random() * TICKER_CHARS.length)];
}

function generateChartPoints(count: number): number[] {
  const points: number[] = [];
  let val = 0.3 + Math.random() * 0.4;
  for (let i = 0; i < count; i++) {
    val += (Math.random() - 0.48) * 0.08;
    val = Math.max(0.05, Math.min(0.95, val));
    points.push(val);
  }
  return points;
}

export function HeroChartBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let w = 0;
    let h = 0;
    const columns: Column[] = [];
    const chartLines: ChartLine[] = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      initColumns();
      initCharts();
    }

    function initColumns() {
      columns.length = 0;
      const gap = 60;
      const count = Math.floor(w / gap);
      for (let i = 0; i < count; i++) {
        columns.push({
          x: gap * i + gap / 2 + (Math.random() - 0.5) * 20,
          chars: [],
          nextSpawn: Math.random() * 120,
        });
      }
    }

    function initCharts() {
      chartLines.length = 0;
      const count = Math.floor(w / 200) + 2;
      for (let i = 0; i < count; i++) {
        spawnChart();
      }
    }

    function spawnChart() {
      const lineW = 80 + Math.random() * 160;
      const lineH = 30 + Math.random() * 50;
      const colors = [GREEN, BLUE, RED];
      chartLines.push({
        points: generateChartPoints(20 + Math.floor(Math.random() * 20)),
        x: Math.random() * (w - lineW),
        y: Math.random() * (h - lineH),
        width: lineW,
        height: lineH,
        color: colors[Math.floor(Math.random() * colors.length)],
        progress: 0,
        speed: 0.003 + Math.random() * 0.005,
      });
    }

    function drawColumns(dt: number) {
      const fontSize = 12;
      ctx!.font = `${fontSize}px "JetBrains Mono", monospace`;
      ctx!.textAlign = "center";

      for (const col of columns) {
        // Spawn new char
        col.nextSpawn -= dt * 60;
        if (col.nextSpawn <= 0) {
          col.chars.push({
            y: -10,
            char: randomChar(),
            opacity: 0.15 + Math.random() * 0.25,
            speed: 0.3 + Math.random() * 0.6,
          });
          col.nextSpawn = 20 + Math.random() * 80;
        }

        // Draw and update chars
        for (let i = col.chars.length - 1; i >= 0; i--) {
          const c = col.chars[i];
          c.y += c.speed * dt * 60;

          // Fade out near bottom
          const fadeZone = h * 0.8;
          const alpha =
            c.y > fadeZone
              ? c.opacity * (1 - (c.y - fadeZone) / (h - fadeZone))
              : c.opacity;

          ctx!.fillStyle = `rgba(${GREEN}, ${Math.max(0, alpha)})`;
          ctx!.fillText(c.char, col.x, c.y);

          // Randomly mutate char
          if (Math.random() < 0.02) {
            c.char = randomChar();
          }

          // Remove off-screen
          if (c.y > h + 20) {
            col.chars.splice(i, 1);
          }
        }
      }
    }

    function drawCharts(dt: number) {
      for (let i = chartLines.length - 1; i >= 0; i--) {
        const chart = chartLines[i];
        chart.progress += chart.speed * dt * 60;

        if (chart.progress >= 1) {
          // Reset with new data
          chart.points = generateChartPoints(
            20 + Math.floor(Math.random() * 20)
          );
          chart.progress = 0;
          chart.x = Math.random() * (w - chart.width);
          chart.y = Math.random() * (h - chart.height);
        }

        const visiblePoints = Math.floor(chart.points.length * chart.progress);
        if (visiblePoints < 2) continue;

        ctx!.beginPath();
        ctx!.strokeStyle = `rgba(${chart.color}, 0.12)`;
        ctx!.lineWidth = 1;

        for (let j = 0; j < visiblePoints; j++) {
          const px = chart.x + (j / (chart.points.length - 1)) * chart.width;
          const py =
            chart.y + (1 - chart.points[j]) * chart.height;
          if (j === 0) {
            ctx!.moveTo(px, py);
          } else {
            ctx!.lineTo(px, py);
          }
        }
        ctx!.stroke();

        // Draw last point as a dot
        if (visiblePoints > 0) {
          const lastIdx = visiblePoints - 1;
          const lx =
            chart.x + (lastIdx / (chart.points.length - 1)) * chart.width;
          const ly =
            chart.y + (1 - chart.points[lastIdx]) * chart.height;
          ctx!.beginPath();
          ctx!.arc(lx, ly, 2, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${chart.color}, 0.25)`;
          ctx!.fill();
        }
      }
    }

    let lastTime = 0;

    function animate(time: number) {
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
      lastTime = time;

      ctx!.clearRect(0, 0, w, h);
      drawCharts(dt);
      drawColumns(dt);

      animRef.current = requestAnimationFrame(animate);
    }

    resize();
    animRef.current = requestAnimationFrame(animate);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      style={{ opacity: 0.6 }}
    />
  );
}
