import "server-only";

import { prisma } from "@/lib/prisma";

/** Listado liviano para la tabla de compras del panel admin. */
export function listPurchases() {
  return prisma.purchase.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      buyerName: true,
      buyerEmail: true,
      buyerPhone: true,
      totalCents: true,
      status: true,
      createdAt: true,
    },
  });
}

export type PurchaseListItem = Awaited<ReturnType<typeof listPurchases>>[number];

export function getPurchaseById(id: string) {
  return prisma.purchase.findUnique({
    where: { id },
    include: { tickets: { orderBy: { createdAt: "asc" } }, event: true },
  });
}

export type PurchaseDetail = NonNullable<Awaited<ReturnType<typeof getPurchaseById>>>;

export function getPurchaseByCode(code: string) {
  return prisma.purchase.findUnique({
    where: { code },
    include: { tickets: { orderBy: { createdAt: "asc" } }, event: true },
  });
}

export type PurchaseWithTickets = NonNullable<
  Awaited<ReturnType<typeof getPurchaseByCode>>
>;
