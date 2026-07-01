import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import {
  getMercadoPagoNotificationId,
  parseMercadoPagoSignature,
  verifyMercadoPagoSignature,
} from "./mercadopago";

describe("mercado pago helpers", () => {
  it("parses signature headers", () => {
    expect(parseMercadoPagoSignature("ts=123,v1=abc,foo=bar")).toEqual({
      ts: "123",
      v1: "abc",
      foo: "bar",
    });
  });

  it("returns null for empty signatures", () => {
    expect(parseMercadoPagoSignature(null)).toBeNull();
  });

  it("verifies valid signatures", () => {
    const requestId = "req-123";
    const ts = "1710000000";
    const secret = "secret-123";
    const payload = `id:${requestId};request-id:${requestId};ts:${ts};`;
    const signature = createHmac("sha256", secret).update(payload).digest("hex");

    expect(
      verifyMercadoPagoSignature({
        signature: `ts=${ts},v1=${signature}`,
        requestId,
        secret,
      }),
    ).toBe(true);
  });

  it("rejects signatures with a different request id", () => {
    const secret = "secret-123";
    const signature = createHmac("sha256", secret)
      .update("id:req-123;request-id:req-123;ts:1710000000;")
      .digest("hex");

    expect(
      verifyMercadoPagoSignature({
        signature: `ts=1710000000,v1=${signature}`,
        requestId: "req-999",
        secret,
      }),
    ).toBe(false);
  });

  it("extracts webhook notification ids", () => {
    expect(
      getMercadoPagoNotificationId(
        "application/json",
        JSON.stringify({ data: { id: "123" } }),
      ),
    ).toBe("123");

    expect(
      getMercadoPagoNotificationId(
        "application/x-www-form-urlencoded",
        "topic=subscription_preapproval&id=456",
      ),
    ).toBe("456");
  });
});