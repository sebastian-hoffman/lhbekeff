import { DashboardStatsGrid } from "@/components/admin/dashboard-stats";
import { DailySalesChart, ProductSalesSummaryTable } from "@/components/admin/dashboard-sales";
import { getDailySalesSummary, getDashboardStats, getProductOrderSummary, getProductSalesSummary } from "@/server/services/dashboard.service";

export default async function AdminDashboardPage() {
  const [stats, productsBySize, productSales, dailySales] = await Promise.all([
    getDashboardStats(),
    getProductOrderSummary(),
    getProductSalesSummary(),
    getDailySalesSummary(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general de las ventas.</p>
      </div>
      <DashboardStatsGrid stats={stats} />
      <ProductSalesSummaryTable products={productSales} />
      <DailySalesChart points={dailySales} />
      <section className="border-t pt-6">
        <h2 className="text-lg font-semibold">Preventa · Productos por talle</h2>
        <p className="mt-1 text-sm text-muted-foreground">Cantidades para preparar la producción. Los pedidos rechazados no se incluyen.</p>
        {productsBySize.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">Todavía no hay pedidos de productos.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-3">Producto</th><th>Talle</th><th className="text-right">Pendientes</th><th className="text-right">Pagados</th></tr></thead><tbody>{productsBySize.map((product) => <tr key={`${product.productId}-${product.size}`} className="border-b"><td className="py-3 pr-4">{product.name}</td><td>{product.size ?? "—"}</td><td className="text-right">{product.pending}</td><td className="text-right font-semibold">{product.confirmed}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
