"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Rocket, Mail, Lock, Store, AlertCircle } from "lucide-react";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // 1. Registro en Supabase Auth con Metadata
    // Enviamos 'nombre_negocio' para que el Trigger de SQL lo use al crear la fila en public.negocios
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/productos`,
        data: {
          nombre_negocio: nombreNegocio,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    // 2. Éxito: Mostramos la vista de confirmación
    setIsSent(true);
    setLoading(false);
  };

  // VISTA DE ÉXITO: Email enviado
  if (isSent) {
    return (
      <div className="bg-primary/5 p-10 rounded-[2.5rem] text-center border border-primary/20 animate-in fade-in zoom-in duration-500 shadow-inner">
        <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-8 text-3xl shadow-lg shadow-primary/30 animate-bounce">
          <Rocket size={32} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-black text-text-primary mb-4 tracking-tighter italic uppercase">
          ¡Casi en órbita!
        </h2>
        <p className="text-text-secondary leading-relaxed text-sm mb-8">
          Hemos enviado un enlace de activación para <br />
          <span className="text-primary font-black uppercase tracking-widest">
            {nombreNegocio}
          </span>{" "}
          <br />
          al correo <strong className="text-text-primary">{email}</strong>.
        </p>
        <div className="p-5 bg-white/50 dark:bg-bg-darker rounded-2xl text-[10px] text-text-muted border border-border italic uppercase tracking-widest font-bold">
          Revisa tu bandeja de entrada y spam para <br /> empezar a cargar tu
          menú.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="w-full space-y-6">
      <div className="space-y-4">
        {/* Nombre del Negocio */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted ml-1">
            <Store size={14} /> Nombre de tu Negocio
          </label>
          <input
            required
            type="text"
            value={nombreNegocio}
            onChange={(e) => setNombreNegocio(e.target.value)}
            disabled={loading}
            className="w-full p-4 bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-2xl outline-none focus:border-primary transition-all text-text-primary font-black placeholder:font-medium uppercase"
            placeholder="Ej: MacDonals"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted ml-1">
            <Mail size={14} /> Correo Electrónico
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full p-4 bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-2xl outline-none focus:border-primary transition-all text-text-primary font-medium"
            placeholder="admin@tu-negocio.com"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted ml-1">
            <Lock size={14} /> Contraseña
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full p-4 bg-white dark:bg-bg-darker border-2 border-border dark:border-border-dark rounded-2xl outline-none focus:border-primary transition-all text-text-primary font-medium"
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* Error Feedback */}
      {errorMsg && (
        <div className="flex items-center gap-3 text-error text-[11px] font-black uppercase bg-error/10 p-4 rounded-2xl border-2 border-error/20 animate-in slide-in-from-top-2 italic">
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          disabled={loading}
          type="submit"
          className="w-full bg-primary hover:bg-primary-hover text-white p-5 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sincronizando...
            </>
          ) : (
            "Crear mi Imperio 🍔"
          )}
        </button>
      </div>

      <p className="text-[9px] text-center text-text-muted px-8 leading-relaxed uppercase font-bold tracking-widest">
        Al unirte, aceptas los{" "}
        <span className="text-primary underline">Términos</span> y la{" "}
        <span className="text-primary underline">Política de Privacidad</span>{" "}
        de NEO.
      </p>
    </form>
  );
}
