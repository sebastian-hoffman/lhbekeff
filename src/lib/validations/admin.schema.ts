import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email("Ingresá un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const rejectPurchaseSchema = z.object({
  purchaseId: z.cuid(),
  rejectionReason: z.string().trim().max(500).optional(),
});
export type RejectPurchaseInput = z.infer<typeof rejectPurchaseSchema>;

export const confirmPurchaseSchema = z.object({
  purchaseId: z.cuid(),
});
export type ConfirmPurchaseInput = z.infer<typeof confirmPurchaseSchema>;

export const deletePurchaseSchema = z.object({
  purchaseId: z.cuid(),
});
export type DeletePurchaseInput = z.infer<typeof deletePurchaseSchema>;
