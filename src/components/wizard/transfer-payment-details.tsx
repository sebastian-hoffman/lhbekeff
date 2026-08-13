"use client";

import { useState } from "react";
import { Check, Clock3, Copy } from "lucide-react";
import { toast } from "sonner";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { TRANSFER_ACCOUNT } from "@/lib/transfer";

type TransferPaymentDetailsProps = {
  totalCents: number;
  code: string;
  showOnlyTransferNotice?: boolean;
};

type CopyKey = "cbu";

export function TransferPaymentDetails({
  totalCents,
  code,
  showOnlyTransferNotice = true,
}: TransferPaymentDetailsProps) {
  const [copiedKey, setCopiedKey] = useState<CopyKey | null>(null);

  async function copyValue(key: CopyKey, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      toast.success("Dato copiado");
      setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1500);
    } catch {
      toast.error("No se pudo copiar. Intentá de nuevo.");
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Pago por transferencia bancaria</h2>
        <p className="text-sm text-muted-foreground">
          Transferí el monto exacto y luego subí el comprobante.
        </p>
      </div>

      {showOnlyTransferNotice ? (
        <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          Por el momento, el pago es únicamente por transferencia bancaria. Mercado Pago estará
          disponible próximamente.
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-secondary/30 p-4 text-center">
        <p className="text-sm text-muted-foreground">Total a transferir</p>
        <p className="mt-1 text-3xl font-semibold">
          <Money cents={totalCents} />
        </p>
      </div>

      <div className="rounded-xl border border-border bg-background p-4 text-sm">
        <div className="space-y-3">
          <DataRow label="Titular" value={TRANSFER_ACCOUNT.holder} />
          <DataRow label="Banco" value={TRANSFER_ACCOUNT.bank} />
          <DataRow label={TRANSFER_ACCOUNT.accountLabel} value={TRANSFER_ACCOUNT.accountNumber} />
          <div className="flex items-center justify-between gap-3">
            <DataRow label="CBU" value={TRANSFER_ACCOUNT.cbuDisplay} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0"
              onClick={() => copyValue("cbu", TRANSFER_ACCOUNT.cbu)}
            >
              {copiedKey === "cbu" ? (
                <>
                  <Check className="size-3.5" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="size-3.5" /> Copiar
                </>
              )}
            </Button>
          </div>
          <DataRow label="Alias" value={TRANSFER_ACCOUNT.alias} />
          <DataRow label="CUIT" value={TRANSFER_ACCOUNT.cuit} />
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Referencia sugerida</p>
        <p>
          Si tu banco te deja agregar observaciones, indicá el código de compra <strong>{code}</strong>
          . No es obligatorio, pero ayuda a validar más rápido.
        </p>
      </div>

      <div className="inline-flex items-start gap-2 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground">
        <Clock3 className="mt-0.5 size-3.5 shrink-0" />
        <span>El pago se acredita tras verificación manual del comprobante.</span>
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
