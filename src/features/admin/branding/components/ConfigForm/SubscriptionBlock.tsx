"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  CreditCard,
  Calendar,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { FoodMini } from "@/components/ui/food-loading";

export interface SubscriptionBlockProps {
  planTier?: string;
  subscriptionStatus?: string | null;
  currentPeriodEndsAt?: string | null;
  createdAt?: string | null;
  upgradeAction: "success" | "cancel" | "checkout" | null;
}

export function SubscriptionBlock({
  planTier,
  subscriptionStatus,
  currentPeriodEndsAt,
  createdAt,
  upgradeAction,
}: SubscriptionBlockProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isPro = planTier === "pro";

  useEffect(() => {
    if (upgradeAction === "success") {
      const timer = setTimeout(() => {
        router.refresh();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [upgradeAction, router]);

  if (upgradeAction === "success") {
    return (
      <div className="admin-card p-8 text-center border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent rounded-xl">
        <div className="p-4 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 mb-5 inline-flex">
          <CheckCircle2 size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)] mb-2">
          Bienvenido a PRO
        </h2>
        <p className="text-sm font-medium text-[var(--admin-text-muted)] max-w-md mx-auto">
          Tu plan ya est activo. Disfrut de productos ilimitados, estadsticas, exportacin de datos y ms.
        </p>
      </div>
    );
  }

  if (upgradeAction === "cancel") {
    return (
      <div className="admin-card p-8 text-center border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent rounded-xl">
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-5 inline-flex">
          <XCircle size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)] mb-2">
          Upgrade cancelado
        </h2>
        <p className="text-sm font-medium text-[var(--admin-text-muted)] max-w-md mx-auto">
          No se realiz ningn cambio en tu plan. Seguis en el plan FREE sin costo.
          Cuando quieras, podes actualizar desde ac mismo.
        </p>
      </div>
    );
  }

  const handleUpgrade = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/mercadopago/create-preapproval", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg(data.error ?? "Error al iniciar el checkout");
      }
    } catch {
      setErrorMsg("Error de conexin");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusLabel: Record<string, string> = {
    active: "Activo",
    pending: "Pendiente",
    cancelled: "Cancelado",
    authorized: "Autorizado",
  };

  return (
    <div className="space-y-6">
      {/* Estado actual */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-[var(--admin-text-muted)]" />
            <h3 className="text-sm font-semibold text-[var(--admin-text)]">
              Plan actual
            </h3>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isPro
                ? "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] border border-[var(--admin-accent)]/30"
                : "bg-[var(--admin-bg)] text-[var(--admin-text-muted)] border border-[var(--admin-border)]"
            }`}
          >
            {isPro ? "PRO" : "GRATIS"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1">
              <Calendar size={11} />
              Creado el
            </span>
            <p className="text-xs font-medium text-[var(--admin-text)]">
              {formatDate(createdAt)}
            </p>
          </div>

          {isPro && (
            <>
              <div className="space-y-1">
                <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={11} />
                  Prximo ciclo
                </span>
                <p className="text-xs font-medium text-[var(--admin-text)]">
                  {formatDate(currentPeriodEndsAt)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <Shield size={11} />
                  Estado
                </span>
                <p className="text-xs font-medium text-[var(--admin-text)] flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      subscriptionStatus === "active" || subscriptionStatus === "authorized"
                        ? "bg-green-500"
                        : "bg-amber-500"
                    }`}
                  />
                  {statusLabel[subscriptionStatus ?? ""] ||
                    subscriptionStatus ||
                    "Activo"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Accin principal */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm">
        {isPro ? (
          <div className="space-y-3">
            <p className="text-xs text-[var(--admin-text-muted)] leading-relaxed">
              Tu suscripcin PRO est activa. Disfruts de todas las funcionalidades
              sin lmites. La cancelacin entrar en vigencia al final del perodo
              de facturacin actual.
            </p>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                Para cancelar tu suscripcin, contactanos a travs de nuestro
                soporte. Te asistiremos con el proceso.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="p-3 rounded-2xl bg-[var(--admin-accent)]/5 text-[var(--admin-accent)] mb-4 inline-flex">
              <Sparkles size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-[var(--admin-text)] mb-1">
              Actualiz a PRO
            </h3>
            <p className="text-xs text-[var(--admin-text-muted)] mb-4 max-w-sm mx-auto">
              Desbloque productos ilimitados, estadsticas detalladas,
              exportacin de datos y ms.
              <span className="block mt-1 text-sm font-bold text-[var(--admin-text)]">
                $15.000/mes
              </span>
            </p>

            {errorMsg && (
              <p className="text-xs font-medium text-red-500 bg-red-500/10 px-3 py-2 rounded-lg mb-3 inline-block">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--admin-accent)] text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-wait"
            >
              {loading ? (
                <FoodMini size={14} />
              ) : (
                <Sparkles size={14} />
              )}
              {loading
                ? "Redirigiendo a Mercado Pago..."
                : "Ir al pago  $15.000/mes"}
            </button>
            <p className="text-[10px] font-medium text-[var(--admin-text-muted)] mt-3">
              Pago mensual nico. Cancel cuando quieras.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
