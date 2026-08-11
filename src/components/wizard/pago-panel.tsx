import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/shared/money";

type PagoPanelProps = {
  code: string;
  totalCents: number;
  mercadoPagoLink: string;
};

export function PagoPanel({ code, totalCents, mercadoPagoLink }: PagoPanelProps) {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Pago</h1>
        <p className="text-sm text-muted-foreground">
          Tu código de compra es{" "}
          <span className="font-medium text-foreground">{code}</span>. Guardalo, te lo vamos a
          pedir en la puerta.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">Total a pagar</p>
        <p className="mt-1 text-3xl font-semibold">
          <Money cents={totalCents} />
        </p>
      </div>

      <Button asChild size="lg" className="h-12 text-base">
        <a href={mercadoPagoLink} target="_blank" rel="noopener noreferrer">
          Pagar con Mercado Pago
          <ExternalLink className="size-4" />
        </a>
      </Button>

      <Button asChild variant="outline" size="lg" className="mt-auto h-12 text-base">
        <Link href={`/reservar/comprobante/${code}`}>Ya pagué, continuar</Link>
      </Button>
    </div>
  );
}
