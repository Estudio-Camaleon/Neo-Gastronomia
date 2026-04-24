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
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 items-center hover:border-blue-200 transition-all">
      {/* Imagen optimizada con next/image */}
      {imagenUrl ? (
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
          <Image src={imagenUrl} alt={nombre} fill className="object-cover" />
        </div>
      ) : (
        <div className="w-20 h-20 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
          <span className="text-gray-300 text-xs">Sin img</span>
        </div>
      )}

      {/* Detalles del producto */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 truncate">{nombre}</h3>
        {descripcion && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {descripcion}
          </p>
        )}
        <p className="font-bold text-blue-600 mt-2">${precio.toFixed(2)}</p>
      </div>

      {/* Botón de acción */}
      <button
        className="bg-gray-50 hover:bg-blue-600 text-gray-900 hover:text-white p-3 rounded-full transition-all"
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
