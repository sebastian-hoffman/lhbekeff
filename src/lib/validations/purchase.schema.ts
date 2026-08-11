import { z } from "zod";
import { TicketCategory } from "@/generated/prisma/enums";

/** Paso 1 — Datos del comprador. */
export const buyerSchema = z.object({
  buyerName: z
    .string()
    .trim()
    .min(3, "Ingresá tu nombre y apellido.")
    .max(120),
  buyerEmail: z.email("Ingresá un email válido."),
  buyerPhone: z
    .string()
    .trim()
    .min(6, "Ingresá un celular válido.")
    .max(30)
    .regex(/^[\d\s+()-]+$/, "Ingresá un celular válido."),
});
export type BuyerInput = z.infer<typeof buyerSchema>;

/** Paso 2 — Cantidad de entradas por categoría. */
export const ticketQuantitiesObjectSchema = z.object({
  adultQty: z.number().int().min(0).max(50),
  minorQty: z.number().int().min(0).max(50),
  freeQty: z.number().int().min(0).max(50),
});
export const ticketQuantitiesSchema = ticketQuantitiesObjectSchema.refine(
  (qty) => qty.adultQty + qty.minorQty + qty.freeQty > 0,
  { message: "Seleccioná al menos una entrada.", path: ["adultQty"] },
);
export type TicketQuantitiesInput = z.infer<typeof ticketQuantitiesObjectSchema>;

/** Paso 3 — Un nombre por asistente (sin pedir edad/categoría, ya elegida). */
export const attendeeSchema = z.object({
  category: z.enum(TicketCategory),
  name: z
    .string()
    .trim()
    .min(1, "Ingresá un nombre, o \"A definir\" si todavía no lo sabés.")
    .max(120),
});
export type AttendeeInput = z.infer<typeof attendeeSchema>;

export const attendeesSchema = z.array(attendeeSchema).min(1);

/** Paso 4 — Aporte voluntario, en centavos. */
export const voluntaryContributionSchema = z.object({
  voluntaryContributionCents: z.number().int().min(0).max(100_000_000),
});
export type VoluntaryContributionInput = z.infer<typeof voluntaryContributionSchema>;

/**
 * Payload completo que recibe la Server Action `createPurchase`. El cliente
 * ya validó cada paso individualmente, pero el servidor vuelve a validar
 * todo junto (nunca confiar en el cliente) y además verifica que la
 * cantidad de asistentes cargados coincida con las cantidades elegidas.
 */
export const createPurchaseSchema = z
  .object({
    eventId: z.cuid(),
    ...buyerSchema.shape,
    ...ticketQuantitiesObjectSchema.shape,
    attendees: attendeesSchema,
    voluntaryContributionCents: z.number().int().min(0).max(100_000_000),
  })
  .superRefine((data, ctx) => {
    const expectedByCategory: Record<TicketCategory, number> = {
      ADULT: data.adultQty,
      MINOR: data.minorQty,
      FREE: data.freeQty,
    };
    const actualByCategory: Record<TicketCategory, number> = {
      ADULT: 0,
      MINOR: 0,
      FREE: 0,
    };
    for (const attendee of data.attendees) {
      actualByCategory[attendee.category] += 1;
    }
    for (const category of Object.values(TicketCategory)) {
      if (actualByCategory[category] !== expectedByCategory[category]) {
        ctx.addIssue({
          code: "custom",
          message: `La cantidad de asistentes de categoría ${category} no coincide con lo seleccionado.`,
          path: ["attendees"],
        });
      }
    }
  });
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
