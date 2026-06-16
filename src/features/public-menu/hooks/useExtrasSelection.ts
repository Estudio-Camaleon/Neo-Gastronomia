"use client";

import { useState, useMemo, useCallback } from "react";
import type { CartExtra } from "@/features/public-menu/cart/useCartStore";
import type { ExtraGroup } from "@/features/public-menu/types";

interface UseExtrasSelectionReturn {
  selected: Record<string, string[]>;
  hasError: string | null;
  extraTotal: number;
  toggleItem: (groupId: string, itemId: string, multiple: boolean) => void;
  buildExtras: () => CartExtra[];
}

export function useExtrasSelection(
  groups: ExtraGroup[],
): UseExtrasSelectionReturn {
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    for (const g of groups) {
      if (g.requerido && !g.multiple && g.items.length > 0) {
        initial[g.id] = [g.items[0].id];
      } else {
        initial[g.id] = [];
      }
    }
    return initial;
  });

  const toggleItem = useCallback(
    (groupId: string, itemId: string, multiple: boolean) => {
      setSelected((prev) => {
        const current = prev[groupId] || [];
        if (multiple) {
          const exists = current.includes(itemId);
          return {
            ...prev,
            [groupId]: exists
              ? current.filter((id) => id !== itemId)
              : [...current, itemId],
          };
        }
        return { ...prev, [groupId]: [itemId] };
      });
    },
    [],
  );

  const hasError = useMemo(() => {
    for (const g of groups) {
      if (g.requerido && (!selected[g.id] || selected[g.id].length === 0)) {
        return `Seleccioná una opción de "${g.titulo}"`;
      }
    }
    return null;
  }, [groups, selected]);

  const extraTotal = useMemo(() => {
    let total = 0;
    for (const g of groups) {
      const ids = selected[g.id] || [];
      for (const id of ids) {
        const item = g.items.find((i) => i.id === id);
        if (item) total += item.precio;
      }
    }
    return total;
  }, [groups, selected]);

  const buildExtras = useCallback((): CartExtra[] => {
    const result: CartExtra[] = [];
    for (const g of groups) {
      const ids = selected[g.id] || [];
      for (const id of ids) {
        const item = g.items.find(
          (i: ExtraGroup["items"][0]) => i.id === id,
        );
        if (item) {
          result.push({
            grupo_id: g.id,
            grupo_titulo: g.titulo,
            item_id: item.id,
            item_nombre: item.nombre,
            item_precio: item.precio,
          });
        }
      }
    }
    return result;
  }, [groups, selected]);

  return { selected, hasError, extraTotal, toggleItem, buildExtras };
}
