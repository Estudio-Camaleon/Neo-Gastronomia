"use client";

import { useState } from "react";
import { ArrowLeft,Loader2} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/core/lib/supabase/client";
import { submitOrderPublicAction } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OrderFormProps {
  negocioId: string;
  cart: any[];
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
      "_blank",
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.whatsapp.trim())
      return toast.error("CAMPOS INCOMPLETOS");
    if (form.esDelivery && !form.direccion.trim())
      return toast.error("DIRECCIÓN DE ENVÍO REQUERIDA");

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
      toast.success("ORDEN DE COMPRA CAPTURADA");
      dispararWhatsAppExterno(negocio.whatsapp, orderId);
      onSuccess();
    } catch (error: any) {
      toast.error("FALLO DE REGISTRO", { description: error.message });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full justify-between space-y-4 font-sans text-black"
    >
      <div className="space-y-4 overflow-y-auto max-h-[450px] pr-1">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-black uppercase tracking-wider flex items-center gap-2 border-2 border-black p-2 bg-white shadow-[2px_2px_0px_0px_#000000]"
        >
          <ArrowLeft size={14} strokeWidth={3} /> VOLVER A LA BOLSA
        </button>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="font-black text-xs uppercase">
              Tu Nombre Completo
            </Label>
            <Input
              name="nombre"
              required
              value={form.nombre}
              onChange={handleInputChange}
              className="border-2 border-black p-3 text-sm font-bold uppercase rounded-none"
              placeholder="Ej: MATEO GÓMEZ"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-black text-xs uppercase">
              WhatsApp de Contacto
            </Label>
            <Input
              name="whatsapp"
              type="tel"
              required
              value={form.whatsapp}
              onChange={handleInputChange}
              className="border-2 border-black p-3 text-sm font-bold rounded-none"
              placeholder="Ej: 381555666"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-black text-xs uppercase block">
            Forma de Despacho
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, esDelivery: false })}
              className={`p-3 font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${!form.esDelivery ? "bg-[#A3FF00]" : "bg-white"}`}
            >
              🛍️ Retiro Local
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, esDelivery: true })}
              className={`p-3 font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${form.esDelivery ? "bg-[#A3FF00]" : "bg-white"}`}
            >
              🛵 Envío Cadete
            </button>
          </div>

          {form.esDelivery && (
            <div className="p-3 border-4 border-black border-dashed bg-gray-50 space-y-2 animate-in zoom-in-95">
              <div className="flex justify-between items-center text-xs font-bold uppercase">
                <span>Costo logístico de envío:</span>
                <span className="font-mono font-black">
                  {simbolo}
                  {config.costo_envio?.toFixed(2)}
                </span>
              </div>
              <Input
                name="direccion"
                required
                placeholder="CALLE, NÚMERO, DETALLES DE PUERTA..."
                value={form.direccion}
                onChange={handleInputChange}
                className="border-2 border-black text-xs font-bold uppercase bg-white rounded-none"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="font-black text-xs uppercase block">
            Medio de Pago
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, metodoPago: "efectivo" })}
              className={`p-3 font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${form.metodoPago === "efectivo" ? "bg-[#A3FF00]" : "bg-white"}`}
            >
              💵 Cash
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, metodoPago: "transferencia" })}
              className={`p-3 font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${form.metodoPago === "transferencia" ? "bg-[#A3FF00]" : "bg-white"}`}
            >
              💳 Transfer
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="font-black text-xs uppercase">
            Aclaraciones Especiales
          </Label>
          <textarea
            name="notas"
            value={form.notas}
            onChange={handleInputChange}
            className="w-full p-3 bg-white border-2 border-black text-xs font-medium resize-none h-16 outline-none text-black"
            placeholder="Ej: Sin aderezos, tocar timbre fuerte..."
          />
        </div>
      </div>

      <div className="pt-4 border-t-4 border-black bg-white space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] font-mono font-black uppercase text-gray-400">
            Total Neto Compra:
          </span>
          <span className="text-3xl font-mono font-black italic tracking-tighter">
            {simbolo}
            {totalFinal.toFixed(2)}
          </span>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#A3FF00] border-4 border-black p-4 font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
        >
          {isPending ? (
            <Loader2 className="animate-spin text-black" size={16} />
          ) : (
            "DESPACHAR COMANDA POR WHATSAPP 🚀"
          )}
        </button>
      </div>
    </form>
  );
}
