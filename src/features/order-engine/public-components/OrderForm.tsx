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
import { submitOrderPublicAction } from "../actions";
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
  const supabase = createClient();
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const dispararWhatsAppExterno = (
    negocioWhatsapp: string,
    pedidoId: string,
  ) => {
    const numeroLimpio = negocioWhatsapp.replace(/\D/g, "");
    if (!numeroLimpio) return;

    const mensaje = [
      `*🆕 NUEVO PEDIDO (#${pedidoId.slice(0, 6).toUpperCase()})*`,
      `👤 *Cliente:* ${form.nombre.toUpperCase()}`,
      `📱 *WhatsApp:* ${form.whatsapp}`,
      `🛵 *Entrega:* ${form.esDelivery ? `DELIVERY\n📍 *Dirección:* ${form.direccion.toUpperCase()}` : "RETIRO EN LOCAL"}`,
      `💳 *Pago:* ${form.metodoPago.toUpperCase()}`,
      `\n📦 *DETALLE DE COMANDA:*`,
      ...cart.map(
        (i) =>
          `• ${i.cantidad}x ${i.nombre.toUpperCase()} ${i.detalles ? `(_${i.detalles}_)` : ""} - ${simbolo}${(i.precio * i.cantidad).toFixed(2)}`,
      ),
      `\n---`,
      `*Subtotal:* ${simbolo}${subtotal.toFixed(2)}`,
      form.esDelivery
        ? `*Envío:* ${simbolo}${costoEnvioActual.toFixed(2)}`
        : "",
      `*💰 TOTAL FINAL: ${simbolo}${totalFinal.toFixed(2)}*`,
      `\n📝 *Notas:* ${form.notas || "Sin especificaciones."}`,
      `\n_Enviado de forma segura desde NEO Infrastructure_`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.whatsapp.trim())
      return toast.error("Por favor completa tus datos personales.");
    if (form.esDelivery && !form.direccion.trim())
      return toast.error("La dirección de envío es requerida.");

    setIsPending(true);
    try {
      const { data: negocio } = await supabase
        .from("negocios")
        .select("whatsapp")
        .eq("id", negocioId)
        .single();

      if (!negocio?.whatsapp)
        throw new Error("El local no configuró un canal de despacho válido.");

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
      toast.success("Pedido procesado con éxito.");
      dispararWhatsAppExterno(negocio.whatsapp, orderId);
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
      className="flex flex-col h-full justify-between space-y-4 text-gray-900 dark:text-zinc-100"
    >
      <div className="space-y-6 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors flex items-center gap-2 mb-2"
        >
          <ArrowLeft size={16} /> Volver al carrito
        </button>

        <div className="space-y-4 bg-gray-50/50 dark:bg-zinc-800/30 p-4 rounded-xl border border-gray-100 dark:border-zinc-800/80">
          <div className="space-y-1.5">
            <Label className="dark:text-zinc-300">Tu Nombre Completo</Label>
            <Input
              name="nombre"
              required
              value={form.nombre}
              onChange={handleInputChange}
              className="bg-white dark:bg-zinc-900 dark:border-zinc-700 text-gray-900 dark:text-zinc-100"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="dark:text-zinc-300">WhatsApp de Contacto</Label>
            <Input
              name="whatsapp"
              type="tel"
              required
              value={form.whatsapp}
              onChange={handleInputChange}
              className="bg-white dark:bg-zinc-900 dark:border-zinc-700 text-gray-900 dark:text-zinc-100"
              placeholder="Ej: +54 9 11 1234-5678"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="block dark:text-zinc-300">Forma de Entrega</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, esDelivery: false })}
              className={`flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl border transition-all ${
                !form.esDelivery
                  ? "bg-[var(--admin-accent,#34a35f)] border-[var(--admin-accent,#34a35f)] text-white shadow-sm"
                  : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-[var(--admin-accent,#34a35f)]"
              }`}
            >
              <Store size={16} /> Retiro
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, esDelivery: true })}
              className={`flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl border transition-all ${
                form.esDelivery
                  ? "bg-[var(--admin-accent,#34a35f)] border-[var(--admin-accent,#34a35f)] text-white shadow-sm"
                  : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-[var(--admin-accent,#34a35f)]"
              }`}
            >
              <Truck size={16} /> Envío
            </button>
          </div>

          {form.esDelivery && (
            <div className="p-4 rounded-xl border border-[var(--admin-accent,#34a35f)]/30 bg-[var(--admin-accent,#34a35f)]/5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-zinc-300">
                <span>Costo de envío:</span>
                <span className="font-semibold text-gray-900 dark:text-zinc-100">
                  {simbolo}
                  {config.costo_envio?.toFixed(2)}
                </span>
              </div>
              <Input
                name="direccion"
                required
                placeholder="Calle, Número, Depto..."
                value={form.direccion}
                onChange={handleInputChange}
                className="bg-white dark:bg-zinc-900 dark:border-zinc-700 text-gray-900 dark:text-zinc-100"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label className="block dark:text-zinc-300">Medio de Pago</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, metodoPago: "efectivo" })}
              className={`flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl border transition-all ${
                form.metodoPago === "efectivo"
                  ? "bg-[var(--admin-accent,#34a35f)] border-[var(--admin-accent,#34a35f)] text-white shadow-sm"
                  : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-[var(--admin-accent,#34a35f)]"
              }`}
            >
              <Banknote size={16} /> Efectivo
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, metodoPago: "transferencia" })}
              className={`flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl border transition-all ${
                form.metodoPago === "transferencia"
                  ? "bg-[var(--admin-accent,#34a35f)] border-[var(--admin-accent,#34a35f)] text-white shadow-sm"
                  : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-[var(--admin-accent,#34a35f)]"
              }`}
            >
              <CreditCard size={16} /> Transferencia
            </button>
          </div>
        </div>

        <div className="space-y-1.5 pb-4">
          <Label className="dark:text-zinc-300">Aclaraciones (Opcional)</Label>
          <textarea
            name="notes"
            value={form.notas}
            onChange={handleInputChange}
            className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-sm resize-none h-20 text-gray-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent,#34a35f)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
            placeholder="Ej: Sin aderezos, timbre no anda..."
          />
        </div>
      </div>

      <div className="pt-5 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
            Total Final:
          </span>
          <span className="text-3xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
            {simbolo}
            {totalFinal.toFixed(2)}
          </span>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[var(--admin-accent,#34a35f)] hover:bg-[var(--admin-accent,#34a35f)]/90 text-white rounded-xl py-3.5 font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
