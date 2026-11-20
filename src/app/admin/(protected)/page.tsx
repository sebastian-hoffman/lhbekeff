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
  const shirtTotals = productsBySize
    .filter((product) => product.productId === "remera")
    .reduce(
      (totals, product) => ({
        pending: totals.pending + product.pending,
        confirmed: totals.confirmed + product.confirmed,
      }),
      { pending: 0, confirmed: 0 },
    );

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
        {productsBySize.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">Todavía no hay pedidos de productos.</p> : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full table-fixed text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="w-[40%] py-3">Producto</th>
                  <th className="w-[12%]">Talle</th>
                  <th className="w-[16%] text-right">Total</th>
                  <th className="w-[16%] text-right">Pagados</th>
                  <th className="w-[16%] text-right">Pendientes</th>
                </tr>
              </thead>
              <tbody>
                {productsBySize.map((product) => (
                  <tr key={`${product.productId}-${product.size}`} className="border-b">
                    <td className="py-3 pr-4">{product.name}</td>
                    <td>{product.size ?? "—"}</td>
                    <td className="text-right font-semibold tabular-nums">{product.pending + product.confirmed}</td>
                    <td className="text-right tabular-nums">{product.confirmed}</td>
                    <td className="text-right tabular-nums">{product.pending}</td>
                  </tr>
                ))}
              </tbody>
              {shirtTotals.pending + shirtTotals.confirmed > 0 ? (
                <tfoot>
                  <tr className="border-t-2 font-semibold">
                    <td className="py-3 pr-4">Total remeras</td>
                    <td>Todos</td>
                    <td className="text-right tabular-nums">{shirtTotals.pending + shirtTotals.confirmed}</td>
                    <td className="text-right tabular-nums">{shirtTotals.confirmed}</td>
                    <td className="text-right tabular-nums">{shirtTotals.pending}</td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
