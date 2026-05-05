import { create } from "zustand";

interface CartItem {
  id: string;

  nombre: string;

  precio: number;

  cantidad: number;
}

interface CartStore {
  cart: CartItem[];

  addToCart: (item: CartItem) => void;

  removeFromCart: (id: string) => void;

  updateCantidad: (id: string, delta: number) => void;

  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],

  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((i) => i.id === item.id);

      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i,
          ),
        };
      }

      return { cart: [...state.cart, { ...item, cantidad: 1 }] };
    }),

  removeFromCart: (id) =>
    set((state) => ({ cart: state.cart.filter((i) => i.id !== id) })),

  updateCantidad: (id, delta) =>
    set((state) => ({
      cart: state.cart.map((i) =>
        i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i,
      ),
    })),

  clearCart: () => set({ cart: [] }),
}));
