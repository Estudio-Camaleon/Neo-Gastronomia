"use client";

import { useState } from "react";
import { z } from "zod";
import { LogIn, AlertTriangle, Loader2, Mail, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { loginAction, resetPasswordAction } from "../actions";

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
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetSent, setResetSent] = useState(false);

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

    // Llamada a la Server Action en lugar del cliente local
    const response = await loginAction(result.data);

    if (response?.error) {
      setError(response.error);
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || !email.trim()) return;
    setError("");
    setLoading(true);
    const res = await resetPasswordAction(email.trim());
    if (res?.error) {
      setError(res.error);
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  if (mode === "reset") {
    return (
      <form onSubmit={handleReset} className="w-full space-y-5">
        <div className="space-y-2">
          <label className="auth-label">Correo Electrónico</label>
          <Input
            type="email"
            disabled={loading}
            placeholder="admin@tucomercio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
        </div>

        {resetSent && (
          <div className="auth-success-box">
            <Mail className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Revisa tu bandeja de entrada. Te enviamos un enlace para restablecer tu contraseña.</span>
          </div>
        )}

        {error && (
          <div className="auth-error-box">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || resetSent}
          className="auth-btn-primary mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
            </>
          ) : (
            <>
              <Mail size={16} />
              <span>Enviar enlace de restablecimiento</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setMode("login"); setResetSent(false); setError(""); }}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium text-[var(--auth-text-muted)] hover:text-[var(--auth-primary)] transition-colors"
        >
          <ArrowLeft size={14} /> Volver al inicio de sesión
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="w-full space-y-5">
      <div className="space-y-2">
        <label className="auth-label">Correo Electrónico</label>
        <Input
          type="email"
          disabled={loading}
          placeholder="admin@tucomercio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="auth-label">Contraseña</label>
          <button
            type="button"
            onClick={() => setMode("reset")}
            className="text-xs font-medium text-[var(--auth-text-muted)] hover:text-[var(--auth-primary)] underline transition-colors"
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
          className="auth-input"
        />
      </div>

      {error && (
        <div className="auth-error-box">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="auth-btn-primary mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Autenticando...
          </>
        ) : (
          <>
            <LogIn size={16} />
            <span>Ingresar al Panel de Control</span>
          </>
        )}
      </button>
    </form>
  );
}
