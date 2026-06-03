"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Store,
  Truck,
  Banknote,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/core/lib/supabase/client";
import { submitOrderPublicAction } from "../../admin/orders/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OrderFormProps {
  negocioId: string;
  cart: import("./useCartStore").CartItem[];
  total: number;
  onBack: () => void;
  onSuccess: () => void;
  config: {
    moneda_simbolo?: string;
    costo_envio?: number;
  };
}

export function OrderForm({
  negocioId,
  cart,
  total: subtotal,
  onBack,
  onSuccess,
  config,
}: OrderFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    whatsapp: "",
    esDelivery: false,
    direccion: "",
    metodoPago: "efectivo" as "efectivo" | "transferencia",
    notas: "",
  });

  const costoEnvioActual = form.esDelivery ? config.costo_envio || 0 : 0;
  const totalFinal = subtotal + costoEnvioActual;
  const simbolo = config.moneda_simbolo || "$";
  const formatMoney = (value: number) =>
    value.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const dispararWhatsAppExterno = (
    negocioWhatsapp: string,
    pedidoId: string,
  ): boolean => {
    const numeroLimpio = negocioWhatsapp.replace(/\D/g, "");
    if (!numeroLimpio) return false;

    const lineasDetalle = cart.map(
      (i) =>
        `• ${i.cantidad}x ${i.nombre.toUpperCase()} ${i.detalles ? `(_${i.detalles}_)` : ""} - ${simbolo}${formatMoney(i.precio * i.cantidad)}`,
    );

    const MAX_DETALLE_ITEMS = 12;
    const detalleTruncado =
      lineasDetalle.length > MAX_DETALLE_ITEMS
        ? [
            ...lineasDetalle.slice(0, MAX_DETALLE_ITEMS),
            `... y ${lineasDetalle.length - MAX_DETALLE_ITEMS} productos más.`,
          ]
        : lineasDetalle;

    const mensaje = [
      `*🆕 NUEVO PEDIDO (#${pedidoId.slice(0, 6).toUpperCase()})*`,
      `👤 *Cliente:* ${form.nombre.toUpperCase()}`,
      `📱 *WhatsApp:* ${form.whatsapp}`,
      `🛵 *Entrega:* ${form.esDelivery ? `DELIVERY\n📍 *Dirección:* ${form.direccion.toUpperCase()}` : "RETIRO EN LOCAL"}`,
      `💳 *Pago:* ${form.metodoPago.toUpperCase()}`,
      `\n📦 *DETALLE DE COMANDA:*`,
      ...detalleTruncado,
      `\n---`,
      `*Subtotal:* ${simbolo}${formatMoney(subtotal)}`,
      form.esDelivery
        ? `*Envío:* ${simbolo}${formatMoney(costoEnvioActual)}`
        : "",
      `*💰 TOTAL FINAL: ${simbolo}${formatMoney(totalFinal)}*`,
      `\n📝 *Notas:* ${form.notas || "Sin especificaciones."}`,
      `\n_Enviado de forma segura desde NEO Infrastructure_`,
    ]
      .filter(Boolean)
      .join("\n");

    const waUrl = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    const opened = window.open(waUrl);

    if (!opened || opened.closed) {
      navigator.clipboard?.writeText(waUrl).catch(() => {});
      toast.error(
        "No pudimos abrir WhatsApp automáticamente. Copiamos el enlace en tu portapapeles para que lo pegues manualmente.",
        { duration: 8000 },
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.whatsapp.trim())
      return toast.error("Por favor completa tus datos personales.");
    if (form.esDelivery && !form.direccion.trim())
      return toast.error("La dirección de envío es requerida.");

    setIsPending(true);
    try {
      const supabase = createClient();
      const { data: negocio } = await supabase
        .from("negocios")
        .select("whatsapp")
        .eq("id", negocioId)
        .single();

      if (!negocio?.whatsapp) {
        toast.error(
          "Este local aún no ha configurado un número de WhatsApp para recibir pedidos.",
        );
        return;
      }

      const payload = {
        negocio_id: negocioId,
        cliente_nombre: form.nombre.trim(),
        cliente_whatsapp: form.whatsapp.trim(),
        es_delivery: form.esDelivery,
        direccion_entrega: form.esDelivery ? form.direccion.trim() : null,
        metodo_pago: form.metodoPago,
        total: totalFinal,
        notas: form.notas.trim() || null,
        items: cart.map((i) => ({
          producto_id: i.producto_id,
          nombre_producto: i.nombre,
          cantidad: i.cantidad,
          precio_unitario: i.precio,
          detalles: i.detalles,
        })),
      };

      const orderId = await submitOrderPublicAction(payload);
      const waOpened = dispararWhatsAppExterno(negocio.whatsapp, orderId);

      if (waOpened) {
        toast.success("Pedido procesado con éxito.");
      } else {
        toast.warning(
          "Pedido guardado. No pudimos abrir WhatsApp — copiamos el enlace en tu portapapeles.",
          { duration: 6000 },
        );
      }

      onSuccess();
    } catch {
      toast.error("Ocurrió un error al procesar el pedido.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full justify-between space-y-4 text-gray-900"
    >
      <div className="space-y-6 overflow-y-auto max-h-[450px] pr-2 public-scrollbar">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 mb-2"
        >
          <ArrowLeft size={16} /> Volver al carrito
        </button>

        <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
          <div className="space-y-1.5">
            <Label>Tu Nombre Completo</Label>
            <Input
              name="nombre"
              required
              value={form.nombre}
              onChange={handleInputChange}
              className="bg-white text-gray-900"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp de Contacto</Label>
            <Input
              name="whatsapp"
              type="tel"
              required
              value={form.whatsapp}
              onChange={handleInputChange}
              className="bg-white text-gray-900"
              placeholder="Ej: +54 9 11 1234-5678"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Forma de Entrega</Label>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Forma de entrega">
            <button
              type="button"
              role="radio"
              aria-checked={!form.esDelivery}
              onClick={() => setForm({ ...form, esDelivery: false })}
              className={`flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl border transition-all ${
                !form.esDelivery
                  ? "bg-[var(--color-custom)] border-[var(--color-custom)] text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-[var(--color-custom)]"
              }`}
            >
              <Store size={16} aria-hidden="true" /> Retiro
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={form.esDelivery}
              onClick={() => setForm({ ...form, esDelivery: true })}
              className={`flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl border transition-all ${
                form.esDelivery
                  ? "bg-[var(--color-custom)] border-[var(--color-custom)] text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-[var(--color-custom)]"
              }`}
            >
              <Truck size={16} aria-hidden="true" /> Envío
            </button>
          </div>

          {form.esDelivery && (
            <div className="p-4 rounded-xl border border-[var(--color-custom)]/30 bg-[var(--color-custom)]/5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center text-sm font-medium text-gray-700">
                <span>Costo de envío:</span>
                <span className="font-semibold text-gray-900">
                  {simbolo}
                  {formatMoney(config.costo_envio || 0)}
                </span>
              </div>
              <Input
                name="direccion"
                required
                placeholder="Calle, Número, Depto..."
                value={form.direccion}
                onChange={handleInputChange}
                className="bg-white text-gray-900"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>Medio de Pago</Label>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Medio de pago">
            <button
              type="button"
              role="radio"
              aria-checked={form.metodoPago === "efectivo"}
              onClick={() => setForm({ ...form, metodoPago: "efectivo" })}
              className={`flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl border transition-all ${
                form.metodoPago === "efectivo"
                  ? "bg-[var(--color-custom)] border-[var(--color-custom)] text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-[var(--color-custom)]"
              }`}
            >
              <Banknote size={16} aria-hidden="true" /> Efectivo
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={form.metodoPago === "transferencia"}
              onClick={() => setForm({ ...form, metodoPago: "transferencia" })}
              className={`flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl border transition-all ${
                form.metodoPago === "transferencia"
                  ? "bg-[var(--color-custom)] border-[var(--color-custom)] text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-[var(--color-custom)]"
              }`}
            >
              <CreditCard size={16} aria-hidden="true" /> Transferencia
            </button>
          </div>
        </div>

        <div className="space-y-1.5 pb-4">
          <Label>Aclaraciones (Opcional)</Label>
          <textarea
            name="notas"
            value={form.notas}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm resize-none h-20 text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-custom)] focus-visible:ring-offset-2"
            placeholder="Ej: Sin aderezos, timbre no anda..."
          />
        </div>
      </div>

      <div className="pt-5 border-t border-gray-100 bg-white space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-sm font-medium text-gray-500">
            Total Final:
          </span>
          <span className="text-3xl font-bold text-gray-900 tracking-tight">
            {simbolo}
            {formatMoney(totalFinal)}
          </span>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[var(--color-custom)] hover:bg-[var(--color-custom)]/90 text-white rounded-xl py-3.5 font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Procesando...
            </>
          ) : (
            "Confirmar Pedido por WhatsApp"
          )}
        </button>
      </div>
    </form>
  );
}
