"use server";

import { revalidatePath } from "next/cache";
import { PurchaseStatus } from "@/generated/prisma/client";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { deleteReceipt } from "@/lib/storage";
import { formatTicketNumber } from "@/lib/ticket-number";
import {
  confirmPurchaseSchema,
  deletePurchaseSchema,
  rejectPurchaseSchema,
  type ConfirmPurchaseInput,
  type DeletePurchaseInput,
  type RejectPurchaseInput,
} from "@/lib/validations/admin.schema";

export type AdminActionResult = { success: true } | { success: false; error: string };

function revalidatePurchaseViews(purchaseId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/compras");
  revalidatePath(`/admin/compras/${purchaseId}`);
  revalidatePath("/admin/ingreso");
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
    await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUniqueOrThrow({
        where: { id: purchaseId },
        include: { tickets: true },
      });

      // Solo se numeran las entradas que todavía no tienen número. Esto hace
      // que confirmar sea idempotente incluso si la compra pasó antes por
      // CONFIRMED -> REJECTED -> CONFIRMED: no se vuelve a numerar (lo que
      // desperdiciaría números) ni se pisa el número ya asignado.
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
          confirmedBy: session.email,
          rejectedAt: null,
          rejectionReason: null,
        },
      });
    });
  } catch {
    return { success: false, error: "No se pudo confirmar la compra." };
  }

  revalidatePurchaseViews(purchaseId);
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
