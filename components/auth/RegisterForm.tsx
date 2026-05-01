"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/pedidos`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setIsSent(true);
      setLoading(false);
    }
  };

  // VISTA DE ÉXITO (Mismo estilo que el formulario)
  if (isSent) {
    return (
      <div className="bg-primary/5 p-8 rounded-[2rem] text-center border border-primary/20 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          🚀
        </div>
        <h2 className="text-2xl font-black text-text-primary mb-3 tracking-tight">
          ¡Casi listo!
        </h2>
        <p className="text-text-secondary leading-relaxed text-sm">
          Hemos enviado un enlace de confirmación a <br />
          <strong className="text-primary">{email}</strong>.
        </p>
        <div className="mt-8 p-4 bg-white rounded-2xl text-xs text-text-muted border border-border italic">
          Por favor, revisa tu bandeja de entrada y spam para activar tu cuenta.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="w-full space-y-5">
      {/* Email Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black uppercase tracking-widest text-text-muted ml-1">
          Correo Electrónico
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full p-4 bg-white border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder:text-text-muted font-medium"
          placeholder="tu@negocio.com"
        />
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black uppercase tracking-widest text-text-muted ml-1">
          Contraseña
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full p-4 bg-white border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder:text-text-muted font-medium"
          placeholder="••••••••"
        />
      </div>

      {/* Error Feedback */}
      {errorMsg && (
        <div className="text-error text-xs font-bold bg-error/5 p-4 rounded-xl border border-error/10 animate-in slide-in-from-top-2">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Submit Button */}
      <button
        disabled={loading}
        type="submit"
        className="w-full bg-primary text-white p-4 rounded-2xl font-black transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creando cuenta...
          </>
        ) : (
          "Crear mi cuenta"
        )}
      </button>

      <p className="text-[10px] text-center text-text-muted px-6 leading-relaxed">
        Al registrarte, aceptas nuestros{" "}
        <span className="underline cursor-pointer">Términos</span> y la{" "}
        <span className="underline cursor-pointer">Política de Privacidad</span>
        .
      </p>
    </form>
  );
}
