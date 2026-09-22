import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "../../lib/contact";

export default function WhatsAppButton() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
      whileHover="hover"
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary-dark shadow-lg shadow-primary/30 sm:bottom-8 sm:right-8"
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-accent"
        animate={{ scale: [1, 1.6], opacity: [0.55, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
      />

      <MessageCircle className="relative h-6 w-6" strokeWidth={2} />

      <motion.span
        variants={{
          hover: { opacity: 1, x: 0, pointerEvents: "auto" },
        }}
        initial={{ opacity: 0, x: 8, pointerEvents: "none" }}
        transition={{ duration: 0.2 }}
        className="absolute right-full mr-3 whitespace-nowrap rounded-full bg-primary-dark px-4 py-2 text-sm font-medium text-cream shadow-md"
      >
        Fale no WhatsApp
      </motion.span>
    </motion.a>
  );
}
