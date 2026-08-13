import { notFound } from "next/navigation";
import { PagoPanel } from "@/components/wizard/pago-panel";
import { getOrCreateMercadoPagoCheckoutUrl } from "@/lib/mercado-pago";
import { getPurchaseByCode } from "@/server/services/purchase.service";

export default async function PagoPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const purchase = await getPurchaseByCode(code);
  if (!purchase) notFound();

  const mercadoPagoCheckoutUrl = await getOrCreateMercadoPagoCheckoutUrl(purchase);

  return (
    <PagoPanel
      code={purchase.code}
      totalCents={purchase.totalCents}
      mercadoPagoCheckoutUrl={mercadoPagoCheckoutUrl}
    />
  );
}
