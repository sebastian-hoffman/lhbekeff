import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardStatsGrid } from "@/components/admin/dashboard-stats";
import { DailySalesChart, ProductOrderStatusCards } from "@/components/admin/dashboard-sales";
import { Money } from "@/components/shared/money";
import { getDailySalesSummary, getDashboardStats, getProductOrderStatusSummary, getProductOrderSummary, getRecentPendingPurchases } from "@/server/services/dashboard.service";

const pendingPurchaseDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

export default async function AdminDashboardPage() {
  const [stats, pendingPurchases, productsBySize, productOrderSummary, dailySales] = await Promise.all([
    getDashboardStats(),
    getRecentPendingPurchases(),
    getProductOrderSummary(),
    getProductOrderStatusSummary(),
    getDailySalesSummary(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general de las ventas.</p>
      </div>
      <DashboardStatsGrid stats={stats} />
      <section className="border-t pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Pedidos pendientes de confirmación</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats.pendingPurchases} {stats.pendingPurchases === 1 ? "pedido espera" : "pedidos esperan"} revisión.
            </p>
          </div>
          <Link href="/admin/compras" className="inline-flex items-center gap-1 text-sm underline underline-offset-4">
            Ver todas las compras <ArrowRight className="size-4" />
          </Link>
        </div>
        {pendingPurchases.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">No hay pedidos esperando confirmación.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 pr-4">Ingreso</th>
                  <th className="pr-4">Pedido</th>
                  <th className="pr-4">Comprador</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {pendingPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b">
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <time dateTime={purchase.createdAt.toISOString()}>
                        {pendingPurchaseDateFormatter.format(purchase.createdAt)}
                      </time>
                    </td>
                    <td className="pr-4 whitespace-nowrap">
                      <Link href={`/admin/compras/${purchase.id}`} className="font-medium underline underline-offset-4">
                        {purchase.code}
                      </Link>
                    </td>
                    <td className="pr-4">
                      <p>{purchase.buyerName}</p>
                      <p className="text-xs text-muted-foreground">{purchase.buyerEmail}</p>
                    </td>
                    <td className="text-right font-semibold whitespace-nowrap">
                      <Money cents={purchase.totalCents} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <ProductOrderStatusCards summary={productOrderSummary} />
      <DailySalesChart points={dailySales} />
      <section className="border-t pt-6">
        <h2 className="text-lg font-semibold">Preventa · Productos por talle</h2>
        <p className="mt-1 text-sm text-muted-foreground">Cantidades para preparar la producción. Los pedidos rechazados no se incluyen.</p>
        {productsBySize.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">Todavía no hay pedidos de productos.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3">Producto</th><th>Talle</th><th className="text-right">Pendientes</th><th className="text-right">Pagados</th></tr></thead><tbody>{productsBySize.map((product) => <tr key={`${product.productId}-${product.size}`} className="border-b"><td className="py-3 pr-4">{product.name}</td><td>{product.size ?? "—"}</td><td className="text-right">{product.pending}</td><td className="text-right font-semibold">{product.confirmed}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
