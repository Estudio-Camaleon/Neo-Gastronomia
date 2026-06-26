"use client";

import { MessageCircle, Info } from "lucide-react";

interface WhatsAppMessagesBlockProps {
  mensajes: Record<string, string>;
  negocioNombre: string;
  onChange: (mensajes: Record<string, string>) => void;
}

export function WhatsAppMessagesBlock({
  mensajes,
  negocioNombre,
  onChange,
}: WhatsAppMessagesBlockProps) {
  const handleChange = (key: string, value: string) => {
    onChange({ ...mensajes, [key]: value });
  };

  const fields = [
    {
      key: "en_preparacion",
      label: "Pedido recibido (en preparación)",
      desc: "Se envía cuando el pedido pasa a cocina",
      placeholder: "¡Hola {cliente}! Tu pedido ya entró a cocina...",
    },
    {
      key: "entregado",
      label: "Pedido listo (entregado)",
      desc: "Se envía cuando el pedido está listo para retirar/enviar",
      placeholder: "¡Buenas noticias {cliente}! Tu pedido ya está listo...",
    },
    {
      key: "cancelado",
      label: "Pedido cancelado",
      desc: "Se envía cuando el pedido es cancelado",
      placeholder: "Hola {cliente}, lamentablemente no podremos procesar tu pedido...",
    },
  ];

  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4 sm:p-5 shadow-sm space-y-4 min-w-0">
      <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5">
        <MessageCircle size={14} className="text-[var(--admin-text-muted)] shrink-0" />
        <h2 className="text-[15px] font-semibold text-[var(--admin-text)]">
          Mensajes de WhatsApp
        </h2>
      </div>

      <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-2.5 flex gap-2 items-start">
        <Info size={12} className="shrink-0 text-[var(--admin-text-muted)] mt-0.5" />
        <p className="text-[12px] sm:text-[13px] text-[var(--admin-text-muted)] leading-normal break-words min-w-0">
          Usá <code className="text-[var(--admin-accent)] text-[11px] sm:text-[12px]">{`{cliente}`}</code> para el nombre del cliente,{" "}
          <code className="text-[var(--admin-accent)] text-[11px] sm:text-[12px]">{`{negocio}`}</code> para el nombre de tu negocio y{" "}
          <code className="text-[var(--admin-accent)] text-[11px] sm:text-[12px]">{`{entrega}`}</code> para indicar envío o retiro.
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <WhatsAppMessageField
            key={field.key}
            fieldKey={field.key}
            label={field.label}
            desc={field.desc}
            placeholder={field.placeholder}
            value={mensajes[field.key] || ""}
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
  onChange,
}: {
  fieldKey: string;
  label: string;
  desc: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5 min-w-0">
      <label
        htmlFor={`whatsapp-msg-${fieldKey}`}
        className="font-medium text-[var(--admin-text-muted)] text-[14px] sm:text-[15px] flex items-start sm:items-center gap-1.5"
      >
        <span className="leading-snug">{label}</span>
        <span className="text-[11px] sm:text-[12px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)] shrink-0 mt-0.5 sm:mt-0">
          Opcional
        </span>
      </label>
      <p className="text-[11px] sm:text-[12px] text-[var(--admin-text-muted)] italic">{desc}</p>
      <textarea
        id={`whatsapp-msg-${fieldKey}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className=" min-w-0 box-border p-2.5 sm:p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-[14px] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/20 focus:border-[var(--admin-accent)] transition-all resize-y min-h-[60px] placeholder:text-[13px] sm:placeholder:text-[15px]"
        placeholder={placeholder}
      />
    </div>
  );
}
