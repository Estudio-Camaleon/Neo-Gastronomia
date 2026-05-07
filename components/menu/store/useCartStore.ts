import { create } from "zustand";

// Interfaz para representar un ítem individual dentro del carrito de compras
interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  detalles?: string; // <--- ¡ESTO ES LO QUE FALTA AGREGAR!
}

// Contrato de la API de estado global del carrito gerenciado por Zustand
interface CartState {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  // Estado inicial plano
  cart: [],

  // Agrega un ítem al carrito o incrementa su cantidad si ya existe
  addItem: (newItem) =>
    set((state) => {
      const existingItemIndex = state.cart.findIndex(
        (item) => item.id === newItem.id,
      );

      if (existingItemIndex > -1) {
        // Clonamos el arreglo para respetar la inmutabilidad de Zustand
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          cantidad: updatedCart[existingItemIndex].cantidad + newItem.cantidad,
        };
        return { cart: updatedCart };
      }

      // Si el ítem es nuevo, lo incorporamos al final del arreglo
      return { cart: [...state.cart, newItem] };
    }),

  // Decrementa la cantidad de un producto o lo remueve por completo si llega a cero
  removeItem: (id) =>
    set((state) => {
      const existingItemIndex = state.cart.findIndex((item) => item.id === id);

      if (existingItemIndex > -1) {
        const updatedCart = [...state.cart];
        const currentItem = updatedCart[existingItemIndex];

        if (currentItem.cantidad > 1) {
          // Si tiene más de una unidad, restamos una
          updatedCart[existingItemIndex] = {
            ...currentItem,
            cantidad: currentItem.cantidad - 1,
          };
          return { cart: updatedCart };
        } else {
          // Si tiene una sola unidad, lo barremos del carrito por completo
          return { cart: state.cart.filter((item) => item.id !== id) };
        }
      }

      return { cart: state.cart };
    }),

  // Vacía el carrito por completo (útil para cancelaciones o despachos exitosos)
  clearCart: () => set({ cart: [] }),
}));
