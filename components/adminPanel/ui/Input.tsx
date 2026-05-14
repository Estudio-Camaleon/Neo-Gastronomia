import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-black uppercase tracking-tight text-black dark:text-white">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-[var(--admin-surface)] border-2 border-black p-3
            font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            placeholder:text-gray-500 outline-none transition-all
            focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none
            disabled:opacity-50
            ${error ? "border-red-500 shadow-red-500" : "focus:border-[var(--admin-accent)]"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-xs font-bold text-red-600 uppercase tracking-tighter">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
