// Archetype accent colors -- shared across all DNA components
// Each of the 10 archetypes gets a unique color for hero cards, charts, PDFs

import type { ArchetypeKey } from "@/lib/financial-dna";

export const ARCHETYPE_COLORS: Record<ArchetypeKey, string> = {
  systems_builder: "#448AFF",
  reassurance_seeker: "#E040FB",
  analytical_skeptic: "#40C4FF",
  diy_controller: "#FF6E40",
  collaborative_partner: "#00C853",
  big_picture_optimist: "#69F0AE",
  trend_sensitive_explorer: "#FFD740",
  avoider_under_stress: "#FF5252",
  action_first_decider: "#FF8A65",
  values_anchored_steward: "#82B1FF",
};

// Archetype icons -- mapped from lucide icon names
// Used in hero card and PDF cover
export const ARCHETYPE_ICONS: Record<ArchetypeKey, string> = {
  systems_builder: "Cpu",
  reassurance_seeker: "ShieldCheck",
  analytical_skeptic: "Search",
  diy_controller: "Wrench",
  collaborative_partner: "Users",
  big_picture_optimist: "Telescope",
  trend_sensitive_explorer: "TrendingUp",
  avoider_under_stress: "Pause",
  action_first_decider: "Zap",
  values_anchored_steward: "Heart",
};
