import { notFound } from "next/navigation";
import { ComprobanteUploader } from "@/components/wizard/comprobante-uploader";
import { getPurchaseByCode } from "@/server/services/purchase.service";

export default async function ComprobantePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const purchase = await getPurchaseByCode(code);
  if (!purchase) notFound();

  return <ComprobanteUploader code={purchase.code} />;
}
