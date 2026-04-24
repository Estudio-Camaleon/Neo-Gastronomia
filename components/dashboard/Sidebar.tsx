"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { name: "Resumen", href: "/admin" },
    { name: "Productos", href: "/productos" },
    { name: "Configuración", href: "/configuracion" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh(); // Refresca para que el middleware re-evalúe la sesión
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col h-screen sticky top-0">
      <div className="mb-10">
        <h2 className="text-xl font-bold text-blue-600 tracking-tight">
          NEO Admin
        </h2>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              prefetch={true}
              className={`block p-3 rounded-xl font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="w-full text-left p-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
