"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { z } from "zod";
import {
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Hash,
  Phone,
  Mail,
  Sparkles,
  Eye,
  EyeOff,
  User,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { StepIndicator } from "./StepIndicator";
import { registerAction, checkDuplicateAction } from "../actions";
import { FoodMini } from "@/components/ui/food-loading";
import { generateSlug } from "@/core/lib/slug";
import { createClient } from "@/core/lib/supabase/client";

const step3Schema = z
  .object({
    email: z
      .string()
      .min(1, "El correo electrónico es obligatorio.")
      .email("Ingresa un formato de correo válido")
      .transform((val) => val.trim().toLowerCase()),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
      .regex(/[0-9]/, "Debe incluir al menos un número")
      .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un símbolo especial")
      .transform((val) => val.trim()),
    confirmPassword: z.string().min(1, "Confirmá la contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

const REFERRAL_OPTIONS = [
  "Google",
  "Instagram",
  "Facebook",
  "Recomendación de un amigo",
  "Otro",
];

export function RegisterForm() {
  const [step, setStep] = useState(1);

  // Step 1 — Titular
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("54");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referralSource, setReferralSource] = useState("");

  // Step 2 — Negocio
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [slug, setSlug] = useState("");
  const [whatsappCountry, setWhatsappCountry] = useState("54");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Step 3 — Acceso
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [registered, setRegistered] = useState(false);

  const [duplicates, setDuplicates] = useState<Record<string, boolean | null>>({
    nombre: null,
    slug: null,
    phone: null,
    whatsapp: null,
    email: null,
  });
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
  const [checkingFields, setCheckingFields] = useState<Record<string, boolean>>({});

  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const combinedPhone = phoneCountry || phoneNumber
    ? `+${phoneCountry}${phoneNumber}`
    : "";
  const combinedWhatsapp = whatsappCountry || whatsappNumber
    ? `+${whatsappCountry}${whatsappNumber}`
    : "";

  const getPasswordStrength = (pass: string) => {
    const checks = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      symbol: /[^A-Za-z0-9]/.test(pass),
    };
    const points = Object.values(checks).filter(Boolean).length;

    let label: string, color: string, width: string;
    if (pass.length === 0) {
      label = "";
      color = "bg-transparent";
      width = "w-0";
    } else if (points <= 1) {
      label = "Insegura";
      color = "bg-red-400";
      width = "w-1/4";
    } else if (points <= 3) {
      label = "Moderada";
      color = "bg-amber-400";
      width = `${(points / 4) * 100}%`;
    } else {
      label = "Fuerte";
      color = "bg-[var(--auth-primary)]";
      width = "w-full";
    }
    return { score: points, label, color, width, checks, allMet: points === 4 };
  };

  const strength = getPasswordStrength(password);

  const checkDuplicate = useCallback(async (field: string, value: string) => {
    if (!value || value.length < (field === "email" ? 5 : 2)) {
      setDuplicates((prev) => ({ ...prev, [field]: null }));
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
      return;
    }
    setCheckingFields((prev) => ({ ...prev, [field]: true }));
    const res = await checkDuplicateAction(field, value);
    if ("error" in res) {
      setDuplicates((prev) => ({ ...prev, [field]: false }));
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
    } else {
      setDuplicates((prev) => ({ ...prev, [field]: res.exists }));
      setSuggestions((prev) => ({ ...prev, [field]: res.suggestions ?? [] }));
    }
    setCheckingFields((prev) => ({ ...prev, [field]: false }));
  }, []);

  const debouncedCheck = useCallback(
    (field: string, value: string) => {
      if (debounceRef.current[field]) clearTimeout(debounceRef.current[field]);
      debounceRef.current[field] = setTimeout(() => checkDuplicate(field, value), 400);
    },
    [checkDuplicate],
  );

  useEffect(() => {
    return () => {
      Object.values(debounceRef.current).forEach(clearTimeout);
    };
  }, []);

  // Polling: detecta cuándo el usuario confirma el email (toca el link)
  useEffect(() => {
    if (!registered) return;

    const supabase = createClient();
    const interval = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        clearInterval(interval);
        window.location.href = "/login?confirmed=true";
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [registered]);

  const handleNombreChange = (val: string) => {
    const prevGenerated = generateSlug(nombreNegocio);
    setNombreNegocio(val);
    const autoSlug = generateSlug(val);
    if (!slug || slug === prevGenerated) {
      setSlug(autoSlug);
    }
    if (val.length >= 2) {
      debouncedCheck("nombre", val);
    }
    if (autoSlug.length >= 2) {
      debouncedCheck("slug", autoSlug);
    } else {
      setDuplicates((prev) => ({ ...prev, slug: null }));
    }
  };

  // --- Step transitions ---

  const goToStep2 = () => {
    setErrorMsg("");
    if (!firstName.trim() || firstName.trim().length < 2) {
      setErrorMsg("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (!lastName.trim() || lastName.trim().length < 2) {
      setErrorMsg("El apellido debe tener al menos 2 caracteres.");
      return;
    }
    if (combinedPhone.length < 8) {
      setErrorMsg("Ingresá un número de teléfono válido.");
      return;
    }
    if (duplicates["phone"] === true) {
      setErrorMsg("El celular ya está registrado por otro usuario.");
      return;
    }
    setStep(2);
  };

  const goToStep3 = () => {
    setErrorMsg("");
    if (nombreNegocio.trim().length < 2) {
      setErrorMsg("El nombre del negocio debe tener al menos 2 caracteres.");
      return;
    }
    if (duplicates["nombre"] === true || duplicates["slug"] === true) {
      setErrorMsg("Corregí los campos marcados en rojo antes de continuar.");
      return;
    }
    setStep(3);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg("");

    const result = step3Schema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      setErrorMsg(result.error.issues[0]?.message || "Datos inválidos.");
      return;
    }

    const hasDuplicates =
      duplicates["nombre"] === true ||
      duplicates["slug"] === true ||
      duplicates["phone"] === true ||
      duplicates["whatsapp"] === true ||
      duplicates["email"] === true;

    if (hasDuplicates) {
      setErrorMsg("Corregí los campos marcados en rojo antes de continuar.");
      return;
    }

    setLoading(true);
    const response = await registerAction({
      email,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: combinedPhone,
      referralSource,
      nombreNegocio: nombreNegocio.trim(),
      slug,
      whatsapp: combinedWhatsapp || undefined,
    });

    if (response?.error) {
      setErrorMsg(response.error);
      setLoading(false);
      return;
    }
    if (response?.success) {
      setRegistered(true);
      setLoading(false);
    }
  };

  const isNombreRegistered = duplicates["nombre"] === true;
  const isSlugTaken = duplicates["slug"] === true;
  const isWhatsappTaken = duplicates["whatsapp"] === true;

  const emailSchemaCheck = z.string().email().safeParse(email).success;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const passwordReady = strength.allMet && passwordsMatch;
  const canProceedToStep3 = emailSchemaCheck && passwordReady && duplicates["email"] !== true;

  // Step 1 validations
  const step1Ready = firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    combinedPhone.length >= 8 &&
    duplicates["phone"] !== true;

  // Step 2 validations
  const step2Ready = nombreNegocio.trim().length >= 2 &&
    duplicates["nombre"] !== true &&
    duplicates["slug"] !== true;

  // --- Pantalla de confirmación (Step 4) ---
  if (registered) {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center space-y-6 py-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[var(--auth-primary)]/10 flex items-center justify-center">
              <Mail className="w-10 h-10 text-[var(--auth-primary)]" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--auth-primary)] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight text-[var(--auth-accent)] uppercase">
              Revisá tu{" "}
              <span className="font-light normal-case text-[var(--auth-accent-muted)]">
                correo
              </span>
            </h3>
            <p className="text-sm text-[var(--auth-text-muted)] max-w-sm leading-relaxed">
              Te enviamos un enlace de confirmación a{" "}
              <span className="font-semibold text-[var(--auth-text)]">{email}</span>.
            </p>
          </div>

          <div className="space-y-3 w-full max-w-sm text-left">
            {[
              "Hacé clic en el enlace que te enviamos para activar tu cuenta.",
              "apenas confirmes, te redirigiremos automáticamente al inicio de sesión.",
              "No encontrás el correo? Revisá la carpeta de Spam / Promociones.",
              "El enlace expira en 1 hora por seguridad.",
            ].map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-sm text-[var(--auth-text-muted)]"
              >
                <Sparkles size={14} className="shrink-0 mt-0.5 text-[var(--auth-primary)]" />
                <span>{tip}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--auth-text-muted)] animate-pulse">
            <FoodMini size={14} />
            Esperando confirmación...
          </div>

          <div className="pt-4">
            <a
              href="/login"
              className="auth-btn-primary inline-flex items-center gap-2"
            >
              <ArrowRight size={16} />
              Ir a iniciar sesión ahora
            </a>
          </div>
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
        {/* === PASO 1: TITULAR === */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="auth-label flex items-center gap-1.5">
                <User size={14} />
                Nombre del titular
              </label>
              <Input
                required
                type="text"
                disabled={loading}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej: Juan"
                className="auth-input"
              />
            </div>

            <div className="space-y-2">
              <label className="auth-label flex items-center gap-1.5">
                <Users size={14} />
                Apellido del titular
              </label>
              <Input
                required
                type="text"
                disabled={loading}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej: Pérez"
                className="auth-input"
              />
            </div>

            <div className="space-y-2">
              <label className="auth-label flex items-center gap-1.5">
                <Phone size={14} />
                Celular del titular
              </label>
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <div>
                  <Input
                    type="tel"
                    disabled={loading}
                    value={phoneCountry}
                    onChange={(e) => setPhoneCountry(e.target.value.replace(/\D/g, ""))}
                    placeholder="54"
                    className="auth-input text-center"
                  />
                  <p className="text-[9px] text-[var(--auth-text-muted)] mt-0.5 text-center">País</p>
                </div>
                <div className="relative">
                  <Input
                    type="tel"
                    disabled={loading}
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPhoneNumber(val);
                      const combined = `+${phoneCountry}${val}`;
                      if (combined.length >= 10) {
                        debouncedCheck("phone", combined);
                      } else {
                        setDuplicates((prev) => ({ ...prev, phone: null }));
                      }
                    }}
                    placeholder="11 12345678"
                    aria-invalid={duplicates["phone"] === true || undefined}
                    className={`auth-input ${
                      duplicates["phone"] === true
                        ? "border-red-400 focus-visible:ring-red-400"
                        : duplicates["phone"] === false && combinedPhone.length >= 10
                          ? "border-green-400 focus-visible:ring-green-400"
                          : ""
                    }`}
                  />
                  {checkingFields["phone"] && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2"><FoodMini size={14} /></span>
                  )}
                  {!checkingFields["phone"] && duplicates["phone"] === true && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                  {!checkingFields["phone"] && duplicates["phone"] === false && combinedPhone.length >= 10 && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              {duplicates["phone"] === true && (
                <p role="alert" className="text-[11px] text-red-500 font-medium mt-1">Este número ya está registrado.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="auth-label">
                ¿Cómo llegaste a nosotros? <span className="text-[10px] font-normal text-[var(--auth-text-muted)]">(opcional)</span>
              </label>
              <select
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                className="auth-input appearance-none cursor-pointer"
                disabled={loading}
              >
                <option value="">Seleccioná una opción</option>
                {REFERRAL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {errorMsg && (
              <div className="auth-error-box" role="alert" aria-live="polite">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={goToStep2}
              disabled={!step1Ready}
              className={`auth-btn-primary mt-2 w-full ${!step1Ready ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Continuar <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* === PASO 2: NEGOCIO === */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="auth-label">Nombre de tu negocio / emprendimiento</label>
              <div className="relative">
                <Input
                  required
                  type="text"
                  disabled={loading}
                  value={nombreNegocio}
                  onChange={(e) => handleNombreChange(e.target.value)}
                  placeholder="Ej: Burger Station"
                  aria-invalid={isNombreRegistered || undefined}
                  className={`auth-input pr-10 ${
                    isNombreRegistered
                      ? "border-red-400 focus-visible:ring-red-400"
                      : duplicates["nombre"] === false && nombreNegocio.length >= 2
                        ? "border-green-400 focus-visible:ring-green-400"
                        : ""
                  }`}
                />
                {checkingFields["nombre"] && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2"><FoodMini size={14} /></span>
                )}
                {!checkingFields["nombre"] && isNombreRegistered && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {!checkingFields["nombre"] && duplicates["nombre"] === false && nombreNegocio.length >= 2 && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {isNombreRegistered && (
                <div role="alert" className="mt-1 space-y-1">
                  <p className="text-[11px] text-red-500 font-medium">
                    Este nombre ya está registrado.
                  </p>
                  {suggestions["nombre"] && suggestions["nombre"].length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-[10px] text-[var(--auth-text-muted)]">Sugerencias:</span>
                      {suggestions["nombre"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleNombreChange(s)}
                          className="text-[11px] bg-[var(--auth-bg)] border border-[var(--auth-border)] px-2 py-0.5 rounded-md hover:border-[var(--auth-primary)] hover:text-[var(--auth-primary)] transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="auth-label flex items-center gap-1.5">
                <Hash size={14} />
                Slug de tu menú público
              </label>
              <div className="relative">
                <Input
                  readOnly
                  type="text"
                  disabled={loading}
                  value={slug}
                  placeholder="burger-station"
                  aria-invalid={isSlugTaken || undefined}
                  className={`auth-input font-mono text-sm bg-gray-50 ${
                    isSlugTaken ? "border-red-400" : duplicates["slug"] === false && slug.length >= 2 ? "border-green-400" : ""
                  }`}
                />
              </div>
              <p className="text-[10px] text-[var(--auth-text-muted)] pl-1">
                La URL de tu menú público será: tu-negocio.com/
                <span className="font-mono font-semibold">{slug || "slug"}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="auth-label flex items-center gap-1.5">
                <Phone size={14} />
                WhatsApp para recibir pedidos
              </label>
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <div>
                  <Input
                    type="tel"
                    disabled={loading}
                    value={whatsappCountry}
                    onChange={(e) => setWhatsappCountry(e.target.value.replace(/\D/g, ""))}
                    placeholder="54"
                    className="auth-input text-center"
                  />
                  <p className="text-[9px] text-[var(--auth-text-muted)] mt-0.5 text-center">País</p>
                </div>
                <div>
                  <Input
                    type="tel"
                    disabled={loading}
                    value={whatsappNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setWhatsappNumber(val);
                      const combined = `+${whatsappCountry}${val}`;
                      if (combined.length >= 10) {
                        debouncedCheck("whatsapp", combined);
                      } else {
                        setDuplicates((prev) => ({ ...prev, whatsapp: null }));
                      }
                    }}
                    placeholder="11 12345678"
                    className="auth-input text-center"
                  />
                  <p className="text-[9px] text-[var(--auth-text-muted)] mt-0.5 text-center">Número (con código de área)</p>
                </div>
              </div>
              {checkingFields["whatsapp"] && (
                <span className="flex items-center gap-1 text-[11px] text-[var(--auth-text-muted)]">
                  <FoodMini size={12} /> Verificando número...
                </span>
              )}
              {!checkingFields["whatsapp"] && isWhatsappTaken && (
                <p role="alert" className="text-[11px] text-red-500 font-medium mt-1">Este número ya está registrado.</p>
              )}
              {!checkingFields["whatsapp"] && duplicates["whatsapp"] === false && combinedWhatsapp.length >= 10 && (
                <p className="text-[11px] text-green-600 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Número disponible
                </p>
              )}
              <p className="text-[10px] text-[var(--auth-text-muted)] pl-1">
                Opcional — se usará para recibir pedidos en tu menú QR.
              </p>
            </div>

            {errorMsg && (
              <div className="auth-error-box" role="alert" aria-live="polite">
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
                type="button"
                onClick={goToStep3}
                disabled={!step2Ready}
                className={`auth-btn-primary flex-1 ${!step2Ready ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Continuar <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* === PASO 3: ACCESO === */}
        {step === 3 && (
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
                    const val = e.target.value;
                    setEmail(val);
                    if (val.length >= 5) debouncedCheck("email", val);
                    else setDuplicates((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder="socio@tu-negocio.com"
                  aria-invalid={duplicates["email"] === true || undefined}
                  className={`auth-input pr-10 ${
                    emailSchemaCheck && email.length > 5 && duplicates["email"] === false
                      ? "border-green-400 focus-visible:ring-green-400"
                      : ""
                  }`}
                />
                {checkingFields["email"] && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2"><FoodMini size={14} /></span>
                )}
                {!checkingFields["email"] && duplicates["email"] === true && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
                {!checkingFields["email"] && duplicates["email"] === false && emailSchemaCheck && email.length > 5 && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {duplicates["email"] === true && (
                  <p role="alert" className="text-[11px] text-red-500 font-medium mt-1">Este correo ya está registrado.</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="auth-label">Contraseña Administrador</label>
                {password.length > 0 && (
                  <span className="text-[10px] font-mono font-medium text-[var(--auth-text-muted)]">
                    Fortaleza: {strength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  required
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ej: MiLocal2024!"
                  className="auth-input mb-1.5 !pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--auth-text-muted)] hover:text-[var(--auth-accent)] hover:bg-black/5 transition-colors z-10"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="h-1.5 w-full bg-[#f3efe6] rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} ${strength.width} transition-all duration-500 ease-out`} />
              </div>
              {password.length > 0 && (
                <div className="space-y-1 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  {[
                    { key: "length" as const, label: "Mínimo 8 caracteres" },
                    { key: "uppercase" as const, label: "Una mayúscula (A-Z)" },
                    { key: "number" as const, label: "Un número (0-9)" },
                    { key: "symbol" as const, label: "Un símbolo especial (!@#$% etc.)" },
                  ].map((req) => {
                    const ok = strength.checks[req.key as keyof typeof strength.checks];
                    return (
                      <div key={req.key} className={`flex items-center gap-2 text-[11px] font-medium transition-all duration-200 ${ok ? "text-green-600 opacity-100" : "text-[var(--auth-text-muted)] opacity-70"}`}>
                        {ok ? <CheckCircle2 size={12} className="shrink-0" /> : <span className="w-[12px] h-[12px] rounded-full border border-current shrink-0 opacity-40" />}
                        <span>{req.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="auth-label">Confirmar contraseña</label>
              <div className="relative">
                <Input
                  required
                  autoComplete="new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  disabled={loading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetí la contraseña"
                  aria-invalid={confirmPassword && password !== confirmPassword ? true : undefined}
                  className={`auth-input !pr-10 ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-400 focus-visible:ring-red-400"
                      : confirmPassword && password === confirmPassword
                        ? "border-green-400 focus-visible:ring-green-400"
                        : ""
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--auth-text-muted)] hover:text-[var(--auth-accent)] hover:bg-black/5 transition-colors z-10"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p role="alert" className="text-[11px] text-red-500 font-medium mt-1">Las contraseñas no coinciden.</p>
              )}
            </div>

            {errorMsg && (
              <div className="auth-error-box" role="alert" aria-live="polite">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className="px-4 py-2 border border-[var(--auth-border)] rounded-lg text-sm text-[var(--auth-text-muted)] hover:bg-[#f7f4ec] transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                disabled={loading || !canProceedToStep3}
                type="submit"
                className={`auth-btn-primary flex-1 ${!canProceedToStep3 && !loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? (
                  <><FoodMini size={14} /> Creando cuenta...</>
                ) : (
                  <><span>Crear mi cuenta</span><CheckCircle2 size={16} /></>
                )}
              </button>
            </div>

            {!canProceedToStep3 && email.length > 0 && (
              <div className="flex flex-col gap-1.5 text-[11px] text-[var(--auth-text-muted)] font-medium pt-1">
                {!emailSchemaCheck && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Correo electrónico válido</span>}
                {!strength.allMet && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Todos los requisitos de contraseña</span>}
                {!passwordsMatch && strength.allMet && <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Confirmar contraseña</span>}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
