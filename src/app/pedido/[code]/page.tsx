import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3, MapPin, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/shared/money";
import { StatusBadge } from "@/components/shared/status-badge";
import { ComprobanteUploader } from "@/components/wizard/comprobante-uploader";
import { TransferPaymentDetails } from "@/components/wizard/transfer-payment-details";
import { getMercadoPagoPaymentOption, type MercadoPagoPaymentOption } from "@/lib/mercado-pago";
import { getPurchaseByCode } from "@/server/services/purchase.service";

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const purchase = await getPurchaseByCode(code);
  if (!purchase || purchase.items.length === 0) notFound();
  let payment: MercadoPagoPaymentOption | null = null;
  if (purchase.status !== "CONFIRMED") {
    try { payment = await getMercadoPagoPaymentOption(purchase); }
    catch (error) { console.error("Mercado Pago no disponible para el pedido", purchase.code, error); }
  }

  return <div className="min-h-screen bg-[#f5f6f3] font-[family-name:var(--font-shop-body)]">
    <header className="border-b bg-white px-5 py-5"><div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
      <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-primary"><Image src="/productos/lamroth-mark.png" alt="" width={36} height={30} />LAMROTH</Link>
      <Link href="/" className="flex items-center gap-2 text-xs"><ArrowLeft size={15} />Volver a la tienda</Link>
    </div></header>
    <main className="mx-auto max-w-5xl px-5 py-10 md:py-16">
      <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Tu pedido de preventa</p>
      <div className="mb-9 flex flex-wrap items-center gap-4"><h1 className="font-[family-name:var(--font-shop-display)] text-5xl font-semibold uppercase">Ya está un paso más cerca.</h1><StatusBadge status={purchase.status} /></div>
      <div className="grid items-start gap-10 md:grid-cols-2">
        <section aria-labelledby="order-summary" className="space-y-5">
          <div className="flex items-center gap-2"><ShoppingBag size={20} /><h2 id="order-summary" className="text-lg font-semibold">Pedido {purchase.code}</h2></div>
          <p className="text-sm text-muted-foreground">Guardá este código y el enlace de esta página para consultar tu pedido y completar el pago.</p>
          <div className="divide-y border-y">{purchase.items.map((item) => <div key={item.id} className="flex justify-between gap-4 py-4 text-sm"><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">{item.size ? `Talle ${item.size} · ` : ""}{item.quantity} × <Money cents={item.unitPriceCents} /></p></div><span className="shrink-0 font-semibold"><Money cents={item.subtotalCents} /></span></div>)}</div>
          <div className="flex justify-between text-lg font-semibold"><span>Total</span><Money cents={purchase.totalCents} /></div>
          <p className="flex items-center gap-2 text-sm"><MapPin size={18} />Entrega en sedes de Lamroth.</p>
          <p className="text-xs leading-relaxed text-muted-foreground">La fecha y la coordinación del retiro se informarán próximamente. Precios finales en pesos argentinos.</p>
          {purchase.status === "CONFIRMED" ? <p className="border-t pt-5 text-sm font-semibold text-green-800">Pago confirmado. Guardá tu código para el retiro.</p> : <p className="flex items-start gap-2 border-t pt-5 text-sm text-muted-foreground"><Clock3 size={18} className="shrink-0" />{purchase.status === "REJECTED" ? `El pago requiere revisión. ${purchase.rejectionReason ?? "Podés cargar un nuevo comprobante."}` : "El pedido está pendiente de pago o verificación manual. Volvé a esta página para consultar su estado."}</p>}
        </section>
        {purchase.status !== "CONFIRMED" && <section aria-label="Pago y comprobante" className="space-y-8">
          {payment ? <div className="space-y-3 border-b pb-7"><h2 className="text-lg font-semibold">Mercado Pago</h2><p className="text-sm text-muted-foreground">{payment.kind === "checkout" ? "Pagá el total de tu pedido con los medios disponibles en Mercado Pago." : "Ingresá el importe exacto de tu pedido al abrir el enlace de pago."}</p><Button asChild className="h-12 w-full"><a href={payment.url} target="_blank" rel="noreferrer">Pagar con Mercado Pago<ArrowUpRight size={18} /></a></Button><p className="text-xs text-muted-foreground">Después de pagar, cargá el comprobante para la verificación manual.</p></div> : <p className="text-xs leading-relaxed text-muted-foreground">Mercado Pago no está disponible en este momento. Podés completar tu pedido por transferencia.</p>}
          <TransferPaymentDetails code={purchase.code} totalCents={purchase.totalCents} showOnlyTransferNotice={false} />
          {purchase.receiptUrl && <p className="text-sm text-green-800">Ya recibimos un comprobante. Podés reemplazarlo si necesitás corregirlo.</p>}
          <ComprobanteUploader code={purchase.code} />
        </section>}
      </div>
    </main>
  </div>;
}