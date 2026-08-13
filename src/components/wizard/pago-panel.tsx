import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TransferPaymentDetails } from "@/components/wizard/transfer-payment-details";

type PagoPanelProps = {
  code: string;
  totalCents: number;
};

export function PagoPanel({ code, totalCents }: PagoPanelProps) {
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

      <TransferPaymentDetails code={code} totalCents={totalCents} />

      <div className="mt-auto grid gap-3 sm:grid-cols-2">
        <Button asChild size="lg" className="h-12 text-base">
          <Link href={`/reservar/comprobante/${code}`}>Ya transferí, subir comprobante ahora</Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="h-12 text-base">
          <Link href="/comprobante">Ya transferí, cargar comprobante después</Link>
        </Button>
      </div>
    </div>
  );
}
