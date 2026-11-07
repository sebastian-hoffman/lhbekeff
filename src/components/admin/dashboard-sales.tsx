import { Money } from "@/components/shared/money";
import { CheckCircle2, Clock, Package } from "lucide-react";
import type { DailySalesPoint, ProductOrderStatusSummary } from "@/server/services/dashboard.service";

const axisMoneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  notation: "compact",
  maximumFractionDigits: 0,
});

const PRODUCT_ORDER_STATES = [
  {
    key: "pending",
    title: "Pendientes de confirmación",
    icon: Clock,
    iconClass: "text-amber-700",
  },
  {
    key: "confirmed",
    title: "Confirmados",
    icon: CheckCircle2,
    iconClass: "text-emerald-700",
  },
  {
    key: "total",
    title: "Total activo",
    icon: Package,
    iconClass: "text-primary",
  },
] as const;

export function ProductOrderStatusCards({ summary }: { summary: ProductOrderStatusSummary }) {
  return (
    <section className="border-t pt-6">
      <h2 className="text-lg font-semibold">Productos por estado de pedido</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Unidades y montos según los subtotales guardados en cada pedido. El total suma pendientes y confirmados; los rechazados no se incluyen.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {PRODUCT_ORDER_STATES.map(({ key, title, icon: Icon, iconClass }) => (
          <article key={key} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3 border-b pb-3">
              <h3 className="text-sm font-semibold">{title}</h3>
              <Icon className={`size-4 shrink-0 ${iconClass}`} aria-hidden="true" />
            </div>
            <dl className="divide-y">
              {summary[key].map((product) => (
                <div key={product.productId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 last:pb-0">
                  <dt className="text-sm">{product.name}</dt>
                  <dd className="flex items-baseline gap-2 whitespace-nowrap text-right text-sm">
                    <span className="tabular-nums text-muted-foreground">{product.quantity} u.</span>
                    <span className="font-semibold"><Money cents={product.totalCents} /></span>
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
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