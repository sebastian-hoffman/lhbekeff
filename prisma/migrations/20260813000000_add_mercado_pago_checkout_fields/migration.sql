-- Add cached Mercado Pago checkout data to purchases so each checkout can be
-- generated once and reused.
ALTER TABLE "purchases"
ADD COLUMN IF NOT EXISTS "mercadoPagoPreferenceId" TEXT,
ADD COLUMN IF NOT EXISTS "mercadoPagoCheckoutUrl" TEXT;
