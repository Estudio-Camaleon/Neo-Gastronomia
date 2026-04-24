import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight">
          Gestiona tu menú <br />
          <span className="text-blue-600">con NEO</span>
        </h1>

        <p className="text-xl text-gray-600">
          La forma más rápida y moderna de mostrar tus productos al mundo. Crea
          tu catálogo digital, gestiona precios y recibe pedidos en minutos.
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/registro"
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Empezar ahora
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
