"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Store,
  Truck,
  Banknote,
  CreditCard,
  Percent,
  Tag,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { FoodMini } from "@/components/ui/food-loading";
import {
  formatMoney,
  getDiscountLabel,
  getPromoSubtotal,
  calculateDiscounts,
  COMBO_PREFIX,
} from "@/features/public-menu/utils";
import {
  orderFormSchema,
  sanitize,
  sanitizePhone,
} from "@/features/public-menu/schemas";
import type { OrderFormValues } from "@/features/public-menu/schemas";
import { dispararWhatsAppExterno } from "@/features/public-menu/services/whatsapp";
import { createClient } from "@/core/lib/supabase/client";
import { submitOrderPublicAction } from "../../admin/orders/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PromoRow } from "@/features/public-menu/types";

interface OrderFormProps {
  negocioId: string;
  cart: import("./useCartStore").CartItem[];
  total: number;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
  config: {
    moneda_simbolo?: string;
    costo_envio?: number;
    tipo_envio?: string;
  };
  promos?: PromoRow[];
  productCategoryMap?: Record<string, string>;
}

export function OrderForm({
  negocioId,
  cart,
  total: subtotal,
  onBack,
  onSuccess,
  config,
  promos = [],
  productCategoryMap = {},
}: OrderFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [recepcionPausada, setRecepcionPausada] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoRow | null>(null);
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const checkRecepcion = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("negocios")
        .select("recepcion_pausada")
        .eq("id", negocioId)
        .limit(1)
        .single();
      if (!cancelled && data?.recepcion_pausada) {
        setRecepcionPausada(true);
      }
    };

    checkRecepcion();
    const interval = setInterval(checkRecepcion, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [negocioId]);

  // Discount promos that auto-apply (no code needed) — only show if they apply to the cart
  const discountPromos = promos.filter(
    (p) =>
      p.tipo_descuento !== "combo" &&
      !p.codigo &&
      getPromoSubtotal(p, cart, productCategoryMap) > 0,
  );
  // Code-based promos
  const codePromos = promos.filter(
    (p) => p.tipo_descuento !== "combo" && p.codigo,
  );

  const handleApplyCode = () => {
    const trimmed = promoCode.trim().toLowerCase();
    if (!trimmed) {
      setCodeError("Ingresá un código");
      return;
    }
    const match = codePromos.find(
      (p) => p.codigo?.toLowerCase() === trimmed,
    );
    if (match) {
      setAppliedPromo(match);
      setCodeError("");
      toast.success(`¡Cupón aplicado! ${getDiscountLabel(match)}`);
    } else {
      setCodeError("Código inválido");
      setAppliedPromo(null);
    }
  };

  // ── Auto-applied discounts (non-code promos) ──
  const { total: autoDiscountAmount } =
    calculateDiscounts(discountPromos, cart, productCategoryMap);

  // ── Code-based promo discount ──
  let codeDiscountAmount = 0;
  if (appliedPromo) {
    const result = calculateDiscounts([appliedPromo], cart, productCategoryMap);
    codeDiscountAmount = result.total;
  }

  const discountAmount = autoDiscountAmount + codeDiscountAmount;

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
  const totalFinal = subtotal + costoEnvioActual - discountAmount;
  const simbolo = config.moneda_simbolo || "$";

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
          // Combo: expandir items internos
          if (i.producto_id.startsWith(COMBO_PREFIX)) {
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

          // Preservar nota + variante dentro del JSON de extras
          // (se inyectan como extras con precio 0; el RPC los suma
          //  sin afectar el total y quedan registrados en la DB)
          let detallesPayload = i.detalles;
          if (i.extras.length > 0 || i.variantName || i.detalles) {
            const arr = i.extras.map((e) => ({ ...e }));

            // Variante del producto (ej: "Grande", "Completo")
            if (i.variantName) {
              arr.push({
                grupo_id: "__variante__",
                grupo_titulo: "Variante",
                item_id: "__variante__",
                item_nombre: i.variantName,
                item_precio: 0,
                cantidad: 1,
              });
            }

            // Nota del cliente
            if (i.detalles) {
              arr.push({
                grupo_id: "__nota__",
                grupo_titulo: "Nota",
                item_id: "__nota__",
                item_nombre: i.detalles,
                item_precio: 0,
                cantidad: 1,
              });
            }
            detallesPayload = JSON.stringify(arr);
          }

          return {
            producto_id: i.producto_id,
            cantidad: i.cantidad,
            detalles: detallesPayload,
          };
        }),
      };

      const orderId = await submitOrderPublicAction(payload);
      const waOpened = dispararWhatsAppExterno(
        negocio.whatsapp,
        orderId,
        formData,
        cart,
        subtotal,
        costoEnvioActual,
        totalFinal,
        simbolo,
        formatMoney,
        discountAmount,
        appliedPromo?.nombre,
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
      {recepcionPausada && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700"
        >
          <AlertTriangle size={20} className="shrink-0" />
          <div className="text-sm font-semibold leading-snug">
            El local no está aceptando pedidos en este momento.
            <br />
            <span className="font-normal text-red-600 text-xs">
              La recepción de pedidos se encuentra pausada.
            </span>
          </div>
        </motion.div>
      )}

      <div className="space-y-6 overflow-y-auto overscroll-y-contain max-h-[70vh] p-2 public-scrollbar">
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
                className={config.tipo_envio === "no_disponible" ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}
                role="radiogroup"
                aria-label="Forma de entrega"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={config.tipo_envio === "no_disponible" || !field.value}
                  onClick={() => field.onChange(false)}
                  className={`flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-xl border transition-all ${
                    config.tipo_envio === "no_disponible" || !field.value
                      ? "bg-[var(--color-custom-500)] border-[var(--color-custom-500)] text-white shadow-sm"
                      : "bg-[var(--color-custom-surface-strong)] border-[var(--color-custom-border)] text-[var(--color-custom-text-muted)] hover:border-[var(--color-custom-500)]"
                  }`}
                >
                  <Store size={16} aria-hidden="true" /> Retiro
                </button>
                {config.tipo_envio !== "no_disponible" && (
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
                )}
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
                    {formatMoney(config.costo_envio || 0, simbolo)}
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

        {/* Discount promos - auto-applied banners */}
        {discountPromos.length > 0 && (
          <div className="space-y-1.5">
            {discountPromos.map((promo) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-lg border border-green-200/60 bg-green-50/80 px-3 py-2 text-xs"
              >
                {promo.tipo_descuento === "porcentaje" ? (
                  <Percent size={13} className="shrink-0 text-green-600" />
                ) : (
                  <Tag size={13} className="shrink-0 text-green-600" />
                )}
                <span className="font-semibold text-green-800 truncate">
                  {promo.nombre}
                </span>
                {promo.descripcion && (
                  <span className="hidden sm:inline text-green-600 truncate">
                    — {promo.descripcion}
                  </span>
                )}
                <span className="shrink-0 ml-auto rounded-full bg-green-500 px-2 py-[1px] text-[9px] font-bold text-white">
                  {getDiscountLabel(promo)}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Promo code input */}
        {codePromos.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-[var(--color-custom-900)]">
              ¿Tenés un código?
            </Label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setCodeError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyCode();
                  }
                }}
                placeholder="Ej: BIENVENIDO10"
                className="flex-1 rounded-lg border border-[var(--color-custom-border)] bg-[var(--color-custom-surface-strong)] px-3 py-2 text-sm text-[var(--color-custom-900)] outline-none placeholder:text-[var(--color-custom-text-muted)] focus:border-[var(--color-custom-500)] focus:ring-2 focus:ring-[var(--color-custom-500)]/20"
                aria-label="Código de descuento"
              />
              <button
                type="button"
                onClick={handleApplyCode}
                className="shrink-0 rounded-lg bg-[var(--color-custom-900)] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[var(--color-custom-800)]"
              >
                Canjear
              </button>
            </div>
            {codeError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500"
              >
                {codeError}
              </motion.p>
            )}
            {appliedPromo && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 text-xs font-semibold text-green-600"
              >
                <Sparkles size={12} />
                {getDiscountLabel(appliedPromo)} aplicado
              </motion.p>
            )}
          </div>
        )}

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
        {/* Price breakdown */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-[var(--color-custom-text-muted)]">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal, simbolo)}</span>
          </div>
          {costoEnvioActual > 0 && (
            <div className="flex justify-between text-[var(--color-custom-text-muted)]">
              <span>Envío</span>
              <span>{formatMoney(costoEnvioActual, simbolo)}</span>
            </div>
          )}
          {autoDiscountAmount > 0 && (
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Descuento automático</span>
              <span>-{formatMoney(autoDiscountAmount, simbolo)}</span>
            </div>
          )}
          {codeDiscountAmount > 0 && (
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Descuento con código</span>
              <span>-{formatMoney(codeDiscountAmount, simbolo)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-end border-t border-dashed border-[var(--color-custom-border)] pt-3">
          <span className="text-sm font-semibold text-[var(--color-custom-900)]">
            Total Final:
          </span>
          <motion.span
            key={totalFinal}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-[var(--color-custom-900)] tracking-tight"
          >
            {formatMoney(totalFinal, simbolo)}
          </motion.span>
        </div>
        <motion.button
          type="submit"
          disabled={isPending || recepcionPausada}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full bg-[var(--color-custom-500)] hover:bg-[var(--color-custom-600)] text-white rounded-xl py-3.5 font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait disabled:hover:bg-[var(--color-custom-500)]"
        >
          {isPending ? (
            <>
              <FoodMini size={16} /> Procesando...
            </>
          ) : (
            "Enviar pedido"
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
