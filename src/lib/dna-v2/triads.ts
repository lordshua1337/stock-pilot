import type { Triad, TriadItem, FactorCode, FactorPole, SubFactorCode } from "./types";

export const TRIADS: readonly Triad[] = [
  // T01: IP high + DS high + TO high
  {
    id: "T01",
    items: [
      { id: "T01_A", text: "Data-driven", factor: "IP", pole: "high", subFactor: "IP_DA", desirability: 4 },
      { id: "T01_B", text: "Quick decisions", factor: "DS", pole: "high", subFactor: "DS_OR", desirability: 4 },
      { id: "T01_C", text: "Long-term focus", factor: "TO", pole: "high", subFactor: "TO_CA", desirability: 4 },
    ],
    contradictionPairId: "T22",
  },
  // T02: RP high + CN high + SI low
  {
    id: "T02",
    items: [
      { id: "T02_A", text: "Bold bets", factor: "RP", pole: "high", subFactor: "RP_VT", desirability: 4 },
      { id: "T02_B", text: "In control", factor: "CN", pole: "high", subFactor: "CN_AR", desirability: 4 },
      { id: "T02_C", text: "Own opinion", factor: "SI", pole: "low", subFactor: "SI_PS", desirability: 4 },
    ],
    contradictionPairId: "T35",
  },
  // T03: ES high + SP high + IP low
  {
    id: "T03",
    items: [
      { id: "T03_A", text: "Calm under pressure", factor: "ES", pole: "high", subFactor: "ES_SR", desirability: 5 },
      { id: "T03_B", text: "Structured approach", factor: "SP", pole: "high", subFactor: "SP_PD", desirability: 4 },
      { id: "T03_C", text: "Go by feel", factor: "IP", pole: "low", subFactor: "IP_NN", desirability: 3 },
    ],
  },
  // T04: DS low + TO low + RP low
  {
    id: "T04",
    items: [
      { id: "T04_A", text: "Think it over", factor: "DS", pole: "low", subFactor: "DS_AT", desirability: 4 },
      { id: "T04_B", text: "Live for now", factor: "TO", pole: "low", subFactor: "TO_PD", desirability: 3 },
      { id: "T04_C", text: "Play it safe", factor: "RP", pole: "low", subFactor: "RP_LS", desirability: 3 },
    ],
  },
  // T05: CN low + SI high + ES low
  {
    id: "T05",
    items: [
      { id: "T05_A", text: "Delegate willingly", factor: "CN", pole: "low", subFactor: "CN_DC", desirability: 3 },
      { id: "T05_B", text: "Seek advice", factor: "SI", pole: "high", subFactor: "SI_TR", desirability: 4 },
      { id: "T05_C", text: "Easily anxious", factor: "ES", pole: "low", subFactor: "ES_IC", desirability: 2 },
    ],
    contradictionPairId: "T41",
  },
  // T06: RP high + SP low + SI low
  {
    id: "T06",
    items: [
      { id: "T06_A", text: "Embrace volatility", factor: "RP", pole: "high", subFactor: "RP_AC", desirability: 4 },
      { id: "T06_B", text: "Flexible plans", factor: "SP", pole: "low", subFactor: "SP_RA", desirability: 3 },
      { id: "T06_C", text: "Contrarian streak", factor: "SI", pole: "low", subFactor: "SI_CC", desirability: 4 },
    ],
  },
  // T07: IP high + TO high + DS low
  {
    id: "T07",
    items: [
      { id: "T07_A", text: "Detail-oriented", factor: "IP", pole: "high", subFactor: "IP_SD", desirability: 4 },
      { id: "T07_B", text: "Build wealth slowly", factor: "TO", pole: "high", subFactor: "TO_CA", desirability: 4 },
      { id: "T07_C", text: "Cautious decisions", factor: "DS", pole: "low", subFactor: "DS_RF", desirability: 3 },
    ],
  },
  // T08: CN high + RP low + ES high
  {
    id: "T08",
    items: [
      { id: "T08_A", text: "Lead decisions", factor: "CN", pole: "high", subFactor: "CN_DC", desirability: 4 },
      { id: "T08_B", text: "Avoid losses", factor: "RP", pole: "low", subFactor: "RP_LS", desirability: 3 },
      { id: "T08_C", text: "Bounce back quickly", factor: "ES", pole: "high", subFactor: "ES_RS", desirability: 5 },
    ],
  },
  // T09: SI high + SP high + TO low
  {
    id: "T09",
    items: [
      { id: "T09_A", text: "Follow the crowd", factor: "SI", pole: "high", subFactor: "SI_PS", desirability: 3 },
      { id: "T09_B", text: "Stick to rules", factor: "SP", pole: "high", subFactor: "SP_RA", desirability: 4 },
      { id: "T09_C", text: "Immediate returns", factor: "TO", pole: "low", subFactor: "TO_GC", desirability: 3 },
    ],
  },
  // T10: DS high + ES low + IP low
  {
    id: "T10",
    items: [
      { id: "T10_A", text: "Jump on opportunities", factor: "DS", pole: "high", subFactor: "DS_OR", desirability: 4 },
      { id: "T10_B", text: "Stress when waiting", factor: "ES", pole: "low", subFactor: "ES_SR", desirability: 2 },
      { id: "T10_C", text: "Gut instinct", factor: "IP", pole: "low", subFactor: "IP_NN", desirability: 3 },
    ],
  },
  // T11: RP low + TO high + CN low
  {
    id: "T11",
    items: [
      { id: "T11_A", text: "Conservative portfolio", factor: "RP", pole: "low", subFactor: "RP_VT", desirability: 3 },
      { id: "T11_B", text: "Patient investor", factor: "TO", pole: "high", subFactor: "TO_PD", desirability: 4 },
      { id: "T11_C", text: "Trust advisors", factor: "CN", pole: "low", subFactor: "CN_TC", desirability: 4 },
    ],
  },
  // T12: IP high + ES high + RP high
  {
    id: "T12",
    items: [
      { id: "T12_A", text: "Analyze thoroughly", factor: "IP", pole: "high", subFactor: "IP_DA", desirability: 5 },
      { id: "T12_B", text: "Handle stress well", factor: "ES", pole: "high", subFactor: "ES_IC", desirability: 5 },
      { id: "T12_C", text: "Take calculated risks", factor: "RP", pole: "high", subFactor: "RP_AC", desirability: 4 },
    ],
    contradictionPairId: "T38",
  },
  // T13: SI low + DS low + TO low
  {
    id: "T13",
    items: [
      { id: "T13_A", text: "Ignore trends", factor: "SI", pole: "low", subFactor: "SI_TR", desirability: 3 },
      { id: "T13_B", text: "Thorough research", factor: "DS", pole: "low", subFactor: "DS_AT", desirability: 4 },
      { id: "T13_C", text: "Want quick wins", factor: "TO", pole: "low", subFactor: "TO_GC", desirability: 2 },
    ],
  },
  // T14: CN high + SI high + SP high
  {
    id: "T14",
    items: [
      { id: "T14_A", text: "Take charge", factor: "CN", pole: "high", subFactor: "CN_AR", desirability: 4 },
      { id: "T14_B", text: "Check with peers", factor: "SI", pole: "high", subFactor: "SI_PS", desirability: 3 },
      { id: "T14_C", text: "Detailed planning", factor: "SP", pole: "high", subFactor: "SP_PD", desirability: 4 },
    ],
  },
  // T15: ES low + RP low + IP low
  {
    id: "T15",
    items: [
      { id: "T15_A", text: "Panic sell", factor: "ES", pole: "low", subFactor: "ES_RS", desirability: 1 },
      { id: "T15_B", text: "Avoid big risks", factor: "RP", pole: "low", subFactor: "RP_AC", desirability: 2 },
      { id: "T15_C", text: "Simple preferences", factor: "IP", pole: "low", subFactor: "IP_SD", desirability: 2 },
    ],
  },
  // T16: DS high + SP high + IP high
  {
    id: "T16",
    items: [
      { id: "T16_A", text: "Act decisively", factor: "DS", pole: "high", subFactor: "DS_RF", desirability: 4 },
      { id: "T16_B", text: "Systematic execution", factor: "SP", pole: "high", subFactor: "SP_RD", desirability: 4 },
      { id: "T16_C", text: "Numbers-focused", factor: "IP", pole: "high", subFactor: "IP_NN", desirability: 4 },
    ],
  },
  // T17: TO high + SI low + ES high
  {
    id: "T17",
    items: [
      { id: "T17_A", text: "Plan 10+ years ahead", factor: "TO", pole: "high", subFactor: "TO_GC", desirability: 4 },
      { id: "T17_B", text: "Independent choice", factor: "SI", pole: "low", subFactor: "SI_CC", desirability: 4 },
      { id: "T17_C", text: "Stay composed", factor: "ES", pole: "high", subFactor: "ES_SR", desirability: 5 },
    ],
  },
  // T18: RP high + DS low + CN low
  {
    id: "T18",
    items: [
      { id: "T18_A", text: "Accept losses easily", factor: "RP", pole: "high", subFactor: "RP_LS", desirability: 3 },
      { id: "T18_B", text: "Mull it over", factor: "DS", pole: "low", subFactor: "DS_AT", desirability: 3 },
      { id: "T18_C", text: "Rely on others", factor: "CN", pole: "low", subFactor: "CN_AR", desirability: 3 },
    ],
  },
  // T19: IP low + TO low + RP high
  {
    id: "T19",
    items: [
      { id: "T19_A", text: "Keep it simple", factor: "IP", pole: "low", subFactor: "IP_NN", desirability: 3 },
      { id: "T19_B", text: "Seek short-term gains", factor: "TO", pole: "low", subFactor: "TO_CA", desirability: 2 },
      { id: "T19_C", text: "Swing for fences", factor: "RP", pole: "high", subFactor: "RP_VT", desirability: 3 },
    ],
  },
  // T20: SP low + SI low + ES low
  {
    id: "T20",
    items: [
      { id: "T20_A", text: "Go with the flow", factor: "SP", pole: "low", subFactor: "SP_RD", desirability: 2 },
      { id: "T20_B", text: "Tuned out", factor: "SI", pole: "low", subFactor: "SI_PS", desirability: 2 },
      { id: "T20_C", text: "Emotionally reactive", factor: "ES", pole: "low", subFactor: "ES_IC", desirability: 1 },
    ],
  },
  // T21: CN low + DS high + IP high
  {
    id: "T21",
    items: [
      { id: "T21_A", text: "Ask for help", factor: "CN", pole: "low", subFactor: "CN_DC", desirability: 3 },
      { id: "T21_B", text: "Quick judgment", factor: "DS", pole: "high", subFactor: "DS_OR", desirability: 4 },
      { id: "T21_C", text: "Research-heavy", factor: "IP", pole: "high", subFactor: "IP_DA", desirability: 4 },
    ],
  },
  // T22: IP low + DS low + TO low (contradiction with T01)
  {
    id: "T22",
    items: [
      { id: "T22_A", text: "Trust my feelings", factor: "IP", pole: "low", subFactor: "IP_NN", desirability: 3 },
      { id: "T22_B", text: "Sleep on decisions", factor: "DS", pole: "low", subFactor: "DS_RF", desirability: 4 },
      { id: "T22_C", text: "Enjoy the present", factor: "TO", pole: "low", subFactor: "TO_PD", desirability: 3 },
    ],
    contradictionPairId: "T01",
  },
  // T23: RP low + CN high + SI high
  {
    id: "T23",
    items: [
      { id: "T23_A", text: "Cautious approach", factor: "RP", pole: "low", subFactor: "RP_VT", desirability: 3 },
      { id: "T23_B", text: "Make the call", factor: "CN", pole: "high", subFactor: "CN_AR", desirability: 4 },
      { id: "T23_C", text: "Value others' views", factor: "SI", pole: "high", subFactor: "SI_TR", desirability: 4 },
    ],
  },
  // T24: ES high + IP high + SP low
  {
    id: "T24",
    items: [
      { id: "T24_A", text: "Unflappable", factor: "ES", pole: "high", subFactor: "ES_RS", desirability: 5 },
      { id: "T24_B", text: "Complex analysis", factor: "IP", pole: "high", subFactor: "IP_SD", desirability: 4 },
      { id: "T24_C", text: "Adapt on the fly", factor: "SP", pole: "low", subFactor: "SP_RD", desirability: 3 },
    ],
  },
  // T25: TO low + SI high + DS high
  {
    id: "T25",
    items: [
      { id: "T25_A", text: "Next quarter focus", factor: "TO", pole: "low", subFactor: "TO_GC", desirability: 2 },
      { id: "T25_B", text: "Follow popular picks", factor: "SI", pole: "high", subFactor: "SI_PS", desirability: 3 },
      { id: "T25_C", text: "Act fast", factor: "DS", pole: "high", subFactor: "DS_OR", desirability: 3 },
    ],
  },
  // T26: RP high + ES high + TO low
  {
    id: "T26",
    items: [
      { id: "T26_A", text: "Thrive on risk", factor: "RP", pole: "high", subFactor: "RP_AC", desirability: 4 },
      { id: "T26_B", text: "Cool under fire", factor: "ES", pole: "high", subFactor: "ES_SR", desirability: 5 },
      { id: "T26_C", text: "Quick profit motive", factor: "TO", pole: "low", subFactor: "TO_CA", desirability: 2 },
    ],
  },
  // T27: IP low + CN low + RP low
  {
    id: "T27",
    items: [
      { id: "T27_A", text: "Follow advice", factor: "IP", pole: "low", subFactor: "IP_NN", desirability: 2 },
      { id: "T27_B", text: "Others decide", factor: "CN", pole: "low", subFactor: "CN_TC", desirability: 2 },
      { id: "T27_C", text: "Minimize losses", factor: "RP", pole: "low", subFactor: "RP_LS", desirability: 3 },
    ],
  },
  // T28: RP low + CN low + SI low (contradiction with T02)
  {
    id: "T28",
    items: [
      { id: "T28_A", text: "Stay secure", factor: "RP", pole: "low", subFactor: "RP_VT", desirability: 3 },
      { id: "T28_B", text: "Others lead", factor: "CN", pole: "low", subFactor: "CN_AR", desirability: 2 },
      { id: "T28_C", text: "Peer influence weak", factor: "SI", pole: "low", subFactor: "SI_TR", desirability: 3 },
    ],
    contradictionPairId: "T02",
  },
  // T29: DS low + ES high + SP high
  {
    id: "T29",
    items: [
      { id: "T29_A", text: "Methodical", factor: "DS", pole: "low", subFactor: "DS_AT", desirability: 4 },
      { id: "T29_B", text: "Poised", factor: "ES", pole: "high", subFactor: "ES_IC", desirability: 5 },
      { id: "T29_C", text: "Organized", factor: "SP", pole: "high", subFactor: "SP_RD", desirability: 4 },
    ],
  },
  // T30: TO high + RP low + SI high
  {
    id: "T30",
    items: [
      { id: "T30_A", text: "30-year vision", factor: "TO", pole: "high", subFactor: "TO_PD", desirability: 4 },
      { id: "T30_B", text: "Avoid big swings", factor: "RP", pole: "low", subFactor: "RP_AC", desirability: 3 },
      { id: "T30_C", text: "Consensus-builder", factor: "SI", pole: "high", subFactor: "SI_CC", desirability: 3 },
    ],
  },
  // T31: CN high + DS low + IP low
  {
    id: "T31",
    items: [
      { id: "T31_A", text: "Call the shots", factor: "CN", pole: "high", subFactor: "CN_DC", desirability: 4 },
      { id: "T31_B", text: "Careful study", factor: "DS", pole: "low", subFactor: "DS_RF", desirability: 3 },
      { id: "T31_C", text: "Intuitive choice", factor: "IP", pole: "low", subFactor: "IP_DA", desirability: 2 },
    ],
  },
  // T32: ES low + SP low + IP high
  {
    id: "T32",
    items: [
      { id: "T32_A", text: "Nerves show", factor: "ES", pole: "low", subFactor: "ES_RS", desirability: 2 },
      { id: "T32_B", text: "Change course easily", factor: "SP", pole: "low", subFactor: "SP_RA", desirability: 2 },
      { id: "T32_C", text: "Dive into data", factor: "IP", pole: "high", subFactor: "IP_SD", desirability: 4 },
    ],
  },
  // T33: SI low + TO high + IP high
  {
    id: "T33",
    items: [
      { id: "T33_A", text: "Ignore peer pressure", factor: "SI", pole: "low", subFactor: "SI_PS", desirability: 4 },
      { id: "T33_B", text: "Wealth building", factor: "TO", pole: "high", subFactor: "TO_CA", desirability: 5 },
      { id: "T33_C", text: "Track everything", factor: "IP", pole: "high", subFactor: "IP_NN", desirability: 4 },
    ],
  },
  // T34: RP high + SI high + ES low
  {
    id: "T34",
    items: [
      { id: "T34_A", text: "High stakes", factor: "RP", pole: "high", subFactor: "RP_VT", desirability: 4 },
      { id: "T34_B", text: "Popular stocks", factor: "SI", pole: "high", subFactor: "SI_TR", desirability: 3 },
      { id: "T34_C", text: "Easily rattled", factor: "ES", pole: "low", subFactor: "ES_SR", desirability: 2 },
    ],
  },
  // T35: RP low + CN low + SI high (contradiction with T02)
  {
    id: "T35",
    items: [
      { id: "T35_A", text: "Protective stance", factor: "RP", pole: "low", subFactor: "RP_LS", desirability: 3 },
      { id: "T35_B", text: "Share decisions", factor: "CN", pole: "low", subFactor: "CN_TC", desirability: 3 },
      { id: "T35_C", text: "Groupthink tendency", factor: "SI", pole: "high", subFactor: "SI_PS", desirability: 2 },
    ],
    contradictionPairId: "T02",
  },
  // T36: IP high + SI low + ES high
  {
    id: "T36",
    items: [
      { id: "T36_A", text: "Numbers tell truth", factor: "IP", pole: "high", subFactor: "IP_DA", desirability: 4 },
      { id: "T36_B", text: "Buck the trend", factor: "SI", pole: "low", subFactor: "SI_CC", desirability: 4 },
      { id: "T36_C", text: "Never panic", factor: "ES", pole: "high", subFactor: "ES_IC", desirability: 5 },
    ],
  },
  // T37: DS high + CN high + TO high
  {
    id: "T37",
    items: [
      { id: "T37_A", text: "Seize chances", factor: "DS", pole: "high", subFactor: "DS_OR", desirability: 4 },
      { id: "T37_B", text: "Lead portfolio", factor: "CN", pole: "high", subFactor: "CN_AR", desirability: 4 },
      { id: "T37_C", text: "Long vision", factor: "TO", pole: "high", subFactor: "TO_GC", desirability: 4 },
    ],
  },
  // T38: IP low + ES low + RP low (contradiction with T12)
  {
    id: "T38",
    items: [
      { id: "T38_A", text: "Avoid complexity", factor: "IP", pole: "low", subFactor: "IP_DA", desirability: 2 },
      { id: "T38_B", text: "Stress-prone", factor: "ES", pole: "low", subFactor: "ES_IC", desirability: 1 },
      { id: "T38_C", text: "Aversion to risk", factor: "RP", pole: "low", subFactor: "RP_AC", desirability: 2 },
    ],
    contradictionPairId: "T12",
  },
  // T39: SI high + RP high + TO low
  {
    id: "T39",
    items: [
      { id: "T39_A", text: "Hot stock picks", factor: "SI", pole: "high", subFactor: "SI_TR", desirability: 3 },
      { id: "T39_B", text: "Trade actively", factor: "RP", pole: "high", subFactor: "RP_VT", desirability: 3 },
      { id: "T39_C", text: "Quarterly goals", factor: "TO", pole: "low", subFactor: "TO_CA", desirability: 2 },
    ],
  },
  // T40: SP low + DS low + CN high
  {
    id: "T40",
    items: [
      { id: "T40_A", text: "Improvise", factor: "SP", pole: "low", subFactor: "SP_PD", desirability: 2 },
      { id: "T40_B", text: "Deliberate", factor: "DS", pole: "low", subFactor: "DS_AT", desirability: 3 },
      { id: "T40_C", text: "Authority matters", factor: "CN", pole: "high", subFactor: "CN_DC", desirability: 4 },
    ],
  },
  // T41: CN high + SI low + ES high (contradiction with T05)
  {
    id: "T41",
    items: [
      { id: "T41_A", text: "Own authority", factor: "CN", pole: "high", subFactor: "CN_TC", desirability: 4 },
      { id: "T41_B", text: "Ignore hype", factor: "SI", pole: "low", subFactor: "SI_TR", desirability: 4 },
      { id: "T41_C", text: "Steady nerve", factor: "ES", pole: "high", subFactor: "ES_SR", desirability: 5 },
    ],
    contradictionPairId: "T05",
  },
  // T42: RP low + DS high + SP high
  {
    id: "T42",
    items: [
      { id: "T42_A", text: "Risk-averse", factor: "RP", pole: "low", subFactor: "RP_LS", desirability: 3 },
      { id: "T42_B", text: "Execute swiftly", factor: "DS", pole: "high", subFactor: "DS_RF", desirability: 4 },
      { id: "T42_C", text: "Check all boxes", factor: "SP", pole: "high", subFactor: "SP_RD", desirability: 4 },
    ],
  },
  // T43: TO low + IP low + CN low
  {
    id: "T43",
    items: [
      { id: "T43_A", text: "Want it now", factor: "TO", pole: "low", subFactor: "TO_PD", desirability: 2 },
      { id: "T43_B", text: "Simple rules", factor: "IP", pole: "low", subFactor: "IP_NN", desirability: 2 },
      { id: "T43_C", text: "Go along", factor: "CN", pole: "low", subFactor: "CN_AR", desirability: 2 },
    ],
  },
  // T44: ES high + RP high + IP high
  {
    id: "T44",
    items: [
      { id: "T44_A", text: "Resilient", factor: "ES", pole: "high", subFactor: "ES_RS", desirability: 5 },
      { id: "T44_B", text: "Accept losses", factor: "RP", pole: "high", subFactor: "RP_LS", desirability: 4 },
      { id: "T44_C", text: "Evidence-based", factor: "IP", pole: "high", subFactor: "IP_DA", desirability: 5 },
    ],
  },
];

export const TRIAD_MAP: Record<string, Triad> = Object.fromEntries(
  TRIADS.map((triad) => [triad.id, triad])
);

export const CONTRADICTION_PAIRS: readonly [string, string][] = [
  ["T01", "T22"],
  ["T02", "T35"],
  ["T05", "T41"],
  ["T12", "T38"],
];

export function getFactorAppearances(): Record<FactorCode, number> {
  const appearances: Record<FactorCode, number> = {
    RP: 0,
    DS: 0,
    CN: 0,
    TO: 0,
    SI: 0,
    ES: 0,
    SP: 0,
    IP: 0,
  };

  for (const triad of TRIADS) {
    for (const item of triad.items) {
      appearances[item.factor]++;
    }
  }

  return appearances;
}
