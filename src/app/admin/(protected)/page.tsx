import { DashboardStatsGrid } from "@/components/admin/dashboard-stats";
import { getDashboardStats } from "@/server/services/dashboard.service";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general de las ventas.</p>
      </div>
      <DashboardStatsGrid stats={stats} />
    </div>
  );
}
