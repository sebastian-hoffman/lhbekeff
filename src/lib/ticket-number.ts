import type { TicketCategory } from "@/generated/prisma/enums";

const CATEGORY_PREFIX: Record<TicketCategory, string> = {
  ADULT: "A",
  MINOR: "M",
  FREE: "G",
};

const CATEGORY_LABEL: Record<TicketCategory, string> = {
  ADULT: "Adulto",
  MINOR: "Menor",
  FREE: "Niño",
};

const CATEGORY_LABEL_PLURAL: Record<TicketCategory, string> = {
  ADULT: "Adultos",
  MINOR: "Menores",
  FREE: "Niños",
};

/** Ej: formatTicketNumber("ADULT", 1) -> "A-0001" */
export function formatTicketNumber(category: TicketCategory, sequence: number): string {
  return `${CATEGORY_PREFIX[category]}-${String(sequence).padStart(4, "0")}`;
}

export function categoryLabel(category: TicketCategory): string {
  return CATEGORY_LABEL[category];
}

export function categoryLabelPlural(category: TicketCategory): string {
  return CATEGORY_LABEL_PLURAL[category];
}
