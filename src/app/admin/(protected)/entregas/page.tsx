import { DeliveryOrdersTable } from "@/components/admin/delivery-orders-table";
import { listDeliveryOrders } from "@/server/services/purchase.service";

export default async function AdminDeliveriesPage() {
  const orders = await listDeliveryOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Entregas</h1>
        <p className="text-sm text-muted-foreground">
          Pedidos de productos pendientes y confirmados, organizados por comprador.
        </p>
      </div>
      <DeliveryOrdersTable data={orders} />
    </div>
  );
}