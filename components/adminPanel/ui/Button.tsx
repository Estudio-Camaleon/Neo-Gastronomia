import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
  icon?: LucideIcon;
}

export const Button = ({
  children,
  variant = "primary",
  isLoading,
  icon: Icon,
  className = "",
  ...props
}: ButtonProps) => {
  const variants = {
    primary:
      "bg-[var(--admin-accent)] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    secondary:
      "bg-white text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    danger: "bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    ghost: "bg-transparent border-2 border-transparent hover:border-black",
  };

  return (
    <button
      className={`
        group relative flex items-center justify-center gap-2 px-4 py-2 
        font-bold uppercase tracking-tight transition-all
        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]}
        ${className}
      `}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </>
      )}
    </button>
  );
};
