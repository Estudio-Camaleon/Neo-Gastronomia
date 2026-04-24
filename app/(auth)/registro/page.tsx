import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50 antialiased">
      {/* Contenedor principal con max-w limitado para evitar el estiramiento */}
      <div className="w-full max-w-md bg-white p-10 rounded-3xl border border-gray-100 shadow-sm transition-all hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100">
        
        {/* Encabezado del Formulario */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-black text-blue-600 tracking-tighter">
            NEO
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 tracking-tight">
            Crea tu cuenta gratis
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Empieza a gestionar tu menú digital hoy mismo
          </p>
        </div>

        {/* El formulario ya corregido y tipado que teníamos */}
        <RegisterForm />
        
      </div>
    </main>
  );
}