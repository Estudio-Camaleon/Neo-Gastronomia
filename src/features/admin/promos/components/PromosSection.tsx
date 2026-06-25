"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, AlertTriangle, Percent, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { upsertPromoSchema } from "@/core/lib/schemas";
import type { PromoRow } from "@/core/types/domain";
import {
  getPromosAction,
  upsertPromoAction,
  deletePromoAction,
  togglePromoAction,
  getComboProductsAction,
  getProductsAndCategoriesAction,
} from "../actions";
import { z } from "zod";
import { FoodMini } from "@/components/ui/food-loading";
import { useScrollLock } from "@/core/hooks/useScrollLock";
import { PromoCard } from "./PromoCard";
import { PromoFormModal } from "./PromoFormModal";

interface PromosSectionProps {
  negocioId: string;
}

type PromoFormData = z.infer<typeof upsertPromoSchema>;

interface ProductOption {
  id: string;
  nombre: string;
  precio: number;
}

const EMPTY_FORM: PromoFormData = {
  nombre: "",
  descripcion: null,
  imagen_url: null,
  tipo_descuento: "porcentaje",
  valor_descuento: 10,
  codigo: null,
  activo: true,
  items_combo: [],
  aplicar_a: null,
};

export function PromosSection({ negocioId }: PromosSectionProps) {
  const [promos, setPromos] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoRow | null>(null);
  const [formData, setFormData] = useState<PromoFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  useScrollLock(!!confirmDeleteId);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "activas" | "inactivas" | "combo" | "descuento">("all");
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [categories, setCategories] = useState<{ id: string; nombre: string }[]>([]);

  const loadPromos = useCallback(async () => {
    try {
      const data = await getPromosAction();
      setPromos(data);
    } catch {
      toast.error("Error al cargar promociones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getComboProductsAction();
      setProducts(data as ProductOption[]);
    } catch {
      toast.error("Error al cargar productos");
    }
  }, []);

  const openCreate = async () => {
    setEditingPromo(null);
    setFormData(EMPTY_FORM);
    loadProducts();
    try {
      const data = await getProductsAndCategoriesAction();
      setProducts(data.productos as ProductOption[]);
      setCategories(data.categorias);
    } catch {
      toast.error("Error al cargar productos y categorías");
    }
    setModalOpen(true);
  };

  const openEdit = async (promo: PromoRow) => {
    setEditingPromo(promo);
    const itemsCombo = (promo.items_combo ?? []) as PromoFormData["items_combo"];
    const aplicarA = promo.aplicar_a as PromoFormData["aplicar_a"];
    setFormData({
      nombre: promo.nombre,
      descripcion: promo.descripcion,
      imagen_url: promo.imagen_url,
      tipo_descuento: promo.tipo_descuento as PromoFormData["tipo_descuento"],
      valor_descuento: promo.valor_descuento,
      codigo: promo.codigo,
      activo: promo.activo ?? true,
      items_combo: itemsCombo,
      aplicar_a: aplicarA,
    });
    if (promo.tipo_descuento === "combo") loadProducts();
    try {
      const data = await getProductsAndCategoriesAction();
      setProducts(data.productos as ProductOption[]);
      setCategories(data.categorias);
    } catch {
      toast.error("Error al cargar productos y categorías");
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertPromoAction(formData, editingPromo?.id);
      toast.success(editingPromo ? "Promoción actualizada" : "Promoción creada");
      setModalOpen(false);
      loadPromos();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (promoId: string) => {
    setConfirmDeleteId(null);
    setDeletingId(promoId);
    try {
      await deletePromoAction(promoId);
      toast.success("Promoción eliminada");
      loadPromos();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (promo: PromoRow) => {
    try {
      await togglePromoAction(promo.id, !promo.activo);
      loadPromos();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const filteredPromos = promos.filter((p) => {
    if (filterType === "activas" && !p.activo) return false;
    if (filterType === "inactivas" && p.activo) return false;
    if (filterType === "combo" && p.tipo_descuento !== "combo") return false;
    if (filterType === "descuento" && p.tipo_descuento === "combo") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.nombre.toLowerCase().includes(q);
      const matchDesc = (p.descripcion ?? "").toLowerCase().includes(q);
      const matchCode = (p.codigo ?? "").toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCode) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FoodMini size={18} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="admin-card p-5">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/20 text-purple-500 shrink-0">
              <Percent size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--admin-text)]">
                Promociones
              </h2>
              <p className="text-xs text-[var(--admin-text-muted)] font-medium">
                Ofertas, descuentos y combos en un solo lugar
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="self-stretch sm:self-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--admin-accent)] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all active:scale-95 shadow-sm"
          >
            <Plus size={14} />
            Crear Promoción
          </button>
        </div>
      </div>

      {promos.length === 0 ? (
        /* EMPTY STATE */
        <div className="admin-card p-6 sm:p-10 flex flex-col items-center justify-center text-center border-dashed">
          <div className="p-4 rounded-2xl bg-[var(--admin-accent)]/5 text-[var(--admin-text-muted)] mb-4">
            <Percent size={40} strokeWidth={1.5} />
          </div>
          <p className="text-lg font-bold text-[var(--admin-text)] mb-1">
            No hay promociones todavía
          </p>
          <p className="text-sm text-[var(--admin-text-muted)] mb-6 max-w-sm">
                Crea ofertas, descuentos o combos especiales para atraer más clientes.
              </p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--admin-accent)] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-sm"
          >
            <Plus size={16} />
            Crear Promoción
          </button>
        </div>
      ) : (
        <>
          {/* SEARCH + FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, descripción o código..."
                className="w-full pl-9 pr-3 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl text-sm text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] focus:border-[var(--admin-accent)] transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "activas", "inactivas", "combo", "descuento"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    filterType === f
                      ? "bg-[var(--admin-accent)] text-white shadow-sm"
                      : "bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface)]"
                  }`}
                >
                  {f === "all" ? "Todas" : f === "activas" ? "Activas" : f === "inactivas" ? "Inactivas" : f === "combo" ? "Combos" : "Descuentos"}
                </button>
              ))}
            </div>
          </div>

          {/* GRID DE PROMOS */}
          {filteredPromos.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--admin-text-muted)]">
              {searchQuery
                ? "No hay promociones que coincidan con la búsqueda."
                : "No hay promociones con este filtro."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPromos.map((promo) => (
                <PromoCard
                  key={promo.id}
                  promo={promo}
                  onToggle={() => handleToggle(promo)}
                  onEdit={() => openEdit(promo)}
                  onDelete={() => setConfirmDeleteId(promo.id)}
                  isDeleting={deletingId === promo.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--admin-surface)] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[var(--admin-border)] text-center animate-in zoom-in-95 duration-150">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-[var(--admin-text)] mb-2">
              ¿Eliminar promoción?
            </h3>
            <p className="text-sm text-[var(--admin-text-muted)] mb-6">
              Esta acción no se puede deshacer. La promoción se borrará permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 border border-[var(--admin-border)] rounded-xl text-sm font-semibold text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deletingId === confirmDeleteId ? <FoodMini size={14} /> : <Trash2 size={14} />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {modalOpen && (
        <PromoFormModal
          formData={formData}
          onChange={setFormData}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          saving={saving}
          isEdit={!!editingPromo}
          products={products}
          categories={categories}
        />
      )}
    </div>
  );
}
