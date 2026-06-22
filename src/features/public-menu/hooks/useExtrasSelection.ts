"use client";

import { useState, useMemo, useCallback } from "react";
import type { CartExtra } from "@/features/public-menu/cart/useCartStore";
import type { ExtraGroup } from "@/features/public-menu/types";

interface UseExtrasSelectionReturn {
  /** groupId → { itemId: quantity } */
  quantities: Record<string, Record<string, number>>;
  /** Sum of selected extra item prices */
  extraTotal: number;
  /** Error message if a required group is empty */
  hasError: string | null;
  /** Toggle a radio-style item (non-multiple groups) */
  toggleItem: (groupId: string, itemId: string) => void;
  /** Increase quantity for a multiple-group item */
  addItem: (groupId: string, itemId: string) => void;
  /** Decrease quantity for a multiple-group item */
  removeItem: (groupId: string, itemId: string) => void;
  /** Get current quantity for an item */
  getQuantity: (groupId: string, itemId: string) => number;
  /** Build CartExtra array for the cart */
  buildExtras: () => CartExtra[];
}

export function useExtrasSelection(
  groups: ExtraGroup[],
): UseExtrasSelectionReturn {
  const [quantities, setQuantities] = useState<
    Record<string, Record<string, number>>
  >(() => {
    const initial: Record<string, Record<string, number>> = {};
    for (const g of groups) {
      const map: Record<string, number> = {};
      if (g.requerido && !g.multiple && g.items.length > 0) {
        map[g.items[0].id] = 1;
      } else {
        for (const item of g.items) {
          map[item.id] = 0;
        }
      }
      initial[g.id] = map;
    }
    return initial;
  });

  const getQuantity = useCallback(
    (groupId: string, itemId: string) => {
      return quantities[groupId]?.[itemId] ?? 0;
    },
    [quantities],
  );

  const toggleItem = useCallback(
    (groupId: string, itemId: string) => {
      setQuantities((prev) => {
        const group = prev[groupId];
        if (!group) return prev;

        const groupConfig = groups.find((g) => g.id === groupId);
        if (!groupConfig) return prev;

        if (groupConfig.multiple) {
          // For multiple groups, toggle between 0 and 1 (legacy support)
          const current = group[itemId] ?? 0;
          return {
            ...prev,
            [groupId]: { ...group, [itemId]: current > 0 ? 0 : 1 },
          };
        }

        // For radio groups, deselect others and toggle this one
        const wasSelected = group[itemId] === 1;
        const newGroup: Record<string, number> = {};
        for (const key of Object.keys(group)) {
          newGroup[key] = 0;
        }
        newGroup[itemId] = wasSelected ? 0 : 1;
        return { ...prev, [groupId]: newGroup };
      });
    },
    [groups],
  );

  const addItem = useCallback(
    (groupId: string, itemId: string) => {
      setQuantities((prev) => {
        const group = prev[groupId];
        if (!group) return prev;

        const current = group[itemId] ?? 0;

        // Check max limit
        const groupConfig = groups.find((g) => g.id === groupId);
        const itemConfig = groupConfig?.items.find((i) => i.id === itemId);
        const max = itemConfig?.max;
        if (max !== undefined && max !== null && current >= max) return prev;

        return {
          ...prev,
          [groupId]: { ...group, [itemId]: current + 1 },
        };
      });
    },
    [groups],
  );

  const removeItem = useCallback(
    (groupId: string, itemId: string) => {
      setQuantities((prev) => {
        const group = prev[groupId];
        if (!group) return prev;

        const current = group[itemId] ?? 0;
        if (current <= 0) return prev;

        // For required radio groups, don't allow going below 1
        const groupConfig = groups.find((g) => g.id === groupId);
        if (
          groupConfig?.requerido &&
          !groupConfig?.multiple &&
          current <= 1
        ) {
          return prev;
        }

        return {
          ...prev,
          [groupId]: { ...group, [itemId]: current - 1 },
        };
      });
    },
    [groups],
  );

  const hasError = useMemo(() => {
    for (const g of groups) {
      if (g.requerido && !g.multiple) {
        const groupQuantities = quantities[g.id] ?? {};
        const hasSelected = Object.values(groupQuantities).some((q) => q > 0);
        if (!hasSelected) {
          return `Seleccioná una opción de "${g.titulo}"`;
        }
      }
    }
    return null;
  }, [groups, quantities]);

  const extraTotal = useMemo(() => {
    let total = 0;
    for (const g of groups) {
      const groupQuantities = quantities[g.id] ?? {};
      for (const item of g.items) {
        const qty = groupQuantities[item.id] ?? 0;
        total += item.precio * qty;
      }
    }
    return total;
  }, [groups, quantities]);

  const buildExtras = useCallback((): CartExtra[] => {
    const result: CartExtra[] = [];
    for (const g of groups) {
      const groupQuantities = quantities[g.id] ?? {};
      for (const item of g.items) {
        const qty = groupQuantities[item.id] ?? 0;
        if (qty > 0) {
          result.push({
            grupo_id: g.id,
            grupo_titulo: g.titulo,
            item_id: item.id,
            item_nombre: item.nombre,
            item_precio: item.precio,
            cantidad: qty,
          });
        }
      }
    }
    return result;
  }, [groups, quantities]);

  return {
    quantities,
    extraTotal,
    hasError,
    toggleItem,
    addItem,
    removeItem,
    getQuantity,
    buildExtras,
  };
}
