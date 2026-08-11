import "server-only";

import { prisma } from "@/lib/prisma";
import type { EventPublicSummary } from "@/types";

function toPublicSummary(event: {
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
}): EventPublicSummary {
  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    date: event.date,
    location: event.location,
    description: event.description,
    mercadoPagoLink: event.mercadoPagoLink,
    adultPriceCents: event.adultPriceCents,
    minorPriceCents: event.minorPriceCents,
    freePriceCents: event.freePriceCents,
    voluntaryAmountsCents: event.voluntaryAmountsCents,
  };
}

/** El evento activo actual. Hoy es siempre el Bingo Bekeff 2026, pero el
 * sistema soporta que en el futuro haya un evento activo distinto sin
 * cambiar código. */
export async function getActiveEvent(): Promise<EventPublicSummary | null> {
  const event = await prisma.event.findFirst({
    where: { isActive: true },
    orderBy: { date: "desc" },
  });
  return event ? toPublicSummary(event) : null;
}

export async function getEventById(eventId: string): Promise<EventPublicSummary | null> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  return event ? toPublicSummary(event) : null;
}
