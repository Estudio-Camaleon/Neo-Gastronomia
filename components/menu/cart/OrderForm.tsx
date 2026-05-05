"use client";

import { User, MapPin, Phone } from "lucide-react";

interface FormDataStructure {
  nombre: string;
  whatsapp: string;
  delivery: boolean;
  direccion: string;
}

interface OrderFormProps {
  data: FormDataStructure;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function OrderForm({ data, onChange }: OrderFormProps) {
  return (
    <div className="space-y-5 my-6 bg-gray-50/80 dark:bg-white/5 p-5 border-2 border-dashed border-border dark:border-border-dark rounded-neo font-mono transition-colors">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-4 text-center underline italic text-text-muted select-none">
        Datos de Despacho
      </p>

      {/* Input de Nombre */}
      <div className="relative">
        <User
          size={12}
          className="absolute left-0 top-1/2 -translate-y-1/2 opacity-40 text-text-primary dark:text-text-inverse"
        />
        <input
          type="text"
          name="nombre"
          required
          placeholder="TU NOMBRE / APODO"
          value={data.nombre}
          onChange={onChange}
          className="w-full bg-transparent border-b border-border dark:border-border-dark pl-5 py-1 text-[11px] outline-none focus:border-primary uppercase font-black italic text-text-primary dark:text-text-inverse placeholder:font-normal"
        />
      </div>

      {/* Switch / Checkbox Estilo Neo-Brutalista para Delivery */}
      <div className="flex items-center gap-3 py-1 select-none">
        <input
          type="checkbox"
          id="delivery-checkbox"
          name="delivery"
          checked={data.delivery}
          onChange={onChange}
          className="accent-primary w-4 h-4 cursor-pointer rounded-sm border-2 border-border"
        />
        <label
          htmlFor="delivery-checkbox"
          className="text-[10px] font-black uppercase tracking-tight cursor-pointer text-text-primary dark:text-text-inverse"
        >
          ¿Solicitar envío a domicilio?
        </label>
      </div>

      {/* Input de Dirección Condicional con animación integrada */}
      {data.delivery && (
        <div className="relative animate-in fade-in slide-in-from-top-2 duration-200">
          <MapPin
            size={12}
            className="absolute left-0 top-1/2 -translate-y-1/2 opacity-40 text-text-primary dark:text-text-inverse"
          />
          <input
            type="text"
            name="direccion"
            required={data.delivery}
            placeholder="DIRECCIÓN DE ENTREGA EXACTA"
            value={data.direccion}
            onChange={onChange}
            className="w-full bg-transparent border-b border-border dark:border-border-dark pl-5 py-1 text-[11px] outline-none focus:border-primary uppercase font-black italic text-text-primary dark:text-text-inverse placeholder:font-normal"
          />
        </div>
      )}

      {/* Input de WhatsApp */}
      <div className="relative">
        <Phone
          size={12}
          className="absolute left-0 top-1/2 -translate-y-1/2 opacity-40 text-text-primary dark:text-text-inverse"
        />
        <input
          type="tel"
          name="whatsapp"
          required
          placeholder="NÚMERO DE WHATSAPP"
          value={data.whatsapp}
          onChange={onChange}
          className="w-full bg-transparent border-b border-border dark:border-border-dark pl-5 py-1 text-[11px] outline-none focus:border-primary uppercase font-black italic text-text-primary dark:text-text-inverse placeholder:font-normal"
        />
      </div>
    </div>
  );
}
