"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Importación necesaria
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const result = registerSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError =
        Object.values(fieldErrors)[0]?.[0] || "Error de validación";
      setError(firstError);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
      setLoading(false);
    }
    
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-3 bg-gray-200 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-all"
      >
        {loading ? "Registrando..." : "Crear cuenta"}
      </button>

      {/* Navegación al Login */}
      <p className="text-center text-sm text-gray-500 mt-4">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-blue-600 font-bold hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
