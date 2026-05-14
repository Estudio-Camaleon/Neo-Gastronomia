"use client";

import { useState } from "react";
import { ClientTable } from "./ui/ClientTable";
import { Card, Input } from "../ui"; // Importamos del core

interface ClienteResumen {
  nombre: string;
  totalGasto: number;
  pedidos: number;
}

interface ClientRadarProps {
  initialClientes: ClienteResumen[];
}

export function ClientRadar({ initialClientes }: ClientRadarProps) {
  const [busqueda, setBusqueda] = useState("");

  const clientesFiltrados = initialClientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      {/* Usamos el nuevo Input del Core */}
      <div className="max-w-md">
        <Input
          label="Filtrar Comunidad"
          placeholder="Ej: Juan Perez..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          // Aquí podrías agregar un ícono si extendiste el Input,
          // sino, el estilo Neo-Brutalista ya lo hace destacar.
        />
      </div>

      <Card title="Ranking de Fidelidad">
        <ClientTable clientes={clientesFiltrados} />
      </Card>
    </div>
  );
}
