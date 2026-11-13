export const PRESALE_CLOSES_AT = "2026-11-14T00:00:00-03:00";
export const SHIRT_SIZES = ["6", "8", "10", "12", "14", "16", "S", "M", "L", "XL", "2XL"] as const;

export const PRODUCTS = [
  { id: "remera", name: "Remera de Shabat", priceCents: 1500000, requiresSize: true },
  { id: "botella", name: "Botellita Lamroth", priceCents: 1000000, requiresSize: false },
  { id: "toallon", name: "Toallón Lamroth", priceCents: 1800000, requiresSize: false },
] as const;

export type ProductId = (typeof PRODUCTS)[number]["id"];
export type CartItem = { productId: ProductId; size: string; quantity: number };

export function isPresaleOpen(now = new Date()) {
  return now.getTime() < new Date(PRESALE_CLOSES_AT).getTime();
}

export function priceCart(items: CartItem[]) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
    throw new Error("Agregá al menos un producto a tu pedido.");
  }
  return items.map((item) => {
    const product = PRODUCTS.find((candidate) => candidate.id === item.productId);
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new Error("Revisá los productos y las cantidades del pedido.");
    }
    if (product.requiresSize && !SHIRT_SIZES.some((size) => size === item.size)) {
      throw new Error("Elegí un talle válido para cada remera.");
    }
    if (!product.requiresSize && item.size !== "") {
      throw new Error("Este producto no tiene variantes.");
    }
    return {
      productId: product.id,
      name: product.name,
      size: item.size || null,
      quantity: item.quantity,
      unitPriceCents: product.priceCents,
      subtotalCents: product.priceCents * item.quantity,
    };
  });
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  }).format(cents / 100);
}