"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { buyerSchema, type BuyerInput } from "@/lib/validations/purchase.schema";
import { useWizardStore } from "@/store/wizard-store";

export function CompradorForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { buyer, setBuyer, setEventId } = useWizardStore();

  useEffect(() => {
    setEventId(eventId);
  }, [eventId, setEventId]);

  const form = useForm<BuyerInput>({
    resolver: zodResolver(buyerSchema),
    defaultValues: buyer ?? { buyerName: "", buyerEmail: "", buyerPhone: "" },
  });

  function onSubmit(values: BuyerInput) {
    setBuyer(values);
    router.push("/reservar/entradas");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Tus datos</h1>
        <p className="text-sm text-muted-foreground">
          Los vamos a usar para identificar tu compra.
        </p>
      </div>

      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.buyerName}>
          <FieldLabel htmlFor="buyerName">Nombre y apellido</FieldLabel>
          <Input
            id="buyerName"
            autoComplete="name"
            placeholder="Juan Pérez"
            {...form.register("buyerName")}
          />
          <FieldError errors={form.formState.errors.buyerName ? [form.formState.errors.buyerName] : undefined} />
        </Field>

        <Field data-invalid={!!form.formState.errors.buyerEmail}>
          <FieldLabel htmlFor="buyerEmail">Email</FieldLabel>
          <Input
            id="buyerEmail"
            type="email"
            autoComplete="email"
            placeholder="juan@email.com"
            {...form.register("buyerEmail")}
          />
          <FieldError errors={form.formState.errors.buyerEmail ? [form.formState.errors.buyerEmail] : undefined} />
        </Field>

        <Field data-invalid={!!form.formState.errors.buyerPhone}>
          <FieldLabel htmlFor="buyerPhone">Celular</FieldLabel>
          <Input
            id="buyerPhone"
            type="tel"
            autoComplete="tel"
            placeholder="11 1234-5678"
            {...form.register("buyerPhone")}
          />
          <FieldError errors={form.formState.errors.buyerPhone ? [form.formState.errors.buyerPhone] : undefined} />
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" className="mt-auto h-12 text-base">
        Continuar
      </Button>
    </form>
  );
}
