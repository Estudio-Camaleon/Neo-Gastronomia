import * as React from "react";
import { cn } from "@/core/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Estructura Base
          "flex h-12 w-full bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-bold transition-all placeholder:text-gray-400",
          // Estilo Neo-Brutalista Puro
          "border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
          // Control del Foco Mecánico Sincronizado (Desplazamiento 4px = Sombra 0px)
          "focus-visible:outline-none focus-visible:translate-x-[4px] focus-visible:translate-y-[4px] focus-visible:shadow-none",
          // Estados Deshabilitados
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
