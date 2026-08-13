"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadReceiptByCodeAndEmail } from "@/server/actions/purchase.actions";

export function ComprobanteLookupUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!code.trim() || !email.trim()) {
      setError("Completá código de compra y email.");
      return;
    }

    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Seleccioná un archivo.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadReceiptByCodeAndEmail(code, email, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/confirmacion/${code.trim().toUpperCase()}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Cargar comprobante</h1>
        <p className="text-sm text-muted-foreground">
          Si ya transferiste, buscá tu compra con el código y email para subir el comprobante.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-2">
          <Label htmlFor="code">Código de compra</Label>
          <Input
            id="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Ej: BK26-ABC123"
            autoCapitalize="characters"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email del comprador</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nombre@email.com"
            required
          />
        </div>

        <label
          htmlFor="receipt"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/40 p-8 text-center transition-colors hover:border-primary/50"
        >
          <FileUp className="size-6 text-muted-foreground" />
          <span className="max-w-full truncate text-sm font-medium">
            {fileName ?? "Elegí el comprobante"}
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
      </div>

      {error ? <p className="text-sm text-center text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" className="h-12 text-base" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {isPending ? "Subiendo…" : "Enviar comprobante"}
      </Button>
    </form>
  );
}
