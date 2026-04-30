"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// 1. Creamos el contexto para NEO
const ThemeContext = createContext({
  theme: "light",
  setTheme: (theme: string) => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState("light");

  // Al montar, leemos la preferencia guardada
  useEffect(() => {
    const savedTheme = localStorage.getItem("neo-theme") || "light";
    setThemeState(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem("neo-theme", newTheme);

    // Aplicamos o quitamos la clase .dark al HTML
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado para usar en el Sidebar
export const useTheme = () => useContext(ThemeContext);
