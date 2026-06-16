"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Percent,
  Plus,
  Tag,
  Pencil,
  Trash2,
  Sparkles,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Minus,
  Upload,
  X,
  Search,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { upsertPromoSchema } from "@/core/lib/schemas";
import type { PromoRow } from "@/core/types/domain";
import {
  getPromosAction,
  upsertPromoAction,
  deletePromoAction,
  togglePromoAction,
  getComboProductsAction,
} from "../actions";
import { z } from "zod";
import { FoodMini } from "@/components/ui/food-loading";
import { useScrollLock } from "@/core/hooks/useScrollLock";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "activas" | "inactivas" | "combo" | "descuento">("all");
  const [products, setProducts] = useState<ProductOption[]>([]);

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
      toast.error("Error al cargar productos para combos");
    }
  }, []);

  const openCreate = () => {
    setEditingPromo(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (promo: PromoRow) => {
    setEditingPromo(promo);
    const itemsCombo = (promo.items_combo ?? []) as z.infer<typeof upsertPromoSchema>["items_combo"];
    setFormData({
      nombre: promo.nombre,
      descripcion: promo.descripcion,
      imagen_url: promo.imagen_url,
      tipo_descuento: promo.tipo_descuento as "porcentaje" | "monto_fijo" | "combo",
      valor_descuento: promo.valor_descuento,
      codigo: promo.codigo,
      activo: promo.activo ?? true,
      items_combo: itemsCombo,
    });
    if (promo.tipo_descuento === "combo") loadProducts();
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

  const addComboItem = (producto_id: string) => {
    const prod = products.find((p) => p.id === producto_id);
    if (!prod) return;
    if (formData.items_combo.some((i) => i.producto_id === producto_id)) {
      toast.error("Este producto ya está en el combo");
      return;
    }
    setFormData({
      ...formData,
      items_combo: [
        ...formData.items_combo,
        { producto_id: prod.id, nombre_producto: prod.nombre, cantidad: 1, precio: prod.precio },
      ],
    });
  };

  const removeComboItem = (producto_id: string) => {
    setFormData({
      ...formData,
      items_combo: formData.items_combo.filter((i) => i.producto_id !== producto_id),
    });
  };

  const updateComboQty = (producto_id: string, cantidad: number) => {
    setFormData({
      ...formData,
      items_combo: formData.items_combo.map((i) =>
        i.producto_id === producto_id ? { ...i, cantidad: Math.max(1, cantidad) } : i,
      ),
    });
  };

  const itemsInCombo = formData.items_combo.map((i) => i.producto_id);
  const availableProducts = products.filter((p) => !itemsInCombo.includes(p.id));
  const comboTotal = formData.items_combo.reduce(
    (sum, i) => sum + (i.precio ?? 0) * i.cantidad,
    0,
  );

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
      <div className="admin-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/20 text-purple-500">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--admin-text)]">
                Promociones y Combos
              </h2>
              <p className="text-xs text-[var(--admin-text-muted)] font-medium">
                Ofertas, descuentos y combos especiales
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFormData({ ...EMPTY_FORM, tipo_descuento: "combo" });
                loadProducts();
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 border border-[var(--admin-border)] rounded-xl text-xs font-bold text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-all active:scale-95"
            >
              <ShoppingBag size={14} />
              Nuevo Combo
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--admin-accent)] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all active:scale-95 shadow-sm"
            >
              <Plus size={14} />
              Nueva Promo
            </button>
          </div>
        </div>
      </div>

      {promos.length === 0 ? (
        <div className="admin-card p-10 flex flex-col items-center justify-center text-center border-dashed">
          <div className="p-4 rounded-2xl bg-[var(--admin-accent)]/5 text-[var(--admin-text-muted)] mb-4">
            <Percent size={40} strokeWidth={1.5} />
          </div>
          <p className="text-lg font-bold text-[var(--admin-text)] mb-1">
            No hay promociones ni combos
          </p>
          <p className="text-sm text-[var(--admin-text-muted)] mb-4">
            Creá tu primera oferta o combo especial.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFormData({ ...EMPTY_FORM, tipo_descuento: "combo" });
                loadProducts();
                setModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 border border-[var(--admin-accent)] text-[var(--admin-accent)] rounded-xl text-sm font-bold hover:bg-[var(--admin-accent)]/5 transition-all active:scale-95"
            >
              <ShoppingBag size={16} />
              Crear Combo
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--admin-accent)] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-sm"
            >
              <Plus size={16} />
              Crear Promoción
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Search + filter bar */}
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
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(["all", "activas", "inactivas", "combo", "descuento"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    filterType === f
                      ? "bg-[var(--admin-accent)] text-white shadow-sm"
                      : "bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface)]"
                  }`}
                >
                  {f === "all" ? "Todas" : f === "activas" ? "Activas" : f === "inactivas" ? "Inactivas" : f === "combo" ? "Combos" : "Dto."}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPromos.length === 0 ? (
            <div className="col-span-full py-10 text-center text-sm text-[var(--admin-text-muted)]">
              {searchQuery ? "No hay promos que coincidan con la búsqueda." : "No hay promociones todavía."}
            </div>
          ) : (
          filteredPromos.map((promo) => {
            const isCombo = promo.tipo_descuento === "combo";
            const comboItems = isCombo ? (promo.items_combo ?? []) : [];

            return (
              <div
                key={promo.id}
                className={`admin-card p-5 relative overflow-hidden transition-all duration-200 min-h-[200px] ${
                  !promo.activo ? "opacity-60" : ""
                }`}
              >
                {!promo.activo && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--admin-text-muted)]/10 text-[var(--admin-text-muted)] border border-[var(--admin-border)]">
                      Inactiva
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${
                    isCombo
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                      : promo.tipo_descuento === "porcentaje"
                        ? "bg-purple-500/10 border-purple-500/20 text-purple-500"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  }`}>
                    {isCombo ? <ShoppingBag size={18} /> : promo.tipo_descuento === "porcentaje" ? <Percent size={18} /> : <Tag size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-[var(--admin-text)] truncate">
                      {promo.nombre}
                    </h3>
                    {promo.descripcion && (
                      <p className="text-[11px] text-[var(--admin-text-muted)] mt-0.5 line-clamp-2">
                        {promo.descripcion}
                      </p>
                    )}
                  </div>
                  {promo.imagen_url && (
                    <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-[var(--admin-border)]">
                      <img
                        src={promo.imagen_url}
                        alt={promo.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {isCombo ? (
                    <span className="text-lg font-black text-blue-500">
                      ${promo.valor_descuento.toLocaleString("es-AR")}
                    </span>
                  ) : (
                    <span className={`text-lg font-black ${
                      promo.tipo_descuento === "porcentaje"
                        ? "text-purple-500" : "text-amber-500"
                    }`}>
                      {promo.tipo_descuento === "porcentaje"
                        ? `${promo.valor_descuento}%`
                        : `$${promo.valor_descuento.toLocaleString("es-AR")}`}
                    </span>
                  )}
                  {isCombo && (
                    <span className="text-[10px] font-medium text-[var(--admin-text-muted)]">
                      Combo
                    </span>
                  )}
                  {promo.codigo && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text-muted)]">
                      {promo.codigo}
                    </span>
                  )}
                </div>

                {isCombo && Array.isArray(comboItems) && comboItems.length > 0 && (
                  <div className="mb-3 space-y-1">
                    <p className="text-[10px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                      Incluye:
                    </p>
                    {(comboItems as Array<{ nombre_producto: string; cantidad: number; precio?: number }>).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-[var(--admin-text)] bg-[var(--admin-bg)] rounded-lg px-2 py-1">
                        <span className="font-bold w-4 text-center">{item.cantidad}x</span>
                        <span>{item.nombre_producto}</span>
                      </div>
                    ))}
                    {(() => {
                      const total = (comboItems as Array<{ precio?: number; cantidad: number }>).reduce(
                        (s, i) => s + (i.precio ?? 0) * i.cantidad, 0,
                      );
                      return total > 0 ? (
                        <p className="text-[10px] text-[var(--admin-text-muted)] pt-1">
                          Valor real: <span className="line-through">${total.toLocaleString("es-AR")}</span>
                        </p>
                      ) : null;
                    })()}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[var(--admin-border)]">
                  <button
                    onClick={() => handleToggle(promo)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      promo.activo
                        ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        : "bg-[var(--admin-text-muted)]/10 text-[var(--admin-text-muted)] hover:bg-[var(--admin-text-muted)]/20"
                    }`}
                  >
                    {promo.activo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {promo.activo ? "Activa" : "Inactiva"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(promo)}
                      className="p-1.5 rounded-lg text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(promo.id)}
                      disabled={deletingId === promo.id}
                      className="p-1.5 rounded-lg text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-40"
                    >
                      {deletingId === promo.id ? (
                        <FoodMini size={14} />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        </div>
        </>
      )}

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

      {modalOpen && (
        <PromoModal
          formData={formData}
          onChange={setFormData}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          saving={saving}
          isEdit={!!editingPromo}
          products={products}
          availableProducts={availableProducts}
          onAddComboItem={addComboItem}
          onRemoveComboItem={removeComboItem}
          onUpdateComboQty={updateComboQty}
          comboTotal={comboTotal}
        />
      )}
    </div>
  );
}

function ImageUploadInline({
  value,
  onChange,
  uploading,
  setUploading,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen supera el límite de 5MB");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/promo-images", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { publicUrl?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Error al subir");
      if (!data.publicUrl) throw new Error("No se recibió URL");
      onChange(data.publicUrl);
      toast.success("Imagen cargada");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = async () => {
    if (value) {
      try {
        await fetch("/api/admin/promo-images", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value }),
        });
      } catch {
        // ignore cleanup errors
      }
    }
    onChange(null);
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--admin-border)] group">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`flex items-center justify-center w-28 h-20 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
            dragOver
              ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/5 scale-105"
              : "border-[var(--admin-border)] hover:border-[var(--admin-accent)]"
          }`}
        >
          {uploading ? (
            <FoodMini size={16} />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload size={18} className="text-[var(--admin-text-muted)]" />
              <span className="text-[8px] text-[var(--admin-text-muted)]">Arrastrar o click</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      )}
      {!value && !uploading && (
        <span className="text-[11px] text-[var(--admin-text-muted)]">
          Subí una foto para esta promo
        </span>
      )}
    </div>
  );
}

function PromoModal({
  formData,
  onChange,
  onSave,
  onClose,
  saving,
  isEdit,
  products,
  availableProducts,
  onAddComboItem,
  onRemoveComboItem,
  onUpdateComboQty,
  comboTotal,
}: {
  formData: PromoFormData;
  onChange: (data: PromoFormData) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  isEdit: boolean;
  products: ProductOption[];
  availableProducts: ProductOption[];
  onAddComboItem: (id: string) => void;
  onRemoveComboItem: (id: string) => void;
  onUpdateComboQty: (id: string, qty: number) => void;
  comboTotal: number;
}) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const productInputRef = useRef<HTMLInputElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  useScrollLock(true);
  const isCombo = formData.tipo_descuento === "combo";

  const filteredAvailable = availableProducts.filter(
    (p) =>
      p.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
      `$${p.precio}`.includes(productSearch),
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(e.target as Node) &&
        productInputRef.current &&
        !productInputRef.current.contains(e.target as Node)
      ) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const validate = (): boolean => {
    const result = upsertPromoSchema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = issue.message;
      }
    }
    setErrors(fieldErrors);
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCombo && formData.items_combo.length === 0) {
      toast.error("Agregá al menos un producto al combo");
      return;
    }
    if (!validate()) return;
    onSave();
  };

  const handleAdd = () => {
    if (!selectedProduct) return;
    onAddComboItem(selectedProduct);
    setSelectedProduct("");
    setProductSearch("");
  };

  const autoSuggestPrice = () => {
    if (comboTotal <= 0) return;
    const suggested = Math.round(comboTotal * 0.85);
    onChange({ ...formData, valor_descuento: suggested });
    toast.success(`Precio sugerido: $${suggested.toLocaleString("es-AR")} (15% de descuento)`);
  };

  const clearErrors = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-modal-title"
        className="bg-[var(--admin-surface)] rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-[var(--admin-border)] animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isCombo
                ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                : "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/20 text-purple-500"
            }`}>
              {isCombo ? <ShoppingBag size={16} /> : <Sparkles size={16} />}
            </div>
            <h3 id="promo-modal-title" className="font-bold text-lg text-[var(--admin-text)]">
              {isEdit ? "Editar" : "Nueva"} {isCombo ? "Combo" : "Promoción"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors"
          >
            <XCircle size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--admin-text)]">
              Nombre
            </label>
            <input
              required
              value={formData.nombre}
              onChange={(e) => {
                onChange({ ...formData, nombre: e.target.value });
                clearErrors("nombre");
              }}
              placeholder={isCombo ? "Ej: Combo Hamburguesa Completo" : "Ej: 2x1 en Combos"}
              className={`w-full p-2.5 bg-[var(--admin-bg)] border rounded-xl text-sm text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all ${
                errors["nombre"]
                  ? "border-red-400 focus:border-red-500"
                  : "border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
              }`}
            />
            {errors["nombre"] && (
              <p className="text-[10px] text-red-500 font-medium">{errors["nombre"]}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--admin-text)]">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.descripcion ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length > 300) return;
                onChange({ ...formData, descripcion: val || null });
                clearErrors("descripcion");
              }}
              maxLength={300}
              placeholder={isCombo ? "Ej: Incluye hamburguesa, papas y bebida" : "Ej: Válido todos los martes"}
              className={`w-full p-2.5 bg-[var(--admin-bg)] border rounded-xl text-sm text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all resize-none h-20 ${
                errors["descripcion"]
                  ? "border-red-400 focus:border-red-500"
                  : "border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
              }`}
            />
            <div className="flex justify-end">
              <span className="text-[10px] tabular-nums text-[var(--admin-text-muted)] opacity-60">
                {(formData.descripcion ?? "").length}/300
              </span>
            </div>
            {errors["descripcion"] && (
              <p className="text-[10px] text-red-500 font-medium">{errors["descripcion"]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--admin-text)]">
                Tipo
              </label>
              <select
                value={formData.tipo_descuento}
                onChange={(e) => {
                  const tipo = e.target.value as "porcentaje" | "monto_fijo" | "combo";
                  if (tipo === "combo") onChange({ ...formData, tipo_descuento: tipo });
                  else onChange({ ...formData, tipo_descuento: tipo, items_combo: [] });
                  clearErrors("tipo_descuento");
                }}
                className={`w-full p-2.5 bg-[var(--admin-bg)] border rounded-xl text-sm text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all ${
                  errors["tipo_descuento"]
                    ? "border-red-400 focus:border-red-500"
                    : "border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
                }`}
              >
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="monto_fijo">Monto Fijo ($)</option>
                <option value="combo">Combo</option>
              </select>
              {errors["tipo_descuento"] && (
                <p className="text-[10px] text-red-500 font-medium">{errors["tipo_descuento"]}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--admin-text)]">
                {isCombo ? "Precio Combo $" : formData.tipo_descuento === "porcentaje" ? "Porcentaje" : "Monto $"}
              </label>
              {isCombo && comboTotal > 0 && (
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] text-[var(--admin-text-muted)] line-through">
                    ${comboTotal.toLocaleString("es-AR")}
                  </span>
                  <span className="text-[10px] text-[var(--admin-text-muted)]">valor real</span>
                  <button
                    type="button"
                    onClick={autoSuggestPrice}
                    className="ml-auto text-[9px] font-bold text-blue-500 hover:text-blue-600 underline"
                  >
                    Sugerir precio
                  </button>
                </div>
              )}
              <input
                required
                type="number"
                min={0}
                max={isCombo ? 999999 : 100}
                step={isCombo ? 0.01 : formData.tipo_descuento === "porcentaje" ? 1 : 0.01}
                value={formData.valor_descuento}
                onChange={(e) => {
                  onChange({ ...formData, valor_descuento: Number(e.target.value) });
                  clearErrors("valor_descuento");
                }}
                className={`w-full min-w-0 p-2.5 bg-[var(--admin-bg)] border rounded-xl text-sm text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all ${
                  errors["valor_descuento"]
                    ? "border-red-400 focus:border-red-500"
                    : "border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
                }`}
              />
              {errors["valor_descuento"] && (
                <p className="text-[10px] text-red-500 font-medium">{errors["valor_descuento"]}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--admin-text)]">
              Código Promocional (opcional)
            </label>
            <input
              value={formData.codigo ?? ""}
              onChange={(e) => {
                onChange({ ...formData, codigo: e.target.value || null });
                clearErrors("codigo");
              }}
              placeholder="Ej: VERANO2025"
              className={`w-full p-2.5 bg-[var(--admin-bg)] border rounded-xl text-sm font-mono text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all uppercase ${
                errors["codigo"]
                  ? "border-red-400 focus:border-red-500"
                  : "border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
              }`}
              maxLength={30}
            />
            {errors["codigo"] && (
              <p className="text-[10px] text-red-500 font-medium">{errors["codigo"]}</p>
            )}
            <p className="text-[10px] text-[var(--admin-text-muted)]">
              Código que el cliente ingresa al hacer un pedido.
            </p>
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--admin-text)]">
              Imagen (opcional)
            </label>
            <ImageUploadInline
              value={formData.imagen_url ?? null}
              onChange={(url) => onChange({ ...formData, imagen_url: url || null })}
              uploading={uploading}
              setUploading={setUploading}
            />
          </div>

          {/* Combo items */}
          {isCombo && (
            <div className="space-y-3 border border-[var(--admin-border)] rounded-xl p-4 bg-[var(--admin-bg)]/50">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--admin-text)]">
                  Productos del Combo
                </label>
                <span className="text-[10px] text-[var(--admin-text-muted)]">
                  {formData.items_combo.length} producto{formData.items_combo.length !== 1 ? "s" : ""}
                </span>
              </div>

              {formData.items_combo.length > 0 && (
                <div className="space-y-1.5">
                  {formData.items_combo.map((item) => (
                    <div
                      key={item.producto_id}
                      className="flex items-center gap-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateComboQty(item.producto_id, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                          className="p-0.5 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] disabled:opacity-30"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateComboQty(item.producto_id, item.cantidad + 1)}
                          className="p-0.5 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)]"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="flex-1 text-xs font-medium text-[var(--admin-text)]">
                        {item.nombre_producto}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveComboItem(item.producto_id)}
                        className="p-1 rounded text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {availableProducts.length > 0 && (
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={productInputRef}
                      type="text"
                      value={selectedProduct ? availableProducts.find((p) => p.id === selectedProduct)?.nombre ?? productSearch : productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setSelectedProduct("");
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      placeholder="Escribí para buscar productos..."
                      className={`w-full p-2 bg-[var(--admin-surface)] border rounded-lg text-xs text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all ${
                        selectedProduct && !productSearch
                          ? "border-[var(--admin-accent)]"
                          : "border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
                      }`}
                    />
                    {showProductDropdown && filteredAvailable.length > 0 && (
                      <div
                        ref={productDropdownRef}
                        className="absolute z-50 top-full left-0 right-0 mt-1 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg shadow-xl max-h-48 overflow-y-auto"
                      >
                        {filteredAvailable.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedProduct(p.id);
                              setProductSearch(p.nombre);
                              setShowProductDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[var(--admin-bg)] transition-colors ${
                              selectedProduct === p.id
                                ? "bg-[var(--admin-accent)]/5 text-[var(--admin-accent)] font-semibold"
                                : "text-[var(--admin-text)]"
                            }`}
                          >
                            <span>{p.nombre}</span>
                            <span className="text-[var(--admin-text-muted)] font-mono">
                              ${p.precio.toLocaleString("es-AR")}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!selectedProduct}
                    className="px-3 py-2 bg-[var(--admin-accent)] text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all disabled:opacity-40"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}

              {comboTotal > 0 && (
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--admin-border)]">
                  <span className="text-[var(--admin-text-muted)]">Valor real:</span>
                  <span className="line-through text-[var(--admin-text-muted)]">
                    ${comboTotal.toLocaleString("es-AR")}
                  </span>
                  <span className="text-blue-500 font-bold">
                    ${formData.valor_descuento.toLocaleString("es-AR")}
                  </span>
                </div>
              )}
            </div>
          )}

          {!isCombo && formData.tipo_descuento === "porcentaje" && (
            <div className="flex items-center gap-2 p-2.5 bg-purple-500/5 border border-purple-500/20 rounded-xl text-xs font-medium text-purple-600">
              <Percent size={14} />
              <span>Descuento: <strong>{formData.valor_descuento}%</strong></span>
            </div>
          )}
          {!isCombo && formData.tipo_descuento === "monto_fijo" && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs font-medium text-amber-600">
              <Tag size={14} />
              <span>Descuento: <strong>${formData.valor_descuento.toLocaleString("es-AR")}</strong></span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 border border-[var(--admin-border)] rounded-xl text-sm font-semibold text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || (isCombo && formData.items_combo.length === 0)}
              className="flex-1 py-2.5 bg-[var(--admin-accent)] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {saving ? (
                <FoodMini size={14} />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {isEdit ? "Guardar Cambios" : isCombo ? "Crear Combo" : "Crear Promoción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
