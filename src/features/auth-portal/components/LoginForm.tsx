"use client";

import { useState } from "react";
import { createClient } from "@/core/lib/supabase/client";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { LogIn, AlertTriangle } from "lucide-react";

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
  const supabase = createClient();

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
        router.refresh();
        router.push("/productos");
      }
    } catch {
      setError("Ocurrió un error inesperado en el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full space-y-5">
      <div className="space-y-2">
        <label className="block text-xs font-black uppercase tracking-wider text-black">
          Correo Electrónico
        </label>
        <input
          type="email"
          disabled={loading}
          className="w-full p-4 bg-white border-4 border-black text-black font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 text-sm"
          placeholder="admin@tuimperio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-black uppercase tracking-wider text-black">
            Contraseña
          </label>
          <button
            type="button"
            className="text-xs font-black uppercase underline tracking-tight text-black hover:text-gray-700"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <input
          type="password"
          disabled={loading}
          className="w-full p-4 bg-white border-4 border-black text-black font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 text-sm"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 text-black text-xs font-black uppercase bg-red-100 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#A3FF00] text-black font-black uppercase text-sm tracking-wider p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-white active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <LogIn className="h-4 w-4 stroke-[3]" />
            Ingresar a mi terminal
          </>
        )}
      </button>
    </form>
  );
}
