"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadReceipt } from "@/server/actions/purchase.actions";

export function ComprobanteUploader({ code }: { code: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Seleccioná un archivo.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadReceipt(code, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/confirmacion/${code}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Comprobante</h1>
        <p className="text-sm text-muted-foreground">
          Subí una foto o PDF del comprobante de pago.
        </p>
      </div>

      <label
        htmlFor="receipt"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center transition-colors hover:border-primary/50"
      >
        <FileUp className="size-6 text-muted-foreground" />
        <span className="max-w-full truncate text-sm font-medium">
          {fileName ?? "Elegí un archivo"}
        </span>
        <span className="text-xs text-muted-foreground">JPG, PNG o PDF · hasta 8 MB</span>
        <input
          ref={inputRef}
          id="receipt"
          name="file"
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="sr-only"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
        />
      </label>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" className="mt-auto h-12 text-base" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {isPending ? "Subiendo…" : "Confirmar compra"}
      </Button>
    </form>
  );
}
