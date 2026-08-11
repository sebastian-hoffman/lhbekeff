import { redirect } from "next/navigation";
import { ResumenCard } from "@/components/wizard/resumen-card";
import { getActiveEvent } from "@/server/services/event.service";

export const dynamic = "force-dynamic";

export default async function ResumenPage() {
  const event = await getActiveEvent();
  if (!event) redirect("/");

  return <ResumenCard event={event} />;
}
