import { customAlphabet } from "nanoid";

// Sin caracteres ambiguos (0/O, 1/I/L) para que el código sea fácil de leer
// y transcribir en la puerta del evento.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const generateSuffix = customAlphabet(ALPHABET, 6);

/** Ej: "BK26-7F3K9Q". El prefijo se deriva del slug del evento. */
export function generatePurchaseCode(eventSlug: string): string {
  const prefix = eventSlug
    .split("-")
    .pop()
    ?.slice(-2)
    .toUpperCase() ?? "EV";
  return `BK${prefix}-${generateSuffix()}`;
}
