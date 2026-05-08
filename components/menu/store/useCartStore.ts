import { create } from "zustand";

// Interfaz para representar un ítem individual dentro del carrito de compras
interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  detalles?: string; // <--- Agregado para soportar personalizaciones
}

// Contrato de la API de estado global del carrito gerenciado por Zustand
interface CartState {
  cart: CartItem[];
  // Usamos _ para indicar al linter que el nombre es estructural
  addItem: (_item: CartItem) => void;
  removeItem: (_id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  // Estado inicial: Vacío
  cart: [],

  // Agrega un ítem al carrito o incrementa su cantidad si el ID coincide exactamente
  addItem: (newItem) =>
    set((state) => {
      const existingItemIndex = state.cart.findIndex(
        (item) => item.id === newItem.id,
      );

      if (existingItemIndex > -1) {
        // Clonamos el arreglo para mantener la inmutabilidad de Zustand
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          cantidad: updatedCart[existingItemIndex].cantidad + newItem.cantidad,
        };
        return { cart: updatedCart };
      }

      // Si el ítem es nuevo (o tiene un ID único por sus detalles), se agrega al final
      return { cart: [...state.cart, newItem] };
    }),

  // Reduce la cantidad o elimina el ítem si llega a cero
  removeItem: (id) =>
    set((state) => {
      const existingItemIndex = state.cart.findIndex((item) => item.id === id);

      if (existingItemIndex > -1) {
        const updatedCart = [...state.cart];
        const currentItem = updatedCart[existingItemIndex];

        if (currentItem.cantidad > 1) {
          updatedCart[existingItemIndex] = {
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

  // Reset total del estado
  clearCart: () => set({ cart: [] }),
}));
