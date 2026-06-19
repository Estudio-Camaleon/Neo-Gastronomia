import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  upsertProductSchema,
  submitOrderSchema,
  updateOrderStatusSchema,
  orderStatusSchema,
} from "./schemas";

describe("loginSchema", () => {
  it("accepts valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "secret" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    email: "test@example.com",
    password: "Test@1234",
    firstName: "Juan",
    lastName: "Pérez",
    phone: "+5491123456789",
    referralSource: "google",
    nombreNegocio: "Mi Local",
    slug: "mi-local",
  };

  it("accepts valid registration", () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects email with leading/trailing spaces", () => {
    const result = registerSchema.safeParse({
      ...valid,
      email: "  test@example.com  ",
    });
    expect(result.success).toBe(false);
  });

  it("trims and lowercases email", () => {
    const result = registerSchema.safeParse({
      ...valid,
      email: "Test@Example.COM",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("test@example.com");
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({ ...valid, password: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects short business name", () => {
    const result = registerSchema.safeParse({ ...valid, nombreNegocio: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid slug characters", () => {
    const result = registerSchema.safeParse({ ...valid, slug: "Mi Local!" });
    expect(result.success).toBe(false);
  });

  it("accepts optional whatsapp with country code", () => {
    const result = registerSchema.safeParse({
      ...valid,
      whatsapp: "+5491123456789",
    });
    expect(result.success).toBe(true);
  });

  it("rejects whatsapp with letters", () => {
    const result = registerSchema.safeParse({
      ...valid,
      whatsapp: "1234-5678",
    });
    expect(result.success).toBe(false);
  });

  it("parses all fields", () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe("Juan");
      expect(result.data.referralSource).toBe("google");
    }
  });
});

describe("orderStatusSchema", () => {
  it("accepts valid statuses", () => {
    expect(orderStatusSchema.safeParse("pendiente").success).toBe(true);
    expect(orderStatusSchema.safeParse("en_preparacion").success).toBe(true);
    expect(orderStatusSchema.safeParse("entregado").success).toBe(true);
    expect(orderStatusSchema.safeParse("cancelado").success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(orderStatusSchema.safeParse("invalid").success).toBe(false);
  });
});

describe("updateOrderStatusSchema", () => {
  it("accepts valid status update", () => {
    const result = updateOrderStatusSchema.safeParse({
      pedidoId: "abc-123",
      nuevoEstado: "entregado",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty pedidoId", () => {
    const result = updateOrderStatusSchema.safeParse({
      pedidoId: "",
      nuevoEstado: "entregado",
    });
    expect(result.success).toBe(false);
  });
});

describe("upsertProductSchema", () => {
  const valid = {
    nombre: "Triple Burger",
    precio: 1500,
    disponible: true,
    configuracion: { variantes: [], grupos_opciones: [] },
  };

  it("accepts valid product", () => {
    const result = upsertProductSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = upsertProductSchema.safeParse({ ...valid, nombre: "" });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = upsertProductSchema.safeParse({ ...valid, precio: -10 });
    expect(result.success).toBe(false);
  });

  it("accepts optional description", () => {
    const result = upsertProductSchema.safeParse({
      ...valid,
      descripcion: "Una descripción",
    });
    expect(result.success).toBe(true);
  });

  it("accepts variants", () => {
    const result = upsertProductSchema.safeParse({
      ...valid,
      configuracion: {
        variantes: [{ nombre: "Grande", precio: 2000 }],
        grupos_opciones: [],
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects variant without name", () => {
    const result = upsertProductSchema.safeParse({
      ...valid,
      configuracion: {
        variantes: [{ nombre: "", precio: 2000 }],
        grupos_opciones: [],
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("submitOrderSchema", () => {
  const valid = {
    negocio_id: "neg-1",
    cliente_nombre: "Juan Pérez",
    cliente_whatsapp: "+5491123456789",
    es_delivery: false,
    metodo_pago: "efectivo",
    items: [{ producto_id: "p1", cantidad: 2 }],
  };

  it("accepts valid order", () => {
    const result = submitOrderSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts transferencia payment", () => {
    const result = submitOrderSchema.safeParse({
      ...valid,
      metodo_pago: "transferencia",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid payment method", () => {
    const result = submitOrderSchema.safeParse({
      ...valid,
      metodo_pago: "tarjeta",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty items array", () => {
    const result = submitOrderSchema.safeParse({ ...valid, items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects zero quantity", () => {
    const result = submitOrderSchema.safeParse({
      ...valid,
      items: [{ producto_id: "p1", cantidad: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = submitOrderSchema.safeParse({
      ...valid,
      items: [{ producto_id: "p1", cantidad: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts order with delivery address", () => {
    const result = submitOrderSchema.safeParse({
      ...valid,
      es_delivery: true,
      direccion_entrega: "Calle Falsa 123",
    });
    expect(result.success).toBe(true);
  });
});
