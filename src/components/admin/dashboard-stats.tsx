import type { ComponentType } from "react";
import { CheckCircle2, Clock, Ticket, Wallet, WalletMinimal } from "lucide-react";
import { Money } from "@/components/shared/money";
import type { DashboardStats } from "@/server/services/dashboard.service";

export function DashboardStatsGrid({ stats }: { stats: DashboardStats }) {
  const countCards = [
    { label: "Compras totales", value: stats.totalPurchases, icon: Ticket },
    { label: "Pedidos por confirmar", value: stats.pendingPurchases, icon: Clock },
    { label: "Confirmadas", value: stats.confirmedPurchases, icon: CheckCircle2 },
    { label: "Entradas ingresadas", value: stats.checkedInCount, icon: Ticket },
  ];

  const moneyCards = [
    { label: "Total esperado", cents: stats.expectedTotalCents, icon: Wallet },
    { label: "Total confirmado", cents: stats.confirmedTotalCents, icon: WalletMinimal },
    { label: "Monto por confirmar", cents: stats.pendingTotalCents, icon: Clock },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {countCards.map(({ label, value, icon }) => (
          <StatCard key={label} label={label} icon={icon}>
            <span className="text-2xl font-semibold tabular-nums">{value}</span>
          </StatCard>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {moneyCards.map(({ label, cents, icon }) => (
          <StatCard key={label} label={label} icon={icon}>
            <span className="text-2xl font-semibold tabular-nums">
              <Money cents={cents} />
            </span>
          </StatCard>
        ))}
      </div>

    </div>
  );
}

function StatCard({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
