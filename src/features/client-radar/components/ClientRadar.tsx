"use client";

import { useState } from "react";
import { ClientTable } from "./ClientTable";
import { Search, Users } from "lucide-react";

export interface ClienteResumen {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  totalGasto: number;
  pedidos: number;
  notas: string | null;
}

interface ClientRadarProps {
  initialClientes: ClienteResumen[];
}

export function ClientRadar({ initialClientes }: ClientRadarProps) {
  const [busqueda, setBusqueda] = useState("");

  const clientesFiltrados = initialClientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.telefono && c.telefono.includes(busqueda)),
  );

  return (
    <div className="space-y-6 font-sans text-black">
      {/* BARRA DE BÚSQUEDA NEO-BRUTALISTA */}
      <div className="bg-white border-4 border-black p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-black stroke-[2.5]" /> RADAR DE
            COMUNIDAD
          </h2>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
            Ranking de fidelidad, volumen de transacciones y bases analíticas.
          </p>
        </div>

        <div className="relative group w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black shrink-0" />
          <input
            type="text"
            placeholder="BUSCAR COMPRADOR POR NOMBRE O WHATSAPP..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white border-2 border-black p-3 pl-12 font-bold text-xs uppercase tracking-wider outline-none focus:bg-[#A3FF00]/5 text-black"
          />
        </div>
      </div>

      {/* CONTENEDOR DE TABLA DE RANGOS */}
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="p-4 bg-black text-white font-mono text-xs uppercase tracking-widest flex justify-between items-center">
          <span>📊 PANEL DE INSIGHTS B2B</span>
          <span className="text-[10px] text-[#A3FF00] font-black">
            {clientesFiltrados.length} CONTACTOS
          </span>
        </div>
        <ClientTable clientes={clientesFiltrados} />
      </div>
    </div>
  );
}
