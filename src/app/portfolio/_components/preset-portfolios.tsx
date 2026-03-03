import type { PortfolioItem } from "../page";

export interface PresetPortfolio {
  name: string;
  desc: string;
  items: PortfolioItem[];
}

export const PRESET_PORTFOLIOS: PresetPortfolio[] = [
  {
    name: "AI Growth",
    desc: "Heavy on AI and tech leaders",
    items: [
      { ticker: "NVDA", allocation: 25 },
      { ticker: "MSFT", allocation: 20 },
      { ticker: "GOOGL", allocation: 20 },
      { ticker: "META", allocation: 15 },
      { ticker: "CRM", allocation: 10 },
      { ticker: "ADBE", allocation: 10 },
    ],
  },
  {
    name: "Dividend Income",
    desc: "Yield-focused for passive income",
    items: [
      { ticker: "T", allocation: 20 },
      { ticker: "KO", allocation: 20 },
      { ticker: "JNJ", allocation: 20 },
      { ticker: "JPM", allocation: 15 },
      { ticker: "AMT", allocation: 15 },
      { ticker: "XOM", allocation: 10 },
    ],
  },
  {
    name: "Balanced",
    desc: "Mix of growth and value across sectors",
    items: [
      { ticker: "AAPL", allocation: 15 },
      { ticker: "NVDA", allocation: 15 },
      { ticker: "JNJ", allocation: 15 },
      { ticker: "JPM", allocation: 15 },
      { ticker: "COST", allocation: 15 },
      { ticker: "XOM", allocation: 10 },
      { ticker: "AMT", allocation: 15 },
    ],
  },
];

interface PresetPortfoliosProps {
  onLoadPreset: (items: PortfolioItem[]) => void;
}

export function PresetPortfolios({ onLoadPreset }: PresetPortfoliosProps) {
  return (
    <div className="mb-6">
      <p className="text-xs text-text-muted mb-3">
        Quick start with a preset, or build from scratch below.
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESET_PORTFOLIOS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onLoadPreset(preset.items)}
            className="bg-surface border border-border rounded-lg px-4 py-2.5 text-left hover:border-green/40 transition-colors group"
          >
            <p className="text-sm font-semibold group-hover:text-green transition-colors">
              {preset.name}
            </p>
            <p className="text-xs text-text-muted">{preset.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
