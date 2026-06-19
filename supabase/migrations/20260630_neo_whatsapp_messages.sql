-- Migration: Add whatsapp_messages column for customizable notification templates
-- Description: Stores custom WhatsApp message templates per business

ALTER TABLE public.negocios
ADD COLUMN IF NOT EXISTS whatsapp_mensajes JSONB DEFAULT NULL;

COMMENT ON COLUMN public.negocios.whatsapp_mensajes IS 'Custom WhatsApp message templates for order status notifications. Expected shape: { en_preparacion?: string, entregado?: string, cancelado?: string }';
