import { Money } from "@/components/shared/money";
import type { DailySalesPoint, ProductSalesSummary } from "@/server/services/dashboard.service";

const axisMoneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  notation: "compact",
  maximumFractionDigits: 0,
});

export function ProductSalesSummaryTable({ products }: { products: ProductSalesSummary[] }) {
  return (
    <section className="border-t pt-6">
      <h2 className="text-lg font-semibold">Ventas por producto</h2>
      <p className="mt-1 text-sm text-muted-foreground">Unidades y monto de compras confirmadas.</p>
      {products.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">Todavía no hay productos vendidos.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3">Producto</th>
                <th className="text-right">Unidades vendidas</th>
                <th className="text-right">Monto vendido</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productId} className="border-b">
                  <td className="py-3 pr-4">{product.name}</td>
                  <td className="text-right tabular-nums">{product.quantity}</td>
                  <td className="text-right font-semibold">
                    <Money cents={product.totalCents} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function DailySalesChart({ points }: { points: DailySalesPoint[] }) {
  const width = 860;
  const height = 280;
  const left = 78;
  const right = 12;
  const top = 14;
  const bottom = 40;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maxAmount = Math.max(...points.map((point) => point.amountCents), 0);
  const scaleMax = maxAmount > 0 ? Math.ceil(maxAmount / 100_000) * 100_000 : 100_000;
  const step = chartWidth / Math.max(points.length, 1);
  const barWidth = Math.min(28, step * 0.6);
  const description = points
    .map((point) => `${point.label}: ${axisMoneyFormatter.format(point.amountCents / 100)}`)
    .join("; ");

  return (
    <section className="border-t pt-6">
      <h2 className="text-lg font-semibold">Pesos vendidos por día</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Compras confirmadas en los últimos 14 días · hora de Argentina.
      </p>
      <div className="mt-4 overflow-x-auto">
        <svg
          className="h-64 min-w-[680px] w-full"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Monto de ventas confirmadas por día. ${description}`}
        >
          <title>Pesos vendidos por día durante los últimos 14 días</title>
          {Array.from({ length: 5 }, (_, index) => {
            const value = (scaleMax * index) / 4;
            const y = top + chartHeight - (chartHeight * index) / 4;
            return (
              <g key={index}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={y}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray={index === 0 ? undefined : "3 5"}
                />
                <text
                  x={left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--muted-foreground)"
                  fontSize="11"
                >
                  {axisMoneyFormatter.format(value / 100)}
                </text>
              </g>
            );
          })}
          {points.map((point, index) => {
            const barHeight = (point.amountCents / scaleMax) * chartHeight;
            const x = left + step * index + step / 2;
            const y = top + chartHeight - barHeight;
            return (
              <g key={point.date}>
                <rect
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="3"
                  fill="var(--chart-1)"
                >
                  <title>{`${point.label}: ${axisMoneyFormatter.format(point.amountCents / 100)}`}</title>
                </rect>
                <text
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  fontSize="10"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}