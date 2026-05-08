"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  detalles?: string; // <--- Agregado para paridad con el sistema de personalización
}

interface CartContextType {
  cart: CartItem[];
  // Usamos el prefijo _ para silenciar el error de variables no usadas en la interfaz
  addToCart: (_item: CartItem) => void;
  removeFromCart: (_id: string) => void;
  updateQuantity: (_id: string, _delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Inicialización perezosa para evitar parpadeos y leer datos reales
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("neo_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Sincronización automática con el almacenamiento local
  useEffect(() => {
    localStorage.setItem("neo_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id
            ? { ...i, cantidad: i.cantidad + newItem.cantidad }
            : i,
        );
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + delta } : i))
        .filter((i) => i.cantidad > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};
