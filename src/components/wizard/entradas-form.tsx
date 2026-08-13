"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/shared/money";
import { QuantityStepper } from "@/components/wizard/quantity-stepper";
import { totalTicketCount } from "@/lib/pricing";
import { ticketQuantitiesSchema } from "@/lib/validations/purchase.schema";
import { useWizardStore } from "@/store/wizard-store";
import type { EventPublicSummary } from "@/types";

export function EntradasForm({ event }: { event: EventPublicSummary }) {
  const router = useRouter();
  const { buyer, quantities, setQuantities } = useWizardStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!buyer) router.replace("/reservar");
  }, [buyer, router]);

  const total = totalTicketCount(quantities);
  const totalCents =
    quantities.adultQty * event.adultPriceCents +
    quantities.minorQty * event.minorPriceCents +
    quantities.freeQty * event.freePriceCents;

  function update(patch: Partial<typeof quantities>) {
    setError(null);
    setQuantities({ ...quantities, ...patch });
  }

  function handleContinue() {
    const result = ticketQuantitiesSchema.safeParse(quantities);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Revisá las cantidades.");
      return;
    }
    router.push("/reservar/asistentes");
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Entradas</h1>
        <p className="text-sm text-muted-foreground">
          Elegí cuántas entradas de cada categoría necesitás.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <QuantityStepper
          label="Adultos"
          sublabel="18 años o más"
          priceCents={event.adultPriceCents}
          value={quantities.adultQty}
          onChange={(adultQty) => update({ adultQty })}
        />
        <QuantityStepper
          label="Menores"
          sublabel="13 a 17 años"
          priceCents={event.minorPriceCents}
          value={quantities.minorQty}
          onChange={(minorQty) => update({ minorQty })}
        />
        <QuantityStepper
          label="Niños"
          sublabel="Hasta 12 años"
          priceCents={event.freePriceCents}
          value={quantities.freeQty}
          onChange={(freeQty) => update({ freeQty })}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {total > 0 ? (
        <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            {total} {total === 1 ? "entrada" : "entradas"}
          </span>
          <span className="font-semibold">
            <Money cents={totalCents} />
          </span>
        </div>
      ) : null}

      <div className="mt-auto grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 text-base"
          onClick={() => router.push("/reservar")}
        >
          Volver
        </Button>
        <Button type="button" size="lg" className="h-12 text-base" onClick={handleContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
