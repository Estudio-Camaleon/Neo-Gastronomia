"use client";

import { useState, useEffect, useRef } from "react";

interface NotesModalProps {
  title: string;
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  onClose: () => void;
}

export function NotesModal({
  title,
  initialValue,
  onSave,
  onClose,
}: NotesModalProps) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    textareaRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(value);
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notes-modal-title"
        className="bg-[var(--admin-surface)] rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-[var(--admin-border)] animate-in zoom-in-95 duration-150"
      >
        <h3
          id="notes-modal-title"
          className="font-bold text-lg text-[var(--admin-text)] mb-4 tracking-tight"
        >
          {title}
        </h3>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full min-h-[120px] p-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] resize-y text-sm transition-all"
          placeholder="Escribí tus notas técnicas..."
        />

        <div className="flex gap-3 mt-5 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 border border-[var(--admin-border)] bg-transparent text-[var(--admin-text)] rounded-xl font-bold text-sm hover:bg-[var(--admin-bg)] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-[var(--admin-accent)] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Notas"}
          </button>
        </div>
      </div>
    </div>
  );
}
