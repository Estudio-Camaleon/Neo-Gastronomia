"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Esto redirige al usuario al panel de administración tras confirmar su correo
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      setIsSent(true);
    }
    setLoading(false);
  };

  // Estado de éxito: mensaje personalizado
  if (isSent) {
    return (
      <div className="bg-blue-50 p-8 rounded-2xl text-center border border-blue-100 animate-in fade-in duration-500">
        <h2 className="text-2xl font-bold text-blue-900 mb-3">
          ¡Casi listo! 🚀
        </h2>
        <p className="text-blue-700 leading-relaxed">
          Hemos enviado un enlace de confirmación a <strong>{email}</strong>.
          <br />
          <br />
          Por favor, revisa tu bandeja de entrada (y tu carpeta de spam) para
          activar tu cuenta y comenzar a administrar tu negocio.
        </p>
      </div>
    );
  }

  // Formulario de registro
  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="tu@negocio.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="••••••••"
        />
      </div>

      <button
        disabled={loading}
        type="submit"
        className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 mt-2"
      >
        {loading ? "Creando cuenta..." : "Crear mi cuenta"}
      </button>
    </form>
  );
}
