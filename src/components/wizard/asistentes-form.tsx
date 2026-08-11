"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { categoryLabel } from "@/lib/ticket-number";
import { useWizardStore } from "@/store/wizard-store";

export function AsistentesForm() {
  const router = useRouter();
  const { buyer, attendees, setAttendeeName } = useWizardStore();
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!buyer) {
      router.replace("/reservar");
    } else if (attendees.length === 0) {
      router.replace("/reservar/entradas");
    }
  }, [buyer, attendees.length, router]);

  const numbered = useMemo(() => {
    const counters: Partial<Record<string, number>> = {};
    return attendees.map((attendee) => {
      counters[attendee.category] = (counters[attendee.category] ?? 0) + 1;
      return { ...attendee, index: counters[attendee.category]! };
    });
  }, [attendees]);

  function handleContinue() {
    setTouched(true);
    if (attendees.some((a) => a.name.trim().length === 0)) return;
    router.push("/reservar/aporte");
  }

  if (attendees.length === 0) return null;

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Asistentes</h1>
        <p className="text-sm text-muted-foreground">
          Un nombre por entrada. Si todavía no lo sabés, escribí &quot;A definir&quot;.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {numbered.map((attendee) => {
          const isEmpty = touched && attendee.name.trim().length === 0;
          return (
            <Field key={attendee.localId} data-invalid={isEmpty}>
              <FieldLabel htmlFor={attendee.localId}>
                {categoryLabel(attendee.category)} {attendee.index}
              </FieldLabel>
              <Input
                id={attendee.localId}
                placeholder="Nombre y apellido"
                value={attendee.name}
                onChange={(e) => setAttendeeName(attendee.localId, e.target.value)}
              />
              <FieldError errors={isEmpty ? [{ message: "Ingresá un nombre." }] : undefined} />
            </Field>
          );
        })}
      </div>

      <Button size="lg" className="mt-auto h-12 text-base" onClick={handleContinue}>
        Continuar
      </Button>
    </div>
  );
}
