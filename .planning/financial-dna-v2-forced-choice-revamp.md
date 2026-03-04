# Financial DNA 2.0 — Forced Choice Scoring Revamp

## What This Is

A complete redesign of the StockPilot Financial DNA Assessment, moving from the current 4-option vector-based scoring to the **Forced Choice Triad methodology** used by DNA Behavior. The goal: measure natural (hard-wired) investor behavior that's resistant to faking, free from situational/gender/cultural bias, and stable over time.

## Why the Change

The current V1 assessment has a good foundation (5 dimensions, 16 biases, 10 archetypes, bias detection, market mood) but its question format has weaknesses:

1. **Situational questions** — "Your portfolio drops 20%..." invites the answer people *want* to give, not what they'd actually do. Learned behavior, not natural behavior.
2. **4-option format** — Easy to game. Social desirability pulls people toward the "disciplined" answer even when that's not who they are.
3. **Scenario-dependent** — Responses change based on mood, recent market events, and how the person is feeling that day. Low retest reliability.
4. **5 dimensions is limiting** — DNA Behavior measures 8 primary factors + 24 sub-factors. Our 5 dimensions (R, C, H, D, E) leave gaps in behavioral coverage.

The Forced Choice Triad methodology solves all of these by forcing participants to rank three non-situational words/phrases as "Most Like Me" and "Least Like Me," revealing true behavioral preferences under pressure.

---

## Current State (What We're Replacing)

### V1 Architecture
- **25 questions**, 4 options each, organized in 5 clusters (A-E)
- Each option carries a 5D weight vector `[R, C, H, D, E]` plus bias flags
- Scoring: sum vectors, normalize 0-100 per dimension
- Output: 5 dimensions, 16 bias flags, 10 archetypes, market mood, confidence scores
- Response timing tracked for confidence/contradiction analysis

### V1 Files (3,308 lines total)
- `src/lib/financial-dna.ts` (856 lines) — Questions, types, cluster labels
- `src/lib/dna-scoring.ts` (946 lines) — Scoring engine, bias rules, archetypes
- `src/lib/dna-storage.ts` (178 lines) — localStorage persistence
- `src/lib/dna-context.ts` (196 lines) — AI system prompt builder
- `src/lib/dna-stock-matcher.ts` (149 lines) — DNA-to-stock matching
- `src/app/personality/page.tsx` (472 lines) — Quiz UI
- `src/app/personality/results/page.tsx` (1034 lines) — Results dashboard
- `src/components/dna/` — action-plan, profile-sections, radar-chart, stock-picks

### What We're Keeping
- The 10 communication archetypes (systems_builder, reassurance_seeker, etc.) — these are good
- The 16 behavioral bias detection system — this is strong
- The market mood computation (panic/FOMO/impulse probabilities)
- The stock matcher logic (dimension-based scoring)
- The AI context builder (behavioral overlays for the chatbot)
- The storage layer (localStorage persistence, timing, history)
- The results UI structure (radar chart, bias flags, action plan, stock picks)

### What's Changing
- Question format: 4-option scenario → forced choice triads
- Dimension model: 5 dimensions → 8 primary factors + sub-factors
- Scoring engine: vector sum → ipsative forced choice scoring
- Question count: 25 → 36-46 (more items needed for 8 factors)
- Question content: situational scenarios → non-situational word/phrase triads
- Quiz UI: single-select → "Most Like Me" / "Least Like Me" dual-select

---

## The New Model

### 8 Primary Behavioral Factors (Investor DNA)

Expanding from 5 (R, C, H, D, E) to 8 factors that map to how people actually behave with money. Each factor exists on a spectrum:

| Factor | Code | Low End | High End | What It Measures |
|--------|------|---------|----------|------------------|
| Risk Posture | RP | Protective | Aggressive | Volatility comfort, loss tolerance, ambiguity handling |
| Decision Speed | DS | Deliberate | Instinctive | How fast they pull the trigger, analysis paralysis vs impulse |
| Control Need | CN | Delegating | Commanding | Trust in others vs need to drive every decision |
| Time Orientation | TO | Present-focused | Future-focused | Near-term gratification vs long-term compounding mindset |
| Social Influence | SI | Independent | Consensus-driven | Susceptibility to herding, FOMO, social proof |
| Emotional Steadiness | ES | Reactive | Composed | Stress response, volatility of decision-making under pressure |
| Structure Preference | SP | Flexible | Systematic | Need for rules, plans, routines vs improvisational style |
| Information Processing | IP | Intuitive | Analytical | Gut feel vs data-driven, narrative vs numbers |

### 24 Sub-Factors (3 per Primary)

Each primary factor has 3 sub-factors that add granularity:

**Risk Posture (RP):**
- Loss sensitivity — How much losses hurt relative to equivalent gains
- Volatility tolerance — Comfort with portfolio value swings
- Ambiguity comfort — Ability to act with incomplete information

**Decision Speed (DS):**
- Analysis threshold — How much data is "enough" before acting
- Reversal frequency — How often they change their mind after deciding
- Opportunity responsiveness — Speed of reaction to new information

**Control Need (CN):**
- Delegation comfort — Willingness to let others execute
- Authority requirement — Need to be the final decision-maker
- Trust calibration — How quickly they trust expert recommendations

**Time Orientation (TO):**
- Patience under drawdown — Ability to hold through losses without acting
- Compounding awareness — Understanding of time-value dynamics
- Goal concreteness — Specificity of long-term financial targets

**Social Influence (SI):**
- Peer sensitivity — Weight given to what others are doing/buying
- Trend responsiveness — How much market momentum drives decisions
- Contrarian capacity — Ability to go against consensus

**Emotional Steadiness (ES):**
- Stress reactivity — Emotional volatility during market turbulence
- Recovery speed — How fast they return to baseline after a shock
- Impulse control — Ability to override emotional urges with logic

**Structure Preference (SP):**
- Rule adherence — Consistency of following their own investment rules
- Planning depth — Detail level of investment strategy documentation
- Review discipline — Regularity of portfolio check-in routines

**Information Processing (IP):**
- Data appetite — Volume of information consumed before decisions
- Narrative vs numbers — Preference for stories vs spreadsheets
- Source diversity — Breadth of information sources consulted

### Mapping to Current Archetypes

The 10 archetypes map naturally to the 8-factor space:

| Archetype | Primary Factor Signature |
|-----------|------------------------|
| Systems Builder | SP-high, DS-low, IP-analytical |
| Reassurance Seeker | ES-low, SI-high, CN-low |
| Analytical Skeptic | IP-analytical, DS-low, CN-high |
| DIY Controller | CN-high, SP-flexible, DS-instinctive |
| Collaborative Partner | CN-mid, SI-mid, ES-composed |
| Big Picture Optimist | TO-future, ES-composed, RP-aggressive |
| Trend Explorer | SI-consensus, DS-instinctive, RP-mid |
| Avoider Under Stress | ES-reactive, DS-deliberate, RP-protective |
| Action-First Decider | DS-instinctive, SP-flexible, CN-high |
| Values-Anchored Steward | TO-future, SP-systematic, SI-independent |

---

## Forced Choice Triad Design

### How It Works

Each question presents 3 words or short phrases. The participant must choose:
- **"Most Like Me"** — The one that best describes them
- **"Least Like Me"** — The one that least describes them
- The unchosen middle item is scored neutrally

This creates **ipsative scoring** — you can't rate everything high. The pressure to choose reveals natural preferences.

### Triad Construction Rules

Each triad contains items from **3 different factors** to prevent obvious clustering. Items are balanced for:
- **Social desirability** — All 3 options are roughly equally "positive" so there's no obviously "good" answer
- **Difficulty** — All 3 should feel like they could describe you
- **Brevity** — Single words or 2-4 word phrases, never situational sentences

### Example Triads (Investor Context)

**Triad 1:**
- "Calculated" (IP — analytical end)
- "Decisive" (DS — instinctive end)
- "Patient" (TO — future-focused end)

**Triad 2:**
- "Thorough researcher" (IP — analytical)
- "Steady under pressure" (ES — composed)
- "In control" (CN — commanding)

**Triad 3:**
- "Follows the plan" (SP — systematic)
- "Trusts gut feeling" (IP — intuitive)
- "Watches what others do" (SI — consensus)

**Triad 4:**
- "Acts fast" (DS — instinctive)
- "Protects gains" (RP — protective)
- "Thinks long-term" (TO — future-focused)

### Scoring Logic

For each triad:
- "Most Like Me" choice: **+2** to its factor (positive pole)
- "Least Like Me" choice: **-1** to its factor (negative pole)
- Unchosen item: **0** (no change)

Each factor appears in ~12 triads across the full assessment, giving enough data points for reliable measurement. Final scores are normalized 0-100 per factor.

### Question Count

- **8 factors x ~5 appearances per factor minimum = ~40 triads** needed for statistical reliability
- Target: **40-46 triads** (120-138 rating items since each triad has 3 items)
- Completion time target: **8-12 minutes** (faster than V1's scenario-based format because words/phrases are quicker to process than sentences)

### Bias Detection Through Forced Choice

The forced choice format enables bias detection differently than V1:

- **Response time analysis** — Fast responses on risk-related triads = strong natural preference. Slow responses = internal conflict (the behavior may be learned, not natural)
- **Consistency checks** — Same factor appears in ~12 different triads. High variance across appearances = low confidence for that factor
- **Contradiction pairs** — Deliberately paired triads where choosing X in triad 7 but Y in triad 23 would be contradictory. Flags faking or confusion.
- **Social desirability index** — Track how often the "socially desirable" option is chosen as "Most Like Me." High rates suggest the participant is performing, not revealing.

The 16 behavioral biases from V1 are preserved but detected through factor profiles rather than per-question flags:

| Bias | Detection via Factors |
|------|----------------------|
| Loss aversion | RP-low + ES-reactive + TO-present |
| FOMO | SI-consensus + DS-instinctive + ES-reactive |
| Overconfidence | CN-high + RP-aggressive + IP-intuitive |
| Herding | SI-consensus + CN-low + IP-intuitive |
| Anchoring | SP-systematic + DS-deliberate + TO-present |
| Disposition effect | RP-low + ES-reactive + SP-low |
| Present bias | TO-present + DS-instinctive + SP-flexible |
| Confirmation bias | IP-intuitive + CN-high + SI-independent |
| Inertia | DS-deliberate + SP-flexible + ES-reactive |
| Regret avoidance | ES-reactive + DS-deliberate + RP-protective |
| Recency bias | DS-instinctive + IP-intuitive + TO-present |
| Sunk cost | RP-protective + SP-systematic + TO-present |
| Mental accounting | IP-intuitive + SP-flexible + TO-present |
| Narrative bias | IP-intuitive + SI-consensus + DS-instinctive |
| Myopic loss aversion | RP-low + TO-present + ES-reactive |
| Availability heuristic | IP-intuitive + DS-instinctive + SI-consensus |

---

## Implementation Plan

### Phase 1: New Data Model (Foundation)

**Files to create/modify:**

1. **`src/lib/dna-v2/factors.ts`** (~200 lines)
   - 8 primary factor definitions with codes, labels, poles, descriptions
   - 24 sub-factor definitions (3 per primary)
   - Factor spectrum types (0-100 scale)
   - TypeScript types for the new model

2. **`src/lib/dna-v2/triads.ts`** (~400-600 lines)
   - 40-46 forced choice triads
   - Each triad: 3 items, each tagged to a factor + pole
   - Social desirability ratings per item (for SDI calculation)
   - Contradiction pair mappings
   - Item randomization seed support (presentation order varies per user)

3. **`src/lib/dna-v2/types.ts`** (~100 lines)
   - TriadItem, Triad, TriadResponse, FactorScore, SubFactorScore
   - DNAProfileV2 interface (replaces DNAProfile)
   - ResponseTiming type (carried over from V1)

**What to validate:** Every factor appears in at least 10 triads. No two triads have the same 3-factor combination. Social desirability is balanced within each triad.

### Phase 2: New Scoring Engine

**Files to create/modify:**

4. **`src/lib/dna-v2/scoring.ts`** (~400 lines)
   - Ipsative scoring: +2 (most), 0 (middle), -1 (least) per triad
   - Raw score accumulation per factor
   - Normalization: raw scores -> 0-100 per factor
   - Sub-factor scoring: derive from triad-level data based on which specific items were chosen
   - Confidence scoring: per-factor variance across triad appearances
   - Social Desirability Index calculation
   - Contradiction detection (flagged pairs)

5. **`src/lib/dna-v2/bias-detection.ts`** (~250 lines)
   - Factor-profile-based bias detection (replaces per-question bias flags)
   - 16 bias detectors rewritten for 8-factor model
   - Severity calculation from factor combinations
   - Market mood computation (updated for 8 factors)
   - Behavior flags (kept from V1 but derived from new factors)

6. **`src/lib/dna-v2/archetypes.ts`** (~300 lines)
   - 10 archetype classification rules rewritten for 8-factor space
   - Primary + secondary archetype selection
   - Archetype info (name, tagline, description, communication rule) — kept from V1
   - Dimensional distance scoring for archetype matching

### Phase 3: Quiz UI Overhaul

**Files to modify:**

7. **`src/app/personality/page.tsx`** (~400 lines, rewrite)
   - New interaction pattern: show 3 words/phrases, user picks "Most" and "Least"
   - Two-tap flow: first tap = "Most Like Me" (green highlight), second tap = "Least Like Me" (red highlight), unchosen = neutral
   - Progress bar: X of 40-46
   - Triad transitions with subtle animations
   - Response timing captured per triad (start time to both selections)
   - Keyboard shortcuts: 1/2/3 for "Most", then 1/2/3 for "Least"
   - Mobile: large tap targets, swipe optional
   - Show factor cluster transitions (like V1's cluster labels) to give context without revealing scoring

   **UX Flow:**
   ```
   [Header: "Which is MOST like you?"]

   [  Calculated  ]    [  Decisive  ]    [  Patient  ]

   User taps "Decisive" → it highlights green, header changes to "Which is LEAST like you?"

   [  Calculated  ]    [  Decisive  ]    [  Patient  ]
                          (green)

   User taps "Patient" → it highlights red, auto-advance to next triad

   [  Calculated  ]    [  Decisive  ]    [  Patient  ]
                          (green)           (red)
   ```

### Phase 4: Results Page Update

**Files to modify:**

8. **`src/app/personality/results/page.tsx`** (~800 lines, major update)
   - Radar chart: 5 spokes → 8 spokes (one per primary factor)
   - Sub-factor breakdown: expandable per primary factor showing 3 sub-scores
   - Archetype display: same structure, updated to reference 8-factor model
   - Bias flags: same display, updated detection logic underneath
   - New: Social Desirability Index warning (if SDI > threshold, show a "these results may not reflect your natural behavior" notice)
   - New: Confidence heat map (which factors are high-confidence vs uncertain)
   - New: Factor spectrum visualization (horizontal bar per factor showing where they fall between poles)

9. **`src/components/dna/radar-chart.tsx`** (~update)
   - Support 8 axes instead of 5
   - Label positions adjusted for 8-spoke layout

10. **`src/components/dna/profile-sections.tsx`** (~update)
    - 8 factor descriptions instead of 5
    - Sub-factor detail panels

### Phase 5: Integration Updates

**Files to modify:**

11. **`src/lib/dna-v2/storage.ts`** (~200 lines)
    - V2 profile storage (separate key from V1 to allow migration)
    - Migration function: if V1 profile exists but no V2, show "retake with improved assessment" prompt
    - Backward compat: V1 profiles still readable for comparison

12. **`src/lib/dna-v2/context.ts`** (~250 lines)
    - AI system prompt builder updated for 8-factor model
    - Richer behavioral overlays (24 sub-factors provide more specific coaching cues)
    - Stock-specific behavioral warnings based on broader factor profile

13. **`src/lib/dna-stock-matcher.ts`** (~update)
    - Matching algorithm updated for 8 factors
    - Better sector affinity based on broader behavioral profile

### Phase 6: Content Development

14. **Write all 40-46 triads** — This is the hardest part. Each triad needs:
    - 3 items that are roughly equally desirable
    - Each item tagged to a different factor + pole
    - Non-situational language (words/short phrases, not scenarios)
    - Investor-relevant but not jargon-heavy
    - Tested for cultural/gender neutrality

    **Process:**
    - Generate initial triad set (120-138 items across 8 factors)
    - Balance check: every factor appears 10-12 times
    - Desirability balance: rate each item 1-5 for social desirability, ensure triads are within 1 point of each other
    - Contradiction pairs: identify 8-10 pairs that test consistency
    - Pilot: test with 5-10 people, check completion time and response patterns

---

## File Structure (V2)

```
src/lib/dna-v2/
  factors.ts           (8 primary + 24 sub-factor definitions)
  triads.ts            (40-46 forced choice triads + items)
  types.ts             (TypeScript interfaces)
  scoring.ts           (Ipsative scoring engine)
  bias-detection.ts    (Factor-profile bias detection)
  archetypes.ts        (8-factor archetype classification)
  storage.ts           (Persistence + V1 migration)
  context.ts           (AI prompt builder for 8-factor model)
  index.ts             (Public API barrel export)

src/lib/
  financial-dna.ts     (KEPT — V1 questions, deprecated but readable)
  dna-scoring.ts       (KEPT — V1 scoring, deprecated but readable)
  dna-storage.ts       (KEPT — V1 storage, still used for migration)
  dna-context.ts       (REPLACED by dna-v2/context.ts)
  dna-stock-matcher.ts (UPDATED to use V2 factors)
```

The V1 files stay in place until V2 is fully validated. A feature flag (`USE_DNA_V2`) controls which system is active. Once V2 is validated, V1 files are removed.

---

## Migration Strategy

1. **Feature flag** — `USE_DNA_V2 = true` in env/config toggles the new system
2. **V1 profiles persist** — Users who took V1 keep their results until they retake
3. **Retake prompt** — On the personality page, V1 users see "We've upgraded our assessment — retake to get deeper insights"
4. **Results comparison** — Optional: show V1 vs V2 factor mapping so users can see how their profile evolved
5. **AI context** — Automatically uses whichever version the user has completed (V2 preferred)

---

## Risk and Open Questions

1. **Triad content quality** — The assessment is only as good as the triads. Poorly written items or obvious desirability imbalance will undermine the forced choice benefit. This is the highest-effort, highest-risk phase.

2. **Sub-factor reliability** — With ~12 appearances per primary factor, sub-factors (3 per primary) get ~4 data points each. That's marginal for reliability. Options:
   - Accept lower sub-factor confidence and display it transparently
   - Increase question count to 50+ (hurts completion time)
   - Use sub-factors as directional indicators, not precise scores

3. **Completion time** — 40-46 triads at ~15 seconds each = ~10-12 minutes. This is longer than V1 (which is ~7-8 minutes). The simpler format (words not sentences) should offset this, but monitor drop-off rates.

4. **8-factor radar chart readability** — 8 spokes is busier than 5. May need an alternative visualization (e.g., horizontal bar chart) alongside or instead of the radar.

5. **Backward compatibility** — The AI context builder, stock matcher, and action plan all need to work with both V1 and V2 profiles during migration. The feature flag approach handles this but adds temporary code complexity.

---

## Priority Order

| Priority | Phase | Effort | Dependency |
|----------|-------|--------|------------|
| P0 | Phase 1: Data model (factors, triads, types) | Medium | None |
| P0 | Phase 6: Write all triads (content) | High | Phase 1 types |
| P1 | Phase 2: Scoring engine | Medium | Phase 1 + Phase 6 |
| P1 | Phase 3: Quiz UI | Medium | Phase 1 types |
| P2 | Phase 4: Results page | Medium-High | Phase 2 scoring |
| P2 | Phase 5: Integration (storage, context, matcher) | Medium | Phase 2 scoring |

Phases 1 and 6 can be worked in parallel. Phase 2 and 3 can be worked in parallel once Phase 1 is done. Phase 4 and 5 depend on Phase 2.

---

## Success Criteria

- Assessment completion rate >= V1 (currently ~85%)
- Average completion time: 8-12 minutes
- Test-retest reliability: factor scores within +/-10 points on retake within 2 weeks
- Social Desirability Index: <30% of users flagged as "performing"
- All 10 archetypes still classifiable from 8-factor profiles
- All 16 biases still detectable from factor combinations
- AI coaching quality: subjectively equal or better than V1
- Stock matching: same or better alignment with user behavior
