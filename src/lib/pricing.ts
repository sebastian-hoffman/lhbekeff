/**
 * Cálculo de totales de una compra. Toda la aritmética de dinero se hace en
 * centavos (enteros) para evitar errores de punto flotante; solo se
 * convierte a formato "$ 20.000" al mostrarlo en pantalla (ver `formatMoney`
 * en `lib/utils.ts`).
 */

export type TicketQuantities = {
  adultQty: number;
  minorQty: number;
  freeQty: number;
};

export type EventPricing = {
  adultUnitPriceCents: number;
  minorUnitPriceCents: number;
  freeUnitPriceCents: number;
};

export type PurchaseTotals = {
  adultSubtotalCents: number;
  minorSubtotalCents: number;
  freeSubtotalCents: number;
  voluntaryContributionCents: number;
  totalCents: number;
};

export function totalTicketCount(qty: TicketQuantities): number {
  return qty.adultQty + qty.minorQty + qty.freeQty;
}

export function calculateTotals(
  qty: TicketQuantities,
  pricing: EventPricing,
  voluntaryContributionCents = 0,
): PurchaseTotals {
  const adultSubtotalCents = qty.adultQty * pricing.adultUnitPriceCents;
  const minorSubtotalCents = qty.minorQty * pricing.minorUnitPriceCents;
  const freeSubtotalCents = qty.freeQty * pricing.freeUnitPriceCents;

  return {
    adultSubtotalCents,
    minorSubtotalCents,
    freeSubtotalCents,
    voluntaryContributionCents,
    totalCents:
      adultSubtotalCents +
      minorSubtotalCents +
      freeSubtotalCents +
      voluntaryContributionCents,
  };
}
