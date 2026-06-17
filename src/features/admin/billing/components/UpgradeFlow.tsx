"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2, XCircle } from "lucide-react";

interface UpgradeFlowProps {
  action: "success" | "cancel" | "checkout" | null;
}

export function UpgradeFlow({ action }: UpgradeFlowProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (action === "success") {
      const timer = setTimeout(() => {
        router.replace("/configuracion");
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [action, router]);

  if (action === "success") {
    return (
      <div className="admin-card p-8 text-center border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
        <div className="p-4 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 mb-5 inline-flex">
          <CheckCircle2 size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)] mb-2">
          ¡Bienvenido a PRO!
        </h2>
        <p className="text-sm font-medium text-[var(--admin-text-muted)] max-w-md mx-auto">
          Tu plan ya está activo. Disfrutá de productos ilimitados, estadísticas, exportación de datos y más.
        </p>
      </div>
    );
  }

  if (action === "cancel") {
    return (
      <div className="admin-card p-8 text-center border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-5 inline-flex">
          <XCircle size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)] mb-2">
          Upgrade cancelado
        </h2>
        <p className="text-sm font-medium text-[var(--admin-text-muted)] max-w-md mx-auto">
          No se realizó ningún cambio en tu plan. Seguís en el plan FREE sin costo.
          Cuando quieras, podés actualizar desde acá mismo.
        </p>
      </div>
    );
  }

  if (action === "checkout") {
    const handleUpgrade = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/mercadopago/create-preapproval", {
          method: "POST",
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert("Error al iniciar el checkout. Intentalo de nuevo.");
        }
      } catch {
        alert("Error de conexión. Intentalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="admin-card p-8 md:p-10 text-center max-w-lg mx-auto border-[var(--admin-accent)]/20 bg-gradient-to-br from-[var(--admin-accent)]/5 to-transparent">
        <div className="p-4 rounded-2xl bg-[var(--admin-accent)]/5 text-[var(--admin-accent)] mb-5 inline-flex">
          <Sparkles size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--admin-text)] mb-2">
          Actualizá a PRO
        </h2>
        <p className="text-sm font-medium text-[var(--admin-text-muted)] mb-6 max-w-sm mx-auto">
          Desbloqueá productos ilimitados, estadísticas detalladas, exportación de datos y más.
          <span className="block mt-2 text-lg font-bold text-[var(--admin-text)]">
            $15.000/mes
          </span>
        </p>
        <button
          type="button"
          onClick={handleUpgrade}
          disabled={loading}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--admin-accent)] text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-wait"
        >
          <Sparkles size={16} />
          {loading ? "Redirigiendo a Mercado Pago..." : "Ir al pago — $15.000/mes"}
        </button>
        <p className="text-[10px] font-medium text-[var(--admin-text-muted)] mt-3">
          Pago único mensual. Cancelá cuando quieras.
        </p>
      </div>
    );
  }

  return null;
}
