import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore, generateItemId, type CartItem } from "./useCartStore";

const mockItem: CartItem = {
  id: "prod-1",
  producto_id: "prod-1",
  nombre: "Pizza",
  precio: 100,
  cantidad: 1,
  detalles: null,
  extras: [],
};

const mockItemWithExtras: CartItem = {
  id: "prod-1__ext-1:opt-1",
  producto_id: "prod-1",
  nombre: "Pizza",
  precio: 120,
  cantidad: 1,
  detalles: null,
  extras: [
    {
      grupo_id: "ext-1",
      grupo_titulo: "Queso extra",
      item_id: "opt-1",
      item_nombre: "Mozzarella",
      item_precio: 20,
    },
  ],
};

beforeEach(() => {
  useCartStore.setState({
    cart: [],
    isCartOpen: false,
    negocio_id: null,
  });
});

describe("useCartStore", () => {
  it("starts with empty cart", () => {
    const { cart, isCartOpen, negocio_id } = useCartStore.getState();
    expect(cart).toEqual([]);
    expect(isCartOpen).toBe(false);
    expect(negocio_id).toBeNull();
  });

  it("adds an item", () => {
    useCartStore.getState().addItem(mockItem);
    const { cart } = useCartStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].nombre).toBe("Pizza");
    expect(cart[0].cantidad).toBe(1);
  });

  it("increments quantity when adding same item id", () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().addItem(mockItem);
    const { cart } = useCartStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].cantidad).toBe(2);
  });

  it("adds separate entries for items with different extras", () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().addItem(mockItemWithExtras);
    const { cart } = useCartStore.getState();
    expect(cart).toHaveLength(2);
  });

  it("decrements quantity on removeItem when > 1", () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().removeItem(mockItem.id);
    const { cart } = useCartStore.getState();
    expect(cart).toHaveLength(1);
    expect(cart[0].cantidad).toBe(1);
  });

  it("removes item when cantidad reaches 0", () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().removeItem(mockItem.id);
    const { cart } = useCartStore.getState();
    expect(cart).toHaveLength(0);
  });

  it("clears the cart", () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().clearCart();
    const { cart } = useCartStore.getState();
    expect(cart).toEqual([]);
  });

  it("toggles cart open state", () => {
    expect(useCartStore.getState().isCartOpen).toBe(false);
    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isCartOpen).toBe(true);
    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isCartOpen).toBe(false);
  });

  it("sets negocio_id and clears cart on change", () => {
    useCartStore.getState().setNegocioId("neg-1");
    useCartStore.getState().addItem(mockItem);
    expect(useCartStore.getState().cart).toHaveLength(1);

    useCartStore.getState().setNegocioId("neg-2");
    expect(useCartStore.getState().cart).toHaveLength(0);
    expect(useCartStore.getState().negocio_id).toBe("neg-2");
  });

  it("keeps cart when setting same negocio_id", () => {
    useCartStore.getState().setNegocioId("neg-1");
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().setNegocioId("neg-1");
    expect(useCartStore.getState().cart).toHaveLength(1);
  });
});

describe("generateItemId", () => {
  it("returns producto_id when no extras", () => {
    expect(generateItemId("prod-1", [])).toBe("prod-1");
  });

  it("generates unique id based on extras", () => {
    const extras = [
      { grupo_id: "g1", item_id: "i1", grupo_titulo: "", item_nombre: "", item_precio: 0 },
      { grupo_id: "g2", item_id: "i2", grupo_titulo: "", item_nombre: "", item_precio: 0 },
    ];
    const id = generateItemId("prod-1", extras);
    expect(id).toContain("prod-1");
    expect(id).toContain("g1");
    expect(id).toContain("g2");
  });

  it("sorts extras to produce consistent ids", () => {
    const extrasA = [
      { grupo_id: "g2", item_id: "i2", grupo_titulo: "", item_nombre: "", item_precio: 0 },
      { grupo_id: "g1", item_id: "i1", grupo_titulo: "", item_nombre: "", item_precio: 0 },
    ];
    const extrasB = [
      { grupo_id: "g1", item_id: "i1", grupo_titulo: "", item_nombre: "", item_precio: 0 },
      { grupo_id: "g2", item_id: "i2", grupo_titulo: "", item_nombre: "", item_precio: 0 },
    ];
    expect(generateItemId("prod-1", extrasA)).toBe(generateItemId("prod-1", extrasB));
  });
});
