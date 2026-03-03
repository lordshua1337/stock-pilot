import {
  Building2,
  Anchor,
  Microscope,
  Crosshair,
  Swords,
  Timer,
  Waves,
  Lock,
  Zap,
  Crown,
  Shield,
} from "lucide-react";
import type { ArchetypeKey } from "@/lib/financial-dna";

export const ARCHETYPE_ICON_MAP: Record<ArchetypeKey, React.ReactNode> = {
  systems_builder: <Building2 className="w-6 h-6" />,
  reassurance_seeker: <Anchor className="w-6 h-6" />,
  analytical_skeptic: <Microscope className="w-6 h-6" />,
  diy_controller: <Crosshair className="w-6 h-6" />,
  collaborative_partner: <Swords className="w-6 h-6" />,
  big_picture_optimist: <Timer className="w-6 h-6" />,
  trend_sensitive_explorer: <Waves className="w-6 h-6" />,
  avoider_under_stress: <Lock className="w-6 h-6" />,
  action_first_decider: <Zap className="w-6 h-6" />,
  values_anchored_steward: <Crown className="w-6 h-6" />,
};
