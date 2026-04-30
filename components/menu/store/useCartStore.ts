"use client";

import { create } from "zustand";

interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (item: any) => void;
  updateQuantity: (id: string, change: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  total: 0,

  addItem: (newItem) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.id === newItem.id);
      let newItems;

      if (existingItem) {
        newItems = state.items.map((i) =>
          i.id === newItem.id ? { ...i, cantidad: i.cantidad + 1 } : i,
        );
      } else {
        newItems = [...state.items, { ...newItem, cantidad: 1 }];
      }

      return {
        items: newItems,
        total: newItems.reduce(
          (acc, item) => acc + item.precio * item.cantidad,
          0,
        ),
      };
    }),

  updateQuantity: (id, change) =>
    set((state) => {
      const newItems = state.items
        .map((i) => {
          if (i.id === id) {
            const newQty = Math.max(0, i.cantidad + change);
            return { ...i, cantidad: newQty };
          }
          return i;
        })
        .filter((i) => i.cantidad > 0);

      return {
        items: newItems,
        total: newItems.reduce(
          (acc, item) => acc + item.precio * item.cantidad,
          0,
        ),
      };
    }),

  removeItem: (id) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== id);
      return {
        items: newItems,
        total: newItems.reduce(
          (acc, item) => acc + item.precio * item.cantidad,
          0,
        ),
      };
    }),

  clearCart: () => set({ items: [], total: 0 }),
}));
