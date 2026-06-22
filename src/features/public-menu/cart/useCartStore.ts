import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartExtra {
  grupo_id: string;
  grupo_titulo: string;
  item_id: string;
  item_nombre: string;
  item_precio: number;
  cantidad: number;
}

export interface CartItem {
  id: string;
  producto_id: string;
  nombre: string;
  imagen_url?: string | null;
  precio: number;
  cantidad: number;
  detalles: string | null;
  extras: CartExtra[];
}

export function generateItemId(
  producto_id: string,
  extras: CartExtra[],
  variant?: string,
): string {
  let id = producto_id;
  if (variant) id += `__v:${variant}`;
  if (extras && extras.length > 0) {
    const key = extras
      .map((e) => `${e.grupo_id}:${e.item_id}`)
      .sort()
      .join("|");
    id += `__${key}`;
  }
  return id;
}

interface CartState {
  cart: CartItem[];
  isCartOpen: boolean;
  negocio_id: string | null;
  addItem: (newItem: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  setNegocioId: (id: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,
      negocio_id: null,

      addItem: (newItem) =>
        set((state) => {
          const existingItemIdx = state.cart.findIndex(
            (item) => item.id === newItem.id,
          );

          if (existingItemIdx > -1) {
            const updatedCart = [...state.cart];
            updatedCart[existingItemIdx] = {
              ...updatedCart[existingItemIdx],
              cantidad:
                updatedCart[existingItemIdx].cantidad + newItem.cantidad,
            };
            return { cart: updatedCart };
          }

          return { cart: [...state.cart, newItem] };
        }),

      removeItem: (id) =>
        set((state) => {
          const existingItemIdx = state.cart.findIndex(
            (item) => item.id === id,
          );

          if (existingItemIdx > -1) {
            const updatedCart = [...state.cart];
            const currentItem = updatedCart[existingItemIdx];

            if (currentItem.cantidad > 1) {
              updatedCart[existingItemIdx] = {
                ...currentItem,
                cantidad: currentItem.cantidad - 1,
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

      setNegocioId: (id) => {
        const currentId = get().negocio_id;
        if (currentId && currentId !== id && get().cart.length > 0) {
          set({ cart: [], negocio_id: id, isCartOpen: false });
        } else {
          set({ negocio_id: id });
        }
      },
    }),
    {
      name: "neo-cart",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return window.localStorage;
        return {
          getItem: (_name: string) => null,
          setItem: (_name: string, _value: string) => undefined,
          removeItem: (_name: string) => undefined,
        } as unknown as Storage;
      }),
      partialize: (state) => ({
        cart: state.cart,
        isCartOpen: state.isCartOpen,
        negocio_id: state.negocio_id,
      }),
    },
  ),
);
