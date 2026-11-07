import "server-only";

import { PurchaseStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PRODUCTS } from "@/lib/shop";

export type DashboardStats = {
  totalPurchases: number;
  pendingPurchases: number;
  confirmedPurchases: number;
  rejectedPurchases: number;
  /** Suma de compras pendientes + confirmadas: lo que se espera recaudar. */
  expectedTotalCents: number;
  /** Suma de compras ya confirmadas. */
  confirmedTotalCents: number;
  /** Suma de compras que todavía esperan confirmación. */
  pendingTotalCents: number;
  checkedInCount: number;
};

export type ProductSalesSummary = {
  productId: string;
  name: string;
  quantity: number;
  totalCents: number;
};

export type ProductOrderStatusSummary = {
  pending: ProductSalesSummary[];
  confirmed: ProductSalesSummary[];
  total: ProductSalesSummary[];
};

export type DailySalesPoint = {
  date: string;
  label: string;
  amountCents: number;
};

const DAILY_SALES_DAYS = 14;
const SALES_TIME_ZONE = "America/Argentina/Buenos_Aires";

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalPurchases,
    pendingPurchases,
    confirmedPurchases,
    rejectedPurchases,
    expectedAgg,
    confirmedAgg,
    checkedInCount,
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
  ]);

  return {
    totalPurchases,
    pendingPurchases,
    confirmedPurchases,
    rejectedPurchases,
    expectedTotalCents: expectedAgg._sum.totalCents ?? 0,
    confirmedTotalCents: confirmedAgg._sum.totalCents ?? 0,
    pendingTotalCents:
      (expectedAgg._sum.totalCents ?? 0) - (confirmedAgg._sum.totalCents ?? 0),
    checkedInCount,
  };
}

export function getRecentPendingPurchases(limit = 8) {
  return prisma.purchase.findMany({
    where: { status: PurchaseStatus.PENDING },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      code: true,
      buyerName: true,
      buyerEmail: true,
      totalCents: true,
      createdAt: true,
    },
  });
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

export async function getProductOrderStatusSummary(): Promise<ProductOrderStatusSummary> {
  const rows = await prisma.purchaseItem.findMany({
    where: {
      purchase: {
        status: { in: [PurchaseStatus.PENDING, PurchaseStatus.CONFIRMED] },
      },
    },
    select: {
      productId: true,
      name: true,
      quantity: true,
      subtotalCents: true,
      purchase: { select: { status: true } },
    },
  });

  const createSummary = () =>
    PRODUCTS.map((product) => ({
      productId: product.id,
      name: product.name,
      quantity: 0,
      totalCents: 0,
    }));
  const summary: ProductOrderStatusSummary = {
    pending: createSummary(),
    confirmed: createSummary(),
    total: createSummary(),
  };
  const productByStatus = {
    pending: new Map(summary.pending.map((product) => [product.productId, product])),
    confirmed: new Map(summary.confirmed.map((product) => [product.productId, product])),
    total: new Map(summary.total.map((product) => [product.productId, product])),
  };

  for (const row of rows) {
    const status = row.purchase.status === PurchaseStatus.PENDING ? "pending" : "confirmed";
    for (const target of [productByStatus[status], productByStatus.total]) {
      const product = target.get(row.productId);
      if (!product) continue;
      product.quantity += row.quantity;
      product.totalCents += row.subtotalCents;
    }
  }

  return summary;
}

export async function getDailySalesSummary(now = new Date()): Promise<DailySalesPoint[]> {
  const today = getSalesDateKey(now);
  const [year, month, day] = today.split("-").map(Number);
  const dates = Array.from({ length: DAILY_SALES_DAYS }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, day - DAILY_SALES_DAYS + 1 + index));
    return date.toISOString().slice(0, 10);
  });
  const firstDayStart = new Date(`${dates[0]}T00:00:00.000-03:00`);
  const purchases = await prisma.purchase.findMany({
    where: {
      status: PurchaseStatus.CONFIRMED,
      OR: [
        { confirmedAt: { gte: firstDayStart } },
        { confirmedAt: null, createdAt: { gte: firstDayStart } },
      ],
    },
    select: { confirmedAt: true, createdAt: true, totalCents: true },
  });
  const totals = new Map(dates.map((date) => [date, 0]));

  for (const purchase of purchases) {
    const date = getSalesDateKey(purchase.confirmedAt ?? purchase.createdAt);
    if (totals.has(date)) totals.set(date, totals.get(date)! + purchase.totalCents);
  }

  const labelFormatter = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  return dates.map((date) => ({
    date,
    label: labelFormatter.format(new Date(`${date}T12:00:00.000Z`)).replace(/\.$/, ""),
    amountCents: totals.get(date) ?? 0,
  }));
}

function getSalesDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SALES_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}
