"use server";

import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { generatePurchaseCode } from "@/lib/purchase-code";
import { isPresaleOpen, PRESALE_CLOSES_AT, priceCart } from "@/lib/shop";
import { buyerSchema } from "@/lib/validations/purchase.schema";
import type { CreatePurchaseResult } from "@/server/actions/purchase.actions";

const orderSchema = buyerSchema.extend({
  buyerEmail: z.email("Ingresá un email válido.").trim().toLowerCase(),
  items: z.array(z.object({
    productId: z.enum(["remera", "botella", "toallon"]),
    size: z.string().max(4),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(30),
});

export async function createShopOrder(input: unknown): Promise<CreatePurchaseResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Revisá tu pedido." };
  if (!isPresaleOpen()) return { success: false, error: "La preventa finalizó el 13 de noviembre." };

  let items;
  try {
    items = priceCart(parsed.data.items);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Pedido inválido." };
  }

  try {
    const event = await prisma.event.upsert({
      where: { slug: "lamroth-preventa-2026" },
      update: {},
      create: {
        slug: "lamroth-preventa-2026", name: "Lamroth · Preventa Majané 2026",
        date: new Date(PRESALE_CLOSES_AT), location: "Sedes de Lamroth",
        isActive: false, mercadoPagoLink: process.env.LAMROTH_MERCADO_PAGO_LINK ?? "",
        adultPriceCents: 0, minorPriceCents: 0, freePriceCents: 0,
        voluntaryAmountsCents: [],
      },
    });
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generatePurchaseCode(event.slug).replace(/^BK/, "LH");
      try {
        await prisma.purchase.create({
          data: {
            code, eventId: event.id,
            buyerName: parsed.data.buyerName,
            buyerEmail: parsed.data.buyerEmail,
            buyerPhone: parsed.data.buyerPhone,
            adultQty: 0, minorQty: 0, freeQty: 0,
            adultUnitPriceCents: 0, minorUnitPriceCents: 0, freeUnitPriceCents: 0,
            adultSubtotalCents: 0, minorSubtotalCents: 0, freeSubtotalCents: 0,
            totalCents: items.reduce((total, item) => total + item.subtotalCents, 0),
            items: { create: items },
          },
        });
        return { success: true, code };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" &&
          Array.isArray(error.meta?.target) && error.meta.target.includes("code")) continue;
        throw error;
      }
    }
  } catch (error) {
    console.error("No se pudo crear el pedido Lamroth", error);
    return { success: false, error: "No pudimos guardar tu pedido. Tus productos siguen en el carrito. Volvé a intentar." };
  }
  return { success: false, error: "No pudimos generar tu código. Volvé a intentar." };
}