import { z } from "zod";
import { BUYER_GROUPS } from "@/lib/buyer-groups";

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

export const rejectPurchasesSchema = z.object({
  purchaseIds: z.array(z.cuid()).min(1).max(100),
  rejectionReason: z.string().trim().max(500).optional(),
});
export type RejectPurchasesInput = z.infer<typeof rejectPurchasesSchema>;

export const confirmPurchaseSchema = z.object({
  purchaseId: z.cuid(),
});
export type ConfirmPurchaseInput = z.infer<typeof confirmPurchaseSchema>;

export const confirmPurchasesSchema = z.object({
  purchaseIds: z.array(z.cuid()).min(1).max(100),
});
export type ConfirmPurchasesInput = z.infer<typeof confirmPurchasesSchema>;

export const deletePurchaseSchema = z.object({
  purchaseId: z.cuid(),
});
export type DeletePurchaseInput = z.infer<typeof deletePurchaseSchema>;

export const updatePurchaseGroupsSchema = z.object({
  purchaseId: z.cuid(),
  groups: z.array(z.enum(BUYER_GROUPS)).max(BUYER_GROUPS.length),
});
export type UpdatePurchaseGroupsInput = z.infer<typeof updatePurchaseGroupsSchema>;

export const updateProductDeliveryStatusSchema = z.object({
  purchaseIds: z.array(z.cuid()).min(1).max(500),
  delivered: z.boolean(),
});
export type UpdateProductDeliveryStatusInput = z.infer<typeof updateProductDeliveryStatusSchema>;
