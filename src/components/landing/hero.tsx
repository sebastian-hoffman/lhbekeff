import Link from "next/link";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import type { EventPublicSummary } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

function formatEventTime(date: Date): string {
  const [hour, minute] = timeFormatter.format(date).split(":");
  if (minute === "00") return `${hour} hs`;
  return `${hour}:${minute} hs`;
}

function formatEventDate(date: Date): string {
  const formatted = dateFormatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function Hero({ event }: { event: EventPublicSummary }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--primary)_0%,transparent_70%)] opacity-[0.07]"
      />
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
        <Logo variant="full" priority className="w-full max-w-[260px] sm:max-w-xs" />

        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              <CalendarDays className="size-3.5" />
              {formatEventDate(event.date)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              <Clock3 className="size-3.5" />
              {formatEventTime(event.date)}
            </span>
          </div>
          {event.location ? (
            <span className="inline-flex max-w-sm items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              {event.location}
            </span>
          ) : null}

          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Una noche de Bingo para toda la familia
          </h1>

          {event.description ? (
            <p className="max-w-xl text-balance text-lg text-muted-foreground">
              {event.description}
            </p>
          ) : null}
        </div>

        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="h-12 px-8 text-base sm:flex-1">
            <Link href="/reservar">Reservar entradas</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base sm:flex-1">
            <Link href="/comprobante">Ya transferí, cargar comprobante</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Reservá en menos de 2 minutos · Toda la experiencia del Bingo incluida
        </p>
      </div>
    </section>
  );
}
