import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PurchaseStatus } from "@/generated/prisma/enums";

const STATUS_CONFIG: Record<PurchaseStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  },
  CONFIRMED: {
    label: "Confirmada",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  REJECTED: {
    label: "Rechazada",
    className: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
  },
};

export function StatusBadge({ status }: { status: PurchaseStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
