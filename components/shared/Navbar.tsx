import Link from "next/link";

export function Navbar() {
  return (
    <nav className="w-full py-6 px-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <Link
        href="/login" // Next.js encontrará automáticamente tu app/(auth)/login/page.tsx
        className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
      >
        Iniciar sesión
      </Link>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/registro"
          className="text-sm font-bold bg-gray-900 text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition-all"
        >
          Registrarse
        </Link>
      </div>
    </nav>
  );
}
