export const WHATSAPP_NUMBER = "5565992002352";
export const WHATSAPP_DISPLAY = "(65) 9 9200-2352";
export const WHATSAPP_MESSAGE = "Olá! Gostaria de agendar uma avaliação.";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`;

export const DOCTOR_NAME = "Dr. André Felipe Moura";
export const ADDRESS_LINE = "Av. Rússia, 302 - Santa Rosa";
export const ADDRESS_CITY = "Cuiabá - MT";
export const FULL_ADDRESS = `${ADDRESS_LINE}, ${ADDRESS_CITY}`;
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  FULL_ADDRESS,
)}`;

export const NAV_LINKS = [
  { label: "Sobre", href: "#sobre" },
  { label: "Vídeos", href: "#conteudo" },
  { label: "Tratamentos", href: "#tratamentos" },
  { label: "Tecnologia", href: "#tecnologia" },
  { label: "Contato", href: "#contato" },
];
