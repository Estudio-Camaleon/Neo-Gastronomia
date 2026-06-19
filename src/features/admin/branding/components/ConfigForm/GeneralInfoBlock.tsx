"use client";

import { Globe, Hash, Phone, XCircle } from "lucide-react";
import type { ConfigFormState } from "../../types";
import { PAISES } from "../../types";

export interface GeneralInfoBlockProps {
  formData: ConfigFormState;
  errors: Partial<Record<keyof ConfigFormState, string | undefined>>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onClearError: (field: keyof ConfigFormState) => void;
  onToggleMostrarNombre: (val: boolean) => void;
}

export function GeneralInfoBlock({
  formData,
  errors,
  onChange,
  onClearError,
  onToggleMostrarNombre,
}: GeneralInfoBlockProps) {
  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5">
        <Globe size={14} className="text-[var(--admin-text-muted)]" />
        <h2 className="text-xs font-semibold text-[var(--admin-text)]">
          Atributos Operacionales Nucleares
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
            Nombre Comercial
            <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">Obligatorio</span>
          </label>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={(e) => { onChange(e); onClearError("nombre"); }}
            className={`w-full p-2 bg-[var(--admin-bg)] border rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/20 transition-all font-medium text-xs ${
              errors.nombre ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
            }`}
            placeholder="Ej: Burger Station"
          />
          {errors.nombre && (
            <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
              <XCircle size={10} />
              {errors.nombre}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
            Dirección Web Estática (Slug URL)
            <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">Obligatorio</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
            <input
              name="slug"
              value={formData.slug}
              onChange={(e) => { onChange(e); onClearError("slug"); }}
              className={`w-full p-2 pl-8 bg-[var(--admin-bg)] border rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/20 font-mono text-xs transition-all ${
                errors.slug ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
              }`}
              placeholder="burger-station"
            />
          </div>
          {errors.slug && (
            <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
              <XCircle size={10} />
              {errors.slug}
            </p>
          )}
          {!errors.slug && (
            <p className="text-[9px] text-[var(--admin-text-muted)] mt-1 leading-normal">
              Enlace público directo:{" "}
              <span className="font-mono">
                neo.app/<b>{formData.slug || "comercio"}</b>
              </span>
            </p>
          )}
        </div>

        {/* WhatsApp: país + número */}
        <div className="space-y-1">
          <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
            <Phone size={12} /> WhatsApp Receptor de Comandas
            <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">Obligatorio</span>
          </label>
          <div className="flex gap-2">
            <select
              name="whatsapp_pais"
              value={formData.whatsapp_pais}
              onChange={(e) => { onChange(e); onClearError("whatsapp_numero"); }}
              className="shrink-0 w-[130px] p-2 bg-[var(--admin-bg)] border rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/20 focus:border-[var(--admin-accent)] transition-all font-medium text-xs"
            >
              {PAISES.map((p) => (
                <option key={p.code} value={p.code}>{p.label}</option>
              ))}
            </select>
            <input
              name="whatsapp_numero"
              value={formData.whatsapp_numero}
              onChange={(e) => { onChange(e); onClearError("whatsapp_numero"); }}
              type="tel"
              className={`flex-1 w-full p-2 bg-[var(--admin-bg)] border rounded-lg text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/20 transition-all font-medium text-xs ${
                errors.whatsapp_numero ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
              }`}
              placeholder="Ej: 9 381 1234567"
            />
          </div>
          {errors.whatsapp_numero ? (
            <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
              <XCircle size={10} />
              {errors.whatsapp_numero}
            </p>
          ) : (
            <p className="text-[9px] text-[var(--admin-text-muted)] leading-tight">
              Sin espacios ni símbolos. Ej: <span className="font-mono">9 381 1234567</span> (sin el +54)
            </p>
          )}
        </div>

        <div className="sm:col-span-2 flex items-center gap-3 pt-1">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.mostrar_nombre}
              onChange={(e) => onToggleMostrarNombre(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[var(--admin-text-muted)]/20 rounded-full peer peer-checked:bg-[var(--admin-accent)] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all border border-[var(--admin-border)]" />
          </label>
          <div>
            <span className="text-xs font-semibold text-[var(--admin-text)]">
              Mostrar nombre del negocio
            </span>
            <p className="text-[10px] text-[var(--admin-text-muted)]">
              Desactivá si tu logo ya incluye el nombre.
            </p>
          </div>
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="font-medium text-[var(--admin-text-muted)] flex items-center gap-1">
            Descripción del negocio
            <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)]">Opcional</span>
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={onChange}
            rows={3}
            className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/20 focus:border-[var(--admin-accent)] transition-all resize-y min-h-[60px]"
            placeholder="Contale a tus clientes de qué se trata tu negocio..."
          />
          <p className="text-[9px] text-[var(--admin-text-muted)] leading-tight">
            Texto corto que aparece en la cabecera del menú público.
          </p>
        </div>
      </div>
    </div>
  );
}
