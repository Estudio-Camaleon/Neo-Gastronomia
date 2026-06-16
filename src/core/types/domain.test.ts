import { describe, it, expect } from "vitest";
import type { PedidoData, ClienteResumen } from "./domain";

describe("domain types", () => {
  it("PedidoData accepts valid structure", () => {
    const pedido: PedidoData = {
      id: "p1",
      estado: "pendiente",
      cliente_nombre: "Juan",
      cliente_whatsapp: "123456789",
      metodo_pago: "efectivo",
      total: 200,
      es_delivery: false,
      created_at: "2026-06-06T10:00:00Z",
      pedido_items: [
        {
          id: "i1",
          producto_id: "p1",
          nombre_producto: "Pizza",
          cantidad: 2,
          precio_unitario: 100,
        },
      ],
    };
    expect(pedido.total).toBe(200);
    expect(pedido.pedido_items).toHaveLength(1);
  });

  it("PedidoData supports delivery", () => {
    const pedido: PedidoData = {
      id: "p2",
      estado: "pendiente",
      cliente_nombre: "Maria",
      cliente_whatsapp: "987654321",
      metodo_pago: "tarjeta",
      total: 0,
      es_delivery: true,
      direccion_entrega: "Calle Falsa 123",
      created_at: "2026-06-06T10:00:00Z",
      pedido_items: [],
    };
    expect(pedido.direccion_entrega).toBe("Calle Falsa 123");
  });

  it("pedido items include producto_id", () => {
    const pedido: PedidoData = {
      id: "p3",
      estado: "pendiente",
      cliente_nombre: "Test",
      cliente_whatsapp: "000",
      metodo_pago: "efectivo",
      total: 0,
      es_delivery: false,
      created_at: "2026-06-06T10:00:00Z",
      pedido_items: [
        {
          id: "i1",
          producto_id: "prod-1",
          nombre_producto: "Item",
          cantidad: 1,
          precio_unitario: 100,
        },
      ],
    };
    expect(pedido.pedido_items[0].producto_id).toBe("prod-1");
  });

  it("ClienteResumen structure", () => {
    const cliente: ClienteResumen = {
      id: "c1",
      nombre: "Pedro",
      telefono: "123",
      email: null,
      totalGasto: 2500,
      pedidos: 5,
      ultimoPedido: null,
      notas: null,
    };
    expect(cliente.nombre).toBe("Pedro");
    expect(cliente.totalGasto).toBe(2500);
    expect(cliente.pedidos).toBe(5);
  });
});
