import assert from "node:assert/strict";
import { test } from "node:test";
import { isPresaleOpen, priceCart, SHIRT_SIZES } from "../src/lib/shop.ts";

test("prices are server-owned and different shirt sizes can coexist", () => {
  const items = priceCart([
    { productId: "remera", size: "6", quantity: 2, unitPriceCents: 1 },
    { productId: "remera", size: "XL", quantity: 1 },
    { productId: "remera", size: "2XL", quantity: 1 },
    { productId: "botella", size: "", quantity: 1 },
    { productId: "toallon", size: "", quantity: 1 },
  ]);
  assert.equal(items.reduce((total, item) => total + item.subtotalCents, 0), 8800000);
  assert.deepEqual(SHIRT_SIZES, ["6", "8", "10", "12", "14", "16", "S", "M", "L", "XL", "2XL"]);
});

test("invalid sizes, products, variants and quantities cannot be ordered", () => {
  for (const item of [
    { productId: "remera", size: "", quantity: 1 },
    { productId: "remera", size: "3XL", quantity: 1 },
    { productId: "botella", size: "blanca", quantity: 1 },
    { productId: "unknown", size: "", quantity: 1 },
    { productId: "toallon", size: "", quantity: -1 },
    { productId: "toallon", size: "", quantity: 1.5 },
    { productId: "toallon", size: "", quantity: 100 },
  ]) assert.throws(() => priceCart([item]));
  assert.throws(() => priceCart([]));
});

test("presale closes after November 13 in Argentina", () => {
  assert.equal(isPresaleOpen(new Date("2026-11-13T23:59:59-03:00")), true);
  assert.equal(isPresaleOpen(new Date("2026-11-14T00:00:00-03:00")), false);
});