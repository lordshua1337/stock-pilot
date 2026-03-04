// URL slug <-> ArchetypeKey mapping for /invest/[archetype] routes

import type { ArchetypeKey } from "./financial-dna";

const SLUG_MAP: Record<string, ArchetypeKey> = {
  "money-architect": "systems_builder",
  "steady-hand": "reassurance_seeker",
  "market-surgeon": "analytical_skeptic",
  "lone-wolf": "diy_controller",
  "war-room-strategist": "collaborative_partner",
  "marathon-capitalist": "big_picture_optimist",
  "wave-rider": "trend_sensitive_explorer",
  "vault-keeper": "avoider_under_stress",
  "first-mover": "action_first_decider",
  "legacy-builder": "values_anchored_steward",
};

const REVERSE_MAP: Record<ArchetypeKey, string> = Object.fromEntries(
  Object.entries(SLUG_MAP).map(([slug, key]) => [key, slug])
) as Record<ArchetypeKey, string>;

export function slugToArchetype(slug: string): ArchetypeKey | null {
  return SLUG_MAP[slug] ?? null;
}

export function archetypeToSlug(key: ArchetypeKey): string {
  return REVERSE_MAP[key];
}

export function getAllSlugs(): string[] {
  return Object.keys(SLUG_MAP);
}

export function getAllArchetypeKeys(): ArchetypeKey[] {
  return Object.values(SLUG_MAP);
}
