"use client";

import { useState } from "react";
import { X, ShoppingBag, Package, Users, Settings, BarChart3 } from "lucide-react";

const sections = [
  {
    icon: ShoppingBag,
    label: "Pedidos",
    description:
      "Acá ves los pedidos entrantes en tiempo real. Podés cambiar su estado (pendiente → en preparación → entregado) y notificar al cliente por WhatsApp.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-900/30",
  },
  {
    icon: Package,
    label: "Productos",
    description:
      "Administrá tu catálogo: agregá productos, categorías, precios, imágenes y configurá opciones personalizadas (extras, ingredientes).",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900/30",
  },
  {
    icon: Users,
    label: "Clientes",
    description:
      "Historial de clientes que pidieron en tu local. Con teléfono, dirección y pedidos anteriores.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-900/30",
  },
  {
    icon: Settings,
    label: "Configuración",
    description:
      "Personalizá la identidad de tu marca: nombre, logo, banner, colores, horarios, redes sociales y el slug de tu menú público.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-900/30",
  },
  {
    icon: BarChart3,
    label: "Dashboard",
    description:
      "Métricas y estadísticas de tu negocio: pedidos por día, productos más vendidos, ingresos y tendencias.",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    border: "border-rose-200 dark:border-rose-900/30",
  },
];

export function FirstTimeTutorial() {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-[var(--admin-surface)] border-b border-[var(--admin-border)] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-[var(--admin-text)] tracking-tight">
              Bienvenido a NEO 🚀
            </h2>
            <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">
              Tu panel de control tiene estas secciones:
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {sections.map((section) => (
            <div
              key={section.label}
              className={`flex gap-3 p-3 rounded-xl border ${section.border} ${section.bg} transition-all`}
            >
              <div
                className={`w-9 h-9 rounded-lg ${section.bg} ${section.color} flex items-center justify-center shrink-0`}
              >
                <section.icon size={18} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className={`text-sm font-bold ${section.color}`}>
                  {section.label}
                </h3>
                <p className="text-xs text-[var(--admin-text-muted)] leading-relaxed">
                  {section.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-[var(--admin-surface)] border-t border-[var(--admin-border)] px-6 py-4 rounded-b-2xl">
          <button
            onClick={() => setOpen(false)}
            className="w-full py-2.5 rounded-xl bg-[var(--admin-accent)] text-white font-bold text-sm hover:opacity-90 transition-all"
          >
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
}
