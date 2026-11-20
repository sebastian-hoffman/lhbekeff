"use server";

import { revalidatePath } from "next/cache";
import { ProductDeliveryStatus, PurchaseStatus } from "@/generated/prisma/client";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { deleteReceipt } from "@/lib/storage";
import { formatTicketNumber } from "@/lib/ticket-number";
import {
  confirmPurchaseSchema,
  confirmPurchasesSchema,
  deletePurchaseSchema,
  rejectPurchaseSchema,
  rejectPurchasesSchema,
  updateProductDeliveryStatusSchema,
  updatePurchaseGroupsSchema,
  type ConfirmPurchaseInput,
  type ConfirmPurchasesInput,
  type DeletePurchaseInput,
  type RejectPurchaseInput,
  type RejectPurchasesInput,
  type UpdateProductDeliveryStatusInput,
  type UpdatePurchaseGroupsInput,
} from "@/lib/validations/admin.schema";

export type AdminActionResult = { success: true } | { success: false; error: string };

function revalidatePurchaseViews(purchaseId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/compras");
  revalidatePath(`/admin/compras/${purchaseId}`);
  revalidatePath("/admin/ingreso");
  revalidatePath("/admin/entregas");
}

/**
 * Confirma el pago de una compra: dentro de una única transacción, asigna
 * de forma atómica el número correlativo de cada entrada (por evento +
 * categoría) y marca la compra como CONFIRMED. Es idempotente: confirmar
 * una compra ya confirmada no reasigna números.
 */
export async function confirmPurchase(input: ConfirmPurchaseInput): Promise<AdminActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = confirmPurchaseSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };
  const { purchaseId } = parsed.data;

  try {
    await confirmPurchasesAtomically([purchaseId], session.email);
  } catch {
    return { success: false, error: "No se pudo confirmar la compra." };
  }

  revalidatePurchaseViews(purchaseId);
  return { success: true };
}

async function confirmPurchasesAtomically(purchaseIds: string[], confirmedBy: string) {
  await prisma.$transaction(async (tx) => {
    for (const purchaseId of purchaseIds) {
      const purchase = await tx.purchase.findUniqueOrThrow({
        where: { id: purchaseId },
        include: { tickets: true },
      });
      if (purchase.status === PurchaseStatus.CONFIRMED) continue;

      for (const ticket of purchase.tickets) {
        if (ticket.number) continue;
        const sequence = await tx.ticketSequence.update({
          where: { eventId_category: { eventId: purchase.eventId, category: ticket.category } },
          data: { lastNumber: { increment: 1 } },
        });
        await tx.ticket.update({
          where: { id: ticket.id },
          data: { number: formatTicketNumber(ticket.category, sequence.lastNumber) },
        });
      }

      await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          status: PurchaseStatus.CONFIRMED,
          confirmedAt: new Date(),
          confirmedBy,
          rejectedAt: null,
          rejectionReason: null,
        },
      });
    }
  }, { timeout: 30_000 });
}

export async function confirmPurchases(input: ConfirmPurchasesInput): Promise<AdminActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = confirmPurchasesSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Seleccioná hasta 100 compras válidas." };

  try {
    await confirmPurchasesAtomically(parsed.data.purchaseIds, session.email);
  } catch {
    return { success: false, error: "No se pudieron confirmar las compras seleccionadas." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/compras");
  revalidatePath("/admin/ingreso");
  revalidatePath("/admin/entregas");
  for (const purchaseId of parsed.data.purchaseIds) {
    revalidatePath(`/admin/compras/${purchaseId}`);
  }
  return { success: true };
}

/**
 * Elimina una compra y sus entradas (cascade) de forma permanente. Los
 * números ya asignados no se reutilizan: `TicketSequence` nunca retrocede,
 * así que borrar una compra confirmada no rompe la numeración de las demás.
 */
export async function deletePurchase(input: DeletePurchaseInput): Promise<AdminActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = deletePurchaseSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };
  const { purchaseId } = parsed.data;

  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
  if (!purchase) return { success: false, error: "No encontramos esa compra." };

  try {
    await prisma.purchase.delete({ where: { id: purchaseId } });
  } catch {
    return { success: false, error: "No se pudo eliminar la compra." };
  }

  if (purchase.receiptUrl) {
    await deleteReceipt(purchase.receiptUrl).catch(() => {});
  }

  revalidatePurchaseViews(purchaseId);
  return { success: true };
}

export async function rejectPurchase(input: RejectPurchaseInput): Promise<AdminActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = rejectPurchaseSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };
  const { purchaseId, rejectionReason } = parsed.data;

  try {
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status: PurchaseStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || null,
      },
    });
  } catch {
    return { success: false, error: "No se pudo rechazar la compra." };
  }

  revalidatePurchaseViews(purchaseId);
  return { success: true };
}

export async function rejectPurchases(input: RejectPurchasesInput): Promise<AdminActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = rejectPurchasesSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Seleccioná hasta 100 compras válidas." };

  try {
    const result = await prisma.purchase.updateMany({
      where: {
        id: { in: parsed.data.purchaseIds },
        status: { not: PurchaseStatus.REJECTED },
      },
      data: {
        status: PurchaseStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: parsed.data.rejectionReason || null,
      },
    });
    if (result.count === 0) {
      return { success: false, error: "No encontramos las compras seleccionadas." };
    }
  } catch {
    return { success: false, error: "No se pudieron rechazar las compras seleccionadas." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/compras");
  revalidatePath("/admin/entregas");
  for (const purchaseId of parsed.data.purchaseIds) {
    revalidatePath(`/admin/compras/${purchaseId}`);
  }
  return { success: true };
}

export async function updatePurchaseGroups(
  input: UpdatePurchaseGroupsInput,
): Promise<AdminActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = updatePurchaseGroupsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Revisá los grupos seleccionados." };

  try {
    await prisma.purchase.update({
      where: { id: parsed.data.purchaseId },
      data: { buyerGroups: [...new Set(parsed.data.groups)] },
    });
  } catch {
    return { success: false, error: "No se pudieron guardar los grupos de la compra." };
  }

  revalidatePurchaseViews(parsed.data.purchaseId);
  return { success: true };
}

export async function updateProductDeliveryStatuses(
  input: UpdateProductDeliveryStatusInput,
): Promise<AdminActionResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = updateProductDeliveryStatusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };

  try {
    const result = await prisma.purchase.updateMany({
      where: {
        id: { in: parsed.data.purchaseIds },
        status: { in: [PurchaseStatus.PENDING, PurchaseStatus.CONFIRMED] },
        items: { some: {} },
      },
      data: {
        deliveryStatus: parsed.data.delivered
          ? ProductDeliveryStatus.DELIVERED
          : ProductDeliveryStatus.PENDING,
      },
    });
    if (result.count === 0) {
      return { success: false, error: "No encontramos pedidos de productos entregables." };
    }
  } catch {
    return { success: false, error: "No se pudieron actualizar los estados de entrega." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/compras");
  revalidatePath("/admin/entregas");
  return { success: true };
}
