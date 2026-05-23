"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("neo-theme") || "light") as Theme;
    setThemeState(savedTheme);
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("neo-theme", newTheme);
  };

  // Protección de Hidratación (Evita el parpadeo claro en recargas)
  if (!mounted) {
    return (
      <div className="admin-theme-wrapper min-h-screen bg-[#f4f4f4] text-[#0f172a] antialiased font-sans">
        <div className="opacity-0">{children}</div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div
        className={`admin-theme-wrapper min-h-screen transition-colors duration-300 ${theme}`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
