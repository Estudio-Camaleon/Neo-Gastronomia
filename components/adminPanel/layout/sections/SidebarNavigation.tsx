"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Settings,
} from "lucide-react";

const LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pedidos", href: "/pedidos", icon: ClipboardList },
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Ajustes", href: "/configuracion", icon: Settings },
];

export function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <div className="space-y-2">
      {LINKS.map((link) => {
        const isActive = pathname.includes(link.href);
        const Icon = link.icon;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`
              flex items-center gap-4 px-4 py-3 border-2 transition-all duration-200 group
              ${
                isActive
                  ? "bg-[var(--admin-accent)] border-[var(--admin-border)] text-[var(--admin-bg)] shadow-[4px_4px_0px_0px_var(--admin-border)]"
                  : "bg-transparent border-transparent text-[var(--admin-text-muted)] hover:border-[var(--admin-border)]/20 hover:text-[var(--admin-text)]"
              }
            `}
          >
            <Icon
              size={18}
              className={`${isActive ? "text-[var(--admin-bg)]" : "text-[var(--admin-accent)] opacity-60 group-hover:opacity-100"}`}
            />
            <span className="text-xs font-black uppercase tracking-widest italic">
              {link.name}
            </span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 bg-[var(--admin-bg)] rounded-full animate-pulse" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
