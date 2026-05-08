// components/adminPanel/clientes/ui/ClientTable.tsx
"use client";

import { User, MessageCircle, MoreVertical } from "lucide-react";

interface Cliente {
  id: string;
  nombre: string;
  whatsapp: string;
  total_pedidos: number;
  ultima_compra: string;
}

export function ClientTable({ clientes }: { clientes: Cliente[] }) {
  return (
    <div className="w-full space-y-4">
      {/* VISTA DESKTOP: Tabla Técnica */}
      <div className="hidden md:block overflow-hidden border-4 border-black rounded-neo bg-surface dark:bg-surface-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-4 border-black bg-primary/10 dark:bg-primary/20">
              <th className="p-4 font-black uppercase italic text-xs tracking-widest">
                Cliente
              </th>
              <th className="p-4 font-black uppercase italic text-xs tracking-widest">
                WhatsApp
              </th>
              <th className="p-4 font-black uppercase italic text-xs tracking-widest text-center">
                Pedidos
              </th>
              <th className="p-4 font-black uppercase italic text-xs tracking-widest text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black/10 dark:divide-white/10">
            {clientes.map((cliente) => (
              <tr
                key={cliente.id}
                className="hover:bg-primary/5 transition-colors group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full border-2 border-primary shadow-[2px_2px_0px_0px_rgba(28,122,66,1)]">
                      <User size={18} />
                    </div>
                    <span className="font-bold text-sm">{cliente.nombre}</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-sm text-primary dark:text-primary-light font-bold">
                  {cliente.whatsapp}
                </td>
                <td className="p-4 text-center">
                  <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-black">
                    {cliente.total_pedidos}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 hover:bg-black hover:text-white rounded-lg transition-all border-2 border-transparent hover:border-black">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VISTA MÓVIL: Cards Neo-Brutales */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {clientes.map((cliente) => (
          <div
            key={cliente.id}
            className="p-5 border-4 border-black rounded-neo bg-surface dark:bg-surface-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-full border-2 border-black">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-black uppercase text-xs leading-none">
                    Cliente
                  </p>
                  <p className="font-bold text-lg leading-tight">
                    {cliente.nombre}
                  </p>
                </div>
              </div>
              <span className="bg-black text-white px-3 py-1 rounded-lg text-xs font-black">
                {cliente.total_pedidos} PEDS
              </span>
            </div>

            <a
              href={`https://wa.me/${cliente.whatsapp}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-black border-2 border-black rounded-xl font-black uppercase italic text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <MessageCircle size={16} />
              Contactar WhatsApp
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
