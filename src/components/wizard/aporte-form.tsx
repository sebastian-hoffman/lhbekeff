"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Money } from "@/components/shared/money";
import { cn } from "@/lib/utils";
import { useWizardStore } from "@/store/wizard-store";
import type { EventPublicSummary } from "@/types";

const NONE = "none";
const CUSTOM = "custom";

export function AporteForm({ event }: { event: EventPublicSummary }) {
  const router = useRouter();
  const { buyer, attendees, voluntaryContributionCents, setVoluntaryContribution } =
    useWizardStore();

  const presetKeys = event.voluntaryAmountsCents.map((cents) => String(cents));
  const initialKey = presetKeys.includes(String(voluntaryContributionCents))
    ? String(voluntaryContributionCents)
    : voluntaryContributionCents > 0
      ? CUSTOM
      : NONE;

  const [selection, setSelection] = useState(initialKey);
  const [customAmount, setCustomAmount] = useState(
    initialKey === CUSTOM ? String(voluntaryContributionCents / 100) : "",
  );

  useEffect(() => {
    if (!buyer) router.replace("/reservar");
    else if (attendees.length === 0) router.replace("/reservar/entradas");
  }, [buyer, attendees.length, router]);

  function handleContinue() {
    const cents =
      selection === NONE
        ? 0
        : selection === CUSTOM
          ? Math.max(0, Math.round(Number(customAmount.replace(",", ".")) || 0) * 100)
          : Number(selection);

    setVoluntaryContribution(cents);
    router.push("/reservar/resumen");
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Aporte voluntario</h1>
        <p className="text-sm text-muted-foreground">
          ¿Querés realizar un aporte voluntario a Bekeff?
        </p>
      </div>

      <RadioGroup value={selection} onValueChange={setSelection} className="gap-3">
        <AmountOption value={NONE} label="Sin aporte" selected={selection === NONE} />
        {event.voluntaryAmountsCents.map((cents) => (
          <AmountOption
            key={cents}
            value={String(cents)}
            label={<Money cents={cents} />}
            selected={selection === String(cents)}
          />
        ))}
        <AmountOption value={CUSTOM} label="Otro importe" selected={selection === CUSTOM} />
      </RadioGroup>

      {selection === CUSTOM ? (
        <div className="space-y-1.5">
          <Label htmlFor="customAmount">Monto en pesos</Label>
          <Input
            id="customAmount"
            type="number"
            inputMode="numeric"
            min={0}
            step={100}
            placeholder="0"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            autoFocus
          />
        </div>
      ) : null}

      <Button size="lg" className="mt-auto h-12 text-base" onClick={handleContinue}>
        Continuar
      </Button>
    </div>
  );
}

function AmountOption({
  value,
  label,
  selected,
}: {
  value: string;
  label: React.ReactNode;
  selected: boolean;
}) {
  return (
    <Label
      htmlFor={`aporte-${value}`}
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-xl border border-border p-4 font-normal transition-colors",
        selected && "border-primary bg-primary/5",
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      <RadioGroupItem id={`aporte-${value}`} value={value} />
    </Label>
  );
}
