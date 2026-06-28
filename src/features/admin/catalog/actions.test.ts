import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/core/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/core/lib/tenant", () => ({
  getAuthenticatedTenant: vi.fn(),
}));

vi.mock("@/core/lib/billing", () => ({
  canAddProduct: vi.fn(),
  canAddCategory: vi.fn(),
}));

vi.mock("@/core/lib/audit", () => ({
  logAuditEvent: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/core/lib/supabase/server";
import { getAuthenticatedTenant } from "@/core/lib/tenant";
import { canAddProduct } from "@/core/lib/billing";
import { upsertProductAction, deleteProductAction, createCategoryAction } from "./actions";

class QueryBuilder {
  result = { data: null as unknown, error: null as unknown, count: null as number | null };

  select = vi.fn(() => this);
  eq = vi.fn(() => this);
  limit = vi.fn(() => this);
  single = vi.fn(() => Promise.resolve(this.result));
  order = vi.fn(() => this);
  maybeSingle = vi.fn(() => Promise.resolve(this.result));
  insert = vi.fn(() => this);
  update = vi.fn(() => this);
  delete = vi.fn(() => this);

  then(
    onfulfilled: (v: typeof this.result) => unknown,
    onrejected: (e: Error) => unknown,
  ) {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
}

describe("upsertProductAction", () => {
  const negocioQ = new QueryBuilder();
  negocioQ.result = { data: { slug: "test-slug" }, error: null, count: null };

  const productQ = new QueryBuilder();
  productQ.result = { data: { nombre: "Old", precio: 100, disponible: true }, error: null, count: null };

  function makeSupabase() {
    return {
      from: vi.fn((table: string) => {
        if (table === "negocios") return negocioQ;
        return productQ;
      }),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
      },
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());
    (getAuthenticatedTenant as ReturnType<typeof vi.fn>).mockResolvedValue("negocio-1");
    (canAddProduct as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    productQ.result = { data: null, error: null, count: null };
  });

  const validPayload = {
    nombre: "Burger",
    precio: 1500,
    disponible: true,
    stock: 0,
    stock_minimo: 5,
    configuracion: { variantes: [], grupos_opciones: [], imagenes_extra: [] },
  };

  it("rejects invalid payload", async () => {
    await expect(upsertProductAction({} as never)).rejects.toThrow("Datos inválidos");
  });

  it("rejects empty name", async () => {
    await expect(upsertProductAction({ ...validPayload, nombre: "" })).rejects.toThrow("Datos inválidos");
  });

  it("rejects negative price", async () => {
    await expect(upsertProductAction({ ...validPayload, precio: -10 })).rejects.toThrow("Datos inválidos");
  });

  it("creates a product successfully", async () => {
    const result = await upsertProductAction(validPayload);
    expect(result.success).toBe(true);
    expect(productQ.insert).toHaveBeenCalled();
  });

  it("rejects create when over plan limit", async () => {
    (canAddProduct as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    await expect(upsertProductAction(validPayload)).rejects.toThrow("límite de productos");
  });

  it("updates a product successfully", async () => {
    const result = await upsertProductAction(
      { ...validPayload, nombre: "New Burger", precio: 2000 },
      "prod-1",
    );
    expect(result.success).toBe(true);
    expect(productQ.update).toHaveBeenCalled();
  });
});

describe("deleteProductAction", () => {
  const negocioQ = new QueryBuilder();
  negocioQ.result = { data: { slug: "test" }, error: null, count: null };

  const productQ = new QueryBuilder();
  productQ.result = { data: { nombre: "Test Product" }, error: null, count: null };

  function makeSupabase() {
    return {
      from: vi.fn((table: string) => {
        if (table === "negocios") return negocioQ;
        return productQ;
      }),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
      },
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());
    (getAuthenticatedTenant as ReturnType<typeof vi.fn>).mockResolvedValue("negocio-1");
    productQ.result = { data: { nombre: "Test Product" }, error: null, count: null };
  });

  it("rejects empty product id", async () => {
    await expect(deleteProductAction("")).rejects.toThrow("ID de producto inválido");
  });

  it("deletes product successfully", async () => {
    productQ.result = { data: null, error: null, count: null };

    const result = await deleteProductAction("prod-1");
    expect(result.success).toBe(true);
    expect(productQ.delete).toHaveBeenCalled();
  });
});

describe("createCategoryAction", () => {
  const negocioQ = new QueryBuilder();
  negocioQ.result = { data: { slug: "test" }, error: null, count: null };

  const catQ = new QueryBuilder();
  catQ.result = { data: { id: "cat-1" }, error: null, count: null };

  function makeSupabase() {
    return {
      from: vi.fn((table: string) => {
        if (table === "negocios") return negocioQ;
        return catQ;
      }),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
      },
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(makeSupabase());
    (getAuthenticatedTenant as ReturnType<typeof vi.fn>).mockResolvedValue("negocio-1");
  });

  it("rejects empty name", async () => {
    await expect(createCategoryAction("", "test")).rejects.toThrow("Datos de categoría inválidos");
  });

  it("rejects invalid slug", async () => {
    await expect(createCategoryAction("Test", "Test!")).rejects.toThrow("Datos de categoría inválidos");
  });
});
