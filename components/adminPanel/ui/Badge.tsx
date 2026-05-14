interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
}

export const Badge = ({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) => {
  const variants = {
    success: "bg-[#A3FF00] text-black", // Neo Lime
    warning: "bg-yellow-400 text-black",
    danger: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    neutral: "bg-white text-black border-2 border-black",
  };

  return (
    <span
      className={`
      inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest
      border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
      ${variant !== "neutral" ? "border-[1px]" : ""}
      ${variants[variant]}
      ${className}
    `}
    >
      {children}
    </span>
  );
};
