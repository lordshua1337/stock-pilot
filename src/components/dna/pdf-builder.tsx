"use client";

import { useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { ARCHETYPE_INFO, DIMENSION_LABELS } from "@/lib/dna-scoring";
import type { BiasFlag, MicroModuleKey } from "@/lib/dna-scoring";
import type { StoredDNAProfile } from "@/lib/dna-storage";
import type { CoreDimensions, DimKey, ArchetypeKey } from "@/lib/financial-dna";
import { matchStocksToDNA } from "@/lib/dna-stock-matcher";
import { ARCHETYPE_CONTENT } from "@/lib/archetype-content";

// ---------------------------------------------------------------------------
// CSS class prefix: dna-pdf-* for container, dnapd-* for body elements
// Following the PDF playbook exactly (816px width, 1056px cover, css-only breaks)
// ---------------------------------------------------------------------------

const PDF_STYLES = `
.dna-pdf-doc {
  width: 816px;
  margin: 0;
  padding: 0;
  display: block;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #1a1a2e;
  background: #fff;
  position: absolute;
  left: -9999px;
  top: 0;
  box-sizing: border-box;
}

.dna-pdf-cover {
  width: 100%;
  height: 1056px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  position: relative;
  overflow: hidden;
}

.dnapd-cover-inner {
  text-align: center;
  padding: 60px;
  color: #fff;
  z-index: 1;
  position: relative;
}

.dnapd-cover-logo {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  opacity: 0.8;
  margin-bottom: 32px;
}

.dnapd-cover-title {
  font-size: 18px;
  font-weight: 400;
  opacity: 0.7;
  margin-bottom: 24px;
  letter-spacing: 1px;
}

.dnapd-cover-archetype {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 12px;
  line-height: 1.2;
}

.dnapd-cover-tagline {
  font-size: 18px;
  font-style: italic;
  opacity: 0.8;
  margin-bottom: 48px;
}

.dnapd-cover-meta {
  font-size: 13px;
  opacity: 0.6;
}

.dna-pdf-page {
  padding: 56px 48px 28px;
  box-sizing: border-box;
  width: 100%;
  background: #fff;
  color: #1a1a2e;
  page-break-before: always;
}

.dna-pdf-first {
  page-break-before: auto;
}

.dnapd-section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.dnapd-heading {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1a1a2e;
}

.dnapd-dim-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.dnapd-dim-card {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  page-break-inside: avoid;
}

.dnapd-dim-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
}

.dnapd-dim-value {
  font-size: 24px;
  font-weight: 700;
}

.dnapd-dim-bar {
  height: 4px;
  border-radius: 2px;
  background: #f0f0f0;
  margin-top: 6px;
  overflow: hidden;
}

.dnapd-dim-fill {
  height: 100%;
  border-radius: 2px;
}

.dnapd-sv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.dnapd-sv-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.dnapd-sv-item {
  font-size: 12px;
  color: #555;
  margin-bottom: 6px;
  padding-left: 12px;
  position: relative;
  line-height: 1.5;
}

.dnapd-sv-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.dnapd-rule-box {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 20px;
  page-break-inside: avoid;
}

.dnapd-mood-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.dnapd-mood-card {
  padding: 12px;
  border-radius: 8px;
  background: #f8f8f8;
  text-align: center;
  page-break-inside: avoid;
}

.dnapd-mood-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
}

.dnapd-mood-value {
  font-size: 18px;
  font-weight: 700;
}

.dnapd-bias-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8f8f8;
  margin-bottom: 8px;
  page-break-inside: avoid;
}

.dnapd-bias-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.dnapd-bias-name {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
}

.dnapd-bias-desc {
  font-size: 11px;
  color: #666;
}

.dnapd-stock-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  margin-bottom: 8px;
  page-break-inside: avoid;
}

.dnapd-stock-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dnapd-stock-ticker {
  font-size: 14px;
  font-weight: 700;
}

.dnapd-stock-name {
  font-size: 11px;
  color: #888;
}

.dnapd-stock-reason {
  font-size: 11px;
  color: #555;
  max-width: 300px;
}

.dnapd-stock-score {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.dnapd-action-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #f8f8f8;
  margin-bottom: 8px;
  page-break-inside: avoid;
}

.dnapd-action-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.dnapd-action-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
}

.dnapd-action-desc {
  font-size: 11px;
  color: #555;
  line-height: 1.5;
}

.dnapd-disclaimer {
  margin-top: 24px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #f8f8f8;
  font-size: 10px;
  color: #999;
  line-height: 1.5;
  page-break-inside: avoid;
}

.dnapd-comm-box {
  padding: 16px;
  border-radius: 8px;
  background: #f8f8f8;
  font-size: 13px;
  font-style: italic;
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
  page-break-inside: avoid;
}

h1, h2 { page-break-after: avoid; }
`;

// ---------------------------------------------------------------------------
// Helpers -- build action items (duplicated logic from action-plan, simplified for PDF)
// ---------------------------------------------------------------------------

interface PdfAction {
  title: string;
  description: string;
}

const BIAS_ACTIONS: Record<string, PdfAction> = {
  loss_aversion: {
    title: "Set a 48-hour decision buffer",
    description: "Before any portfolio change triggered by news, wait 48 hours and write down your reasoning.",
  },
  fomo: {
    title: "72-hour cooling period on trending picks",
    description: "Add trending stocks to a watchlist instead. Review in 3 days before buying.",
  },
  overconfidence: {
    title: "\"What could go wrong?\" checklist",
    description: "List 3 specific risks before any new position over 5% of your portfolio.",
  },
  herding: {
    title: "Write 3 reasons a crowd trade could fail",
    description: "Before following any popular trade, independently document why it might not work.",
  },
  recency_bias: {
    title: "Check the 5-year chart before acting",
    description: "Zoom out to the 5-year view before making any trade driven by recent events.",
  },
  disposition_effect: {
    title: "Set exit prices before entering positions",
    description: "Write down target sell prices (up and down) before buying. Review quarterly.",
  },
  present_bias: {
    title: "Automate monthly contributions",
    description: "Set up automatic transfers on payday. Remove the manual decision step.",
  },
  inertia: {
    title: "Schedule quarterly portfolio reviews",
    description: "Put a 30-minute review on your calendar now. Review holdings and rebalance if needed.",
  },
};

function buildPdfActions(
  biasFlags: BiasFlag[],
  triggeredModules: MicroModuleKey[]
): PdfAction[] {
  const items: PdfAction[] = [];
  const usedTitles = new Set<string>();

  // Top biases
  const topBiases = [...biasFlags]
    .filter((f) => f.severity >= 1)
    .sort((a, b) => b.severity - a.severity);

  for (const bias of topBiases) {
    if (items.length >= 5) break;
    const action = BIAS_ACTIONS[bias.bias];
    if (action && !usedTitles.has(action.title)) {
      usedTitles.add(action.title);
      items.push(action);
    }
  }

  // Module-based fallbacks
  if (items.length < 4 && triggeredModules.includes("volatility_coping")) {
    const a = { title: "Build a volatility playbook", description: "Write what you will do if your portfolio drops 10%, 20%, 30%. Keep it visible." };
    if (!usedTitles.has(a.title)) { usedTitles.add(a.title); items.push(a); }
  }
  if (items.length < 4 && triggeredModules.includes("plan_discipline")) {
    const a = { title: "Create a 3-rule trading checklist", description: "Check thesis, check position size, sleep on it. Tape it to your monitor." };
    if (!usedTitles.has(a.title)) { usedTitles.add(a.title); items.push(a); }
  }

  return items.slice(0, 5);
}

// ---------------------------------------------------------------------------
// Score color for PDF (inline, no CSS vars)
// ---------------------------------------------------------------------------

function pdfScoreColor(value: number): string {
  if (value >= 70) return "#00C853";
  if (value >= 40) return "#E5A100";
  return "#E53935";
}

// ---------------------------------------------------------------------------
// SVG radar chart for PDF (static, inline)
// ---------------------------------------------------------------------------

function buildRadarSVG(dims: CoreDimensions, accentColor: string): string {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 95;
  const keys: DimKey[] = ["R", "C", "H", "D", "E"];
  const labels = ["Risk", "Control", "Horizon", "Discipline", "Emotion"];

  function polar(r: number, i: number) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function ringPts(scale: number) {
    return keys.map((_, i) => { const p = polar(radius * scale, i); return `${p.x},${p.y}`; }).join(" ");
  }

  const grids = [0.25, 0.5, 0.75, 1.0].map(s =>
    `<polygon points="${ringPts(s)}" fill="none" stroke="#ddd" stroke-width="0.5"/>`
  ).join("");

  const axes = keys.map((_, i) => {
    const p = polar(radius, i);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#ddd" stroke-width="0.5"/>`;
  }).join("");

  const dataPts = keys.map((k, i) => polar(radius * (dims[k] / 100), i));
  const dataPolygon = dataPts.map(p => `${p.x},${p.y}`).join(" ");

  const dots = dataPts.map(p =>
    `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${accentColor}"/>`
  ).join("");

  const lbls = keys.map((_, i) => {
    const p = polar(radius + 32, i);
    return `<text x="${p.x}" y="${p.y - 5}" text-anchor="middle" dominant-baseline="middle" fill="#555" font-size="10" font-weight="500" font-family="Inter,sans-serif">${labels[i]}</text>` +
           `<text x="${p.x}" y="${p.y + 9}" text-anchor="middle" dominant-baseline="middle" fill="${accentColor}" font-size="11" font-weight="700" font-family="Inter,sans-serif">${dims[keys[i]]}</text>`;
  }).join("");

  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="display:block;margin:0 auto">${grids}${axes}<polygon points="${dataPolygon}" fill="${accentColor}30" stroke="${accentColor}" stroke-width="2"/>${dots}${lbls}</svg>`;
}

// ---------------------------------------------------------------------------
// Build PDF document
// ---------------------------------------------------------------------------

function buildPdfDocument(
  profile: StoredDNAProfile,
  accentColor: string
): HTMLDivElement {
  const doc = document.createElement("div");
  doc.className = "dna-pdf-doc";

  const archetype = ARCHETYPE_INFO[profile.communicationArchetype as keyof typeof ARCHETYPE_INFO];
  const archetypeName = archetype?.name ?? "Unknown Type";
  const tagline = archetype?.tagline ?? "";
  const commRule = archetype?.communicationRule ?? "";

  const dims = profile.dimensions;
  const activeBiases = profile.biasFlags
    .filter((f) => f.severity > 0)
    .sort((a, b) => b.severity - a.severity);

  const stocks = matchStocksToDNA(dims);
  const actions = buildPdfActions(profile.biasFlags, profile.triggeredModules);
  const dateStr = new Date(profile.completedAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  // Darken accent for cover background
  const coverBg = accentColor;

  // --- COVER PAGE ---
  const cover = document.createElement("div");
  cover.className = "dna-pdf-cover";
  cover.style.background = `linear-gradient(135deg, ${coverBg} 0%, ${coverBg}dd 50%, #0d1f3c 100%)`;
  cover.innerHTML = `
    <div class="dnapd-cover-inner">
      <div class="dnapd-cover-logo">STOCKPILOT</div>
      <div class="dnapd-cover-title">Investor Identity Assessment</div>
      <div class="dnapd-cover-archetype">${archetypeName}</div>
      <div class="dnapd-cover-tagline">"${tagline}"</div>
      <div class="dnapd-cover-meta">${dateStr} &nbsp;&bull;&nbsp; Confidence: ${profile.confidence.overall}%</div>
    </div>
  `;
  doc.appendChild(cover);

  // --- PAGE 1: Profile Overview ---
  const page1 = document.createElement("div");
  page1.className = "dna-pdf-page dna-pdf-first";

  const dimCards = (["R", "C", "H", "D", "E"] as DimKey[]).map(k => {
    const v = dims[k];
    const color = pdfScoreColor(v);
    return `<div class="dnapd-dim-card">
      <div class="dnapd-dim-label">${DIMENSION_LABELS[k]}</div>
      <div class="dnapd-dim-value" style="color:${color}">${v}</div>
      <div class="dnapd-dim-bar"><div class="dnapd-dim-fill" style="width:${v}%;background:${color}"></div></div>
    </div>`;
  }).join("");

  const strengthItems = profile.strengths.map(s =>
    `<div class="dnapd-sv-item" style="color:#1a7a3c"><span style="position:absolute;left:0;top:7px;width:4px;height:4px;border-radius:50%;background:#00C853;display:block"></span>${s}</div>`
  ).join("");

  const vulnItems = profile.vulnerabilities.map(v =>
    `<div class="dnapd-sv-item" style="color:#b57a00"><span style="position:absolute;left:0;top:7px;width:4px;height:4px;border-radius:50%;background:#E5A100;display:block"></span>${v}</div>`
  ).join("");

  page1.innerHTML = `
    <div class="dnapd-section-title" style="color:${accentColor}">Profile Overview</div>
    <div class="dnapd-heading">Your Investor Identity</div>
    ${buildRadarSVG(dims, accentColor)}
    <div style="height:20px"></div>
    <div class="dnapd-dim-grid">${dimCards}</div>
    <div class="dnapd-sv-grid">
      <div>
        <div class="dnapd-sv-title" style="color:#00C853">Strengths</div>
        ${strengthItems}
      </div>
      <div>
        <div class="dnapd-sv-title" style="color:#E5A100">Vulnerabilities</div>
        ${vulnItems}
      </div>
    </div>
  `;
  doc.appendChild(page1);

  // --- PAGE 2: Behavioral Analysis ---
  const page2 = document.createElement("div");
  page2.className = "dna-pdf-page";

  const moodState = profile.marketMood.state;
  const moodLabels: Record<string, string> = {
    panicked: "Panicked", reactive: "Reactive", euphoric: "Euphoric",
    concerned: "Concerned", steady: "Steady",
  };
  const moodColors: Record<string, string> = {
    panicked: "#E53935", reactive: "#FF8A65", euphoric: "#E5A100",
    concerned: "#E5A100", steady: "#00C853",
  };

  const biasItems = activeBiases.slice(0, 6).map(b => {
    const bColor = b.severity >= 3 ? "#E53935" : b.severity >= 2 ? "#E5A100" : "#999";
    return `<div class="dnapd-bias-item">
      <div class="dnapd-bias-dot" style="background:${bColor}"></div>
      <div>
        <div class="dnapd-bias-name">${b.label}</div>
        <div class="dnapd-bias-desc">${b.behavioral_signature}</div>
      </div>
    </div>`;
  }).join("");

  page2.innerHTML = `
    <div class="dnapd-section-title" style="color:${accentColor}">Behavioral Analysis</div>
    <div class="dnapd-heading">How You Behave Under Pressure</div>

    <div style="font-size:12px;font-weight:600;color:#555;margin-bottom:8px">Your Behavioral Rule</div>
    <div class="dnapd-rule-box" style="border-color:${accentColor}40;background:${accentColor}08">
      ${profile.behavioralRule}
    </div>

    <div style="font-size:12px;font-weight:600;color:#555;margin-bottom:8px">Market Mood: <span style="color:${moodColors[moodState] ?? "#00C853"}">${moodLabels[moodState] ?? "Steady"}</span></div>
    <div class="dnapd-mood-grid">
      <div class="dnapd-mood-card">
        <div class="dnapd-mood-label">Panic</div>
        <div class="dnapd-mood-value">${(profile.marketMood.panic_probability * 100).toFixed(0)}%</div>
      </div>
      <div class="dnapd-mood-card">
        <div class="dnapd-mood-label">FOMO</div>
        <div class="dnapd-mood-value">${(profile.marketMood.fomo_probability * 100).toFixed(0)}%</div>
      </div>
      <div class="dnapd-mood-card">
        <div class="dnapd-mood-label">Impulse</div>
        <div class="dnapd-mood-value">${(profile.marketMood.impulse_trade_probability * 100).toFixed(0)}%</div>
      </div>
    </div>

    ${activeBiases.length > 0 ? `
      <div style="font-size:12px;font-weight:600;color:#555;margin-bottom:8px">Bias Profile (${activeBiases.length} detected)</div>
      ${biasItems}
    ` : ""}

    <div style="font-size:12px;font-weight:600;color:#555;margin-bottom:8px;margin-top:20px">Communication Style</div>
    <div class="dnapd-comm-box">"${commRule}"</div>
  `;
  doc.appendChild(page2);

  // --- PAGE 3: Stock Picks + Action Plan ---
  const page3 = document.createElement("div");
  page3.className = "dna-pdf-page";

  const stockItems = stocks.map(m => {
    const scoreColor = m.stock.aiScore >= 80 ? "#00C853" : m.stock.aiScore >= 60 ? "#E5A100" : "#999";
    return `<div class="dnapd-stock-card">
      <div class="dnapd-stock-left">
        <div>
          <div class="dnapd-stock-ticker">${m.stock.ticker}</div>
          <div class="dnapd-stock-name">${m.stock.name}</div>
        </div>
      </div>
      <div class="dnapd-stock-reason">${m.reason}</div>
      <div class="dnapd-stock-score" style="color:${scoreColor};background:${scoreColor}15">AI ${m.stock.aiScore}</div>
    </div>`;
  }).join("");

  const actionItems = actions.map((a, i) => `
    <div class="dnapd-action-item">
      <div class="dnapd-action-num" style="color:${accentColor};background:${accentColor}15">${i + 1}</div>
      <div>
        <div class="dnapd-action-title">${a.title}</div>
        <div class="dnapd-action-desc">${a.description}</div>
      </div>
    </div>
  `).join("");

  page3.innerHTML = `
    <div class="dnapd-section-title" style="color:${accentColor}">Personalized Recommendations</div>
    <div class="dnapd-heading">Stocks + Action Plan</div>

    <div style="font-size:12px;font-weight:600;color:#555;margin-bottom:8px">Top 5 Personality-Matched Stocks</div>
    ${stockItems}

    <div style="height:20px"></div>
    <div style="font-size:12px;font-weight:600;color:#555;margin-bottom:8px">Your Action Plan</div>
    ${actionItems}

    <div class="dnapd-disclaimer">
      Not financial advice. Stock matches are based on your behavioral profile and StockPilot AI scores, not guaranteed returns.
      Always do your own research before investing. Past performance does not predict future results.
    </div>
  `;
  doc.appendChild(page3);

  // --- PAGE 4: Investor Operating System ---
  const archetypeKeyStr = profile.communicationArchetype as ArchetypeKey;
  const content = ARCHETYPE_CONTENT[archetypeKeyStr];
  if (content) {
    const page4 = document.createElement("div");
    page4.className = "dna-pdf-page";

    const famousNames = content.famousInvestors.map(inv =>
      `<span style="display:inline-block;padding:3px 10px;border-radius:12px;border:1px solid #e0e0e0;font-size:11px;margin:2px 4px">${inv.name}</span>`
    ).join("");

    const strengthBullets = profile.strengths.slice(0, 3).map(s =>
      `<div style="font-size:12px;color:#1a7a3c;margin-bottom:4px;padding-left:12px;position:relative"><span style="position:absolute;left:0;color:#00C853;font-weight:700">+</span>${s}</div>`
    ).join("");

    const riskBullets = profile.vulnerabilities.slice(0, 2).map(v =>
      `<div style="font-size:12px;color:#b57a00;margin-bottom:4px;padding-left:12px;position:relative"><span style="position:absolute;left:0;color:#E5A100;font-weight:700">!</span>${v}</div>`
    ).join("");

    page4.innerHTML = `
      <div class="dnapd-section-title" style="color:${accentColor}">Your Playbook</div>
      <div class="dnapd-heading">Investor Operating System</div>

      <div style="padding:20px;border-radius:12px;border:1px solid ${accentColor}40;background:${accentColor}05;margin-bottom:16px">
        <div style="font-size:20px;font-weight:800;margin-bottom:4px;color:#1a1a2e">${archetypeName}</div>
        <div style="font-size:13px;font-style:italic;color:#888;margin-bottom:12px">"${tagline}"</div>
        <div style="font-size:12px;color:#555;line-height:1.6;margin-bottom:16px;font-style:italic;background:#f8f8f8;padding:12px;border-radius:8px">${content.metaphor}</div>
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#888;margin-bottom:6px">Famous Investors Like You</div>
          ${famousNames}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div style="padding:12px;border-radius:8px;border:1px solid #e0e0e0">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:6px;font-weight:600">Core Strengths</div>
          ${strengthBullets}
        </div>
        <div style="padding:12px;border-radius:8px;border:1px solid #e0e0e0">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:6px;font-weight:600">Risks to Watch</div>
          ${riskBullets}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div style="padding:12px;border-radius:8px;background:#f8f8f8">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:4px;font-weight:600">Portfolio Style</div>
          <div style="font-size:12px;color:#555">${content.portfolioStyle}</div>
        </div>
        <div style="padding:12px;border-radius:8px;background:#f8f8f8">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:4px;font-weight:600">Ideal Allocation</div>
          <div style="font-size:12px;color:#555">${content.idealAllocation}</div>
        </div>
      </div>

      <div style="padding:16px;border-radius:8px;border:1px solid ${accentColor}40;background:${accentColor}08;text-align:center;margin-bottom:16px">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:6px;font-weight:600">Before Any Trade</div>
        <div style="font-size:13px;font-weight:600;color:#1a1a2e">${content.decisionFramework}</div>
      </div>

      <div style="padding:12px;border-radius:8px;border:1px solid ${accentColor}30;background:${accentColor}06">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:${accentColor};margin-bottom:4px;font-weight:600">Your #1 Rule</div>
        <div style="font-size:12px;color:#555;line-height:1.6">${profile.behavioralRule}</div>
      </div>

      <div style="text-align:center;margin-top:24px;font-size:10px;color:#bbb">
        ${archetypeName} -- ${content.rarity}% of investors share your type
      </div>
    `;
    doc.appendChild(page4);
  }

  // --- Inject styles ---
  const style = document.createElement("style");
  style.textContent = PDF_STYLES;
  doc.prepend(style);

  return doc;
}

// ---------------------------------------------------------------------------
// PDF generation function
// ---------------------------------------------------------------------------

async function generatePdf(profile: StoredDNAProfile, accentColor: string): Promise<void> {
  // Dynamic import because html2pdf.js is browser-only
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf = (await import("html2pdf.js")).default as any;

  const pdfDoc = buildPdfDocument(profile, accentColor);

  // Append off-screen (CSS positions it at left: -9999px)
  document.body.appendChild(pdfDoc);

  const dateSlug = new Date(profile.completedAt).toISOString().split("T")[0];

  try {
    await html2pdf()
      .set({
        margin: 0,
        filename: `investor-identity-${dateSlug}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          windowWidth: 816,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
        pagebreak: { mode: ["css"] },
      })
      .from(pdfDoc)
      .save();
  } finally {
    document.body.removeChild(pdfDoc);
  }
}

// ---------------------------------------------------------------------------
// Download PDF button component
// ---------------------------------------------------------------------------

export function DownloadPdfButton({
  profile,
  accentColor = "#00C853",
}: {
  profile: StoredDNAProfile;
  accentColor?: string;
}) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    try {
      await generatePdf(profile, accentColor);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }, [profile, accentColor, generating]);

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="text-sm hover:text-green-light transition-colors inline-flex items-center gap-1 disabled:opacity-50"
      style={{ color: accentColor }}
    >
      {generating ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5" />
          Download PDF
        </>
      )}
    </button>
  );
}
