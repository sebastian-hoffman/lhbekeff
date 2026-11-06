import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { Money } from "@/components/shared/money";
import { WizardResetOnMount } from "@/components/wizard/wizard-reset-on-mount";
import { getPurchaseByCode } from "@/server/services/purchase.service";
import { StatusBadge } from "@/components/shared/status-badge";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

function formatEventTime(date: Date): string {
  const [hour, minute] = timeFormatter.format(date).split(":");
  if (minute === "00") return `${hour} hs`;
  return `${hour}:${minute} hs`;
}

function formatEventDate(date: Date): string {
  const formatted = dateFormatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default async function ConfirmacionPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const purchase = await getPurchaseByCode(code);
  if (!purchase) notFound();

  if (purchase.items.length > 0) {
    return <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-6 py-14 text-center">
      <Link href="/" className="text-xl font-extrabold text-primary">LAMROTH</Link>
      <CheckCircle2 className="mt-8 size-12 text-primary" />
      <h1 className="mt-5 text-3xl font-semibold">{purchase.status === "CONFIRMED" ? "¡Tu pago está confirmado!" : purchase.receiptUrl ? "¡Recibimos tu comprobante!" : "Tu pedido está registrado."}</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{purchase.status === "CONFIRMED" ? "Entrega en sedes de Lamroth. Guardá el código de tu pedido." : purchase.receiptUrl ? "El pago se confirmará después de la revisión manual del comprobante." : "El regreso desde Mercado Pago no confirma el pago automáticamente. Cargá el comprobante desde tu pedido para que podamos verificarlo."}</p>
      <div className="mt-5"><StatusBadge status={purchase.status} /></div>
      <div className="mt-7 w-full space-y-4 border-y py-5 text-left"><p className="text-sm">Pedido <strong>{purchase.code}</strong></p>{purchase.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.quantity} × {item.name}{item.size ? ` · Talle ${item.size}` : ""}</span><Money cents={item.subtotalCents} /></div>)}<div className="flex justify-between border-t pt-4 font-semibold"><span>Total</span><Money cents={purchase.totalCents} /></div></div>
      <Button asChild className="mt-7 w-full"><Link href={`/pedido/${purchase.code}`}>Ver mi pedido y estado del pago</Link></Button>
      <Link href="/" className="mt-5 text-sm underline underline-offset-4">Volver a la tienda</Link>
    </main>;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <WizardResetOnMount />
      <Logo variant="mark" className="size-14" />
      <CheckCircle2 className="mt-6 size-12 text-primary" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">¡Gracias por tu compra!</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Comprobante recibido. Validaremos tu pago y te avisaremos por este medio.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
          <CalendarDays className="size-3.5" />
          {formatEventDate(purchase.event.date)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          <Clock3 className="size-3.5" />
          {formatEventTime(purchase.event.date)}
        </span>
      </div>

      <div className="mt-8 w-full max-w-xs space-y-3 rounded-2xl border border-border bg-card p-5 text-left">
        <div>
          <p className="text-xs text-muted-foreground">Código de compra</p>
          <p className="text-lg font-semibold tracking-wide">{purchase.code}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold">
            <Money cents={purchase.totalCents} />
          </p>
        </div>
      </div>

      <Button asChild variant="outline" className="mt-8">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
