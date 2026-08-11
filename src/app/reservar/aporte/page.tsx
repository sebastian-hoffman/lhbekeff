import { redirect } from "next/navigation";
import { AporteForm } from "@/components/wizard/aporte-form";
import { getActiveEvent } from "@/server/services/event.service";

export default async function AportePage() {
  const event = await getActiveEvent();
  if (!event) redirect("/");

  return <AporteForm event={event} />;
}
