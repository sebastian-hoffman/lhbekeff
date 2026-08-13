import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { MercadoPagoPaymentOption } from "@/lib/mercado-pago";
import { TransferPaymentDetails } from "@/components/wizard/transfer-payment-details";

type PagoPanelProps = {
  code: string;
  totalCents: number;
  mercadoPagoPaymentOption?: MercadoPagoPaymentOption | null;
  mercadoPagoQrDataUrl?: string | null;
};

export function PagoPanel({
  code,
  totalCents,
  mercadoPagoPaymentOption,
  mercadoPagoQrDataUrl,
}: PagoPanelProps) {
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

      {mercadoPagoPaymentOption ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-medium">Mercado Pago</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {mercadoPagoPaymentOption.kind === "link"
              ? "Podés pagar escaneando este QR o abriendo el link desde este mismo dispositivo (el monto se ingresa ahí)."
              : "Esta opción aparece cuando activás el token y el modo de pago."}
          </p>

          {mercadoPagoQrDataUrl ? (
            <div className="mt-4 rounded-xl border border-border bg-background p-3">
              <Image
                src={mercadoPagoQrDataUrl}
                alt="QR de pago de Mercado Pago"
                width={280}
                height={280}
                className="mx-auto h-auto w-full max-w-[280px]"
                unoptimized
              />
            </div>
          ) : null}

          {mercadoPagoPaymentOption.kind === "checkout" ? (
            <Button asChild size="lg" className="mt-4 h-12 w-full text-base">
              <Link href={mercadoPagoPaymentOption.url} target="_blank" rel="noreferrer">
                Probar Mercado Pago
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
