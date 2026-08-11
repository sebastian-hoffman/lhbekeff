"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/shared/money";

type QuantityStepperProps = {
  label: string;
  sublabel: string;
  priceCents: number;
  value: number;
  onChange: (value: number) => void;
  max?: number;
};

export function QuantityStepper({
  label,
  sublabel,
  priceCents,
  value,
  onChange,
  max = 50,
}: QuantityStepperProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{sublabel}</p>
        <p className="mt-1 text-sm font-medium text-primary">
          {priceCents === 0 ? "Sin cargo" : <Money cents={priceCents} />}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 rounded-full"
          disabled={value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label={`Restar ${label}`}
        >
          <Minus className="size-4" />
        </Button>
        <span className="w-6 text-center text-lg font-semibold tabular-nums">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 rounded-full"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Sumar ${label}`}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
