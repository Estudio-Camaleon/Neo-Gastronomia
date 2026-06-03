import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("El correo no tiene un formato válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir una mayúscula")
    .regex(/[0-9]/, "Debe incluir un número")
    .regex(/[^A-Za-z0-9]/, "Debe incluir un símbolo especial"),
  businessName: z.string().min(2, "Nombre de negocio muy corto"),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
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
  total: z.number().min(0, "El total no puede ser negativo"),
  items: z
    .array(
      z.object({
        producto_id: z.string().min(1),
        nombre_producto: z.string().min(1),
        cantidad: z.number().int().positive("La cantidad debe ser positiva"),
        precio_unitario: z.number().min(0),
        detalles: z.string().nullable().optional(),
      }),
    )
    .min(1, "Debe haber al menos un item"),
});
