"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/shared/money";
import { calculateTotals } from "@/lib/pricing";
import { createPurchase } from "@/server/actions/purchase.actions";
import { useWizardStore } from "@/store/wizard-store";
import type { EventPublicSummary } from "@/types";

export function ResumenCard({ event }: { event: EventPublicSummary }) {
  const router = useRouter();
  const {
    eventId,
    buyer,
    quantities,
    attendees,
    voluntaryContributionCents,
    setPurchaseCode,
  } = useWizardStore();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!buyer) router.replace("/reservar");
    else if (attendees.length === 0) router.replace("/reservar/entradas");
  }, [buyer, attendees.length, router]);

  if (!buyer || attendees.length === 0) return null;

  const totals = calculateTotals(
    quantities,
    {
      adultUnitPriceCents: event.adultPriceCents,
      minorUnitPriceCents: event.minorPriceCents,
      freeUnitPriceCents: event.freePriceCents,
    },
    voluntaryContributionCents,
  );

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await createPurchase({
        eventId: eventId!,
        buyerName: buyer!.buyerName,
        buyerEmail: buyer!.buyerEmail,
        buyerPhone: buyer!.buyerPhone,
        adultQty: quantities.adultQty,
        minorQty: quantities.minorQty,
        freeQty: quantities.freeQty,
        attendees: attendees.map((a) => ({ category: a.category, name: a.name.trim() })),
        voluntaryContributionCents,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setPurchaseCode(result.code);
      router.push(`/reservar/pago/${result.code}`);
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
        <p className="text-sm text-muted-foreground">
          Revisá los datos antes de continuar al pago.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 text-sm">
        <dl className="space-y-2">
          <Row label="Comprador">{buyer.buyerName}</Row>
          <Row label="Email">{buyer.buyerEmail}</Row>
          <Row label="Celular">{buyer.buyerPhone}</Row>
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <ul className="divide-y divide-border text-sm">
          {quantities.adultQty > 0 ? (
            <LineItem
              label={`Adultos · ${quantities.adultQty} x`}
              unitCents={event.adultPriceCents}
              subtotalCents={totals.adultSubtotalCents}
            />
          ) : null}
          {quantities.minorQty > 0 ? (
            <LineItem
              label={`Menores · ${quantities.minorQty} x`}
              unitCents={event.minorPriceCents}
              subtotalCents={totals.minorSubtotalCents}
            />
          ) : null}
          {quantities.freeQty > 0 ? (
            <LineItem
              label={`Niños · ${quantities.freeQty} x`}
              unitCents={event.freePriceCents}
              subtotalCents={totals.freeSubtotalCents}
            />
          ) : null}
          {voluntaryContributionCents > 0 ? (
            <li className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Aporte voluntario</span>
              <span className="font-medium">
                <Money cents={voluntaryContributionCents} />
              </span>
            </li>
          ) : null}
        </ul>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-semibold">
            <Money cents={totals.totalCents} />
          </span>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button size="lg" className="mt-auto h-12 text-base" onClick={handleConfirm} disabled={isPending}>
        {isPending ? "Confirmando…" : "Confirmar y continuar al pago"}
      </Button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{children}</dd>
    </div>
  );
}

function LineItem({
  label,
  unitCents,
  subtotalCents,
}: {
  label: string;
  unitCents: number;
  subtotalCents: number;
}) {
  return (
    <li className="flex items-center justify-between py-3">
      <span className="text-muted-foreground">
        {label} <Money cents={unitCents} />
      </span>
      <span className="font-medium">
        <Money cents={subtotalCents} />
      </span>
    </li>
  );
}
