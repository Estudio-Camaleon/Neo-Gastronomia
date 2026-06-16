"use client";

import { useEffect } from "react";

export function useCartVisibility(setCartOpen: (open: boolean) => void) {
  useEffect(() => {
    let wasDesktop = window.innerWidth >= 1024;

    const syncCartVisibility = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop !== wasDesktop) {
        wasDesktop = isDesktop;
        setCartOpen(isDesktop);
      }
    };

    syncCartVisibility();
    window.addEventListener("resize", syncCartVisibility);
    return () => window.removeEventListener("resize", syncCartVisibility);
  }, [setCartOpen]);
}
