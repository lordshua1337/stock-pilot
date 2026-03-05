// V2 -> V1 compatibility helpers
// Convert V2 factor scores to approximate V1 CoreDimensions for stock matching

import type { CoreDimensions } from "@/lib/financial-dna";
import type { StoredDNAProfileV2 } from "./storage";

export function v2ToDimensions(v2: StoredDNAProfileV2): CoreDimensions {
  const f = v2.factors.primary;
  return {
    R: f.RP?.normalized ?? 50,
    C: f.CN?.normalized ?? 50,
    H: f.TO?.normalized ?? 50,
    D: Math.round(((f.SP?.normalized ?? 50) + (f.DS?.normalized ?? 50)) / 2),
    E: f.ES?.normalized ?? 50,
  };
}
