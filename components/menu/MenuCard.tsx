import Image from "next/image";

interface MenuCardProps {
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenUrl?: string;
}

export function MenuCard({
  nombre,
  descripcion,
  precio,
  imagenUrl,
}: MenuCardProps) {
  return (
    <div className="bg-surface dark:bg-surface-dark p-4 rounded-2xl border border-border dark:border-border-dark shadow-sm flex gap-4 items-center hover:border-primary transition-all">
      {/* Imagen optimizada con next/image */}
      {imagenUrl ? (
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
          <Image src={imagenUrl} alt={nombre} fill className="object-cover" />
        </div>
      ) : (
        <div className="w-20 h-20 rounded-xl bg-bg-main dark:bg-bg-darker flex items-center justify-center flex-shrink-0">
          <span className="text-text-muted text-xs">Sin img</span>
        </div>
      )}

      {/* Detalles del producto */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-text-primary dark:text-text-inverse truncate">
          {nombre}
        </h3>
        {descripcion && (
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {descripcion}
          </p>
        )}
        <p className="font-bold text-primary mt-2">${precio.toFixed(2)}</p>
      </div>

      {/* Botón de acción */}
      <button
        className="bg-bg-main dark:bg-bg-darker hover:bg-primary text-text-primary dark:text-text-inverse p-3 rounded-full transition-all border border-border dark:border-border-dark"
        aria-label={`Añadir ${nombre} al pedido`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
}
