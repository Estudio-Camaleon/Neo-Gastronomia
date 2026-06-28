"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

type Position = "bottom-right" | "bottom-center" | "top-right" | "top-center";

/**
 * Toaster responsive que adapta posición y offset según el viewport.
 *
 * - ≥1440px (desktop) → bottom-right, offset 80px
 * - <1440px (móvil)   → bottom-center, offset 120px
 *
 * Así evita solaparse con el botón flotante del carrito (menú público)
 * y con la BottomTabBar (admin) en dispositivos móviles.
 */
export function ResponsiveToaster() {
  const [{ position, offset }, setConfig] = useState<{
    position: Position;
    offset: string;
  }>({ position: "bottom-right", offset: "80px" });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1439px)");

    function update() {
      if (mq.matches) {
        setConfig({ position: "bottom-center", offset: "120px" });
      } else {
        setConfig({ position: "bottom-right", offset: "80px" });
      }
    }

    mq.addEventListener("change", update);
    update();
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <Toaster
      richColors
      closeButton
      position={position}
      duration={4000}
      visibleToasts={5}
      gap={8}
      offset={offset}
      toastOptions={{
        classNames: {
          title: "text-sm font-semibold",
          description: "text-xs opacity-90",
          closeButton:
            "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900",
        },
      }}
    />
  );
}
