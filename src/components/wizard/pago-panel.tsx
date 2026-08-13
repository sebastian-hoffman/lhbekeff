import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TransferPaymentDetails } from "@/components/wizard/transfer-payment-details";

type PagoPanelProps = {
  code: string;
  totalCents: number;
  mercadoPagoCheckoutUrl?: string | null;
};

export function PagoPanel({ code, totalCents, mercadoPagoCheckoutUrl }: PagoPanelProps) {
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

      <div className="mt-auto flex flex-col gap-3">
        <Button asChild size="lg" className="h-12 w-full text-base whitespace-normal text-center leading-tight">
          <Link href={`/reservar/comprobante/${code}`}>Subir comprobante ahora</Link>
        </Button>

        <Button asChild variant="outline" size="lg" className="h-12 w-full text-base whitespace-normal text-center leading-tight">
          <Link href="/comprobante">Cargar comprobante después</Link>
        </Button>
      </div>

      {mercadoPagoCheckoutUrl ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-medium">Mercado Pago</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta opción aparece solo cuando activás el token y el modo de pago.
          </p>
          <Button asChild size="lg" className="mt-4 h-12 w-full text-base">
            <Link href={mercadoPagoCheckoutUrl} target="_blank" rel="noreferrer">
              Probar Mercado Pago
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
