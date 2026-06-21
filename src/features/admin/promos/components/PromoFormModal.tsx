"use client";

import { useState, useEffect, useRef } from "react";
import { XCircle, Plus, Minus, Trash2, Percent, Tag, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { upsertPromoSchema } from "@/core/lib/schemas";
import { FoodMini } from "@/components/ui/food-loading";
import { useScrollLock } from "@/core/hooks/useScrollLock";
import { ImageUpload } from "./ImageUpload";
import { z } from "zod";

interface ProductOption {
  id: string;
  nombre: string;
  precio: number;
}

type PromoFormData = z.infer<typeof upsertPromoSchema>;

interface CategoryOption {
  id: string;
  nombre: string;
}

interface PromoFormModalProps {
  formData: PromoFormData;
  onChange: (data: PromoFormData) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  isEdit: boolean;
  products: ProductOption[];
  categories?: CategoryOption[];
}

const TYPE_OPTIONS = [
  {
    value: "porcentaje" as const,
    icon: Percent,
    title: "Oferta %",
    desc: "Descuento porcentual sobre productos seleccionados",
    example: "Ej: 20% OFF",
    color: "purple",
  },
  {
    value: "monto_fijo" as const,
    icon: Tag,
    title: "Descuento Fijo",
    desc: "Descuento en pesos sobre productos seleccionados",
    example: "Ej: $500 de descuento",
    color: "amber",
  },
  {
    value: "combo" as const,
    icon: ShoppingBag,
    title: "Combo",
    desc: "Varios productos agrupados con precio especial",
    example: "Ej: Hamburguesa + Papas + Bebida",
    color: "blue",
  },
] as const;

export function PromoFormModal({
  formData,
  onChange,
  onSave,
  onClose,
  saving,
  isEdit,
  products,
  categories,
}: PromoFormModalProps) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [discountProductSearch, setDiscountProductSearch] = useState("");
  const [showDiscountDropdown, setShowDiscountDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [applyMode, setApplyMode] = useState<"all" | "selected">(
    formData.aplicar_a ? "selected" : "all",
  );
  const productInputRef = useRef<HTMLInputElement>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  useScrollLock(true);

  const isCombo = formData.tipo_descuento === "combo";

  const itemsInCombo = formData.items_combo.map((i) => i.producto_id);
  const availableProducts = products.filter((p) => !itemsInCombo.includes(p.id));
  const comboTotal = formData.items_combo.reduce(
    (sum, i) => sum + (i.precio ?? 0) * i.cantidad,
    0,
  );

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
    const prod = products.find((p) => p.id === selectedProduct);
    if (!prod) return;
    onChange({
      ...formData,
      items_combo: [
        ...formData.items_combo,
        { producto_id: prod.id, nombre_producto: prod.nombre, cantidad: 1, precio: prod.precio },
      ],
    });
    setSelectedProduct("");
    setProductSearch("");
  };

  const removeComboItem = (producto_id: string) => {
    onChange({
      ...formData,
      items_combo: formData.items_combo.filter((i) => i.producto_id !== producto_id),
    });
  };

  const updateComboQty = (producto_id: string, cantidad: number) => {
    onChange({
      ...formData,
      items_combo: formData.items_combo.map((i) =>
        i.producto_id === producto_id ? { ...i, cantidad: Math.max(1, cantidad) } : i,
      ),
    });
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

  const setType = (tipo: "porcentaje" | "monto_fijo" | "combo") => {
    if (tipo === "combo") {
      onChange({ ...formData, tipo_descuento: tipo });
    } else {
      onChange({ ...formData, tipo_descuento: tipo, items_combo: [] });
    }
    clearErrors("tipo_descuento");
  };

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-modal-title"
        className="bg-[var(--admin-surface)] rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl border border-[var(--admin-border)] animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h3 id="promo-modal-title" className="font-bold text-lg text-[var(--admin-text)]">
            {isEdit ? "Editar" : "Nueva"} Promoción
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--admin-bg)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors"
          >
            <XCircle size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* SELECTOR DE TIPO — tarjetas visuales */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--admin-text)] block">
              Tipo de promoción
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const isActive = formData.tipo_descuento === opt.value;
                const Icon = opt.icon;
                const colorMap = {
                  purple: "border-purple-500/30 bg-purple-500/10 text-purple-500",
                  amber: "border-amber-500/30 bg-amber-500/10 text-amber-500",
                  blue: "border-blue-500/30 bg-blue-500/10 text-blue-500",
                };
                const activeMap = {
                  purple: "ring-2 ring-purple-500/40 border-purple-500",
                  amber: "ring-2 ring-amber-500/40 border-amber-500",
                  blue: "ring-2 ring-blue-500/40 border-blue-500",
                };
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`text-left p-3 rounded-xl border transition-all overflow-hidden ${
                      isActive
                        ? `bg-[var(--admin-surface)] ${activeMap[opt.color]} shadow-sm`
                        : `border-[var(--admin-border)] bg-[var(--admin-bg)] hover:border-[var(--admin-text-muted)]/30`
                    }`}
                  >
                    <div className={`w-fit p-1.5 rounded-lg border mb-2 ${
                      isActive ? colorMap[opt.color] : "text-[var(--admin-text-muted)] border-[var(--admin-border)]"
                    }`}>
                      <Icon size={16} />
                    </div>
                    <p className={`text-xs font-bold mb-0.5 truncate ${
                      isActive ? `text-${opt.color}-600` : "text-[var(--admin-text)]"
                    }`}>
                      {opt.title}
                    </p>
                    <p className="text-[9px] text-[var(--admin-text-muted)] leading-tight truncate">
                      {opt.example}
                    </p>
                  </button>
                );
              })}
            </div>
            {errors["tipo_descuento"] && (
              <p className="text-[10px] text-red-500 font-medium">{errors["tipo_descuento"]}</p>
            )}
          </div>

          {/* ── CAMPOS COMUNES ── */}

          {/* NOMBRE */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--admin-text)]">
              Nombre de la promoción
            </label>
            <input
              required
              value={formData.nombre}
              onChange={(e) => {
                onChange({ ...formData, nombre: e.target.value });
                clearErrors("nombre");
              }}
              placeholder={
                isCombo
                  ? "Ej: Combo Hamburguesa Completo"
                  : formData.tipo_descuento === "porcentaje"
                    ? "Ej: 20% OFF en todo"
                    : "Ej: $500 de descuento"
              }
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

          {/* DESCRIPCIÓN */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--admin-text)]">
              Descripción <span className="text-[var(--admin-text-muted)] font-normal">(opcional)</span>
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
              placeholder={
                isCombo
                  ? "Contale a tus clientes qué incluye este combo"
                  : "Explicá cómo funciona esta promoción"
              }
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
          </div>

          {/* VALOR DEL DESCUENTO */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--admin-text)]">
              {isCombo
                ? "Precio del Combo ($)"
                : formData.tipo_descuento === "porcentaje"
                  ? "Porcentaje de descuento (%)"
                  : "Monto de descuento ($)"}
            </label>
            {isCombo && comboTotal > 0 && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-[var(--admin-text-muted)]">
                  Valor real: <span className="line-through">${comboTotal.toLocaleString("es-AR")}</span>
                </span>
                <button
                  type="button"
                  onClick={autoSuggestPrice}
                  className="text-[9px] font-bold text-blue-500 hover:text-blue-600 underline"
                >
                  Sugerir precio
                </button>
              </div>
            )}
            <div className="relative">
              {!isCombo && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--admin-text-muted)]">
                  {formData.tipo_descuento === "porcentaje" ? "%" : "$"}
                </span>
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
                className={`w-full p-2.5 bg-[var(--admin-bg)] border rounded-xl text-sm text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all ${
                  !isCombo ? "pl-8" : ""
                } ${
                  errors["valor_descuento"]
                    ? "border-red-400 focus:border-red-500"
                    : "border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
                }`}
              />
            </div>
            {errors["valor_descuento"] && (
              <p className="text-[10px] text-red-500 font-medium">{errors["valor_descuento"]}</p>
            )}
            {isCombo && comboTotal > 0 && formData.valor_descuento > 0 && (
              <p className="text-[10px] text-green-600 font-medium">
                Ahorro: ${(comboTotal - formData.valor_descuento).toLocaleString("es-AR")} (
                {Math.round((1 - formData.valor_descuento / comboTotal) * 100)}% OFF)
              </p>
            )}
          </div>

          {/* CÓDIGO PROMOCIONAL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--admin-text)]">
              Código promocional <span className="text-[var(--admin-text-muted)] font-normal">(opcional)</span>
            </label>
            <input
              value={formData.codigo ?? ""}
              onChange={(e) => {
                onChange({ ...formData, codigo: e.target.value || null });
                clearErrors("codigo");
              }}
              placeholder="Ej: VERANO2025 — lo ingresa el cliente al pedir"
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
          </div>

          {/* IMAGEN */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--admin-text)]">
              Imagen <span className="text-[var(--admin-text-muted)] font-normal">(opcional)</span>
            </label>
            <ImageUpload
              value={formData.imagen_url ?? null}
              onChange={(url) => onChange({ ...formData, imagen_url: url || null })}
            />
          </div>

          {/* ── APLICA A (solo para descuentos) ── */}
          {!isCombo && (
            <div className="space-y-3 border border-[var(--admin-border)] rounded-xl p-4 bg-[var(--admin-bg)]/50">
              <label className="text-xs font-semibold text-[var(--admin-text)]">
                ¿A qué productos aplica esta promoción?
              </label>

              {/* Toggle: all vs selected */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setApplyMode("all");
                    onChange({ ...formData, aplicar_a: null });
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-semibold transition-all border text-left ${
                    applyMode === "all"
                      ? "bg-[var(--admin-accent)] text-white border-[var(--admin-accent)]"
                      : "bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)]/30"
                  }`}
                >
                  <span className="block text-[11px]">Todos los productos</span>
                  <span className="block opacity-70 mt-0.5">Aplica a cualquier producto del menú</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setApplyMode("selected");
                    onChange({
                      ...formData,
                      aplicar_a: formData.aplicar_a ?? { productos: [], categorias: [] },
                    });
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-semibold transition-all border text-left ${
                    applyMode === "selected"
                      ? "bg-[var(--admin-accent)] text-white border-[var(--admin-accent)]"
                      : "bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)]/30"
                  }`}
                >
                  <span className="block text-[11px]">Solo algunos</span>
                  <span className="block opacity-70 mt-0.5">Elegí productos o categorías específicas</span>
                </button>
              </div>

              {/* Selector de productos/categorías */}
              {applyMode === "selected" && (
                <div className="space-y-3">
                  {/* ── PRODUCTOS ── */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                      Productos
                    </label>

                    {/* Selected product chips */}
                    {formData.aplicar_a && formData.aplicar_a.productos.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {formData.aplicar_a.productos.map((pid) => {
                          const prod = products.find((p) => p.id === pid);
                          if (!prod) return null;
                          return (
                            <span
                              key={pid}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[10px] font-medium text-[var(--admin-text)]"
                            >
                              {prod.nombre}
                              <button
                                type="button"
                                onClick={() => {
                                  const actual = formData.aplicar_a ?? { productos: [], categorias: [] };
                                  const nuevos = actual.productos.filter((id) => id !== pid);
                                  onChange({
                                    ...formData,
                                    aplicar_a: { ...actual, productos: nuevos },
                                  });
                                }}
                                className="ml-0.5 text-[var(--admin-text-muted)] hover:text-red-500"
                              >
                                <Trash2 size={10} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Product search + add */}
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={discountProductSearch}
                          onChange={(e) => {
                            setDiscountProductSearch(e.target.value);
                            setShowDiscountDropdown(true);
                          }}
                          onFocus={() => setShowDiscountDropdown(true)}
                          placeholder="Buscá productos para incluir..."
                          className="w-full p-2 bg-[var(--admin-surface)] border rounded-lg text-xs text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
                        />
                        {showDiscountDropdown && (
                          <DiscountProductDropdown
                            products={products}
                            search={discountProductSearch}
                            selectedIds={formData.aplicar_a?.productos ?? []}
                            onSelect={(id) => {
                              const actual = formData.aplicar_a ?? { productos: [], categorias: [] };
                              const actuales = actual.productos;
                              if (!actuales.includes(id)) {
                                onChange({
                                  ...formData,
                                  aplicar_a: { ...actual, productos: [...actuales, id] },
                                });
                              }
                              setDiscountProductSearch("");
                              setShowDiscountDropdown(false);
                            }}
                            onClose={() => setShowDiscountDropdown(false)}
                          />
                        )}
                      </div>
                      {formData.aplicar_a && formData.aplicar_a.productos.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const actual = formData.aplicar_a ?? { productos: [], categorias: [] };
                            onChange({
                              ...formData,
                              aplicar_a: { ...actual, productos: [] },
                            });
                          }}
                          className="text-[9px] text-[var(--admin-text-muted)] hover:text-red-500 underline self-center"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── CATEGORÍAS ── */}
                  {categories && categories.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
                        Categorías
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat) => {
                          const isSelected = formData.aplicar_a?.categorias.includes(cat.id) ?? false;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                const actual = formData.aplicar_a ?? { productos: [], categorias: [] };
                                const actuales = actual.categorias;
                                const nuevas = isSelected
                                  ? actuales.filter((id) => id !== cat.id)
                                  : [...actuales, cat.id];
                                onChange({
                                  ...formData,
                                  aplicar_a: { ...actual, categorias: nuevas },
                                });
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${
                                isSelected
                                  ? "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] border-[var(--admin-accent)]/30"
                                  : "bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)]/20"
                              }`}
                            >
                              {cat.nombre}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(!formData.aplicar_a || (formData.aplicar_a.productos.length === 0 && formData.aplicar_a.categorias.length === 0)) && (
                    <p className="text-[10px] text-[var(--admin-text-muted)] italic">
                      No seleccionaste ningún producto ni categoría. La promoción se mostrará como sugerencia general.
                    </p>
                  )}

                  {formData.aplicar_a && (formData.aplicar_a.productos.length > 0 || formData.aplicar_a.categorias.length > 0) && (
                    <p className="text-[10px] text-green-600 font-medium">
                      Afecta a {formData.aplicar_a.productos.length} producto{formData.aplicar_a.productos.length !== 1 ? "s" : ""}
                      {formData.aplicar_a.categorias.length > 0 && (
                        <> y {formData.aplicar_a.categorias.length} categoría{formData.aplicar_a.categorias.length !== 1 ? "s" : ""}</>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTOS DEL COMBO ── */}
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
                          onClick={() => updateComboQty(item.producto_id, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                          className="p-0.5 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] disabled:opacity-30"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => updateComboQty(item.producto_id, item.cantidad + 1)}
                          className="p-0.5 rounded text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)]"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="flex-1 text-xs font-medium text-[var(--admin-text)]">
                        {item.nombre_producto}
                      </span>
                      <span className="text-[10px] text-[var(--admin-text-muted)] font-mono">
                        ${(item.precio ?? 0).toLocaleString("es-AR")}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeComboItem(item.producto_id)}
                        className="p-1 rounded text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Buscador de productos */}
              {availableProducts.length > 0 && (
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={productInputRef}
                      type="text"
                      value={
                        selectedProduct
                          ? availableProducts.find((p) => p.id === selectedProduct)?.nombre ?? productSearch
                          : productSearch
                      }
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setSelectedProduct("");
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      placeholder="Buscá productos para agregar al combo..."
                      className="w-full p-2 bg-[var(--admin-surface)] border rounded-lg text-xs text-[var(--admin-text)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] transition-all border-[var(--admin-border)] focus:border-[var(--admin-accent)]"
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

              {availableProducts.length === 0 && products.length > 0 && (
                <p className="text-[10px] text-[var(--admin-text-muted)] text-center py-2">
                  Todos los productos disponibles ya están en el combo
                </p>
              )}

              {products.length === 0 && (
                <p className="text-[10px] text-[var(--admin-text-muted)] text-center py-2">
                  No hay productos disponibles. Creá productos primero.
                </p>
              )}
            </div>
          )}

          {/* Botones */}
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
                <Sparkles size={14} />
              )}
              {isEdit ? "Guardar Cambios" : "Crear Promoción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DiscountProductDropdown({
  products,
  search,
  selectedIds,
  onSelect,
  onClose,
}: {
  products: ProductOption[];
  search: string;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const filtered = products
    .filter((p) => !selectedIds.includes(p.id))
    .filter(
      (p) =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        `$${p.precio}`.includes(search),
    );

  if (filtered.length === 0) return null;

  return (
    <div
      ref={ref}
      className="absolute z-50 top-full left-0 right-0 mt-1 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg shadow-xl max-h-48 overflow-y-auto"
    >
      {filtered.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelect(p.id)}
          className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[var(--admin-bg)] transition-colors text-[var(--admin-text)]"
        >
          <span>{p.nombre}</span>
          <span className="text-[var(--admin-text-muted)] font-mono">
            ${p.precio.toLocaleString("es-AR")}
          </span>
        </button>
      ))}
    </div>
  );
}
