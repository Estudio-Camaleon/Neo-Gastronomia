"use client";

import { useEffect, useRef } from "react";
import { checkStockAlertAction } from "@/features/admin/catalog/actions";

const INTERVAL_MS = 5 * 60 * 1000; // cada 5 minutos

export function StockAlertWatcher() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Ejecutar al montar
    checkStockAlertAction().catch(() => {});

    // Y repetir cada 5 min
    intervalRef.current = setInterval(() => {
      checkStockAlertAction().catch(() => {});
    }, INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return null; // Componente invisible
}
