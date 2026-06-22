"use client";

import {
  LifeBuoy,
  Mail,
  MessageCircle,
  FileText,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { TransitionLink } from "@/components/ui/transition-link";

export function SupportBlock() {
  const supportEmail = "soporteneotuc@gmail.com";
  const whatsappNumber = "+5491123456789";
  const appVersion = "1.1.1";

  const links = [
    {
      icon: FileText,
      label: "Centro de Ayuda",
      desc: "Guías, tutoriales y preguntas frecuentes",
      href: "/ayuda",
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      desc: "Chateá con soporte en vivo",
      href: `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`,
    },
    {
      icon: Mail,
      label: "Correo electrónico",
      desc: supportEmail,
      href: `mailto:${supportEmail}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* INTRO */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[var(--admin-accent)]/5 text-[var(--admin-accent)] rounded-2xl shrink-0">
            <LifeBuoy size={28} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--admin-text)] mb-1">
              ¿Necesitás ayuda?
            </h3>
            <p className="text-xs text-[var(--admin-text-muted)] leading-relaxed max-w-lg">
              Estamos acá para ayudarte a sacar el máximo provecho de tu
              catálogo. Elegí el canal que prefieras y te respondemos a la
              brevedad.
            </p>
          </div>
        </div>
      </div>

      {/* CANALES DE SOPORTE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          const isExternal = link.href.startsWith("http");
          const sharedClass = "group bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4 shadow-sm hover:border-[var(--admin-accent)]/30 hover:shadow-md transition-all duration-200";

          const inner = (
            <>
              <div className="flex items-start justify-between">
                <div className="p-2 bg-[var(--admin-accent)]/5 text-[var(--admin-accent)] rounded-lg group-hover:bg-[var(--admin-accent)]/10 transition-colors">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <ChevronRight
                  size={16}
                  className="text-[var(--admin-text-muted)]/40 group-hover:text-[var(--admin-accent)] group-hover:translate-x-0.5 transition-all"
                />
              </div>
              <h4 className="text-xs font-semibold text-[var(--admin-text)] mt-3 mb-0.5">
                {link.label}
              </h4>
              <p className="text-[10px] text-[var(--admin-text-muted)] leading-relaxed">
                {link.desc}
              </p>
            </>
          );

          if (isExternal) {
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={sharedClass}
              >
                {inner}
              </a>
            );
          }

          return (
            <TransitionLink key={link.label} href={link.href} className={sharedClass}>
              {inner}
            </TransitionLink>
          );
        })}
      </div>

      {/* INFO ADICIONAL */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Smartphone size={16} className="text-[var(--admin-text-muted)] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--admin-text)]">
              App v{appVersion}
            </p>
            <p className="text-[10px] text-[var(--admin-text-muted)]">
              NeoCatalog &mdash; Gesti&oacute;n inteligente de cat&aacute;logos digitales
            </p>
          </div>
          <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            Operativo
          </span>
        </div>
      </div>
    </div>
  );
}
