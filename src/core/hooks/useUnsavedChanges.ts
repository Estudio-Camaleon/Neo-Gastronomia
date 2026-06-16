"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook que detecta si el usuario tiene cambios sin guardar.
 * Ofrece un modal de confirmación + beforeunload nativo.
 *
 * @param isDirty - señal externa de que hay cambios
 * @param onReset - función que resetea el formulario a su estado inicial
 */
export function useUnsavedChanges(
  isDirty: boolean,
  onReset?: () => void,
) {
  const [showModal, setShowModal] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Bloquea navegación interna (clicks en links, router.back, etc.)
  const blockNavigation = useCallback(
    (callback: () => void) => {
      if (!isDirty) {
        callback();
        return;
      }
      pendingActionRef.current = callback;
      setShowModal(true);
    },
    [isDirty],
  );

  // Bloquea cierre de ventana / recarga (beforeunload)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const confirmLeave = useCallback(() => {
    setShowModal(false);
    if (pendingActionRef.current) {
      pendingActionRef.current();
      pendingActionRef.current = null;
    }
  }, []);

  const cancelLeave = useCallback(() => {
    setShowModal(false);
    pendingActionRef.current = null;
  }, []);

  const discardAndReset = useCallback(() => {
    setShowModal(false);
    onReset?.();
    pendingActionRef.current = null;
  }, [onReset]);

  return {
    showModal,
    blockNavigation,
    confirmLeave,
    cancelLeave,
    discardAndReset,
  };
}
