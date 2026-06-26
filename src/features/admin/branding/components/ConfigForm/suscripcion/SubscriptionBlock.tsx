"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  CheckCircle2,
  XCircle,
  CreditCard,
  Calendar,
  Shield,
  AlertTriangle,
  User,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import { FoodMini } from "@/components/ui/food-loading";
import { createClient } from "@/core/lib/supabase/client";
import { jsPDF } from "jspdf";

export interface SubscriptionBlockProps {
  planTier?: string;
  subscriptionStatus?: string | null;
  currentPeriodEndsAt?: string | null;
  createdAt?: string | null;
  negocioId?: string;
  negocioNombre?: string;
  phone?: string;
  upgradeAction: "success" | "cancel" | "checkout" | null;
}

export function SubscriptionBlock({
  planTier,
  subscriptionStatus,
  currentPeriodEndsAt,
  createdAt,
  negocioId,
  negocioNombre,
  phone,
  upgradeAction,
}: SubscriptionBlockProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ownerData, setOwnerData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const isPro = planTier === "pro";

  // Fetch owner info from auth metadata
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const meta = user.user_metadata ?? {};
        setOwnerData({
          firstName: (meta["first_name"] as string) || "",
          lastName: (meta["last_name"] as string) || "",
          email: user.email || "",
        });
      }
    });
  }, []);

  useEffect(() => {
    if (upgradeAction === "success") {
      const timer = setTimeout(() => {
        router.refresh();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [upgradeAction, router]);

  const handleDownloadReceipt = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a5" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 14;
      const contentW = pageW - margin * 2;
      let y = margin;

      // ── Header ──
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("NEO", pageW / 2, y, { align: "center" });
      y += 7;
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Sistema Gastronómico", pageW / 2, y, { align: "center" });
      y += 5;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Comprobante de suscripción", pageW / 2, y, { align: "center" });
      y += 10;

      // ── Línea separadora ──
      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 8;

      // ── Datos del negocio ──
      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Negocio", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Nombre: ${negocioNombre || "—"}`, margin, y);
      y += 4.5;
      doc.text(`Plan: ${isPro ? "PRO" : "GRATIS"}`, margin, y);
      y += 4.5;
      if (isPro) {
        doc.text(
          `Monto: $15/mes`,
          margin,
          y,
        );
        y += 4.5;
      }
      y += 4;

      // ── Titular ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Titular", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      if (ownerData?.firstName || ownerData?.lastName) {
        doc.text(
          `Nombre: ${ownerData.firstName} ${ownerData.lastName}`,
          margin,
          y,
        );
        y += 4.5;
      }
      if (ownerData?.email) {
        doc.text(`Email: ${ownerData.email}`, margin, y);
        y += 4.5;
      }
      if (phone) {
        doc.text(`Teléfono: ${phone}`, margin, y);
        y += 4.5;
      }
      y += 4;

      // ── Suscripción ──
      if (isPro) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Suscripción", margin, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(
          `Estado: ${statusLabel[subscriptionStatus ?? ""] || subscriptionStatus || "Activo"}`,
          margin,
          y,
        );
        y += 4.5;
        doc.text(
          `Creación: ${createdAt ? new Date(createdAt).toLocaleDateString("es-AR") : "—"}`,
          margin,
          y,
        );
        y += 4.5;
        doc.text(
          `Próximo ciclo: ${currentPeriodEndsAt ? new Date(currentPeriodEndsAt).toLocaleDateString("es-AR") : "—"}`,
          margin,
          y,
        );
        y += 4.5;
        doc.text(
          `ID suscripción: ${negocioId || "—"}`,
          margin,
          y,
        );
        y += 4;
      }

      y = Math.max(y + 8, 120);

      // ── Footer ──
      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 5;
      doc.setFontSize(7);
      doc.setTextColor(180);
      doc.text(
        `Generado el ${new Date().toLocaleString("es-AR")}`,
        pageW / 2,
        y,
        { align: "center" },
      );
      y += 3.5;
      doc.text("NEO — Sistema Gastronómico", pageW / 2, y, { align: "center" });

      doc.save(`comprobante-pro-${negocioId || "neo"}.pdf`);
    } catch (err) {
      console.error("[PDF] Error al generar comprobante:", err);
    } finally {
      setDownloading(false);
    }
  };

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
      setErrorMsg("Error de conexión");
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

  if (upgradeAction === "success") {
    return (
      <div className="admin-card p-8 text-center border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent rounded-xl">
        <div className="p-4 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 mb-5 inline-flex">
          <CheckCircle2 size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-[27px] font-black tracking-tight text-[var(--admin-text)] mb-2">
          Bienvenido a PRO
        </h2>
        <p className="text-[17px] font-medium text-[var(--admin-text-muted)] max-w-md mx-auto">
          Tu plan ya está activo. Disfrutá de productos ilimitados, estadísticas, exportación de datos y más.
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
        <h2 className="text-[27px] font-black tracking-tight text-[var(--admin-text)] mb-2">
          Upgrade cancelado
        </h2>
        <p className="text-[17px] font-medium text-[var(--admin-text-muted)] max-w-md mx-auto">
          No se realizó ningún cambio en tu plan. Seguís en el plan FREE sin costo.
          Cuando quieras, podés actualizar desde acá mismo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Datos del titular */}
      {ownerData && (ownerData.firstName || ownerData.lastName) && (
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-[var(--admin-text-muted)]" />
            <h3 className="text-[17px] font-semibold text-[var(--admin-text)]">
              Datos del titular
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <User size={13} className="text-[var(--admin-text-muted)] shrink-0" />
              <span className="text-[15px] text-[var(--admin-text)]">
                {ownerData.firstName} {ownerData.lastName}
              </span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Mail size={13} className="text-[var(--admin-text-muted)] shrink-0" />
              <span className="text-[15px] text-[var(--admin-text)] truncate">
                {ownerData.email}
              </span>
            </div>
            {phone && (
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-[var(--admin-text-muted)] shrink-0" />
                <span className="text-[15px] text-[var(--admin-text)]">{phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado actual */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-[var(--admin-text-muted)]" />
            <h3 className="text-[17px] font-semibold text-[var(--admin-text)]">
              Plan actual
            </h3>
          </div>
          <span
            className={`text-[13px] font-bold px-2 py-0.5 rounded-full ${
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
            <span className="text-[12px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1">
              <Calendar size={11} />
              Creado el
            </span>
            <p className="text-[15px] font-medium text-[var(--admin-text)]">
              {formatDate(createdAt)}
            </p>
          </div>

          {isPro && (
            <>
              <div className="space-y-1">
                <span className="text-[12px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={11} />
                  Próximo ciclo
                </span>
                <p className="text-[15px] font-medium text-[var(--admin-text)]">
                  {formatDate(currentPeriodEndsAt)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[12px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <Shield size={11} />
                  Estado
                </span>
                <p className="text-[15px] font-medium text-[var(--admin-text)] flex items-center gap-1.5">
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

        {/* Botón descargar comprobante (solo PRO) */}
        {isPro && (
          <div className="mt-4 pt-4 border-t border-[var(--admin-border)]">
            <button
              type="button"
              onClick={handleDownloadReceipt}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--admin-border)] text-[13px] font-semibold text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:border-[var(--admin-accent)]/30 hover:bg-[var(--admin-accent)]/5 transition-all disabled:opacity-60"
            >
              {downloading ? (
                <FoodMini size={14} />
              ) : (
                <FileText size={14} />
              )}
              {downloading ? "Generando..." : "Descargar comprobante PDF"}
            </button>
          </div>
        )}
      </div>

      {/* Acción principal */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm">
        {isPro ? (
          <div className="space-y-3">
            <p className="text-[15px] text-[var(--admin-text-muted)] leading-relaxed">
              Tu suscripción PRO está activa. Disfrutás de todas las funcionalidades
              sin límites. La cancelación entrará en vigencia al final del período
              de facturación actual.
            </p>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[13px] text-amber-700 dark:text-amber-400 leading-relaxed">
                Para cancelar tu suscripción, contactanos a través de nuestro
                soporte. Te asistiremos con el proceso.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="p-3 rounded-2xl bg-[var(--admin-accent)]/5 text-[var(--admin-accent)] mb-4 inline-flex">
              <Crown size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-[19px] font-bold text-[var(--admin-text)] mb-1">
              Actualizá a PRO
            </h3>
            <p className="text-[15px] text-[var(--admin-text-muted)] mb-4 max-w-sm mx-auto">
              Desbloqueá productos ilimitados, estadísticas detalladas,
              exportación de datos y más.
              <span className="block mt-1 text-[17px] font-bold text-[var(--admin-text)]">
                $15/mes
              </span>
            </p>

            {errorMsg && (
              <p className="text-[15px] font-medium text-red-500 bg-red-500/10 px-3 py-2 rounded-lg mb-3 inline-block">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--admin-accent)] text-white rounded-xl font-bold text-[17px] shadow-md hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-wait"
            >
              {loading ? (
                <FoodMini size={14} />
              ) : (
                <Crown size={14} />
              )}
              {loading
                ? "Redirigiendo a Mercado Pago..."
                : "Ir al pago — $15/mes"}
            </button>
            <p className="text-[13px] font-medium text-[var(--admin-text-muted)] mt-3">
              Pago mensual único. Cancelá cuando quieras.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
