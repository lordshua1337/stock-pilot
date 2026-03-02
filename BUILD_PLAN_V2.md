# StockPilot v2 Build Plan

## Current State (v1)
- 3 pages: home (market overview + AI scores), research (stock cards), portfolio (builder)
- 9 stocks with AI scores, thesis, catalysts, risks in `src/lib/stock-data.ts`
- Dark Robinhood-style design with green accent
- Portfolio builder with allocation and sector metrics

## V2 Vision
No separate build spec file provided for StockPilot v2. Enhance based on v1 patterns and common portfolio intelligence platform features.

## Note
StockPilot build spec was mentioned as available at a Claude.ai URL but was not downloaded to the local filesystem. Check if Josh has it elsewhere or build based on the patterns established in The Well and Uncommon Cents v2 specs.

---

## Phase 1: Expand Stock Universe

### Update `src/lib/stock-data.ts`
- Expand from 9 to 30+ stocks across all major sectors
- Add: market cap, dividend yield, 52-week high/low, beta, revenue growth, profit margin
- Add: AI thesis with bull case, bear case, catalysts, risks (separate fields)
- Add: sector classification with sub-sectors
- Add: ESG score (optional)

### New file: `src/lib/sectors.ts`
```typescript
interface Sector {
  id: string;
  name: string;
  description: string;
  stocks: string[]; // ticker references
  marketWeight: number; // S&P 500 weighting
}
```
11 GICS sectors: Technology, Healthcare, Financials, Consumer Discretionary, Communication Services, Industrials, Consumer Staples, Energy, Utilities, Real Estate, Materials

---

## Phase 2: Enhanced Research

### Update `/research` page
- Search + filter by sector, AI score range, market cap range
- Sort by: AI score, price change, market cap, dividend yield
- Expandable stock cards with full thesis
- Compare mode: select 2-3 stocks side by side

### New: `/research/[ticker]` page -> Stock Detail
- Full AI analysis with sections: Thesis, Bull Case, Bear Case, Catalysts, Risks
- Key metrics dashboard (P/E, P/S, PEG, dividend yield, beta, etc.)
- Sector comparison (how this stock compares to sector peers)
- Related stocks
- "Add to portfolio" button
- Disclaimer: "Educational only. Not investment advice."

---

## Phase 3: Enhanced Portfolio Builder

### Update `/portfolio` page
- Drag-to-reorder allocations
- Portfolio metrics: expected return, volatility, Sharpe ratio estimate, dividend yield
- Sector exposure pie chart (CSS-based, no chart library needed)
- Concentration warnings (>25% in single stock, >40% in single sector)
- Risk score (1-10) based on composition
- "Optimize" suggestions (diversification tips)
- Save/load portfolio from localStorage
- Export portfolio summary

---

## Phase 4: New Pages

### New: `/screener` page -> Stock Screener
- Filter by: sector, AI score, P/E range, market cap, dividend yield, analyst rating
- Results table with sortable columns
- Quick-add to portfolio

### New: `/sectors` page -> Sector Analysis
- All 11 sectors with performance data
- Sector rotation insights
- Top stocks per sector
- Sector weight vs portfolio weight comparison

### New: `/watchlist` page
- Save stocks to watch (localStorage)
- Price alerts (visual only -- show if stock crossed threshold)
- Notes per stock

---

## Phase 5: AI Integration

### New or update: `/ask` page -> AI Research Assistant
- Chat interface for stock research questions
- Context-aware: knows user's portfolio composition
- Can compare stocks, analyze sectors, explain metrics
- Always includes disclaimer
- Never recommends specific buy/sell actions

### System prompt
- Stock data injected as context
- Portfolio composition awareness
- Sector analysis capability
- Advice boundary: "I can analyze and educate but cannot recommend specific trades"

---

## Phase 6: Getting Started / Onboarding

### New: `/onboard` page -> Getting Started Flow
Multi-step onboarding wizard that prompts new users through:
1. **Sign Up**: Name, email, display name (localStorage-based, no backend yet)
2. **Profile Setup**: Investment experience level, goals (growth/income/balanced), time horizon, risk comfort
3. **Financial DNA Assessment**: Deep personality quiz (expand existing `/personality` quiz into full "Financial DNA" report)
   - 20-30 question assessment covering: risk tolerance, emotional investing tendencies, sector biases, time horizon mindset, loss aversion
   - Generates a PDF report (html2pdf.js) with:
     - Investor archetype (e.g., "The Calculated Growth Seeker")
     - Risk profile score (1-10) with visual gauge
     - Recommended sector allocation based on personality
     - Behavioral insights ("You tend to panic-sell during 10%+ drawdowns")
     - Suggested portfolio preset matching their DNA
     - "Your Financial DNA" branding with premium feel
   - Store results in localStorage for portfolio recommendations
4. **Suggested Portfolio**: Based on DNA results, pre-populate portfolio builder with recommended allocation
5. **Dashboard redirect**: Send them to home with personalized greeting

### Design Reference
- Financial DNA report style: professional PDF like personality assessments (Myers-Briggs, DISC, StrengthsFinder)
- Quiz UX: one question at a time, progress bar, engaging micro-animations
- PDF: cover page with name + archetype, 4-6 pages of analysis, charts, recommendations

---

## Phase 7: Polish and Deploy

- Mobile-responsive all pages
- Dark mode polish (Robinhood aesthetic)
- Loading states and transitions
- PWA manifest
- Deploy to Vercel
- Push to GitHub

---

## Completed Work

| Item | Status |
|------|--------|
| Stock universe expanded to 85+ stocks | DONE |
| Market benchmarks (S&P 500, DJIA, NASDAQ, Russell 2000, VIX, etc.) | DONE |
| `src/lib/stock-data-extended.ts` -- 45 new stocks | DONE |
| `src/lib/portfolio-utils.ts` -- portfolio metrics calculations | DONE |
| Benchmark interface + 12 benchmark entries in stock-data.ts | DONE |

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/stock-data.ts` | DONE - 85+ stocks, benchmarks, extended import |
| `src/lib/stock-data-extended.ts` | DONE - 45 additional stocks |
| `src/lib/portfolio-utils.ts` | DONE - Portfolio metrics calculations |
| `src/lib/financial-dna.ts` | NEW - Assessment questions, scoring, archetype engine |
| `src/app/page.tsx` | UPDATE - Enhanced home |
| `src/app/research/page.tsx` | UPDATE - Search, filter, sort |
| `src/app/research/[ticker]/page.tsx` | NEW - Stock detail |
| `src/app/portfolio/page.tsx` | UPDATE - Enhanced builder |
| `src/app/screener/page.tsx` | NEW - Stock screener |
| `src/app/sectors/page.tsx` | NEW - Sector analysis |
| `src/app/watchlist/page.tsx` | NEW - Watchlist |
| `src/app/ask/page.tsx` | NEW or UPDATE - AI research assistant |
| `src/app/onboard/page.tsx` | NEW - Getting started wizard |
| `src/app/onboard/assessment/page.tsx` | NEW - Financial DNA quiz |
| `src/app/onboard/results/page.tsx` | NEW - DNA results + PDF generation |
| `src/components/nav.tsx` | UPDATE - New routes |
| `src/lib/system-prompt.ts` | NEW - AI context |
| `src/lib/financial-dna.ts` | NEW - Assessment engine |
| `src/app/globals.css` | UPDATE |
