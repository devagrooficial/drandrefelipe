import type { LucideIcon } from "lucide-react";
import { site, TREATMENT_SLUGS, type SiteContent, type TreatmentSlug } from "./content";
import { TREATMENT_ICONS } from "./treatmentMeta";

export { treatmentHref } from "./treatmentMeta";

type TreatmentContent = SiteContent["treatments"]["items"][TreatmentSlug];
export type TreatmentVideo = TreatmentContent["videos"][number];

export interface Treatment extends TreatmentContent {
  slug: TreatmentSlug;
  icon: LucideIcon;
}

export const treatments: Treatment[] = TREATMENT_SLUGS.map((slug) => ({
  slug,
  icon: TREATMENT_ICONS[slug],
  ...site.treatments.items[slug],
}));

export const youtubeWatchUrl = ({ youtubeId, format }: TreatmentVideo) =>
  format === "vertical"
    ? `https://www.youtube.com/shorts/${youtubeId}`
    : `https://www.youtube.com/watch?v=${youtubeId}`;
