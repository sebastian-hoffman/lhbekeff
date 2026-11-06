"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { priceCart, type CartItem } from "@/lib/shop";

type ShopState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  clear: () => void;
};

export const useShopStore = create<ShopState>()(persist((set) => ({
  items: [],
  add: (item) => set((state) => {
    const existing = state.items.find((entry) => entry.productId === item.productId && entry.size === item.size);
    return { items: existing
      ? state.items.map((entry) => entry === existing ? { ...entry, quantity: Math.min(99, entry.quantity + item.quantity) } : entry)
      : [...state.items, item] };
  }),
  setQuantity: (productId, size, quantity) => set((state) => ({
    items: state.items.map((item) => item.productId === productId && item.size === size
      ? { ...item, quantity: Math.min(99, quantity) } : item).filter((item) => item.quantity > 0),
  })),
  clear: () => set({ items: [] }),
}), {
  name: "lamroth-cart-v1", skipHydration: true,
  merge: (persisted, current) => {
    const saved = persisted as { items?: CartItem[] } | undefined;
    try {
      if (saved?.items?.length) priceCart(saved.items);
      return { ...current, items: saved?.items ?? [] };
    } catch {
      return current;
    }
  },
}));