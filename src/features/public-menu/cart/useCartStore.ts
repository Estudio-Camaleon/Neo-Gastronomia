import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string; // Hash único sintáctico (productoId + extrasSlug)
  producto_id: string; // ID real de la tabla public.productos
  nombre: string;
  imagen_url?: string | null;
  precio: number;
  cantidad: number;
  detalles: string | null;
}

interface CartState {
  cart: CartItem[];
  isCartOpen: boolean;
  addItem: (newItem: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      isCartOpen: false,

      addItem: (newItem) =>
        set((state) => {
          const existingItemIdx = state.cart.findIndex(
            (item) => item.id === newItem.id,
          );

          if (existingItemIdx > -1) {
            const updatedCart = [...state.cart];
            updatedCart[existingItemIdx] = {
              ...updatedCart[existingItemIdx],
              cantidad: updatedCart[existingItemIdx].cantidad + newItem.cantidad,
            };
            return { cart: updatedCart };
          }

          return { cart: [...state.cart, newItem] };
        }),

      removeItem: (id) =>
        set((state) => {
          const existingItemIdx = state.cart.findIndex((item) => item.id === id);

          if (existingItemIdx > -1) {
            const updatedCart = [...state.cart];
            const currentItem = updatedCart[existingItemIdx];

            if (currentItem.cantidad > 1) {
              updatedCart[existingItemIdx] = {
                ...currentItem,
                cantidad:
                  currentItem.cantidad > 1
                    ? currentItem.cantidad - 1
                    : currentItem.cantidad - 1,
              };
              return { cart: updatedCart };
            } else {
              return { cart: state.cart.filter((item) => item.id !== id) };
            }
          }
          return { cart: state.cart };
        }),

      clearCart: () => set({ cart: [] }),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
    }),
    {
      name: "neo-cart", // key in localStorage
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return window.localStorage;
        return {
          getItem: (_name: string) => null,
          setItem: (_name: string, _value: string) => undefined,
          removeItem: (_name: string) => undefined,
        } as unknown as Storage;
      }),
      partialize: (state) => ({ cart: state.cart, isCartOpen: state.isCartOpen }),
    },
  ),
);
