import { create } from "zustand";

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

export const useCartStore = create<CartState>((set) => ({
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
}));
