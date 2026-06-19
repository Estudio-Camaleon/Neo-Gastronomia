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
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2.5">
        <MessageCircle size={14} className="text-[var(--admin-text-muted)]" />
        <h2 className="text-xs font-semibold text-[var(--admin-text)]">
          Mensajes de WhatsApp
        </h2>
      </div>

      <div className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-2.5 flex gap-2 items-start">
        <Info size={12} className="shrink-0 text-[var(--admin-text-muted)] mt-0.5" />
        <p className="text-[10px] text-[var(--admin-text-muted)] leading-normal">
          Usá <code className="text-[var(--admin-accent)]">{`{cliente}`}</code> para el nombre del cliente,{" "}
          <code className="text-[var(--admin-accent)]">{`{negocio}`}</code> para el nombre de tu negocio y{" "}
          <code className="text-[var(--admin-accent)]">{`{entrega}`}</code> para indicar envío o retiro.
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label className="font-medium text-[var(--admin-text-muted)] text-xs flex items-center gap-1">
              {field.label}
              <span className="text-[9px] font-medium text-[var(--admin-text-muted)]/60 px-1.5 py-0.5 rounded border border-[var(--admin-border)]">Opcional</span>
            </label>
            <p className="text-[9px] text-[var(--admin-text-muted)] italic">{field.desc}</p>
            <textarea
              value={mensajes[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              rows={3}
              className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-text)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/20 focus:border-[var(--admin-accent)] transition-all resize-y min-h-[60px]"
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
