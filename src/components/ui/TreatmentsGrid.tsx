import { motion, type Variants } from "framer-motion";
import {
  Bone,
  Activity,
  PersonStanding,
  Move,
  Footprints,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

interface Treatment {
  title: string;
  icon: LucideIcon;
}

const treatments: Treatment[] = [
  { title: "Dor no joelho", icon: Bone },
  { title: "Dor no quadril", icon: Activity },
  { title: "Dor lombar e coluna", icon: PersonStanding },
  { title: "Dor no ombro", icon: Move },
  { title: "Tornozelo e pé", icon: Footprints },
  { title: "Alternativas à cirurgia", icon: ShieldCheck },
];

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

export default function TreatmentsGrid() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {treatments.map(({ title, icon: Icon }) => (
        <motion.div
          key={title}
          variants={item}
          whileHover={{ y: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="group rounded-2xl border border-primary/10 bg-white/60 p-8 shadow-sm shadow-primary/5 transition-colors hover:border-accent/50 hover:bg-white hover:shadow-lg hover:shadow-primary/10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary transition-colors group-hover:bg-accent/15 group-hover:text-accent-dark">
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <h3 className="mt-6 font-serif text-xl font-semibold text-primary">
            {title}
          </h3>
        </motion.div>
      ))}
    </motion.div>
  );
}
