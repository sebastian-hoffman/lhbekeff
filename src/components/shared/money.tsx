import { formatMoney } from "@/lib/utils";
import { cn } from "@/lib/utils";

type MoneyProps = {
  cents: number;
  className?: string;
};

/** Muestra un monto en centavos formateado como pesos argentinos. */
export function Money({ cents, className }: MoneyProps) {
  return <span className={cn("tabular-nums", className)}>{formatMoney(cents)}</span>;
}
