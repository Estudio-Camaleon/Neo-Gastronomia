"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

type LoadingContextValue = {
  isLoading: boolean;
  message: string;
  show: (message?: string) => void;
  hide: () => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("Cargando...");

  const value = useMemo<LoadingContextValue>(
    () => ({
      isLoading,
      message,
      show: (nextMessage = "Cargando...") => {
        setMessage(nextMessage);
        setIsLoading(true);
      },
      hide: () => {
        setIsLoading(false);
      },
    }),
    [isLoading, message],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay isActive={isLoading} message={message} />
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
