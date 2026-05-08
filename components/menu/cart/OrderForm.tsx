"use client";

import { useState, ComponentPropsWithoutRef } from "react";
import { ArrowLeft, Check, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// Importamos tus componentes NEO
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Definimos el Textarea con tipos estrictos para el Linter
const Textarea = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) => (
  <textarea
    className={cn(
      "flex min-h-[80px] w-full bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-bold transition-all border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-400 focus-visible:outline-none focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-none focus-visible:border-custom disabled:opacity-50 resize-none",
      className,
    )}
    {...props}
  />
);

interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  detalles?: string;
}

interface OrderFormProps {
  negocioId: string;
  cart: CartItem[];
  total: number;
  onBack: () => void;
  onSuccess: () => void;
  config: {
    moneda_simbolo?: string;
    costo_envio?: number;
  };
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
  total: subtotal,
  onBack,
  onSuccess,
  config,
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

  const costoEnvioActual = form.esDelivery ? config.costo_envio || 0 : 0;
  const totalFinal = subtotal + costoEnvioActual;
  const simbolo = config.moneda_simbolo || "$";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const dispararWhatsApp = (negocioWhatsapp: string, pedidoId: string) => {
    const numeroLimpio = negocioWhatsapp.replace(/\D/g, "");
    if (!numeroLimpio) return;

    const encabezado = `*🆕 NUEVO PEDIDO (#${pedidoId.slice(0, 6).toUpperCase()})*\n`;

    const datosCliente =
      [
        `👤 *Cliente:* ${form.nombre}`,
        `📱 *WhatsApp:* ${form.whatsapp}`,
        `🛵 *Entrega:* ${form.esDelivery ? `DELIVERY\n📍 *Dirección:* ${form.direccion}` : "RETIRO EN LOCAL"}`,
        `💳 *Pago:* ${form.metodoPago.toUpperCase()}`,
      ].join("\n") + "\n";

    let itemsTexto = `\n📦 *DETALLE:* \n`;
    cart.forEach((item) => {
      itemsTexto += `• ${item.cantidad}x ${item.nombre.toUpperCase()} ${item.detalles ? `(_${item.detalles}_)` : ""} - ${simbolo}${(item.precio * item.cantidad).toLocaleString("es-AR")}\n`;
    });

    const mensajeCompleto = `${encabezado}${datosCliente}${itemsTexto}\n---\n*Subtotal:* ${simbolo}${subtotal.toLocaleString("es-AR")}\n${form.esDelivery ? `*Envío:* ${simbolo}${costoEnvioActual.toLocaleString("es-AR")}\n` : ""}💰 *TOTAL: ${simbolo}${totalFinal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}*\n\n📝 *Notas:* ${form.notas || "Sin notas"}\n\n_Enviado desde NEO_`;

    window.open(
      `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensajeCompleto)}`,
      "_blank",
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.whatsapp.trim())
      return toast.error("CAMPOS INCOMPLETOS");
    if (form.esDelivery && !form.direccion.trim())
      return toast.error("DIRECCIÓN REQUERIDA");

    setIsPending(true);
    try {
      const { data: negocio } = await supabase
        .from("negocios")
        .select("whatsapp")
        .eq("id", negocioId)
        .single();
      if (!negocio?.whatsapp)
        throw new Error("Comercio sin WhatsApp configurado.");

      const { data: nuevoPedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          negocio_id: negocioId,
          cliente_nombre: form.nombre.trim(),
          cliente_whatsapp: form.whatsapp.trim(),
          es_delivery: form.esDelivery,
          direccion_entrega: form.esDelivery ? form.direccion.trim() : null,
          metodo_pago: form.metodoPago,
          total: totalFinal,
          estado: "pendiente",
          notas: form.notas.trim() || null,
        })
        .select("id")
        .single();

      if (pedidoError) throw pedidoError;

      const itemsParaInsertar = cart.map((item) => ({
        pedido_id: nuevoPedido.id,
        producto_id: item.id,
        nombre_producto: item.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
      }));

      await supabase.from("pedido_items").insert(itemsParaInsertar);

      toast.success("ORDEN REGISTRADA");
      dispararWhatsApp(negocio.whatsapp, nuevoPedido.id);
      onSuccess();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error("ERROR", { description: message });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full justify-between space-y-4"
    >
      <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft size={12} strokeWidth={3} /> VOLVER AL LISTADO
        </Button>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Tu Nombre</Label>
            <Input
              name="nombre"
              required
              value={form.nombre}
              onChange={handleInputChange}
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp de Contacto</Label>
            <Input
              name="whatsapp"
              type="tel"
              required
              value={form.whatsapp}
              onChange={handleInputChange}
              placeholder="Ej: 381..."
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Forma de Entrega</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={!form.esDelivery ? "default" : "outline"}
              onClick={() => setForm((p) => ({ ...p, esDelivery: false }))}
            >
              TAKE AWAY 🛍️
            </Button>
            <Button
              type="button"
              variant={form.esDelivery ? "default" : "outline"}
              onClick={() => setForm((p) => ({ ...p, esDelivery: true }))}
            >
              DELIVERY 🛵
            </Button>
          </div>

          {form.esDelivery && (
            <div className="p-4 border-4 border-black border-dashed bg-custom/5 space-y-3 animate-in zoom-in-95">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2 text-custom">
                  <Truck size={14} /> Costo de Envío
                </Label>
                <span className="font-black italic text-sm">
                  {simbolo}
                  {config.costo_envio?.toLocaleString("es-AR")}
                </span>
              </div>
              <Input
                name="direccion"
                placeholder="Calle, Nro, Barrio..."
                required
                value={form.direccion}
                onChange={handleInputChange}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>Método de Pago</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={form.metodoPago === "efectivo" ? "default" : "outline"}
              onClick={() => setForm((p) => ({ ...p, metodoPago: "efectivo" }))}
            >
              EFECTIVO 💵
            </Button>
            <Button
              type="button"
              variant={
                form.metodoPago === "transferencia" ? "default" : "outline"
              }
              onClick={() =>
                setForm((p) => ({ ...p, metodoPago: "transferencia" }))
              }
            >
              TRANSFERENCIA 💳
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notas Adicionales (Opcional)</Label>
          <Textarea
            name="notas"
            value={form.notas}
            onChange={handleInputChange}
            placeholder="Ej: Sin cebolla, traer cambio..."
          />
        </div>
      </div>

      <div className="pt-4 border-t-4 border-black space-y-3 bg-white dark:bg-bg-darker">
        <div className="flex justify-between items-end px-1">
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">
            Total a pagar
          </span>
          <span className="text-2xl font-black italic tracking-tighter">
            {simbolo}
            {totalFinal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-16 text-sm"
        >
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              CONFIRMAR Y ENVIAR{" "}
              <Check className="ml-2" size={18} strokeWidth={3} />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
