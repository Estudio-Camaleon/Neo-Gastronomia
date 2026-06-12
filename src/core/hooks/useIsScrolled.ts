// src/core/hooks/useIsScrolled.ts
"use client";

import { useState, useEffect } from "react";

export function useIsScrolled() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Buscamos el píxel invisible que colocamos en la cima de la web
    const pixel = document.getElementById("top-pixel");
    if (!pixel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Si el píxel ya NO está intersectando la pantalla (el usuario bajó), es true
        setIsScrolled(!entry.isIntersecting);
      },
      {
        rootMargin: "0px",
        threshold: 0,
      },
    );

    observer.observe(pixel);

    return () => observer.disconnect();
  }, []);

  return isScrolled;
}
