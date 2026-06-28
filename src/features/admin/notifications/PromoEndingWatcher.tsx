"use client";

import { useEffect, useRef } from "react";
import { checkPromosExpiringAction } from "@/features/admin/promos/actions";

const INTERVAL_MS = 5 * 60 * 1000; // cada 5 minutos

export function PromoEndingWatcher() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Ejecutar al montar
    checkPromosExpiringAction().catch(() => {});

    // Y repetir cada 5 min
    intervalRef.current = setInterval(() => {
      checkPromosExpiringAction().catch(() => {});
    }, INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return null; // Componente invisible
}
