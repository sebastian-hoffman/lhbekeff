import { Money } from "@/components/shared/money";
import { cn } from "@/lib/utils";
import type { EventPublicSummary } from "@/types";

export function PricingPreview({ event }: { event: EventPublicSummary }) {
  const tiers = [
    { label: "Adultos", sub: "18 años o más", cents: event.adultPriceCents },
    { label: "Menores", sub: "13 a 17 años", cents: event.minorPriceCents },
    { label: "Niños", sub: "Hasta 12 años", cents: event.freePriceCents },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Entradas</h2>
        <p className="mt-2 text-muted-foreground">
          Elegís las cantidades de cada categoría al reservar.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {tiers.map((tier) => {
          const isFree = tier.cents === 0;
          return (
            <div
              key={tier.label}
              className={cn(
                "rounded-2xl border p-6 text-center shadow-sm",
                isFree ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-border bg-card",
              )}
            >
              <p className="font-medium">{tier.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{tier.sub}</p>
              <p
                className={cn(
                  "mt-4 text-3xl font-semibold tabular-nums",
                  isFree && "text-emerald-600 dark:text-emerald-400",
                )}
              >
                {isFree ? "Sin cargo" : <Money cents={tier.cents} />}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
