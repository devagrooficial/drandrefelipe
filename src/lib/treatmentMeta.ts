import {
  Activity,
  Bone,
  Footprints,
  Move,
  PersonStanding,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { TreatmentSlug } from "./contentSchema";

// Kept free of site.json so hydrated islands can import it without bundling all site content.
export const TREATMENT_ICONS: Record<TreatmentSlug, LucideIcon> = {
  "dor-no-joelho": Bone,
  "dor-no-quadril": Activity,
  "dor-lombar-e-coluna": PersonStanding,
  "dor-no-ombro": Move,
  "tornozelo-e-pe": Footprints,
  "alternativas-a-cirurgia": ShieldCheck,
};

export const treatmentHref = (slug: string) => `/tratamentos/${slug}`;
