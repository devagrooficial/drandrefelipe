import raw from "../data/site.json";
import { siteSchema, type SiteContent } from "./contentSchema";

export * from "./contentSchema";

// Parsed at build time: a malformed site.json fails the build instead of shipping a broken page.
export const site: SiteContent = siteSchema.parse(raw);
