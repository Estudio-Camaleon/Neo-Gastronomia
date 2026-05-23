"use client";

import { useState } from "react";
import { z } from "zod";
import { LogIn, AlertTriangle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { loginAction } from "../actions";

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
