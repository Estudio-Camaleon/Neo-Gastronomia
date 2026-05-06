"use client";

import { useState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface OrderFormProps {
  negocioId: string;
  cart: CartItem[];
  total: number;
  onBack: () => void;
  onSuccess: () => void;
}

interface FormState {
  nombre: string;
  whatsapp: string;
  esDelivery: boolean;
  direccion: string;
  metodoPago: "efectivo" | "transferencia";
  notas: string;
}

export function OrderForm({
  negocioId,
  cart,
  total,
  onBack,
  onSuccess,
}: OrderFormProps) {
  const supabase = createClient();
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState<FormState>({
    nombre: "",
    whatsapp: "",
    esDelivery: false,
    direccion: "",
    metodoPago: "efectivo",
    notas: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Función encargada de estructurar el mensaje de texto para WhatsApp
  const dispararWhatsApp = (negocioWhatsapp: string, pedidoId: string) => {
    const numeroLimpio = negocioWhatsapp.replace(/\D/g, "");
    if (!numeroLimpio) return;

    const encabezado = `*🆕 NUEVO PEDIDO EN NEO (#${pedidoId.slice(0, 6).toUpperCase()})*\n`;
    const datosCliente = `\n👤 *Cliente:* ${form.nombre}\n📱 *WhatsApp:* ${form.whatsapp}\n🛵 *Entrega:* ${form.esDelivery ? `Delivery\n📍 *Dirección:* ${form.direccion}` : "Retiro en el local (Take Away)"}\n💳 *Pago:* ${form.metodoPago.toUpperCase()}\n`;

    let itemsTexto = `\n📦 *DETALLE DEL PEDIDO:*\n`;
    cart.forEach((item) => {
      itemsTexto += `• ${item.cantidad}x ${item.nombre.toUpperCase()} - $${(item.precio * item.cantidad).toLocaleString("es-AR")}\n`;
    });

    const notasTexto = form.notas.trim() ? `\n📝 *Notas:* ${form.notas}\n` : "";
    const totalTexto = `\n💰 *TOTAL A PAGAR: $${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}*`;

    const mensajeCompleto = `${encabezado}${datosCliente}${itemsTexto}${notasTexto}${totalTexto}`;

    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensajeCompleto)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones de seguridad iniciales
    if (!form.nombre.trim() || !form.whatsapp.trim()) {
      return toast.error("CAMPOS INCOMPLETOS", {
        description: "Por favor ingresá tu nombre y un celular de contacto.",
      });
    }

    if (form.esDelivery && !form.direccion.trim()) {
      return toast.error("DIRECCIÓN VACÍA", {
        description:
          "Al seleccionar Delivery, es obligatorio indicar el domicilio de entrega.",
      });
    }

    setIsPending(true);

    try {
      // 1. Buscamos el número de WhatsApp del negocio para el redireccionamiento posterior
      const { data: negocio } = await supabase
        .from("negocios")
        .select("whatsapp")
        .eq("id", negocioId)
        .single();

      if (!negocio?.whatsapp) {
        throw new Error(
          "El comercio no tiene un WhatsApp configurado en el sistema.",
        );
      }

      // 2. Insertamos el pedido de forma limpia en la tabla de Supabase
      const { data: nuevoPedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          negocio_id: negocioId,
          cliente_nombre: form.nombre.trim(),
          cliente_whatsapp: form.whatsapp.trim(),
          es_delivery: form.esDelivery,
          direccion_entrega: form.esDelivery ? form.direccion.trim() : null,
          metodo_pago: form.metodoPago,
          total: total,
          estado: "pendiente",
          notas: form.notas.trim() || null,
        })
        .select("id")
        .single();

      if (pedidoError) throw pedidoError;

      // 3. Insertamos el desglose de ítems del carrito en la tabla relacional de la base de datos
      const itemsParaInsertar = cart.map((item) => ({
        pedido_id: nuevoPedido.id,
        producto_id: item.id,
        nombre_producto: item.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
      }));

      const { error: itemsError } = await supabase
        .from("pedido_items")
        .insert(itemsParaInsertar);

      if (itemsError) throw itemsError;

      // 4. Éxito total: Notificamos, abrimos la API de WhatsApp y limpiamos el store
      toast.success("PEDIDO ENVIADO CON ÉXITO", {
        description: "Tu orden fue registrada. Redirigiendo a la mensajería...",
      });

      dispararWhatsApp(negocio.whatsapp, nuevoPedido.id);
      onSuccess();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Error al procesar la orden.";
      toast.error("ERROR AL PROCESAR PEDIDO", { description: msg });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full justify-between space-y-4 text-text-primary dark:text-text-inverse"
    >
      <div className="space-y-4 overflow-y-auto max-h-[380px] lg:max-h-[500px] pr-1">
        {/* Botón de Retorno */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase text-text-muted hover:text-text-primary dark:hover:text-text-inverse tracking-wider cursor-pointer py-1"
        >
          <ArrowLeft size={12} strokeWidth={3} /> Volver al listado
        </button>

        {/* Campo: Nombre */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
            Tu Nombre *
          </label>
          <input
            type="text"
            name="nombre"
            required
            value={form.nombre}
            onChange={handleInputChange}
            placeholder="Ej. Juan Pérez"
            className="w-full px-4 py-3 rounded-xl border-2 border-border dark:border-border-dark bg-transparent text-xs font-bold outline-hidden focus:border-custom transition-all"
          />
        </div>

        {/* Campo: WhatsApp de Contacto */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
            Número de WhatsApp *
          </label>
          <input
            type="tel"
            name="whatsapp"
            required
            value={form.whatsapp}
            onChange={handleInputChange}
            placeholder="Ej. 3816554433"
            className="w-full px-4 py-3 rounded-xl border-2 border-border dark:border-border-dark bg-transparent text-xs font-bold outline-hidden focus:border-custom transition-all"
          />
        </div>

        {/* Selector Táctico: Tipo de Entrega (Delivery vs Take Away) */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
            Forma de Entrega
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, esDelivery: false }))
              }
              className={`py-3 rounded-xl border-2 text-xs font-black uppercase italic tracking-tight cursor-pointer transition-all ${
                !form.esDelivery
                  ? "bg-custom border-custom text-white shadow-sm"
                  : "bg-transparent border-border dark:border-border-dark text-text-secondary hover:border-custom/30"
              }`}
            >
              TAKE AWAY 🛍️
            </button>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, esDelivery: true }))}
              className={`py-3 rounded-xl border-2 text-xs font-black uppercase italic tracking-tight cursor-pointer transition-all ${
                form.esDelivery
                  ? "bg-custom border-custom text-white shadow-sm"
                  : "bg-transparent border-border dark:border-border-dark text-text-secondary hover:border-custom/30"
              }`}
            >
              DELIVERY 🛵
            </button>
          </div>
        </div>

        {/* Campo Condicional: Dirección de Entrega */}
        {form.esDelivery && (
          <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
            <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
              Dirección de Envío *
            </label>
            <input
              type="text"
              name="direccion"
              required={form.esDelivery}
              value={form.direccion}
              onChange={handleInputChange}
              placeholder="Calle, Número, Barrio o departamento"
              className="w-full px-4 py-3 rounded-xl border-2 border-error/40 focus:border-custom dark:border-border-dark bg-transparent text-xs font-bold outline-hidden transition-all"
            />
          </div>
        )}

        {/* Selector Táctico: Método de Pago */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
            Método de Pago
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, metodoPago: "efectivo" }))
              }
              className={`py-3 rounded-xl border-2 text-xs font-black uppercase italic tracking-tight cursor-pointer transition-all ${
                form.metodoPago === "efectivo"
                  ? "bg-custom border-custom text-white shadow-sm"
                  : "bg-transparent border-border dark:border-border-dark text-text-secondary hover:border-custom/30"
              }`}
            >
              EFECTIVO 💵
            </button>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, metodoPago: "transferencia" }))
              }
              className={`py-3 rounded-xl border-2 text-xs font-black uppercase italic tracking-tight cursor-pointer transition-all ${
                form.metodoPago === "transferencia"
                  ? "bg-custom border-custom text-white shadow-sm"
                  : "bg-transparent border-border dark:border-border-dark text-text-secondary hover:border-custom/30"
              }`}
            >
              TRANSFERENCIA 💳
            </button>
          </div>
        </div>

        {/* Campo Opcional: Notas Adicionales */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
            Notas para el Local (Opcional)
          </label>
          <textarea
            name="notas"
            rows={2}
            value={form.notas}
            onChange={handleInputChange}
            placeholder="Ej. Sacar la cebolla, traer cambio de $5.000, etc."
            className="w-full px-4 py-3 rounded-xl border-2 border-border dark:border-border-dark bg-transparent text-xs font-bold outline-hidden focus:border-custom transition-all resize-none"
          />
        </div>
      </div>

      {/* Botón de Confirmación y Cierre de Formulario */}
      <div className="pt-4 border-t-2 border-border dark:border-border-dark bg-white dark:bg-bg-darker">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-custom text-white py-4 rounded-xl font-black uppercase italic text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-95 transition-all active:scale-98 shadow-md shadow-custom/10 cursor-pointer border-t border-white/10"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <>
              CONFIRMAR Y ENVIAR <Check size={14} strokeWidth={3} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
