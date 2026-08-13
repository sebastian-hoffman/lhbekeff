import { notFound } from "next/navigation";
import { PagoPanel } from "@/components/wizard/pago-panel";
import { getMercadoPagoPaymentOption } from "@/lib/mercado-pago";
import { generateQrDataUrl } from "@/lib/qr";
import { getPurchaseByCode } from "@/server/services/purchase.service";

export default async function PagoPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const purchase = await getPurchaseByCode(code);
  if (!purchase) notFound();

  const mercadoPagoPaymentOption = await getMercadoPagoPaymentOption(purchase);
  const mercadoPagoQrDataUrl = mercadoPagoPaymentOption
    ? await generateQrDataUrl(mercadoPagoPaymentOption.url)
    : null;

  return (
    <PagoPanel
      code={purchase.code}
      totalCents={purchase.totalCents}
      mercadoPagoPaymentOption={mercadoPagoPaymentOption}
      mercadoPagoQrDataUrl={mercadoPagoQrDataUrl}
    />
  );
}
