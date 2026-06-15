import { z } from "zod";

export const orderFormSchema = z
  .object({
    nombre: z
      .string()
      .min(1, "El nombre es obligatorio")
      .max(100, "El nombre es demasiado largo"),
    whatsapp: z
      .string()
      .min(1, "El WhatsApp es obligatorio")
      .max(30, "WhatsApp demasiado largo"),
    esDelivery: z.boolean(),
    direccion: z.string().default(""),
    metodoPago: z.enum(["efectivo", "transferencia"]),
    notas: z
      .string()
      .max(500, "Las notas no pueden superar 500 caracteres")
      .default(""),
  })
  .superRefine((data, ctx) => {
    if (data.esDelivery && !data.direccion.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La dirección de envío es obligatoria",
        path: ["direccion"],
      });
    }
  });

export function sanitize(v: string): string {
  return v.trim().replace(/\s+/g, " ").normalize("NFC");
}

export function sanitizePhone(v: string): string {
  return v.trim().replace(/\s+/g, "");
}

export type OrderFormValues = z.infer<typeof orderFormSchema>;
