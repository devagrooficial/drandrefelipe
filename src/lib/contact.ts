export const WHATSAPP_NUMBER = "5565999117723";
export const WHATSAPP_DISPLAY = "(65) 9 9911-7723";
export const WHATSAPP_MESSAGE = "Olá! Gostaria de agendar uma avaliação.";
export const whatsappUrl = (message = WHATSAPP_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
export const WHATSAPP_URL = whatsappUrl();

export const DOCTOR_NAME = "Dr. André Felipe Moura";
export const ADDRESS_LINE = "Av. Rússia, 302 - Santa Rosa";
export const ADDRESS_CITY = "Cuiabá - MT";
export const FULL_ADDRESS = `${ADDRESS_LINE}, ${ADDRESS_CITY}`;
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  FULL_ADDRESS,
)}`;

// Root-relative so the same links work from /tratamentos/* pages too.
export const NAV_LINKS: { label: string; href: string; treatmentsMenu?: boolean }[] = [
  { label: "Sobre", href: "/#sobre" },
  { label: "Clínica", href: "/#clinica" },
  { label: "Vídeos", href: "/#conteudo" },
  { label: "Tratamentos", href: "/#tratamentos", treatmentsMenu: true },
  { label: "Tecnologia", href: "/#tecnologia" },
  { label: "Contato", href: "/#contato" },
];
