import { Search, ShoppingBag } from "lucide-react";

export function PublicNavbar({
  logo,
  nombre,
}: {
  logo?: string;
  nombre: string;
}) {
  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg-public)]/80 backdrop-blur-xl border-b border-black/5 px-6 py-4 flex justify-between items-center transition-all">
      {logo ? (
        <img src={logo} alt={nombre} className="h-9 w-auto object-contain" />
      ) : (
        <span className="font-black text-2xl tracking-tighter text-[var(--brand-color)]">
          {nombre.split(" ")[0]}
        </span>
      )}

      <div className="flex items-center gap-4">
        <button className="p-2.5 bg-white rounded-full shadow-sm border border-black/5 text-[var(--text-public)] active:scale-90 transition-transform">
          <Search size={20} />
        </button>
      </div>
    </nav>
  );
}
