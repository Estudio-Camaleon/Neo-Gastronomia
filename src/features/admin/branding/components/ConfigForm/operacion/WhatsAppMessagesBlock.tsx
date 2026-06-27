"use client";

import { FaWhatsapp } from "react-icons/fa";
import { Info, Eye } from "lucide-react";

const MAX_LENGTH = 500;
const CLIENTE_EJEMPLO = "Juan";
const ENTREGA_EJEMPLO = "envío";

interface WhatsAppMessagesBlockProps {
  mensajes: Record<string, string>;
  negocioNombre: string;
  onChange: (mensajes: Record<string, string>) => void;
}

function previewMensaje(texto: string, negocio: string): string {
  return texto
    .replace(/\{cliente\}/g, CLIENTE_EJEMPLO)
    .replace(/\{negocio\}/g, negocio)
    .replace(/\{entrega\}/g, ENTREGA_EJEMPLO);
}

export function WhatsAppMessagesBlock({
  mensajes,
  negocioNombre,
  onChange,
}: WhatsAppMessagesBlockProps) {
  const handleChange = (key: string, value: string) => {
    if (value.length <= MAX_LENGTH) {
      onChange({ ...mensajes, [key]: value });
    }
  };

  const fields = [
    {
      key: "en_preparacion",
      label: "Pedido recibido (en preparación)",
      desc: "Se envía cuando el pedido pasa a cocina",
      placeholder:
        "¡Hola {cliente}! Tu pedido ya entró a cocina y pronto lo tendremos listo.",
    },
    {
      key: "entregado",
      label: "Pedido listo (entregado)",
      desc: "Se envía cuando el pedido está listo para retirar/enviar",
      placeholder:
        "¡Buenas noticias {cliente}! Tu pedido ya está listo. Te esperamos.",
    },
    {
      key: "cancelado",
      label: "Pedido cancelado",
      desc: "Se envía cuando el pedido es cancelado",
      placeholder:
        "Hola {cliente}, lamentamos informarte que tu pedido fue cancelado. Podés realizar uno nuevo cuando quieras.",
    },
  ];

  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4 sm:p-5 shadow-sm space-y-4 min-w-0">
      <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5">
        <FaWhatsapp size={14} className="text-[var(--admin-text-muted)] shrink-0" />
        <h2 className="text-[15px] font-semibold text-[var(--admin-text)]">
          Mensajes de WhatsApp
        </h2>
      </div>

      {/* INFO DESTACADO */}
      <div className="bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-800/40 rounded-lg p-3 flex gap-2.5 items-start">
        <Info size={14} className="shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
        <p className="text-[12px] sm:text-[13px] text-sky-700 dark:text-sky-300 leading-relaxed break-words min-w-0">
          Usá{" "}
          <code className="text-[var(--admin-accent)] font-semibold text-[11px] sm:text-[12px]">
            {`{cliente}`}
          </code>{" "}
          para el nombre del cliente,{" "}
          <code className="text-[var(--admin-accent)] font-semibold text-[11px] sm:text-[12px]">
            {`{negocio}`}
          </code>{" "}
          para el nombre de tu negocio y{" "}
          <code className="text-[var(--admin-accent)] font-semibold text-[11px] sm:text-[12px]">
            {`{entrega}`}
          </code>{" "}
          para indicar envío o retiro.
        </p>
      </div>

      <div className="space-y-5">
        {fields.map((field) => (
          <WhatsAppMessageField
            key={field.key}
            fieldKey={field.key}
            label={field.label}
            desc={field.desc}
            placeholder={field.placeholder}
            value={mensajes[field.key] || ""}
            negocioNombre={negocioNombre}
            onChange={(value) => handleChange(field.key, value)}
          />
        ))}
      </div>
    </div>
  );
}

function WhatsAppMessageField({
  fieldKey,
  label,
  desc,
  placeholder,
  value,
  negocioNombre,
  onChange,
}: {
  fieldKey: string;
  label: string;
  desc: string;
  placeholder: string;
  value: string;
  negocioNombre: string;
  onChange: (value: string) => void;
}) {
  const preview = value ? previewMensaje(value, negocioNombre) : "";

  return (
    <div className="space-y-2 min-w-0">
      {/* LABEL + BADGE */}
      <div className="flex items-start sm:items-center justify-between gap-2">
        <label
          htmlFor={`whatsapp-msg-${fieldKey}`}
          className="font-medium text-[var(--admin-text-muted)] text-[14px] sm:text-[15px]"
        >
          {label}
        </label>
        <span className="text-[10px] font-medium text-[var(--admin-text-muted)]/50 px-1.5 py-0.5 rounded border border-[var(--admin-border)] shrink-0 leading-normal">
          Opcional
        </span>
      </div>

      {/* DESCRIPCIÓN */}
      <p className="text-[11px] sm:text-[12px] text-[var(--admin-text-muted)] italic leading-relaxed hyphens-auto">
        {desc}
      </p>

      {/* TEXTAREA + CONTADOR */}
      <div className="relative">
        <textarea
          id={`whatsapp-msg-${fieldKey}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          maxLength={MAX_LENGTH}
          className="w-full min-w-0 box-border p-3 sm:p-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-[14px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/30 focus:border-[var(--admin-accent)] transition-all resize-y min-h-[80px] placeholder:text-[13px] sm:placeholder:text-[14px] leading-relaxed"
          placeholder={placeholder}
        />
        <span className="absolute bottom-2 right-3 text-[10px] font-mono text-[var(--admin-text-muted)]/40 pointer-events-none select-none tabular-nums">
          {value.length}/{MAX_LENGTH}
        </span>
      </div>

      {/* PREVIEW EN VIVO */}
      {preview && (
        <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 rounded-lg p-3 text-[13px] sm:text-[14px] leading-relaxed text-emerald-800 dark:text-emerald-200 break-words hyphens-auto">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Eye size={12} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
              Vista previa
            </span>
          </div>
          {preview}
        </div>
      )}
    </div>
  );
}
