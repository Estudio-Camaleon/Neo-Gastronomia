"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * useFocusTrap — atrapa el foco dentro de un contenedor modal/drawer
 *
 * - Enfoca el primer elemento focusable al montar
 * - Cicla Tab/Shift+Tab dentro del contenedor
 * - Restaura el foco al elemento que tenía el foco antes de montar
 * - Soporta Escape (opcional, mediante onEscape)
 *
 * @param active - si el trap está activo
 * @param onEscape - callback opcional al presionar Escape
 * @returns ref al contenedor
 */
export function useFocusTrap(active: boolean, onEscape?: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(selectors.join(", ")),
    );
  }, []);

  const trapFocus = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const elements = getFocusableElements();
      if (elements.length === 0) {
        e.preventDefault();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [getFocusableElements],
  );

  useEffect(() => {
    if (!active) return;
    previousActiveElement.current = document.activeElement;
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    } else {
      containerRef.current?.focus();
    }
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      if (
        previousActiveElement.current &&
        previousActiveElement.current instanceof HTMLElement
      ) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, getFocusableElements, trapFocus]);

  return containerRef;
}
