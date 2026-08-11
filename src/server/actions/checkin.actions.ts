"use server";

import { PurchaseStatus, type TicketCategory } from "@/generated/prisma/client";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  checkInTicketSchema,
  checkinSearchSchema,
  type CheckInTicketInput,
  type CheckinSearchInput,
} from "@/lib/validations/checkin.schema";

export type TicketSearchResult = {
  id: string;
  attendeeName: string;
  category: TicketCategory;
  number: string | null;
  checkedIn: boolean;
  purchaseCode: string;
};

/** Busca por nombre de asistente, número de entrada o código de compra.
 * Solo entre compras ya confirmadas: son las únicas con número asignado y
 * habilitadas para ingresar. */
export async function searchTickets(input: CheckinSearchInput): Promise<TicketSearchResult[]> {
  const session = await getAdminSession();
  if (!session) return [];

  const parsed = checkinSearchSchema.safeParse(input);
  if (!parsed.success) return [];
  const { query } = parsed.data;

  const tickets = await prisma.ticket.findMany({
    where: {
      purchase: { status: PurchaseStatus.CONFIRMED },
      OR: [
        { attendeeName: { contains: query, mode: "insensitive" } },
        { number: { contains: query, mode: "insensitive" } },
        { purchase: { code: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: { purchase: { select: { code: true } } },
    orderBy: { attendeeName: "asc" },
    take: 25,
  });

  return tickets.map((ticket) => ({
    id: ticket.id,
    attendeeName: ticket.attendeeName,
    category: ticket.category,
    number: ticket.number,
    checkedIn: ticket.checkedIn,
    purchaseCode: ticket.purchase.code,
  }));
}

export type CheckInResult =
  | { success: true; alreadyCheckedIn: boolean }
  | { success: false; error: string };

export async function checkInTicket(input: CheckInTicketInput): Promise<CheckInResult> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = checkInTicketSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };

  const ticket = await prisma.ticket.findUnique({ where: { id: parsed.data.ticketId } });
  if (!ticket) return { success: false, error: "Entrada no encontrada." };
  if (ticket.checkedIn) return { success: true, alreadyCheckedIn: true };

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { checkedIn: true, checkedInAt: new Date() },
  });

  return { success: true, alreadyCheckedIn: false };
}
