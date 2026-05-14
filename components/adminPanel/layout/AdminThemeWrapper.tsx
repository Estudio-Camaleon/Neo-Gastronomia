"use client";
import { useTheme } from "@/components/providers/ThemeProvider";

export function AdminThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className={theme}>
      {/* Esta es la clave: el fondo y el texto cambian aquí, 
          pero solo afectan a lo que está dentro de este layout.
      */}
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {children}
      </div>
    </div>
  );
}
