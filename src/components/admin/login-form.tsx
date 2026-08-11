"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validations/admin.schema";
import { adminLogin } from "@/server/actions/admin-auth.actions";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: AdminLoginInput) {
    setError(null);
    startTransition(async () => {
      const result = await adminLogin(values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      const from = searchParams.get("from");
      router.push(from && from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="admin@bekeff.com.ar"
            {...form.register("email")}
          />
          <FieldError errors={form.formState.errors.email ? [form.formState.errors.email] : undefined} />
        </Field>

        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
          <FieldError
            errors={form.formState.errors.password ? [form.formState.errors.password] : undefined}
          />
        </Field>
      </FieldGroup>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" className="h-11" disabled={isPending}>
        {isPending ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  );
}
