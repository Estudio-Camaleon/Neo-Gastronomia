"use client";

import { useState } from "react";
import { z } from "zod";
import { ShieldAlert, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

// Esquema de registro con Regex quirúrgico para fulminar inyecciones XSS
const registerSchema = z.object({
  nombreNegocio: z
    .string()
    .min(2, "El nombre comercial debe poseer al menos 2 caracteres.")
    .transform((val) => {
      return val
        .trim()
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/[<>]/g, "");
    }),
  email: z
    .string()
    .min(1, "El correo electrónico es mandatorio.")
    .email("Ingresa un formato de correo válido")
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(6, "La contraseña del administrador requiere mínimo 6 caracteres.")
    .transform((val) => val.trim()),
});

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // --- HEURÍSTICA DE ENTROPÍA ULTRA-LIGHT ---
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) {
      return { score: 0, label: "", color: "bg-transparent", width: "w-0" };
    }
    let points = 0;
    if (pass.length >= 6) points++;
    if (/[A-Z]/.test(pass)) points++;
    if (/[0-9]/.test(pass)) points++;
    if (/[^A-Za-z0-9]/.test(pass)) points++;

    if (points <= 1) {
      return {
        score: 1,
        label: "Insegura",
        color: "bg-red-500",
        width: "w-1/3",
      };
    }
    if (points === 2 || points === 3) {
      return {
        score: 2,
        label: "Moderada",
        color: "bg-amber-500",
        width: "w-2/3",
      };
    }
    return {
      score: 3,
      label: "Fuerte",
      color: "bg-zinc-900 dark:bg-zinc-100",
      width: "w-full",
    };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg("");

    const validation = registerSchema.safeParse({
      nombreNegocio,
      email,
      password,
    });

    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message || "Esquema inválido.");
      return;
    }

    setLoading(true);
    try {
      const { createClient } = await import("@/core/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            nombre_negocio: validation.data.nombreNegocio,
          },
        },
      });

      if (error) throw error;
      setIsSent(true);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Fallo crítico de persistencia en la creación de credenciales.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center space-y-4 animate-in zoom-in-95 duration-200 select-none">
        <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full flex items-center justify-center mx-auto shadow-3xs">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
            Enlace de Activación Despachado
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
            Hemos enviado una firma de verificación para consolidar el local:{" "}
            <br />
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] mt-1 inline-block">
              {nombreNegocio}
            </span>
          </p>
        </div>
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900/60 rounded-lg text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal">
          Por favor, valida tu bandeja de entrada o buzón de spam para habilitar
          tu infraestructura multi-tenant en NEO.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="w-full space-y-4 text-xs">
      <div className="space-y-1.5">
        <label className="font-semibold text-zinc-700 dark:text-zinc-300">
          Nombre de tu Negocio
        </label>
        <Input
          required
          type="text"
          disabled={loading}
          value={nombreNegocio}
          onChange={(e) => setNombreNegocio(e.target.value)}
          placeholder="Ej: Burger Station"
          className="h-11 bg-zinc-50/50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800 text-sm rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 focus:bg-white text-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="space-y-1.5">
        <label className="font-semibold text-zinc-700 dark:text-zinc-300">
          Correo Electrónico
        </label>
        <Input
          required
          type="email"
          disabled={loading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="socio@tu-negocio.com"
          className="h-11 bg-zinc-50/50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800 text-sm rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 focus:bg-white text-zinc-900 dark:text-zinc-50"
        />
      </div>

      {/* INPUT DE CONTRASEÑA CON ENTROPÍA PREMIUM INTEGRADA */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="font-semibold text-zinc-700 dark:text-zinc-300">
            Contraseña Administrador
          </label>
          {password.length > 0 && (
            <span className="text-[10px] font-mono font-medium text-zinc-400 dark:text-zinc-500 animate-in fade-in duration-200">
              Fortaleza: {strength.label}
            </span>
          )}
        </div>
        <Input
          required
          autoComplete="new-password"
          type="password"
          disabled={loading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          className="h-11 bg-zinc-50/50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800 text-sm rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-300 focus:bg-white text-zinc-900 dark:text-zinc-50 mb-1"
        />

        {/* TRACKING VISUAL ADAPTATIVO */}
        <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden transition-all duration-300">
          <div
            className={`h-full ${strength.color} ${strength.width} transition-all duration-500 ease-out`}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2.5 text-red-700 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-3 rounded-lg text-[11px] leading-relaxed animate-in fade-in duration-150">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        disabled={loading}
        type="submit"
        className="w-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-medium text-xs h-11 rounded-lg shadow-sm hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Provisionando
            entorno...
          </>
        ) : (
          <>
            <span>Inicializar Mi Cuenta Comercial</span>
            <ArrowRight size={13} />
          </>
        )}
      </button>
    </form>
  );
}
