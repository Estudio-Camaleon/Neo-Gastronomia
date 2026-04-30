"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Datos inválidos");
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "Correo o contraseña incorrectos"
            : signInError.message,
        );
      } else {
        router.push("/pedidos");
        router.refresh();
      }
    } catch (err) {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full space-y-4">
      {/* Campo Email */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black uppercase tracking-widest text-text-muted ml-1">
          Correo Electrónico
        </label>
        <input
          type="email"
          placeholder="tu@ejemplo.com"
          className="w-full p-4 bg-white dark:bg-bg-darker border border-border dark:border-border-dark rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder:text-text-muted font-medium"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      {/* Campo Password */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center px-1">
          <label className="block text-xs font-black uppercase tracking-widest text-text-muted">
            Contraseña
          </label>
          <button
            type="button"
            className="text-[10px] font-bold text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full p-4 bg-white dark:bg-bg-darker border border-border dark:border-border-dark rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder:text-text-muted font-medium"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      {/* Mensajes de Error */}
      {error && (
        <div className="flex items-center gap-2 text-error text-xs font-bold bg-error/10 p-4 rounded-xl border border-error/20 animate-in fade-in zoom-in duration-300">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Botón de Acción */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white p-4 rounded-2xl font-black transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Accediendo...
          </>
        ) : (
          "Iniciar Sesión"
        )}
      </button>
    </form>
  );
}
