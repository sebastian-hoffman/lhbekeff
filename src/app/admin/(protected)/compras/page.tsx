import { PurchasesTable } from "@/components/admin/purchases-table";
import { listPurchases } from "@/server/services/purchase.service";

export default async function AdminPurchasesPage() {
  const purchases = await listPurchases();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Compras</h1>
        <p className="text-sm text-muted-foreground">Todas las compras registradas.</p>
      </div>
      <PurchasesTable data={purchases} />
    </div>
  );
}
