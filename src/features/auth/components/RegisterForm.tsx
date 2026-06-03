"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import {
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { StepIndicator } from "./StepIndicator";
import { registerAction } from "../actions";

const step1Schema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es mandatorio.")
    .email("Ingresa un formato de correo válido")
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(8, "La contraseña del administrador requiere mínimo 8 caracteres.")
    .transform((val) => val.trim()),
});

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // --- HEURÍSTICA DE ENTROPÍA ULTRA-LIGHT ORIGINAL RESTAURADA ---
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) {
      return { score: 0, label: "", color: "bg-transparent", width: "w-0" };
    }
    let points = 0;
    if (pass.length >= 8) points++;
    if (/[A-Z]/.test(pass)) points++;
    if (/[0-9]/.test(pass)) points++;
    if (/[^A-Za-z0-9]/.test(pass)) points++;

    if (points <= 1) {
      return {
        score: 1,
        label: "Insegura",
        color: "bg-red-400",
        width: "w-1/3",
      };
    }
    if (points === 2 || points === 3) {
      return {
        score: 2,
        label: "Moderada",
        color: "bg-amber-400",
        width: "w-2/3",
      };
    }
    return {
      score: 3,
      label: "Fuerte",
      color: "bg-[var(--auth-primary)]",
      width: "w-full",
    };
  };

  const strength = getPasswordStrength(password);

  const handleNextStep = () => {
    setErrorMsg("");
    const result = step1Schema.safeParse({ email, password });
    if (!result.success) {
      setErrorMsg(result.error.issues[0]?.message || "Datos inválidos.");
      return;
    }
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg("");

    const sanitize = (v: string) =>
      v.trim().replace(/<[^>]*>/g, "").replace(/[<>]/g, "");

    const negocioLimpio = sanitize(nombreNegocio);
    const whatsappLimpio = sanitize(whatsapp);
    const descripcionLimpia = sanitize(descripcion);

    if (negocioLimpio.length < 2) {
      setErrorMsg("El nombre comercial debe poseer al menos 2 caracteres.");
      return;
    }

    setLoading(true);
    const response = await registerAction({
      email,
      password,
      nombreNegocio: negocioLimpio,
      whatsapp: whatsappLimpio || undefined,
      descripcion: descripcionLimpia || undefined,
    });

    if (response?.error) {
      setErrorMsg(response.error);
      setLoading(false);
    } else {
      setIsSent(true);
      setLoading(false);
    }
  };

  // --- REDIRECCIÓN TRAS REGISTRO EXITOSO ---
  useEffect(() => {
    if (isSent) {
      router.push("/pedidos");
    }
  }, [isSent, router]);

  if (isSent) {
    return (
      <div className="bg-[var(--auth-surface-form)] p-6 rounded-xl border border-[var(--auth-border)] text-center space-y-4 animate-in zoom-in-95 duration-200 select-none shadow-sm">
        <div className="w-12 h-12 bg-[var(--auth-primary-soft)] text-[var(--auth-primary)] rounded-full flex items-center justify-center mx-auto shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-[var(--auth-accent)] tracking-tight">
            Registro Exitoso
          </h2>
          <p className="text-[var(--auth-text-muted)] text-sm leading-relaxed">
            Redirigiendo a tu panel de control...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <StepIndicator currentStep={step} />

      <form
        onSubmit={handleRegister}
        className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {/* === PASO 1: CUENTA (CON ENTROPÍA PREMIUM INTEGRADA) === */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="auth-label">Correo Electrónico</label>
              <Input
                required
                type="email"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="socio@tu-negocio.com"
                className="auth-input"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="auth-label">Contraseña Administrador</label>
                {password.length > 0 && (
                  <span className="text-[10px] font-mono font-medium text-[var(--auth-text-muted)] animate-in fade-in duration-200">
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
                placeholder="Mínimo 8 caracteres"
                className="auth-input mb-1.5"
              />
              {/* TRACKING VISUAL ADAPTATIVO */}
              <div className="h-1.5 w-full bg-[#f3efe6] rounded-full overflow-hidden transition-all duration-300">
                <div
                  className={`h-full ${strength.color} ${strength.width} transition-all duration-500 ease-out`}
                />
              </div>
            </div>

            {errorMsg && (
              <div className="auth-error-box">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleNextStep}
              className="auth-btn-primary mt-2 w-full"
            >
              Continuar <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* === PASO 2: NEGOCIO === */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="auth-label">Nombre de tu Negocio</label>
              <Input
                required
                type="text"
                disabled={loading}
                value={nombreNegocio}
                onChange={(e) => setNombreNegocio(e.target.value)}
                placeholder="Ej: Burger Station"
                className="auth-input"
              />
            </div>

            <div className="space-y-2">
              <label className="auth-label">WhatsApp de contacto</label>
              <Input
                type="tel"
                disabled={loading}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ej: +5491123456789"
                className="auth-input"
              />
              <p className="text-[10px] text-[var(--auth-text-muted)] pl-1">
                Opcional — lo usará tu menú QR para recibir pedidos.
              </p>
            </div>

            <div className="space-y-2">
              <label className="auth-label">Descripción breve</label>
              <textarea
                disabled={loading}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Hamburguesas artesanales en Palermo"
                rows={2}
                className="auth-input min-h-[60px] h-auto resize-none"
              />
              <p className="text-[10px] text-[var(--auth-text-muted)] pl-1">
                Opcional — aparecerá en tu perfil público.
              </p>
            </div>

            {errorMsg && (
              <div className="auth-error-box">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="px-4 py-2 border border-[var(--auth-border)] rounded-lg text-sm text-[var(--auth-text-muted)] hover:bg-[#f7f4ec] transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                disabled={loading}
                type="submit"
                className="auth-btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Provisionando
                    entorno...
                  </>
                ) : (
                  <>
                    <span>Inicializar Mi Cuenta Comercial</span>
                    <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
