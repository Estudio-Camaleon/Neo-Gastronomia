"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationLink {
  name: string;
  href: string;
  icon: string;
}

export function SidebarNavigation() {
  const pathname = usePathname();

  const links: NavigationLink[] = [
    { name: "Pedidos", href: "/pedidos", icon: "📦" },
    { name: "Productos", href: "/productos", icon: "🏷️" },
    { name: "Clientes", href: "/clientes", icon: "👥" },
    { name: "Configuración", href: "/configuracion", icon: "⚙️" },
  ];

  return (
    <nav className="flex-1 space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all ${
              isActive
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-text-secondary hover:bg-bg-main dark:hover:bg-bg-darker hover:text-text-primary dark:hover:text-text-inverse"
            }`}
          >
            <span className={isActive ? "opacity-100" : "opacity-50"}>
              {link.icon}
            </span>
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
