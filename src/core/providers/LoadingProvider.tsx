"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

interface LoadingContextType {
  isLoading: boolean;
  show: (message?: string) => void;
  hide: () => void;
  variant: "dark" | "light";
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
  variant?: "dark" | "light";
}

export function LoadingProvider({ children, variant = "dark" }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const show = useCallback((msg = "Cargando...") => {
    setMessage(msg);
    setIsLoading(true);
  }, []);

  const hide = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, show, hide, variant }}>
      {children}
      <LoadingOverlay isActive={isLoading} message={message} variant={variant} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading debe usarse dentro de LoadingProvider");
  }
  return context;
}
