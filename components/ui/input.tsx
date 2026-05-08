import * as React from "react";
import { cn } from "@/lib/utils";

// Cambiamos interface por type para evitar el error de "empty interface"
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Estructura Base
          "flex h-12 w-full bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-bold transition-all",
          // Estilo Neo-Brutalista
          "border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
          // Estados (Focus, Hover, Disabled)
          "placeholder:text-gray-400 focus-visible:outline-none focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-none focus-visible:border-custom",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100",
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
