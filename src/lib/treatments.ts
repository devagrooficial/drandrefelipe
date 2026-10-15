import {
  Activity,
  Bone,
  Footprints,
  Move,
  PersonStanding,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface TreatmentVideo {
  youtubeId: string;
  title: string;
  // Separate paragraphs with a blank line.
  description: string;
  // "vertical" = YouTube Shorts (9:16), "horizontal" = regular video (16:9).
  format: "vertical" | "horizontal";
}

export interface Treatment {
  slug: string;
  title: string;
  icon: LucideIcon;
  summary: string;
  intro: string;
  videos: TreatmentVideo[];
}

export const treatments: Treatment[] = [
  {
    slug: "dor-no-joelho",
    title: "Dor no joelho",
    icon: Bone,
    summary: "Artrose, lesões de menisco e ligamentos, dor ao treinar.",
    intro:
      "O joelho concentra boa parte das queixas ortopédicas — do desgaste da cartilagem às lesões do esporte. Nos vídeos abaixo, o Dr. André explica causas, sinais de alerta e os caminhos de tratamento, incluindo as opções regenerativas.",
    videos: [
      {
        youtubeId: "H857GbsiHVA",
        title: "Dor no joelho durante o treino",
        description:
          "Sentir dor no joelho durante o treino não é algo para ignorar. Entenda quando esse sinal merece atenção e por que um diagnóstico cedo faz diferença na recuperação.",
        format: "vertical",
      },
    ],
  },
  {
    slug: "dor-no-quadril",
    title: "Dor no quadril",
    icon: Activity,
    summary: "Artrose, bursite e dor ao caminhar ou subir escadas.",
    intro:
      "Dor na virilha, na lateral do quadril ou ao levantar da cadeira pode ter origens diferentes — na articulação, nos tendões ou nas bursas. Aqui você entende cada uma delas e como o tratamento é conduzido.",
    videos: [],
  },
  {
    slug: "dor-lombar-e-coluna",
    title: "Dor lombar e coluna",
    icon: PersonStanding,
    summary: "Lombalgia, hérnia de disco e dor que irradia para as pernas.",
    intro:
      "A dor lombar é uma das queixas mais comuns no consultório e, muitas vezes, pode ser tratada sem cirurgia. Conheça as causas mais frequentes e quando é preciso investigar mais a fundo.",
    videos: [],
  },
  {
    slug: "dor-no-ombro",
    title: "Dor no ombro",
    icon: Move,
    summary: "Tendinites, lesões do manguito rotador e ombro travado.",
    intro:
      "Dor para levantar o braço, para dormir sobre o ombro ou para treinar costuma envolver os tendões do manguito rotador. Veja como o problema é identificado e quais tratamentos existem.",
    videos: [],
  },
  {
    slug: "tornozelo-e-pe",
    title: "Tornozelo e pé",
    icon: Footprints,
    summary: "Entorses, fascite plantar e dor no calcanhar.",
    intro:
      "Entorses que não cicatrizaram bem, dor no calcanhar ao acordar e sobrecarga nos pés afetam a rotina inteira. Entenda as causas e as opções de tratamento para voltar a pisar sem dor.",
    videos: [],
  },
  {
    slug: "alternativas-a-cirurgia",
    title: "Alternativas à cirurgia",
    icon: ShieldCheck,
    summary: "Medicina regenerativa e terapias que podem evitar ou adiar a cirurgia.",
    intro:
      "Nem toda lesão precisa de cirurgia. A medicina regenerativa e as terapias guiadas por imagem usam o potencial do próprio corpo para tratar dor e lesões — sempre com indicação individualizada.",
    videos: [
      {
        youtubeId: "OgjC55HUY10",
        title: "O poder da medicina regenerativa",
        description:
          "Como os tratamentos regenerativos usam recursos do próprio paciente para estimular a recuperação de tecidos lesionados.",
        format: "vertical",
      },
      {
        youtubeId: "wGq1r1rEicg",
        title: "Medicina regenerativa pode substituir a cirurgia?",
        description:
          "Quando a medicina regenerativa entra como alternativa à cirurgia — e como essa indicação é avaliada caso a caso.",
        format: "vertical",
      },
    ],
  },
];

export const treatmentHref = (slug: string) => `/tratamentos/${slug}`;

export const youtubeWatchUrl = ({ youtubeId, format }: TreatmentVideo) =>
  format === "vertical"
    ? `https://www.youtube.com/shorts/${youtubeId}`
    : `https://www.youtube.com/watch?v=${youtubeId}`;
