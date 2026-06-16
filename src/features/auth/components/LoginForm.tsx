"use client";

import { useState } from "react";
import { useFocusTrap } from "@/core/hooks/useFocusTrap";
import { useScrollLock } from "@/core/hooks/useScrollLock";
import { z } from "zod";
import {
  LogIn,
  AlertTriangle,
  Mail,
  X,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { FoodMini } from "@/components/ui/food-loading";
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

function ResetPasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  useScrollLock(open);
  const containerRef = useFocusTrap(open);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !email.trim()) return;
    setError("");
    setLoading(true);
    const res = await resetPasswordAction(email.trim());
    if (res?.error) {
      setError(res.error);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setEmail("");
    setSent(false);
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      tabIndex={-1}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-[var(--auth-surface-form)] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[var(--auth-border)] animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-[var(--auth-text)] tracking-tight">
            Restablecer contraseña
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-[var(--auth-bg)] text-[var(--auth-text-muted)] hover:text-[var(--auth-text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="auth-success-box">
              <Mail className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Revisá tu bandeja de entrada. Te enviamos un enlace para
                restablecer tu contraseña.
              </span>
            </div>
            <p className="text-xs text-[var(--auth-text-muted)] leading-relaxed">
              Si no encontrás el correo, revisá la carpeta de spam. El enlace
              expira en 1 hora.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="auth-btn-primary w-full"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-[var(--auth-text-muted)] leading-relaxed">
              Ingresá el correo de tu cuenta y te enviaremos un enlace seguro
              para cambiar tu contraseña.
            </p>
            <Input
              type="email"
              disabled={loading}
              placeholder="admin@tucomercio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            {error && (
              <div className="auth-error-box">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 border border-[var(--auth-border)] rounded-xl text-sm font-semibold text-[var(--auth-text-muted)] hover:bg-[var(--auth-bg)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="auth-btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <FoodMini size={14} /> Enviando...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Enviar enlace
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        if (!errs[field]) errs[field] = issue.message;
      }
      setFieldErrors(errs);
      setError(result.error.issues[0]?.message || "Datos de acceso inválidos.");
      return;
    }

    setLoading(true);
    const response = await loginAction(result.data);

    if (response?.error) {
      setError(response.error);
      setLoading(false);
    }
  };

  return (
    <>
      <ResetPasswordModal
        open={showReset}
        onClose={() => setShowReset(false)}
      />

      <form onSubmit={handleLogin} className="w-full space-y-5">
        <div className="space-y-2">
          <label className="auth-label">Correo Electrónico</label>
          <Input
            type="email"
            autoComplete="email"
            disabled={loading}
            placeholder="admin@tucomercio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={!!fieldErrors["email"] || undefined}
            aria-describedby={fieldErrors["email"] ? "login-email-error" : undefined}
            className="auth-input"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="auth-label">Contraseña</label>
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="text-xs font-medium text-[var(--auth-text-muted)] hover:text-[var(--auth-primary)] underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={loading}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            aria-invalid={!!fieldErrors["password"] || undefined}
            aria-describedby={fieldErrors["password"] ? "login-password-error" : undefined}
            className="auth-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--auth-text-muted)] hover:text-[var(--auth-text)] transition-colors"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="auth-error-box" role="alert" aria-live="polite">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span id={fieldErrors["email"] ? "login-email-error" : fieldErrors["password"] ? "login-password-error" : undefined}>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="auth-btn-primary mt-2"
        >
          {loading ? (
            <>
              <FoodMini size={14} /> Autenticando...
            </>
          ) : (
            <>
              <LogIn size={16} />
              <span>Ingresar al Panel de Control</span>
            </>
          )}
        </button>
      </form>
    </>
  );
}
