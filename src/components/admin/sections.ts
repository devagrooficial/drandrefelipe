import type { SectionKey } from "../../lib/contentSchema";

export type Field =
  | { type: "text"; key: string; label: string; help?: string }
  | { type: "textarea"; key: string; label: string; help?: string; rows?: number }
  // key "" = the item itself (lists of images)
  | { type: "image"; key: string; label: string; help?: string }
  | { type: "youtube"; key: string; label: string; help?: string; optional?: boolean }
  | { type: "select"; key: string; label: string; options: { value: string; label: string }[] }
  | {
      type: "list";
      key: string;
      label: string;
      help?: string;
      itemTitle: (item: any, index: number) => string;
      fields: Field[];
      // Omitted = fixed number of items (no add/remove/reorder).
      newItem?: () => unknown;
      addLabel?: string;
    }
  | {
      type: "record";
      key: string;
      label: string;
      itemTitle: (item: any) => string;
      fields: Field[];
    };

export interface SectionConfig {
  key: SectionKey;
  label: string;
  description: string;
  siteAnchor: string;
  fields: Field[];
}

const header = (titleRows = 2): Field[] => [
  { type: "text", key: "eyebrow", label: "Chamada", help: "Texto pequeno, em destaque, acima do título." },
  { type: "textarea", key: "title", label: "Título", rows: titleRows },
  { type: "textarea", key: "text", label: "Texto", rows: 4 },
];

export const SECTIONS: SectionConfig[] = [
  {
    key: "hero",
    label: "Banner principal",
    description: "Primeira tela do site, ao lado do vídeo do joelho.",
    siteAnchor: "/#top",
    fields: [
      ...header(),
      { type: "text", key: "primaryCta", label: "Botão principal", help: "Abre o WhatsApp." },
      { type: "text", key: "secondaryCta", label: "Botão secundário", help: "Leva para Tratamentos." },
    ],
  },
  {
    key: "about",
    label: "Sobre",
    description: "Apresentação do Dr. André, com foto e destaques.",
    siteAnchor: "/#sobre",
    fields: [
      ...header(),
      { type: "image", key: "image", label: "Foto do doutor", help: "Formato retrato funciona melhor (ex.: 4:5)." },
      {
        type: "list",
        key: "stats",
        label: "Destaques",
        itemTitle: (_item, index) => `Destaque ${index + 1}`,
        fields: [
          { type: "text", key: "value", label: "Número / palavra", help: "Ex.: 10+, 100%, Cuiabá" },
          { type: "text", key: "label", label: "Legenda" },
        ],
      },
    ],
  },
  {
    key: "clinic",
    label: "Clínica",
    description: "Texto e as duas fotos da clínica.",
    siteAnchor: "/#clinica",
    fields: [
      ...header(),
      {
        type: "list",
        key: "photos",
        label: "Fotos",
        itemTitle: (_item, index) => `Foto ${index + 1}`,
        fields: [{ type: "image", key: "", label: "Imagem", help: "Formato paisagem (4:3) funciona melhor." }],
      },
    ],
  },
  {
    key: "videos",
    label: "Vídeos (início)",
    description: "Vídeos curtos exibidos na página inicial.",
    siteAnchor: "/#conteudo",
    fields: [
      ...header(),
      {
        type: "list",
        key: "items",
        label: "Vídeos",
        itemTitle: (item, index) => item.title || `Vídeo ${index + 1}`,
        newItem: () => ({ title: "", youtubeId: "" }),
        addLabel: "Adicionar vídeo",
        fields: [
          { type: "text", key: "title", label: "Título" },
          {
            type: "youtube",
            key: "youtubeId",
            label: "Link do YouTube",
            optional: true,
            help: "Deixe vazio para mostrar um card de “Em breve”.",
          },
        ],
      },
    ],
  },
  {
    key: "treatments",
    label: "Tratamentos",
    description: "Cards da página inicial e as páginas de cada tratamento, com seus vídeos.",
    siteAnchor: "/#tratamentos",
    fields: [
      ...header(),
      {
        type: "record",
        key: "items",
        label: "Páginas de tratamento",
        itemTitle: (item) => item.title,
        fields: [
          { type: "text", key: "title", label: "Nome" },
          { type: "text", key: "summary", label: "Resumo", help: "Aparece no menu e nos cards da página inicial." },
          { type: "textarea", key: "intro", label: "Introdução da página", rows: 4 },
          {
            type: "list",
            key: "videos",
            label: "Vídeos da página",
            itemTitle: (item, index) => item.title || `Vídeo ${index + 1}`,
            newItem: () => ({ youtubeId: "", title: "", description: "", format: "vertical" }),
            addLabel: "Adicionar vídeo",
            fields: [
              { type: "youtube", key: "youtubeId", label: "Link do YouTube", help: "Vídeo normal ou Shorts." },
              {
                type: "select",
                key: "format",
                label: "Formato",
                options: [
                  { value: "vertical", label: "Vertical (Shorts, 9:16)" },
                  { value: "horizontal", label: "Horizontal (vídeo normal, 16:9)" },
                ],
              },
              { type: "text", key: "title", label: "Título" },
              {
                type: "textarea",
                key: "description",
                label: "Descrição",
                rows: 5,
                help: "Para separar parágrafos, deixe uma linha em branco entre eles.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "technology",
    label: "Tecnologia",
    description: "Equipamentos e técnicas (os ícones são fixos).",
    siteAnchor: "/#tecnologia",
    fields: [
      ...header(),
      {
        type: "list",
        key: "items",
        label: "Itens",
        itemTitle: (item, index) => item.title || `Item ${index + 1}`,
        fields: [
          { type: "text", key: "title", label: "Título" },
          { type: "textarea", key: "description", label: "Descrição", rows: 3 },
        ],
      },
    ],
  },
  {
    key: "contact",
    label: "Contato",
    description: "WhatsApp e endereço usados em todo o site.",
    siteAnchor: "/#contato",
    fields: [
      {
        type: "text",
        key: "whatsappNumber",
        label: "Número do WhatsApp",
        help: "Só números: 55 + DDD + número. Ex.: 5565999117723",
      },
      { type: "text", key: "whatsappDisplay", label: "Número como aparece no site", help: "Ex.: (65) 9 9911-7723" },
      { type: "textarea", key: "whatsappMessage", label: "Mensagem inicial do WhatsApp", rows: 2 },
      { type: "text", key: "addressLine", label: "Endereço" },
      { type: "text", key: "addressCity", label: "Cidade / UF" },
    ],
  },
  {
    key: "footer",
    label: "Rodapé",
    description: "Texto de apresentação no rodapé.",
    siteAnchor: "/#contato",
    fields: [{ type: "textarea", key: "text", label: "Texto", rows: 3 }],
  },
  {
    key: "seo",
    label: "Google (SEO)",
    description: "Como a página inicial aparece no Google e na aba do navegador.",
    siteAnchor: "/",
    fields: [
      { type: "text", key: "title", label: "Título da página" },
      {
        type: "textarea",
        key: "description",
        label: "Descrição",
        rows: 3,
        help: "Resumo exibido no Google. O ideal é até ~160 caracteres.",
      },
    ],
  },
];

export const SECTION_LABELS = Object.fromEntries(SECTIONS.map((s) => [s.key, s.label])) as Record<
  SectionKey,
  string
>;
