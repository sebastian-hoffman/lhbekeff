import "server-only";

import { prisma } from "@/lib/prisma";
import type { PurchaseWithTickets } from "@/server/services/purchase.service";

const MERCADO_PAGO_API = "https://api.mercadopago.com/checkout/preferences";

export type MercadoPagoPaymentOption = {
  url: string;
  kind: "checkout" | "link";
};

export function isMercadoPagoEnabled() {
  const mode = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER?.trim().toLowerCase();
  return mode === "mercadopago" || mode === "both";
}

export function hasMercadoPagoAccessToken() {
  return Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim());
}

export async function getMercadoPagoPaymentOption(
  purchase: PurchaseWithTickets,
): Promise<MercadoPagoPaymentOption | null> {
  if (isMercadoPagoEnabled() && hasMercadoPagoAccessToken()) {
    const checkoutUrl = await getOrCreateMercadoPagoCheckoutUrl(purchase);
    if (checkoutUrl) {
      return { url: checkoutUrl, kind: "checkout" };
    }
  }

  const eventPaymentLink = normalizeHttpUrl(purchase.event.mercadoPagoLink);
  if (eventPaymentLink) {
    return { url: eventPaymentLink, kind: "link" };
  }

  return null;
}

async function getOrCreateMercadoPagoCheckoutUrl(purchase: PurchaseWithTickets) {
  if (!hasMercadoPagoAccessToken()) {
    return null;
  }

  if (purchase.mercadoPagoCheckoutUrl) {
    return purchase.mercadoPagoCheckoutUrl;
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    return null;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrl) {
    throw new Error("Falta NEXT_PUBLIC_APP_URL para crear el checkout de Mercado Pago.");
  }

  const response = await fetch(MERCADO_PAGO_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": purchase.code,
    },
    body: JSON.stringify({
      external_reference: purchase.code,
      payer: {
        name: purchase.buyerName,
        email: purchase.buyerEmail,
      },
      items: [
        {
          title: `Bingo Bekeff 2026 · ${purchase.code}`,
          quantity: 1,
          unit_price: purchase.totalCents / 100,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: `${appUrl}/confirmacion/${purchase.code}`,
        pending: `${appUrl}/confirmacion/${purchase.code}`,
        failure: `${appUrl}/reservar/pago/${purchase.code}`,
      },
      auto_return: "approved",
      binary_mode: false,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Mercado Pago devolvió ${response.status}: ${details}`);
  }

  const data = (await response.json()) as {
    id?: string;
    init_point?: string;
    sandbox_init_point?: string;
  };

  const checkoutUrl = data.init_point ?? data.sandbox_init_point;
  if (!checkoutUrl) {
    throw new Error("Mercado Pago no devolvió una URL de checkout.");
  }

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      mercadoPagoPreferenceId: data.id ?? null,
      mercadoPagoCheckoutUrl: checkoutUrl,
    },
  });

  return checkoutUrl;
}

function normalizeHttpUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
