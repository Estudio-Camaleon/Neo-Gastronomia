"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Store,
  Truck,
  Banknote,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { FoodMini } from "@/components/ui/food-loading";
import { z } from "zod";
import { createClient } from "@/core/lib/supabase/client";
import { submitOrderPublicAction } from "../../admin/orders/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const orderFormSchema = z
  .object({
    nombre: z
      .string()
      .min(1, "El nombre es obligatorio")
      .max(100, "El nombre es demasiado largo"),
    whatsapp: z
      .string()
      .min(1, "El WhatsApp es obligatorio")
      .max(30, "WhatsApp demasiado largo"),
    esDelivery: z.boolean(),
    direccion: z.string().default(""),
    metodoPago: z.enum(["efectivo", "transferencia"]),
    notas: z
      .string()
      .max(500, "Las notas no pueden superar 500 caracteres")
      .default(""),
  })
  .superRefine((data, ctx) => {
    if (data.esDelivery && !data.direccion.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La dirección de envío es obligatoria",
        path: ["direccion"],
      });
    }
  });

function sanitize(v: string): string {
  return v.trim().replace(/\s+/g, " ").normalize("NFC");
}

function sanitizePhone(v: string): string {
  return v.trim().replace(/\s+/g, "");
}

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  negocioId: string;
  cart: import("./useCartStore").CartItem[];
  total: number;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
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

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      nombre: "",
      whatsapp: "",
      esDelivery: false,
      direccion: "",
      metodoPago: "efectivo",
      notas: "",
    },
  });

  const esDelivery = watch("esDelivery");

  const costoEnvioActual = esDelivery ? config.costo_envio || 0 : 0;
  const totalFinal = subtotal + costoEnvioActual;
  const simbolo = config.moneda_simbolo || "$";
  const formatMoney = (value: number) =>
    value.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const dispararWhatsAppExterno = (
    negocioWhatsapp: string,
    pedidoId: string,
    formData: OrderFormValues,
  ): boolean => {
    const numeroLimpio = negocioWhatsapp.replace(/\D/g, "");
    if (!numeroLimpio) return false;

    const formatearExtras = (i: (typeof cart)[0]) => {
      if (!i.extras || i.extras.length === 0) return "";
      if (i.producto_id.startsWith("combo-")) {
        try {
          const comboItems = JSON.parse(i.detalles || "[]") as Array<{
            nombre_producto: string;
            cantidad: number;
          }>;
          return comboItems
            .map((ci) => `${ci.cantidad}x ${ci.nombre_producto}`)
            .join(", ");
        } catch {
          return "";
        }
      }
      return i.extras.map((e) => `${e.item_nombre}`).join(", ");
    };

    const lineasDetalle = cart.map((i) => {
      const extrasStr = formatearExtras(i);
      const extraPart = extrasStr ? ` (_${extrasStr}_)` : "";
      return `• ${i.cantidad}x ${i.nombre.toUpperCase()}${extraPart} - ${simbolo}${formatMoney(i.precio * i.cantidad)}`;
    });

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
      `👤 *Cliente:* ${formData.nombre.toUpperCase()}`,
      `📱 *WhatsApp:* ${formData.whatsapp}`,
      `🛵 *Entrega:* ${formData.esDelivery ? `DELIVERY\n📍 *Dirección:* ${(formData.direccion || "").toUpperCase()}` : "RETIRO EN LOCAL"}`,
      `💳 *Pago:* ${formData.metodoPago.toUpperCase()}`,
      `\n📦 *DETALLE DE COMANDA:*`,
      ...detalleTruncado,
      `\n---`,
      `*Subtotal:* ${simbolo}${formatMoney(subtotal)}`,
      formData.esDelivery
        ? `*Envío:* ${simbolo}${formatMoney(costoEnvioActual)}`
        : "",
      `*💰 TOTAL FINAL: ${simbolo}${formatMoney(totalFinal)}*`,
      `\n📝 *Notas:* ${formData.notas || "Sin especificaciones."}`,
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

  const onSubmit = async (formData: OrderFormValues) => {
    setIsPending(true);
    try {
      const supabase = createClient();
      const { data: negocios } = await supabase
        .from("negocios")
        .select("whatsapp")
        .eq("id", negocioId)
        .limit(1);

      const negocio = negocios?.[0] ?? null;
      if (!negocio?.whatsapp) {
        toast.error(
          "Este local aún no ha configurado un número de WhatsApp para recibir pedidos.",
        );
        return;
      }

      const payload = {
        negocio_id: negocioId,
        cliente_nombre: sanitize(formData.nombre),
        cliente_whatsapp: sanitizePhone(formData.whatsapp),
        es_delivery: formData.esDelivery,
        direccion_entrega: formData.esDelivery
          ? sanitize(formData.direccion || "")
          : null,
        metodo_pago: formData.metodoPago,
        notas: formData.notas ? sanitize(formData.notas) : null,
        items: cart.flatMap((i) => {
          if (i.producto_id.startsWith("combo-")) {
            try {
              const comboItems = JSON.parse(i.detalles || "[]") as Array<{
                producto_id: string;
                cantidad: number;
              }>;
              return comboItems.map((ci) => ({
                producto_id: ci.producto_id,
                cantidad: ci.cantidad * i.cantidad,
                detalles: null,
              }));
            } catch {
              return [];
            }
          }
          return {
            producto_id: i.producto_id,
            cantidad: i.cantidad,
            detalles:
              i.extras && i.extras.length > 0
                ? JSON.stringify(i.extras)
                : i.detalles,
          };
        }),
      };

      const orderId = await submitOrderPublicAction(payload);
      const waOpened = dispararWhatsAppExterno(
        negocio.whatsapp,
        orderId,
        formData,
      );

      if (waOpened) {
        toast.success("Pedido procesado con éxito.");
      } else {
        toast.warning(
          "Pedido guardado. No pudimos abrir WhatsApp — copiamos el enlace en tu portapapeles.",
          { duration: 6000 },
        );
      }

      onSuccess(orderId);
    } catch {
      toast.error("Ocurrió un error al procesar el pedido.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col h-full justify-between space-y-4"
    >
      <div className="space-y-6 overflow-y-auto max-h-[450px] pr-2 public-scrollbar">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-[var(--color-custom-text-muted)] hover:text-[var(--color-custom-900)] transition-colors flex items-center gap-2 mb-2"
        >
          <ArrowLeft size={16} /> Volver al carrito
        </button>

        <div className="space-y-4 bg-[var(--color-custom-100)]/50 p-4 rounded-xl border border-[var(--color-custom-border)]">
          <div className="space-y-1.5">
            <Label className="text-[var(--color-custom-900)]">
              Tu Nombre Completo
            </Label>
            <Input
              {...register("nombre")}
              className="bg-[var(--color-custom-surface-strong)] text-[var(--color-custom-900)] border-[var(--color-custom-border)]"
              placeholder="Ej: Juan Pérez"
            />
            {errors.nombre && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1"
              >
                {errors.nombre.message}
              </motion.p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[var(--color-custom-900)]">
              WhatsApp de Contacto
            </Label>
            <Input
              {...register("whatsapp")}
              type="tel"
              className="bg-[var(--color-custom-surface-strong)] text-[var(--color-custom-900)] border-[var(--color-custom-border)]"
              placeholder="Ej: +54 9 11 1234-5678"
            />
            {errors.whatsapp && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1"
              >
                {errors.whatsapp.message}
              </motion.p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-[var(--color-custom-900)]">
            Forma de Entrega
          </Label>
          <Controller
            control={control}
            name="esDelivery"
            render={({ field }) => (
              <div
                className="grid grid-cols-2 gap-3"
                role="radiogroup"
                aria-label="Forma de entrega"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={!field.value}
                  onClick={() => field.onChange(false)}
                  className={`flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl border transition-all ${
                    !field.value
                      ? "bg-[var(--color-custom-500)] border-[var(--color-custom-500)] text-white shadow-sm"
                      : "bg-[var(--color-custom-surface-strong)] border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] hover:border-[var(--color-custom-500)]"
                  }`}
                >
                  <Store size={16} aria-hidden="true" /> Retiro
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={field.value}
                  onClick={() => field.onChange(true)}
                  className={`flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl border transition-all ${
                    field.value
                      ? "bg-[var(--color-custom-500)] border-[var(--color-custom-500)] text-white shadow-sm"
                      : "bg-[var(--color-custom-surface-strong)] border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] hover:border-[var(--color-custom-500)]"
                  }`}
                >
                  <Truck size={16} aria-hidden="true" /> Envío
                </button>
              </div>
            )}
          />

          <AnimatePresence>
            {esDelivery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-xl border border-[var(--color-custom-500)]/30 bg-[var(--color-custom-500)]/5 space-y-3 overflow-hidden"
              >
                <div className="flex justify-between items-center text-sm font-medium text-[var(--color-custom-text-muted)]">
                  <span>Costo de envío:</span>
                  <span className="font-semibold text-[var(--color-custom-900)]">
                    {simbolo}
                    {formatMoney(config.costo_envio || 0)}
                  </span>
                </div>
                <Input
                  {...register("direccion")}
                  placeholder="Calle, Número, Depto..."
                  className="bg-[var(--color-custom-surface-strong)] text-[var(--color-custom-900)] border-[var(--color-custom-border)]"
                />
                {errors.direccion && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500"
                  >
                    {errors.direccion.message}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-3">
          <Label className="text-[var(--color-custom-900)]">
            Medio de Pago
          </Label>
          <Controller
            control={control}
            name="metodoPago"
            render={({ field }) => (
              <div
                className="grid grid-cols-2 gap-3"
                role="radiogroup"
                aria-label="Medio de pago"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={field.value === "efectivo"}
                  onClick={() => field.onChange("efectivo")}
                  className={`flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl border transition-all ${
                    field.value === "efectivo"
                      ? "bg-[var(--color-custom-500)] border-[var(--color-custom-500)] text-white shadow-sm"
                      : "bg-[var(--color-custom-surface-strong)] border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] hover:border-[var(--color-custom-500)]"
                  }`}
                >
                  <Banknote size={16} aria-hidden="true" /> Efectivo
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={field.value === "transferencia"}
                  onClick={() => field.onChange("transferencia")}
                  className={`flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl border transition-all ${
                    field.value === "transferencia"
                      ? "bg-[var(--color-custom-500)] border-[var(--color-custom-500)] text-white shadow-sm"
                      : "bg-[var(--color-custom-surface-strong)] border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] hover:border-[var(--color-custom-500)]"
                  }`}
                >
                  <CreditCard size={16} aria-hidden="true" /> Transferencia
                </button>
              </div>
            )}
          />
        </div>

        <div className="space-y-1.5 pb-4">
          <Label className="text-[var(--color-custom-900)]">
            Aclaraciones (Opcional)
          </Label>
          <textarea
            {...register("notas")}
            className="w-full p-3 bg-[var(--color-custom-surface-strong)] border border-[var(--color-custom-border)] rounded-md text-sm resize-none h-20 text-[var(--color-custom-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-custom-500)] focus-visible:ring-offset-2"
            placeholder="Ej: Sin aderezos, timbre no anda..."
          />
          {errors.notas && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500"
            >
              {errors.notas.message}
            </motion.p>
          )}
        </div>
      </div>

      <motion.div
        layout
        className="pt-5 border-t border-[var(--color-custom-border)] bg-[var(--color-custom-surface-strong)] space-y-4"
      >
        <div className="flex justify-between items-end">
          <span className="text-sm font-medium text-[var(--color-custom-text-muted)]">
            Total Final:
          </span>
          <motion.span
            key={totalFinal}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-[var(--color-custom-900)] tracking-tight"
          >
            {simbolo}
            {formatMoney(totalFinal)}
          </motion.span>
        </div>
        <motion.button
          type="submit"
          disabled={isPending}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full bg-[var(--color-custom-500)] hover:bg-[var(--color-custom-600)] text-white rounded-xl py-3.5 font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <FoodMini size={16} /> Procesando...
            </>
          ) : (
            "Confirmar Pedido por WhatsApp"
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
