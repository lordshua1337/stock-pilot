// Archetype accent colors -- shared across all DNA components
// Each of the 10 archetypes gets a unique color for hero cards, charts, PDFs

import type { ArchetypeKey } from "@/lib/financial-dna";

export const ARCHETYPE_COLORS: Record<ArchetypeKey, string> = {
  systems_builder: "#448AFF",
  reassurance_seeker: "#E040FB",
  analytical_skeptic: "#40C4FF",
  diy_controller: "#FF6E40",
  collaborative_partner: "#006DD8",
  big_picture_optimist: "#0058B0",
  trend_sensitive_explorer: "#FFD740",
  avoider_under_stress: "#FF5252",
  action_first_decider: "#FF8A65",
  values_anchored_steward: "#82B1FF",
};

// Archetype icons -- mapped from lucide icon names
// Used in hero card and PDF cover
export const ARCHETYPE_ICONS: Record<ArchetypeKey, string> = {
  systems_builder: "Building2",
  reassurance_seeker: "Anchor",
  analytical_skeptic: "Microscope",
  diy_controller: "Crosshair",
  collaborative_partner: "Swords",
  big_picture_optimist: "Timer",
  trend_sensitive_explorer: "Waves",
  avoider_under_stress: "Lock",
  action_first_decider: "Zap",
  values_anchored_steward: "Crown",
};
