import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
  .regex(/[0-9]/, "Debe incluir al menos un número")
  .regex(
    /[^A-Za-z0-9]/,
    "Debe incluir al menos un símbolo especial",
  );

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("El correo no tiene un formato válido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z.object({
  email: z
    .string()
    .email("El correo no tiene un formato válido")
    .transform((v) => v.trim().toLowerCase()),
  password: passwordSchema,
  nombreNegocio: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo")
    .transform((v) => v.trim()),
  slug: z
    .string()
    .min(2, "El slug debe tener al menos 2 caracteres")
    .max(60, "El slug es demasiado largo")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones")
    .transform((v) => v.trim().toLowerCase()),
  whatsapp: z
    .string()
    .regex(
      /^\+?\d{7,15}$/,
      "Ingresa un número válido con código de país (ej: +5491123456789)",
    )
    .optional()
    .or(z.literal("")),
  direccion: z
    .string()
    .max(200, "La dirección es demasiado larga")
    .optional()
    .or(z.literal("")),
  color_primary: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color inválido")
    .default("#10b981"),
});

const productVariantSchema = z.object({
  nombre: z.string().min(1, "El nombre de variante es requerido"),
  precio: z.number().min(0, "El precio no puede ser negativo"),
});

const extraItemSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  precio: z.number(),
});

const extraGroupSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  requerido: z.boolean(),
  multiple: z.boolean(),
  items: z.array(extraItemSchema),
});

const productConfigSchema = z.object({
  variantes: z.array(productVariantSchema).default([]),
  grupos_opciones: z.array(extraGroupSchema).default([]),
});

export const upsertProductSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre del producto es requerido")
    .max(200, "El nombre es demasiado largo"),
  descripcion: z.string().nullable().optional(),
  precio: z.number().min(0, "El precio no puede ser negativo"),
  imagen_url: z.string().nullable().optional(),
  categoria_id: z.string().nullable().optional(),
  disponible: z.boolean(),
  configuracion: productConfigSchema,
});

const discountTypeSchema = z.enum(["porcentaje", "monto_fijo", "combo"]);

export const comboItemSchema = z.object({
  producto_id: z.string().min(1, "Producto requerido"),
  nombre_producto: z.string().min(1, "Nombre del producto requerido"),
  cantidad: z.number().int().positive("La cantidad debe ser positiva"),
  precio: z.number().min(0, "Precio no puede ser negativo"),
});

export const upsertPromoSchema = z
  .object({
    nombre: z
      .string()
      .min(1, "El nombre de la promo es requerido")
      .max(100, "El nombre es demasiado largo"),
    descripcion: z.string().max(300, "La descripción es demasiado larga").nullable().optional(),
    tipo_descuento: discountTypeSchema,
    valor_descuento: z
      .number()
      .min(0, "El valor no puede ser negativo")
      .max(999999, "El valor es demasiado alto"),
    codigo: z
      .string()
      .max(30, "El código es demasiado largo")
      .regex(/^[A-Za-z0-9_-]+$/, "Solo letras, números, guiones y guión bajo")
      .nullable()
      .optional(),
    activo: z.boolean().default(true),
    items_combo: z.array(comboItemSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.tipo_descuento === "porcentaje") {
      if (data.valor_descuento <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["valor_descuento"],
          message: "El porcentaje debe ser mayor a 0",
        });
      }
      if (data.valor_descuento > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["valor_descuento"],
          message: "El porcentaje no puede ser mayor a 100",
        });
      }
    }
    if (
      (data.tipo_descuento === "monto_fijo" || data.tipo_descuento === "combo") &&
      data.valor_descuento <= 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["valor_descuento"],
        message: "El valor debe ser mayor a 0",
      });
    }
  });

export const orderStatusSchema = z.enum([
  "pendiente",
  "en_preparacion",
  "entregado",
  "cancelado",
]);

export const updateOrderStatusSchema = z.object({
  pedidoId: z.string().min(1, "ID de pedido requerido"),
  nuevoEstado: orderStatusSchema,
});

export const submitOrderSchema = z.object({
  negocio_id: z.string().min(1),
  cliente_nombre: z.string().min(1, "El nombre del cliente es requerido"),
  cliente_whatsapp: z.string().min(1, "El WhatsApp es requerido"),
  es_delivery: z.boolean(),
  direccion_entrega: z.string().nullable().optional(),
  metodo_pago: z.enum(["efectivo", "transferencia"]),
  notas: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        producto_id: z.string().min(1),
        cantidad: z.number().int().positive("La cantidad debe ser positiva"),
        detalles: z.string().nullable().optional(),
      }),
    )
    .min(1, "Debe haber al menos un item"),
});
