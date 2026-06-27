"use client";

import { forwardRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import type { PedidoData, PedidoItem } from "@/core/types/domain";

// ─── Helpers ──────────────────────────────────────────────

function formatPeso(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

interface ExtraGroup {
  titulo: string;
  items: { nombre: string; precio: number; cantidad: number }[];
}

function parseDetalles(
  item: PedidoItem,
): { extrasByGroup: ExtraGroup[]; variante: string | null; notaCliente: string | null } {
  let extrasByGroup: ExtraGroup[] = [];
  let notaCliente: string | null = null;
  let variante: string | null = null;

  if (item.detalles) {
    try {
      const parsed = JSON.parse(item.detalles);
      if (Array.isArray(parsed)) {
        const map = new Map<string, { nombre: string; precio: number; cantidad: number }[]>();
        for (const e of parsed) {
          const id = String(e.grupo_id ?? "");
          const titulo = String(e.grupo_titulo ?? "Otros");
          const nombre = String(e.item_nombre ?? e.nombre ?? "");
          const precio = Number(e.item_precio ?? 0);
          const cantidad = Number(e.cantidad ?? 1);

          if (id === "__nota__") {
            notaCliente = nombre;
            continue;
          }
          if (id === "__variante__") {
            variante = nombre;
            continue;
          }

          if (!map.has(titulo)) map.set(titulo, []);
          map.get(titulo)!.push({ nombre, precio, cantidad });
        }
        extrasByGroup = Array.from(map.entries()).map(([titulo, items]) => ({ titulo, items }));
      } else {
        notaCliente = item.detalles;
      }
    } catch {
      notaCliente = item.detalles;
    }
  }

  return { extrasByGroup, variante, notaCliente };
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrderRef(id: string): string {
  return `NEO-${id.slice(0, 6).toUpperCase()}`;
}

// ─── CSS (inyectado inline en el print) ──────────────────

const PRINT_STYLE_ID = "comanda-print-styles";

export function injectPrintStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(PRINT_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    @page {
      size: 72mm auto;
      margin: 0;
    }
    @media print {
      html, body {
        width: 72mm;
        margin: 0;
        padding: 0;
        background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;
  document.head.appendChild(style);
}

// ─── Componente principal ─────────────────────────────────

export const ComandaPrintView = forwardRef<HTMLDivElement, { pedido: PedidoData }>(
  function ComandaPrintView({ pedido }, ref) {
    const items = pedido.pedido_items ?? [];
    const orderRef = getOrderRef(pedido.id);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

    useEffect(() => {
      QRCode.toDataURL(orderRef, {
        width: 100,
        margin: 1,
        color: { dark: "#1a1a1a", light: "#ffffff" },
      })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null));
    }, [orderRef]);

    return (
      <div
        ref={ref}
        style={{
          width: "72mm",
          fontFamily: "'Courier New', 'Lucida Console', monospace",
          fontSize: "10px",
          lineHeight: 1.3,
          padding: "2.5mm 2.5mm",
          color: "#000",
          background: "#fff",
        }}
      >
        {/* ══════════════ HEADER ══════════════ */}
        <div style={{ textAlign: "center", marginBottom: "3mm" }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 900,
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "0.8mm",
            }}
          >
            🍔 Comanda
          </div>
          <div
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color: "#333",
              fontFamily: "'Courier New', monospace",
              background: "#f5f5f5",
              display: "inline-block",
              padding: "0.3mm 2.5mm",
              borderRadius: "1mm",
              marginBottom: "0.3mm",
            }}
          >
            {orderRef}
          </div>
          <div style={{ fontSize: "8px", color: "#888", marginTop: "0.3mm" }}>
            {formatDateTime(pedido.created_at)}
          </div>

          {/* QR Code */}
          {qrDataUrl && (
            <div style={{ marginTop: "1.5mm", textAlign: "center" }}>
              <img
                src={qrDataUrl}
                alt={`QR ${orderRef}`}
                style={{ width: "22mm", height: "22mm", imageRendering: "pixelated" }}
              />
              <div style={{ fontSize: "7px", color: "#aaa", marginTop: "0.2mm" }}>
                {orderRef}
              </div>
            </div>
          )}
        </div>

        <Divider dashed />

        {/* ══════════════ CLIENTE ══════════════ */}
        <div style={{ margin: "2mm 0" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "0.3mm" }}>
            {pedido.cliente_nombre}
          </div>
          {pedido.cliente_whatsapp && (
            <div style={{ fontSize: "9px", color: "#444", marginBottom: "0.3mm" }}>
              📱 {pedido.cliente_whatsapp}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: "1mm",
              flexWrap: "wrap",
              marginBottom: pedido.es_delivery && pedido.direccion_entrega ? "0.3mm" : 0,
            }}
          >
            <Tag>{pedido.es_delivery ? "🚚 Delivery" : "🏪 Retiro"}</Tag>
            <Tag>{pedido.metodo_pago}</Tag>
          </div>
          {pedido.es_delivery && pedido.direccion_entrega && (
            <div style={{ fontSize: "9px", color: "#444", marginTop: "0.3mm" }}>
              📍 {pedido.direccion_entrega}
            </div>
          )}
        </div>

        <Divider dashed />

        {/* ══════════════ ITEMS ══════════════ */}
        <table style={{ width: "100%", borderCollapse: "collapse", margin: "1mm 0" }}>
          <thead>
            <tr
              style={{
                fontSize: "8px",
                color: "#999",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              <th style={{ textAlign: "center", padding: "0.3mm 0", width: "9mm" }}>
                Cant
              </th>
              <th style={{ textAlign: "left", padding: "0.3mm 0" }}>
                Producto
              </th>
              <th style={{ textAlign: "right", padding: "0.3mm 0", width: "15mm" }}>
                Importe
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const { extrasByGroup, variante, notaCliente } = parseDetalles(item);
              const totalItem = item.precio_unitario * item.cantidad;
              const isLast = idx === items.length - 1;

              return (
                <tr key={item.id}>
                  <td
                    style={{
                      textAlign: "center",
                      verticalAlign: "top",
                      padding: `${idx === 0 ? "1mm" : "0.8mm"} 0 ${isLast ? "1mm" : "0.8mm"} 0`,
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {item.cantidad}x
                  </td>
                  <td
                    style={{
                      verticalAlign: "top",
                      padding: `${idx === 0 ? "1mm" : "0.8mm"} 0 ${isLast ? "1mm" : "0.8mm"} 0`,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "10px" }}>
                      {item.nombre_producto}
                      {variante && (
                        <span style={{ fontWeight: 400, color: "#666", fontSize: "9px" }}>
                          {" "}({variante})
                        </span>
                      )}
                    </div>

                    {/* Extras agrupados */}
                    {extrasByGroup.map((group) => (
                      <div
                        key={group.titulo}
                        style={{
                          fontSize: "8px",
                          color: "#555",
                          marginTop: "0.2mm",
                          marginLeft: "1.5mm",
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{group.titulo}:</span>{" "}
                        {group.items
                          .map(
                            (ex) =>
                              `${ex.nombre}${ex.cantidad > 1 ? ` x${ex.cantidad}` : ""}`,
                          )
                          .join(", ")}
                      </div>
                    ))}

                    {/* Nota del ítem */}
                    {notaCliente && (
                      <div
                        style={{
                          fontSize: "8px",
                          color: "#b8860b",
                          marginTop: "0.2mm",
                          marginLeft: "1.5mm",
                          fontStyle: "italic",
                        }}
                      >
                        📝 {notaCliente}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      verticalAlign: "top",
                      padding: `${idx === 0 ? "1mm" : "0.8mm"} 0 ${isLast ? "1mm" : "0.8mm"} 0`,
                      fontSize: "10px",
                      fontWeight: 500,
                    }}
                  >
                    {formatPeso(totalItem)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <Divider dashed />

        {/* ══════════════ TOTAL ══════════════ */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            fontWeight: 800,
            margin: "1.5mm 0",
            padding: "0.8mm 1mm",
            background: "#fafafa",
            borderRadius: "1mm",
          }}
        >
          <span>TOTAL</span>
          <span>{formatPeso(pedido.total)}</span>
        </div>

        {/* ══════════════ NOTAS DEL PEDIDO ══════════════ */}
        {pedido.notas && (
          <div
            style={{
              margin: "1.5mm 0",
              padding: "1.5mm",
              background: "#fff8e1",
              borderRadius: "1mm",
              fontSize: "9px",
              border: "1px solid #ffe082",
            }}
          >
            <strong>📝 Nota:</strong> {pedido.notas}
          </div>
        )}

        <Divider />

        {/* ══════════════ FOOTER ══════════════ */}
        <div style={{ textAlign: "center", fontSize: "8px", color: "#999", marginTop: "1.5mm" }}>
          <div style={{ letterSpacing: "1.5px", fontSize: "8px", marginBottom: "0.5mm" }}>
            * * * Gracias por tu pedido * * *
          </div>
          <div style={{ fontSize: "7px", color: "#bbb" }}>
            {formatDateTime(pedido.created_at)}
          </div>
          <div
            style={{
              fontSize: "7px",
              color: "#bbb",
              marginTop: "0.2mm",
              fontFamily: "'Courier New', monospace",
            }}
          >
            {orderRef}
          </div>
        </div>

        {/* Espacio extra para que no se corte el footer */}
        <div style={{ height: "2mm" }} />
      </div>
    );
  },
);

// ─── Sub-componentes ──────────────────────────────────────

function Divider({ dashed }: { dashed?: boolean }) {
  return (
    <hr
      style={{
        border: "none",
        borderTop: dashed ? "1px dashed #bbb" : "1.5px solid #333",
        margin: "1.5mm 0",
      }}
    />
  );
}

function Tag({ children }: { children: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: "#f0f0f0",
        padding: "0.3mm 2mm",
        borderRadius: "0.8mm",
        fontSize: "8px",
        fontWeight: 600,
        color: "#444",
      }}
    >
      {children}
    </span>
  );
}
