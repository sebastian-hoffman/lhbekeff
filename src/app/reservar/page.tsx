import { redirect } from "next/navigation";
import { CompradorForm } from "@/components/wizard/comprador-form";
import { getActiveEvent } from "@/server/services/event.service";

export default async function ReservarPage() {
  const event = await getActiveEvent();
  if (!event) redirect("/");

  return <CompradorForm eventId={event.id} />;
}
