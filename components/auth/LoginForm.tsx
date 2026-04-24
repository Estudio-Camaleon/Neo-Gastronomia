"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validación de Zod
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const errorMessage =
        result.error.issues[0]?.message || "Error en los datos ingresados";
      setError(errorMessage);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Éxito: refrescamos el router para actualizar la sesión
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full space-y-4">
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
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all"
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
        {loading ? "Accediendo..." : "Iniciar Sesión"}
      </button>
      <p className="text-center text-sm text-gray-500 mt-4">
  ¿No tienes cuenta?{' '}
  <Link href="/registro" className="text-blue-600 font-bold hover:underline">
    Regístrate aquí
  </Link>
</p>
    </form>
    
  );
}
