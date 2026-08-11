import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

/** Formatea un monto en centavos como pesos argentinos, ej: 2000000 -> "$ 20.000". */
export function formatMoney(cents: number): string {
  return moneyFormatter.format(cents / 100)
}
