import { redirect } from "next/navigation";
import { EntradasForm } from "@/components/wizard/entradas-form";
import { getActiveEvent } from "@/server/services/event.service";

export default async function EntradasPage() {
  const event = await getActiveEvent();
  if (!event) redirect("/");

  return <EntradasForm event={event} />;
}
