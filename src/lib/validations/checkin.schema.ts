import { z } from "zod";

export const checkinSearchSchema = z.object({
  query: z.string().trim().min(1).max(120),
});
export type CheckinSearchInput = z.infer<typeof checkinSearchSchema>;

export const checkInTicketSchema = z.object({
  ticketId: z.cuid(),
});
export type CheckInTicketInput = z.infer<typeof checkInTicketSchema>;
