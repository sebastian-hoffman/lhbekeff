import { redirect } from "next/navigation";
import { CompradorForm } from "@/components/wizard/comprador-form";
import { getActiveEvent } from "@/server/services/event.service";

export const dynamic = "force-dynamic";

export default async function ReservarPage() {
  const event = await getActiveEvent();
  if (!event) redirect("/");

  return <CompradorForm eventId={event.id} />;
}
