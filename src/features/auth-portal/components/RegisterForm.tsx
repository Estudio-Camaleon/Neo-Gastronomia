"use client";

import { useState } from "react";
import { createClient } from "@/core/lib/supabase/client";
import { z } from "zod";
import { ShieldAlert, Terminal, ArrowRight } from "lucide-react";

const registerSchema = z.object({
  nombreNegocio: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

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
    if (loading) return;

    setLoading(true);
    setErrorMsg("");

    const validation = registerSchema.safeParse({
      nombreNegocio,
      email,
      password,
    });
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message || "Datos incorrectos.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/pedidos`,
          data: {
            nombre_negocio: nombreNegocio,
          },
        },
      });

      if (error) throw error;
      setIsSent(true);
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Error fatal en el onboarding.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center space-y-6 transform -rotate-1 animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-[#A3FF00] border-4 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Terminal className="h-8 w-8 text-black stroke-[3]" />
        </div>
        <h2 className="text-3xl font-black text-black uppercase tracking-tighter">
          ¡CASI EN ÓRBITA!
        </h2>
        <p className="text-sm font-bold text-gray-800 leading-relaxed uppercase tracking-wide">
          Hemos enviado un comando de activación para <br />
          <span className="bg-black text-[#A3FF00] px-2 py-0.5 inline-block my-1 font-black">
            {nombreNegocio}
          </span>{" "}
          <br />
          al correo: <span className="underline">{email}</span>
        </p>
        <div className="p-4 bg-gray-100 border-2 border-black text-[11px] font-black uppercase tracking-wider text-gray-700 italic">
          Verificá tu casilla de correo o spam para inicializar la terminal de
          administración.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="w-full space-y-5">
      <div className="space-y-2">
        <label className="block text-xs font-black uppercase tracking-wider text-black">
          Nombre de tu Negocio
        </label>
        <input
          required
          type="text"
          disabled={loading}
          value={nombreNegocio}
          onChange={(e) => setNombreNegocio(e.target.value)}
          className="w-full p-4 bg-white border-4 border-black text-black font-black outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase transition-all placeholder:text-gray-400 text-sm"
          placeholder="Ej: BURGER KING"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-black uppercase tracking-wider text-black">
          Correo Electrónico
        </label>
        <input
          required
          type="email"
          disabled={loading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 bg-white border-4 border-black text-black font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 text-sm"
          placeholder="socio@tu-negocio.com"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-black uppercase tracking-wider text-black">
          Contraseña
        </label>
        <input
          required
          autoComplete="new-password"
          type="password"
          disabled={loading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 bg-white border-4 border-black text-black font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 text-sm"
          placeholder="••••••••"
        />
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 text-black text-xs font-black uppercase bg-red-100 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top-2 italic">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        disabled={loading}
        type="submit"
        className="w-full bg-[#A3FF00] text-black font-black uppercase text-sm tracking-wider p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-white active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            Crear mi Imperio Gastronómico
            <ArrowRight className="h-4 w-4 stroke-[3]" />
          </>
        )}
      </button>
    </form>
  );
}
