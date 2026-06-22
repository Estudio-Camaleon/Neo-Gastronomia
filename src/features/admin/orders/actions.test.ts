import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/core/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/core/lib/supabase/admin", () => ({
  supabaseAdmin: { from: vi.fn(), rpc: vi.fn() },
}));

vi.mock("@/core/lib/tenant", () => ({
  getAuthenticatedTenant: vi.fn(),
}));

vi.mock("@/core/lib/audit", () => ({
  logAuditEvent: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/core/lib/supabase/server";
import { getAuthenticatedTenant } from "@/core/lib/tenant";
import { updateOrderStatusAction } from "./actions";

class QueryBuilder {
  result = { data: null as unknown, error: null as unknown, count: null as number | null };

  select = vi.fn(() => this);
  eq = vi.fn(() => this);
  limit = vi.fn(() => this);
  single = vi.fn(() => Promise.resolve(this.result));
  order = vi.fn(() => this);
  maybeSingle = vi.fn(() => Promise.resolve(this.result));
  update = vi.fn(() => this);

  then(
    onfulfilled: (v: typeof this.result) => unknown,
    onrejected: (e: Error) => unknown,
  ) {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
}

describe("updateOrderStatusAction", () => {
  const pedidoQ = new QueryBuilder();

  beforeEach(() => {
    vi.clearAllMocks();
    pedidoQ.result = { data: { estado: "pendiente" }, error: null, count: null };

    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      from: vi.fn(() => pedidoQ),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
      },
    });
    (getAuthenticatedTenant as ReturnType<typeof vi.fn>).mockResolvedValue("negocio-1");
  });

  it("rejects invalid status", async () => {
    await expect(updateOrderStatusAction("pedido-1", "invalid" as never)).rejects.toThrow("Estado de pedido inválido");
  });

  it("rejects empty pedidoId", async () => {
    await expect(updateOrderStatusAction("", "entregado")).rejects.toThrow("Estado de pedido inválido");
  });

  it("updates order status successfully", async () => {
    const result = await updateOrderStatusAction("pedido-1", "entregado");
    expect(result.success).toBe(true);
    expect(pedidoQ.update).toHaveBeenCalledWith({ estado: "entregado" });
  });

  it("throws on db error", async () => {
    pedidoQ.result = { data: { estado: "pendiente" }, error: new Error("RLS failure"), count: null };

    await expect(updateOrderStatusAction("pedido-1", "en_preparacion")).rejects.toThrow("RLS failure");
  });
});
