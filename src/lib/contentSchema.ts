import { z } from "astro/zod";

export const TREATMENT_SLUGS = [
  "dor-no-joelho",
  "dor-no-quadril",
  "dor-lombar-e-coluna",
  "dor-no-ombro",
  "tornozelo-e-pe",
  "alternativas-a-cirurgia",
] as const;
export type TreatmentSlug = (typeof TREATMENT_SLUGS)[number];

const text = (max: number) =>
  z.string().trim().min(1, "Campo obrigatório").max(max, `Máximo de ${max} caracteres`);

// Only paths the site itself serves: original assets or admin uploads.
export const IMAGE_PATH = /^\/(images|uploads)\/[\w.-]+\.(jpe?g|png|webp)$/i;
const image = z.strictObject({
  src: z.string().regex(IMAGE_PATH, "Imagem inválida"),
  alt: text(200),
});

export const YOUTUBE_ID = /^[\w-]{11}$/;

const treatmentVideo = z.strictObject({
  youtubeId: z.string().regex(YOUTUBE_ID, "ID do YouTube inválido"),
  title: text(160),
  description: text(2000),
  format: z.enum(["vertical", "horizontal"]),
});

const treatment = z.strictObject({
  title: text(80),
  summary: text(200),
  intro: text(800),
  videos: z.array(treatmentVideo).max(30),
});

export const sectionSchemas = {
  seo: z.strictObject({ title: text(120), description: text(300) }),
  contact: z.strictObject({
    whatsappNumber: z.string().regex(/^\d{12,13}$/, "Use só números, com 55 + DDD"),
    whatsappDisplay: text(40),
    whatsappMessage: text(300),
    addressLine: text(160),
    addressCity: text(80),
  }),
  hero: z.strictObject({
    eyebrow: text(80),
    title: text(160),
    text: text(600),
    primaryCta: text(40),
    secondaryCta: text(40),
  }),
  about: z.strictObject({
    eyebrow: text(80),
    title: text(160),
    text: text(1200),
    image,
    stats: z.array(z.strictObject({ value: text(20), label: text(60) })).length(3),
  }),
  clinic: z.strictObject({
    eyebrow: text(80),
    title: text(160),
    text: text(1200),
    photos: z.array(image).length(2),
  }),
  videos: z.strictObject({
    eyebrow: text(80),
    title: text(160),
    text: text(600),
    items: z
      .array(
        z.strictObject({
          title: text(160),
          youtubeId: z.union([z.literal(""), z.string().regex(YOUTUBE_ID, "ID do YouTube inválido")]),
        }),
      )
      .max(12),
  }),
  treatments: z.strictObject({
    eyebrow: text(80),
    title: text(160),
    text: text(600),
    items: z.strictObject(
      Object.fromEntries(TREATMENT_SLUGS.map((slug) => [slug, treatment])) as Record<
        TreatmentSlug,
        typeof treatment
      >,
    ),
  }),
  technology: z.strictObject({
    eyebrow: text(80),
    title: text(160),
    text: text(600),
    items: z.array(z.strictObject({ title: text(120), description: text(400) })).length(4),
  }),
  footer: z.strictObject({ text: text(400) }),
};

export type SectionKey = keyof typeof sectionSchemas;
export const SECTION_KEYS = Object.keys(sectionSchemas) as SectionKey[];

export const siteSchema = z.strictObject(sectionSchemas);
export type SiteContent = z.infer<typeof siteSchema>;

