"use client";

import { AlertTriangle } from "lucide-react";

interface ErrorModalProps {
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function ErrorModal({ title, message, action }: ErrorModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 font-sans animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark p-8 rounded-super shadow-2xl text-center animate-in zoom-in-95 duration-200">
        {/* Alerta Visual Neo-Brutalista */}
        <div className="w-14 h-14 bg-error/10 text-error border-2 border-error rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <AlertTriangle size={24} strokeWidth={2.5} />
        </div>

        {/* Título de la Excepción */}
        <h2 className="text-xl font-black text-text-primary dark:text-text-inverse uppercase tracking-tighter italic mb-2">
          {title}
        </h2>

        {/* Mensaje Técnico Descriptivo */}
        <p className="text-xs font-medium text-text-muted dark:text-text-muted/80 leading-relaxed mb-6">
          {message}
        </p>

        {/* Ranura condicional para botones de acción secundarios (Ej: Reintentar) */}
        {action && (
          <div className="flex justify-center items-center gap-3 animate-in fade-in delay-75">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
