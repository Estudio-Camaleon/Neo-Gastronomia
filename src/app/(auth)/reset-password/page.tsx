"use client";

import { useState } from "react";
import { z } from "zod";
import {
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  KeyRound,
  Sparkles,
  Smartphone,
  LayoutDashboard,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { TransitionLink } from "@/components/ui/transition-link";
import Image from "next/image";
import { updatePasswordAction } from "@/features/auth/actions";
import { useRouter } from "next/navigation";
import "@/features/auth/auth.css";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirm: z.string().min(1, "Confirmá la contraseña."),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Las contraseñas no coinciden.",
    path: ["confirm"],
  });

const BENEFITS = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    text: "Sin comisiones por pedido",
  },
  {
    icon: <Smartphone className="w-5 h-5" />,
    text: "Optimizado para móviles",
  },
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    text: "Panel de gestión intuitivo",
  },
];

import { FoodMini } from "@/components/ui/food-loading";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getStrength = (pass: string) => {
    if (pass.length === 0) return { score: 0, label: "", color: "" };
    let points = 0;
    if (pass.length >= 8) points++;
    if (/[A-Z]/.test(pass)) points++;
    if (/[0-9]/.test(pass)) points++;
    if (/[^A-Za-z0-9]/.test(pass)) points++;
    if (points <= 1)
      return { score: 1, label: "Insegura", color: "bg-red-400" };
    if (points <= 3)
      return { score: 2, label: "Moderada", color: "bg-amber-400" };
    return { score: 3, label: "Fuerte", color: "bg-[var(--auth-primary)]" };
  };

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    const result = resetSchema.safeParse({ password, confirm });
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Datos inválidos.");
      return;
    }

    setLoading(true);
    const res = await updatePasswordAction(password);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-layout-container flex flex-col min-h-screen text-[var(--auth-text)] antialiased font-sans relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-8%] left-[-5%] w-[500px] h-[500px] bg-[var(--auth-primary)]/8 rounded-full auth-blob auth-pulse-glow" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-[var(--auth-accent-secondary)]/10 rounded-full auth-blob-reverse auth-pulse-glow" />
          <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-[var(--auth-primary-soft)]/20 rounded-full auth-blob-secondary" />
        </div>
        <div className="flex-1 grid lg:grid-cols-12 overflow-hidden relative z-10">
          <section className="hidden lg:flex lg:col-span-7 relative p-12 xl:p-16 flex-col justify-between items-center overflow-hidden bg-gradient-to-br from-[var(--auth-bg)] via-transparent to-[var(--auth-primary-soft)]/10 border-r border-[var(--auth-border)]">
            <div className="absolute inset-0 auth-dot-grid opacity-30 pointer-events-none" />
            <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-[var(--auth-primary)]/5 rounded-full auth-blob pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-15%] w-[500px] h-[500px] bg-[var(--auth-accent-secondary)]/8 rounded-full auth-blob-reverse pointer-events-none" />
            <div className="w-full text-left z-10">
              <TransitionLink
                href="/"
                className="inline-block transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                <div className="relative h-8 w-24">
                  <Image
                    src="/icons/neo_logo_negro.webp"
                    alt="NEO"
                    width={96}
                    height={32}
                    className="object-contain"
                    priority
                  />
                </div>
              </TransitionLink>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 max-w-xl z-10">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl xl:text-3xl font-bold text-[var(--auth-text)] text-center">
                Contraseña actualizada
              </h1>
              <p className="text-sm text-[var(--auth-text-muted)] text-center max-w-sm">
                Tu contraseña se cambió correctamente. Ya podés iniciar sesión
                con tu nueva clave.
              </p>
              <button
                onClick={() => router.push("/pedidos")}
                className="auth-btn-primary max-w-[220px]"
              >
                Ir al panel <ArrowRight size={16} />
              </button>
            </div>
          </section>
          <section className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center p-4 sm:p-6 md:p-12 bg-[var(--auth-surface-form)] backdrop-blur-xl">
            <div className="absolute top-[-5%] right-[-10%] w-[300px] h-[300px] bg-[var(--auth-primary)]/5 rounded-full auth-blob pointer-events-none" />
            <div className="absolute bottom-[-5%] left-[-10%] w-[250px] h-[250px] bg-[var(--auth-accent-secondary)]/6 rounded-full auth-blob-reverse pointer-events-none" />
            <div className="w-full max-w-md space-y-8 relative z-10">
              <div className="flex lg:hidden justify-center mb-4">
                <TransitionLink href="/">
                  <div className="relative h-8 w-24">
                  <Image
                    src="/icons/neo_logo_negro.webp"
                    alt="NEO"
                    width={96}
                    height={32}
                    className="object-contain"
                    priority
                  />
                </div>
              </TransitionLink>
            </div>
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-[var(--auth-accent)] uppercase">
                Listo{" "}
                <span className="font-light normal-case text-[var(--auth-accent-muted)]">
                  / NEO
                </span>
              </h2>
              <p className="text-[var(--auth-text-muted)] text-xs font-medium">
                Ahora iniciá sesión con tu nueva contraseña.
              </p>
            </div>
              <button
                onClick={() => router.push("/login")}
                className="auth-btn-primary"
              >
                Ir a iniciar sesión <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout-container flex flex-col min-h-screen text-[var(--auth-text)] antialiased font-sans relative overflow-hidden">
      {/* Blobs animados de fondo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-8%] left-[-5%] w-[500px] h-[500px] bg-[var(--auth-primary)]/8 rounded-full auth-blob auth-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-[var(--auth-accent-secondary)]/10 rounded-full auth-blob-reverse auth-pulse-glow" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-[var(--auth-primary-soft)]/20 rounded-full auth-blob-secondary" />
      </div>

      <div className="flex-1 grid lg:grid-cols-12 overflow-hidden relative z-10">
        {/* === SECCIÓN IZQUIERDA: HERO === */}
        <section className="hidden lg:flex lg:col-span-7 relative p-12 xl:p-16 flex-col justify-between items-center overflow-hidden bg-gradient-to-br from-[var(--auth-bg)] via-transparent to-[var(--auth-primary-soft)]/10 border-r border-[var(--auth-border)]">
          {/* Dot grid */}
          <div className="absolute inset-0 auth-dot-grid opacity-30 pointer-events-none" />

          {/* Blobs locales */}
          <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-[var(--auth-primary)]/5 rounded-full auth-blob pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-15%] w-[500px] h-[500px] bg-[var(--auth-accent-secondary)]/8 rounded-full auth-blob-reverse pointer-events-none" />

          {/* Líneas arquitectónicas */}
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-gradient-to-b from-transparent via-[var(--auth-border)] to-transparent opacity-30" />
          <div className="absolute top-0 bottom-0 right-1/3 w-px bg-gradient-to-b from-transparent via-[var(--auth-border)] to-transparent opacity-20" />

          {/* Logo */}
          <div className="w-full text-left z-10">
            <TransitionLink
              href="/"
              className="inline-block transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <div className="relative h-8 w-24">
                <Image
                  src="/icons/neo_logo_negro.webp"
                  alt="NEO Logo"
                  width={96}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
            </TransitionLink>
          </div>

          {/* Contenido central */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-10 max-w-xl z-10">
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--auth-primary-soft)] flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-[var(--auth-primary)]" />
              </div>
              <h1 className="text-3xl xl:text-5xl font-black tracking-tight text-[var(--auth-accent)] leading-[0.95] uppercase">
                Restablecé tu{" "}
                <span className="text-[var(--auth-accent-muted)] font-light italic normal-case">
                  contraseña
                </span>
              </h1>
              <p className="text-[var(--auth-text-muted)] text-sm leading-relaxed max-w-sm mx-auto font-medium">
                Elegí una clave segura para proteger tu cuenta y seguir
                gestionando tu negocio sin interrupciones.
              </p>
            </div>

            {/* Beneficios */}
            <div className="grid gap-3 w-full max-w-sm">
              {BENEFITS.map((item, i) => (
                <div
                  key={i}
                  className="auth-benefit-card group cursor-default animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--auth-bg)] text-[var(--auth-primary)] border border-[var(--auth-border)] transition-all duration-300 group-hover:border-[var(--auth-primary)]/30 group-hover:shadow-sm">
                    {item.icon}
                  </div>
                  <span className="font-semibold text-[var(--auth-text)] text-sm">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-2">
              {["Seguridad", "Encriptado", "Sin riesgos"].map((feat, idx) => (
                <div
                  key={idx}
                  className="auth-badge animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${300 + idx * 100}ms` }}
                >
                  <KeyRound size={12} />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === SECCIÓN DERECHA: FORMULARIO === */}
        <section className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center p-4 sm:p-6 md:p-12 relative bg-[var(--auth-surface-form)] backdrop-blur-xl">
          {/* Blobs sutiles del form */}
          <div className="absolute top-[-5%] right-[-10%] w-[300px] h-[300px] bg-[var(--auth-primary)]/5 rounded-full auth-blob pointer-events-none" />
          <div className="absolute bottom-[-5%] left-[-10%] w-[250px] h-[250px] bg-[var(--auth-accent-secondary)]/6 rounded-full auth-blob-reverse pointer-events-none" />

          <div className="w-full max-w-md space-y-8 relative z-10">
            {/* Logo Mobile */}
            <div className="flex lg:hidden justify-center mb-4">
              <TransitionLink href="/">
                <div className="relative h-8 w-24">
                  <Image
                    src="/icons/neo_logo_negro.webp"
                    alt="NEO"
                    fill
                    sizes="96px"
                    className="object-contain"
                    priority
                  />
                </div>
              </TransitionLink>
            </div>

            {/* Header */}
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-[var(--auth-accent)] uppercase">
                Nueva{" "}
                <span className="font-light normal-case text-[var(--auth-accent-muted)]">
                  contraseña
                </span>
              </h2>
              <p className="text-[var(--auth-text-muted)] text-xs font-medium">
                Elegí una contraseña segura para tu cuenta.
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="auth-label">Nueva contraseña</label>
                <div className="relative">
                  <Input
                    required
                    type={showPassword ? "text" : "password"}
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="auth-input pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--auth-text-muted)] hover:text-[var(--auth-text)]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-[#f3efe6] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-500`}
                        style={{
                          width: `${(strength.score / 3) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-[var(--auth-text-muted)]">
                      Fortaleza: {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="auth-label">Confirmar contraseña</label>
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  disabled={loading}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repetí la contraseña"
                  className={`auth-input ${
                    confirm && password !== confirm
                      ? "border-red-400 focus-visible:ring-red-400"
                      : confirm && password === confirm
                        ? "border-green-400 focus-visible:ring-green-400"
                        : ""
                  }`}
                  autoComplete="new-password"
                />
                {confirm && password !== confirm && (
                  <p className="text-[11px] text-red-500 font-medium mt-1">
                    Las contraseñas no coinciden.
                  </p>
                )}
              </div>

              {error && (
                <div className="auth-error-box">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="auth-btn-primary"
              >
                {loading ? (
                  <>
                    <FoodMini size={14} /> Actualizando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Cambiar contraseña
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-[var(--auth-text-muted)] text-sm font-medium">
                ¿Recordaste tu contraseña?{" "}
                <TransitionLink
                  href="/login"
                  className="text-[var(--auth-primary)] font-semibold hover:underline transition-colors ml-1 inline-block"
                >
                  Inicia sesión
                </TransitionLink>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
