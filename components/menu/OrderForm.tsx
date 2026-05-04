"use client";
import { User, MapPin, Phone } from "lucide-react";

interface OrderFormProps {
  data: { nombre: string; direccion: string; whatsapp: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function OrderForm({ data, onChange }: OrderFormProps) {
  return (
    <div className="space-y-4 my-6 bg-gray-50/80 p-5 border border-dashed border-black/20 rounded-sm">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-center underline italic">
        Datos de Despacho
      </p>

      <div className="relative">
        <User
          size={10}
          className="absolute left-0 top-1/2 -translate-y-1/2 opacity-40"
        />
        <input
          name="nombre"
          placeholder="TU NOMBRE / APODO"
          value={data.nombre}
          onChange={onChange}
          className="w-full bg-transparent border-b border-black/10 pl-5 py-1 text-[10px] outline-none focus:border-black uppercase font-black italic"
        />
      </div>

      <div className="relative">
        <MapPin
          size={10}
          className="absolute left-0 top-1/2 -translate-y-1/2 opacity-40"
        />
        <input
          name="direccion"
          placeholder="DIRECCIÓN DE ENTREGA"
          value={data.direccion}
          onChange={onChange}
          className="w-full bg-transparent border-b border-black/10 pl-5 py-1 text-[10px] outline-none focus:border-black uppercase font-black italic"
        />
      </div>

      <div className="relative">
        <Phone
          size={10}
          className="absolute left-0 top-1/2 -translate-y-1/2 opacity-40"
        />
        <input
          name="whatsapp"
          placeholder="WHATSAPP (OPCIONAL)"
          value={data.whatsapp}
          onChange={onChange}
          className="w-full bg-transparent border-b border-black/10 pl-5 py-1 text-[10px] outline-none focus:border-black uppercase font-black italic"
        />
      </div>
    </div>
  );
}
