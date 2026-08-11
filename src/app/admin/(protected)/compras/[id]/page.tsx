import { notFound } from "next/navigation";
import { PurchaseDetailView } from "@/components/admin/purchase-detail";
import { getPurchaseById } from "@/server/services/purchase.service";

export default async function AdminPurchaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const purchase = await getPurchaseById(id);
  if (!purchase) notFound();

  return <PurchaseDetailView purchase={purchase} />;
}
