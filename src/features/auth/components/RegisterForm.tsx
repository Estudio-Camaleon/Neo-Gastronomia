"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { z } from "zod";
import {
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Hash,
  MapPin,
  Palette,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { StepIndicator } from "./StepIndicator";
import { registerAction, checkDuplicateAction } from "../actions";

const step1Schema = z
  .object({
    email: z
      .string()
      .min(1, "El correo electrónico es obligatorio.")
      .email("Ingresa un formato de correo válido")
      .transform((val) => val.trim().toLowerCase()),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .transform((val) => val.trim()),
    confirmPassword: z.string().min(1, "Confirmá la contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

function generateSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)+/g, "") || ""
  );
}

const DEFAULT_COLOR = "#10b981";

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [slug, setSlug] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [direccion, setDireccion] = useState("");
  const [colorPrimary, setColorPrimary] = useState(DEFAULT_COLOR);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [duplicates, setDuplicates] = useState<Record<string, boolean | null>>({
    nombre: null,
    slug: null,
    whatsapp: null,
  });
  const [checkingFields, setCheckingFields] = useState<Record<string, boolean>>(
    {},
  );

  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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

  const checkDuplicate = useCallback(async (field: string, value: string) => {
    if (!value || value.length < (field === "email" ? 5 : 2)) {
      setDuplicates((prev) => ({ ...prev, [field]: null }));
      return;
    }
    setCheckingFields((prev) => ({ ...prev, [field]: true }));
    const res = await checkDuplicateAction(field, value);
    setDuplicates((prev) => ({ ...prev, [field]: res.exists ?? false }));
    setCheckingFields((prev) => ({ ...prev, [field]: false }));
  }, []);

  const debouncedCheck = useCallback(
    (field: string, value: string) => {
      if (debounceRef.current[field]) {
        clearTimeout(debounceRef.current[field]);
      }
      debounceRef.current[field] = setTimeout(
        () => checkDuplicate(field, value),
        400,
      );
    },
    [checkDuplicate],
  );

  useEffect(() => {
    return () => {
      Object.values(debounceRef.current).forEach(clearTimeout);
    };
  }, []);

  const handleNombreChange = (val: string) => {
    setNombreNegocio(val);
    const autoSlug = generateSlug(val);
    if (!slug || slug === generateSlug(nombreNegocio)) {
      setSlug(autoSlug);
    }
    if (val.length >= 2) {
      debouncedCheck("nombre", val);
    } else {
      setDuplicates((prev) => ({ ...prev, nombre: null }));
    }
  };

  const handleSlugChange = (val: string) => {
    const cleaned = generateSlug(val);
    setSlug(cleaned);
    if (cleaned.length >= 2) {
      debouncedCheck("slug", cleaned);
    } else {
      setDuplicates((prev) => ({ ...prev, slug: null }));
    }
  };

  const handleNextStep = () => {
    setErrorMsg("");
    const result = step1Schema.safeParse({ email, password, confirmPassword });
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

    const hasDuplicates =
      duplicates["nombre"] === true ||
      duplicates["slug"] === true ||
      duplicates["whatsapp"] === true;

    if (hasDuplicates) {
      setErrorMsg("Corregí los campos marcados en rojo antes de continuar.");
      return;
    }

    if (slug.length < 2) {
      setErrorMsg("El slug debe tener al menos 2 caracteres.");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setErrorMsg("El slug solo puede contener minúsculas, números y guiones.");
      return;
    }

    setLoading(true);
    const response = await registerAction({
      email,
      password,
      nombreNegocio,
      slug,
      whatsapp: whatsapp || undefined,
      direccion: direccion || undefined,
      color_primary: colorPrimary,
    });

    if (response?.error) {
      setErrorMsg(response.error);
      setLoading(false);
    }
  };

  const isNombreRegistered = duplicates["nombre"] === true;
  const isSlugTaken = duplicates["slug"] === true;
  const isWhatsappTaken = duplicates["whatsapp"] === true;

  const emailSchemaCheck = z.string().email().safeParse(email).success;
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;
  const passwordReady = strength.score >= 2 && passwordsMatch;
  const canProceedToStep2 = emailSchemaCheck && passwordReady;

  return (
    <div className="w-full">
      <StepIndicator currentStep={step} />

      <form
        onSubmit={handleRegister}
        className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {/* === PASO 1: CUENTA === */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="auth-label">Correo Electrónico</label>
              <div className="relative">
                <Input
                  required
                  type="email"
                  autoComplete="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  placeholder="socio@tu-negocio.com"
                  className={`auth-input pr-10 ${
                    emailSchemaCheck && email.length > 5
                      ? "border-green-400 focus-visible:ring-green-400"
                      : email.length > 0
                        ? ""
                        : ""
                  }`}
                />
                {emailSchemaCheck && email.length > 5 && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
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
              <div className="h-1.5 w-full bg-[#f3efe6] rounded-full overflow-hidden transition-all duration-300">
                <div
                  className={`h-full ${strength.color} ${strength.width} transition-all duration-500 ease-out`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="auth-label">Confirmar contraseña</label>
              <Input
                required
                autoComplete="new-password"
                type="password"
                disabled={loading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí la contraseña"
                className={`auth-input ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-400 focus-visible:ring-red-400"
                    : confirmPassword && password === confirmPassword
                      ? "border-green-400 focus-visible:ring-green-400"
                      : ""
                }`}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[11px] text-red-500 font-medium mt-1">
                  Las contraseñas no coinciden.
                </p>
              )}
            </div>

            {errorMsg && (
              <div className="auth-error-box">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Indicador de requisitos */}
            {password.length > 0 && strength.score < 2 && (
              <div className="auth-warning-box">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="text-xs">
                  La contraseña debe incluir al menos 2 de estos: mayúscula,
                  número, símbolo especial.
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleNextStep}
              disabled={!canProceedToStep2}
              className={`auth-btn-primary mt-2 w-full ${
                !canProceedToStep2 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Continuar <ArrowRight size={16} />
            </button>

            {!canProceedToStep2 && email.length > 0 && (
              <div className="flex flex-col gap-1.5 text-[11px] text-[var(--auth-text-muted)] font-medium pt-1">
                {!emailSchemaCheck && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Correo electrónico válido
                  </span>
                )}
                {strength.score < 2 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Contraseña segura (mín. moderada)
                  </span>
                )}
                {!passwordsMatch && strength.score >= 2 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Confirmar contraseña
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* === PASO 2: NEGOCIO === */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="auth-label">Nombre de tu Negocio</label>
              <div className="relative">
                <Input
                  required
                  type="text"
                  disabled={loading}
                  value={nombreNegocio}
                  onChange={(e) => handleNombreChange(e.target.value)}
                  placeholder="Ej: Burger Station"
                  className={`auth-input pr-10 ${
                    isNombreRegistered
                      ? "border-red-400 focus-visible:ring-red-400"
                      : duplicates["nombre"] === false &&
                          nombreNegocio.length >= 2
                        ? "border-green-400 focus-visible:ring-green-400"
                        : ""
                  }`}
                />
                {checkingFields["nombre"] && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[var(--auth-text-muted)]" />
                )}
                {!checkingFields["nombre"] && isNombreRegistered && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {!checkingFields["nombre"] &&
                  duplicates["nombre"] === false &&
                  nombreNegocio.length >= 2 && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
              </div>
              {isNombreRegistered && (
                <p className="text-[11px] text-red-500 font-medium mt-1">
                  Este nombre ya está registrado.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="auth-label flex items-center gap-1.5">
                <Hash size={14} />
                Slug de tu menú público
              </label>
              <div className="relative">
                <Input
                  required
                  type="text"
                  disabled={loading}
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="burger-station"
                  className={`auth-input pr-10 font-mono text-sm ${
                    isSlugTaken
                      ? "border-red-400 focus-visible:ring-red-400"
                      : duplicates["slug"] === false && slug.length >= 2
                        ? "border-green-400 focus-visible:ring-green-400"
                        : ""
                  }`}
                />
                {checkingFields["slug"] && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[var(--auth-text-muted)]" />
                )}
                {!checkingFields["slug"] && isSlugTaken && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {!checkingFields["slug"] &&
                  duplicates["slug"] === false &&
                  slug.length >= 2 && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
              </div>
              {isSlugTaken && (
                <p className="text-[11px] text-red-500 font-medium mt-1">
                  Este slug ya está en uso. Elegí otro.
                </p>
              )}
              <p className="text-[10px] text-[var(--auth-text-muted)] pl-1">
                La URL de tu menú público será: tu-negocio.com/
                <span className="font-mono font-semibold">
                  {slug || "slug"}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="auth-label">WhatsApp de contacto</label>
              <div className="relative">
                <Input
                  type="tel"
                  disabled={loading}
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    if (e.target.value.length >= 7) {
                      debouncedCheck("whatsapp", e.target.value);
                    } else {
                      setDuplicates((prev) => ({
                        ...prev,
                        whatsapp: null,
                      }));
                    }
                  }}
                  placeholder="+5491123456789"
                  className={`auth-input pr-10 ${
                    isWhatsappTaken
                      ? "border-red-400 focus-visible:ring-red-400"
                      : duplicates["whatsapp"] === false && whatsapp.length >= 7
                        ? "border-green-400 focus-visible:ring-green-400"
                        : ""
                  }`}
                />
                {checkingFields["whatsapp"] && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[var(--auth-text-muted)]" />
                )}
                {!checkingFields["whatsapp"] && isWhatsappTaken && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {!checkingFields["whatsapp"] &&
                  duplicates["whatsapp"] === false &&
                  whatsapp.length >= 7 && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
              </div>
              {isWhatsappTaken && (
                <p className="text-[11px] text-red-500 font-medium mt-1">
                  Este número ya está registrado.
                </p>
              )}
              <p className="text-[10px] text-[var(--auth-text-muted)] pl-1">
                Opcional — lo usará tu menú QR para recibir pedidos.
              </p>
            </div>

            <div className="space-y-2">
              <label className="auth-label flex items-center gap-1.5">
                <MapPin size={14} />
                Dirección del local
              </label>
              <Input
                type="text"
                disabled={loading}
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej: Av. Corrientes 1234, CABA"
                className="auth-input"
              />
              <p className="text-[10px] text-[var(--auth-text-muted)] pl-1">
                Opcional — aparecerá en tu perfil público.
              </p>
            </div>

            <div className="space-y-2">
              <label className="auth-label flex items-center gap-1.5">
                <Palette size={14} />
                Color principal de tu marca
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorPrimary}
                  onChange={(e) => setColorPrimary(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-[var(--auth-border)] cursor-pointer bg-transparent p-0.5"
                />
                <span className="font-mono text-sm text-[var(--auth-text-muted)]">
                  {colorPrimary}
                </span>
                <div
                  className="w-6 h-6 rounded-full border border-[var(--auth-border)]"
                  style={{ backgroundColor: colorPrimary }}
                />
              </div>
              <p className="text-[10px] text-[var(--auth-text-muted)] pl-1">
                Se usará en tu menú digital y panel de administración.
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
                    <Loader2 className="w-4 h-4 animate-spin" /> Creando
                    cuenta...
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
