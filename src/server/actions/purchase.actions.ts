"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateTotals } from "@/lib/pricing";
import { generatePurchaseCode } from "@/lib/purchase-code";
import { UnsupportedFileError, saveReceipt } from "@/lib/storage";
import { createPurchaseSchema, type CreatePurchaseInput } from "@/lib/validations/purchase.schema";

export type CreatePurchaseResult = { success: true; code: string } | { success: false; error: string };

const MAX_CODE_ATTEMPTS = 5;

/**
 * Crea la compra (estado PENDING) junto con sus entradas, ya con nombre y
 * categoría pero sin número asignado. El número se asigna recién al
 * confirmar el pago (ver `admin-purchase.actions.ts`).
 */
export async function createPurchase(input: CreatePurchaseInput): Promise<CreatePurchaseResult> {
  const parsed = createPurchaseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const event = await prisma.event.findUnique({ where: { id: data.eventId } });
  if (!event || !event.isActive) {
    return { success: false, error: "El evento ya no está disponible." };
  }

  const totals = calculateTotals(
    { adultQty: data.adultQty, minorQty: data.minorQty, freeQty: data.freeQty },
    {
      adultUnitPriceCents: event.adultPriceCents,
      minorUnitPriceCents: event.minorPriceCents,
      freeUnitPriceCents: event.freePriceCents,
    },
    data.voluntaryContributionCents,
  );

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const code = generatePurchaseCode(event.slug);
    try {
      await prisma.purchase.create({
        data: {
          code,
          eventId: event.id,
          buyerName: data.buyerName,
          buyerEmail: data.buyerEmail,
          buyerPhone: data.buyerPhone,
          adultQty: data.adultQty,
          minorQty: data.minorQty,
          freeQty: data.freeQty,
          adultUnitPriceCents: event.adultPriceCents,
          minorUnitPriceCents: event.minorPriceCents,
          freeUnitPriceCents: event.freePriceCents,
          adultSubtotalCents: totals.adultSubtotalCents,
          minorSubtotalCents: totals.minorSubtotalCents,
          freeSubtotalCents: totals.freeSubtotalCents,
          voluntaryContributionCents: totals.voluntaryContributionCents,
          totalCents: totals.totalCents,
          tickets: {
            create: data.attendees.map((attendee) => ({
              eventId: event.id,
              category: attendee.category,
              attendeeName: attendee.name.trim(),
            })),
          },
        },
      });
      return { success: true, code };
    } catch (error) {
      if (isUniqueCodeCollision(error)) continue;
      throw error;
    }
  }

  return {
    success: false,
    error: "No se pudo generar un código de compra único. Probá de nuevo.",
  };
}

export type UploadReceiptResult = { success: true } | { success: false; error: string };

export async function uploadReceipt(
  code: string,
  formData: FormData,
): Promise<UploadReceiptResult> {
  const normalizedCode = code.trim().toUpperCase();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Seleccioná un archivo." };
  }

  const purchase = await prisma.purchase.findUnique({ where: { code: normalizedCode } });
  if (!purchase) {
    return { success: false, error: "No encontramos esa compra." };
  }

  return attachReceiptToPurchase(purchase.id, purchase.code, file);
}

export async function uploadReceiptByCodeAndEmail(
  code: string,
  email: string,
  formData: FormData,
): Promise<UploadReceiptResult> {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedCode || !normalizedEmail) {
    return { success: false, error: "Completá código de compra y email." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Seleccioná un archivo." };
  }

  const purchase = await prisma.purchase.findUnique({ where: { code: normalizedCode } });
  if (!purchase) {
    return { success: false, error: "No encontramos una compra con ese código." };
  }

  if (purchase.buyerEmail.trim().toLowerCase() !== normalizedEmail) {
    return { success: false, error: "El email no coincide con la compra." };
  }

  return attachReceiptToPurchase(purchase.id, purchase.code, file);
}

async function attachReceiptToPurchase(
  purchaseId: string,
  purchaseCode: string,
  file: File,
): Promise<UploadReceiptResult> {
  try {
    const saved = await saveReceipt(file, purchaseCode);
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { receiptUrl: saved.relativePath, receiptMimeType: saved.mimeType },
    });
    return { success: true };
  } catch (error) {
    if (error instanceof UnsupportedFileError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}

function isUniqueCodeCollision(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes("code")
  );
}
