import "server-only";

import { PurchaseStatus, TicketCategory } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type DashboardStats = {
  totalPurchases: number;
  pendingPurchases: number;
  confirmedPurchases: number;
  rejectedPurchases: number;
  /** Suma de compras pendientes + confirmadas: lo que se espera recaudar. */
  expectedTotalCents: number;
  /** Suma de compras ya confirmadas. */
  confirmedTotalCents: number;
  checkedInCount: number;
  /** Entradas vendidas (compras confirmadas) acumuladas por categoría. */
  ticketsSoldByCategory: Record<TicketCategory, number>;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalPurchases,
    pendingPurchases,
    confirmedPurchases,
    rejectedPurchases,
    expectedAgg,
    confirmedAgg,
    checkedInCount,
    ticketsByCategory,
  ] = await Promise.all([
    prisma.purchase.count(),
    prisma.purchase.count({ where: { status: PurchaseStatus.PENDING } }),
    prisma.purchase.count({ where: { status: PurchaseStatus.CONFIRMED } }),
    prisma.purchase.count({ where: { status: PurchaseStatus.REJECTED } }),
    prisma.purchase.aggregate({
      _sum: { totalCents: true },
      where: { status: { in: [PurchaseStatus.PENDING, PurchaseStatus.CONFIRMED] } },
    }),
    prisma.purchase.aggregate({
      _sum: { totalCents: true },
      where: { status: PurchaseStatus.CONFIRMED },
    }),
    prisma.ticket.count({ where: { checkedIn: true } }),
    prisma.ticket.groupBy({
      by: ["category"],
      where: { purchase: { status: PurchaseStatus.CONFIRMED } },
      _count: { _all: true },
    }),
  ]);

  const ticketsSoldByCategory: Record<TicketCategory, number> = {
    ADULT: 0,
    MINOR: 0,
    FREE: 0,
  };
  for (const row of ticketsByCategory) {
    ticketsSoldByCategory[row.category] = row._count._all;
  }

  return {
    totalPurchases,
    pendingPurchases,
    confirmedPurchases,
    rejectedPurchases,
    expectedTotalCents: expectedAgg._sum.totalCents ?? 0,
    confirmedTotalCents: confirmedAgg._sum.totalCents ?? 0,
    checkedInCount,
    ticketsSoldByCategory,
  };
}

export async function getProductOrderSummary() {
  const rows = await prisma.purchaseItem.findMany({
    where: { purchase: { status: { in: [PurchaseStatus.PENDING, PurchaseStatus.CONFIRMED] } } },
    select: { productId: true, name: true, size: true, quantity: true, purchase: { select: { status: true } } },
  });
  const summary = new Map<string, { productId: string; name: string; size: string | null; pending: number; confirmed: number }>();
  for (const row of rows) {
    const key = `${row.productId}-${row.size ?? ""}`;
    const total = summary.get(key) ?? { productId: row.productId, name: row.name, size: row.size, pending: 0, confirmed: 0 };
    if (row.purchase.status === PurchaseStatus.CONFIRMED) total.confirmed += row.quantity;
    else total.pending += row.quantity;
    summary.set(key, total);
  }
  return [...summary.values()].sort((first, second) => first.productId.localeCompare(second.productId) || (first.size ?? "").localeCompare(second.size ?? "", "es", { numeric: true }));
}
