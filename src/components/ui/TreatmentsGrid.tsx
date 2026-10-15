import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { TreatmentSlug } from "../../lib/contentSchema";
import { TREATMENT_ICONS, treatmentHref } from "../../lib/treatmentMeta";

interface Item {
  slug: TreatmentSlug;
  title: string;
  summary: string;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function TreatmentsGrid({ items }: { items: Item[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map(({ slug, title, summary }) => {
        const Icon = TREATMENT_ICONS[slug];
        return (
          <motion.a
            key={slug}
            href={treatmentHref(slug)}
            variants={item}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group flex flex-col rounded-2xl border border-primary/10 bg-white/60 p-8 shadow-sm shadow-primary/5 transition-colors hover:border-accent/50 hover:bg-white hover:shadow-lg hover:shadow-primary/10"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary transition-colors group-hover:bg-accent/15 group-hover:text-accent-dark">
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <h3 className="mt-6 font-serif text-xl font-semibold text-primary">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-primary/60">
              {summary}
            </p>
            <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-accent-dark">
              Ver conteúdos
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                strokeWidth={2}
              />
            </span>
          </motion.a>
        );
      })}
    </motion.div>
  );
}
