"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { LogIn, AlertTriangle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio.")
    .email("Ingresa un formato de correo válido")
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .transform((val) => val.trim()),
});

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(
        result.error.issues[0]?.message || "Payload de acceso inválido.",
      );
      return;
    }

    setLoading(true);
    try {
      const { createClient } = await import("@/core/lib/supabase/client");
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
      });

      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "El correo electrónico o la contraseña son incorrectos."
            : signInError.message,
        );
      } else {
        router.refresh();
        router.push("/pedidos");
      }
    } catch {
      setError("Fallo crítico de comunicación con el nodo de base de datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full space-y-4 text-xs">
      <div className="space-y-1.5">
        <label className="font-medium text-zinc-600 dark:text-zinc-400">
          Correo Electrónico
        </label>
        <Input
          type="email"
          disabled={loading}
          placeholder="admin@tucomercio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800/80 text-xs rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 focus:bg-white text-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="font-medium text-zinc-600 dark:text-zinc-400">
            Contraseña
          </label>
          <button
            type="button"
            className="text-[11px] font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <Input
          type="password"
          disabled={loading}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-10 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800/80 text-xs rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 focus:bg-white text-zinc-900 dark:text-zinc-50"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2.5 text-red-700 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 p-3 rounded-lg text-[11px] leading-relaxed animate-in fade-in duration-150">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-medium text-xs h-10 rounded-lg shadow-2xs hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Autenticando...
          </>
        ) : (
          <>
            <LogIn size={13} />
            <span>Ingresar al Panel de Control</span>
          </>
        )}
      </button>
    </form>
  );
}
