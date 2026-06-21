"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useUnsavedChanges(
  isDirty: boolean,
  onReset?: () => void,
) {
  const [showModal, setShowModal] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

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
    pendingActionRef.current?.();
    pendingActionRef.current = null;
  }, []);

  const cancelLeave = useCallback(() => {
    setShowModal(false);
    pendingActionRef.current = null;
  }, []);

  const discardAndReset = useCallback(() => {
    setShowModal(false);
    onReset?.();
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }, [onReset]);

  return {
    showModal,
    blockNavigation,
    confirmLeave,
    cancelLeave,
    discardAndReset,
  };
}
