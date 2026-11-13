import "server-only";

import { createReceiptShareToken } from "@/lib/receipt-share";
import { prisma } from "@/lib/prisma";

/** Listado liviano para la tabla de compras del panel admin. */
export async function listPurchases() {
  const purchases = await prisma.purchase.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      buyerName: true,
      buyerEmail: true,
      buyerPhone: true,
      buyerGroups: true,
      receiptUrl: true,
      receiptMimeType: true,
      totalCents: true,
      status: true,
      createdAt: true,
    },
  });

  return Promise.all(purchases.map(async ({ receiptUrl, ...purchase }) => ({
    ...purchase,
    receiptShareToken: receiptUrl ? await createReceiptShareToken(receiptUrl) : null,
  })));
}

export type PurchaseListItem = Awaited<ReturnType<typeof listPurchases>>[number];

export function getPurchaseById(id: string) {
  return prisma.purchase.findUnique({
    where: { id },
    include: { tickets: { orderBy: { createdAt: "asc" } }, items: true, event: true },
  });
}

export type PurchaseDetail = NonNullable<Awaited<ReturnType<typeof getPurchaseById>>>;

export function getPurchaseByCode(code: string) {
  return prisma.purchase.findUnique({
    where: { code },
    include: { tickets: { orderBy: { createdAt: "asc" } }, items: true, event: true },
  });
}

export type PurchaseWithTickets = NonNullable<
  Awaited<ReturnType<typeof getPurchaseByCode>>
>;
