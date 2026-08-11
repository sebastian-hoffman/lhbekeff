import type { TicketCategory } from "@/generated/prisma/enums";

/**
 * Subconjunto público de `Event`: lo único que necesita el flujo de compra
 * y la landing. Evita pasarle a componentes de cliente campos internos.
 */
export type EventPublicSummary = {
  id: string;
  slug: string;
  name: string;
  date: Date;
  location: string | null;
  description: string | null;
  mercadoPagoLink: string;
  adultPriceCents: number;
  minorPriceCents: number;
  freePriceCents: number;
  voluntaryAmountsCents: number[];
};

export type WizardAttendee = {
  /** id local y estable para React (no es el id de la entrada en la DB) */
  localId: string;
  category: TicketCategory;
  name: string;
};
