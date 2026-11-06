CREATE TABLE "purchase_items" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "purchase_items_quantity_check" CHECK ("quantity" > 0),
    CONSTRAINT "purchase_items_price_check" CHECK ("unitPriceCents" >= 0 AND "subtotalCents" = "unitPriceCents" * "quantity")
);

CREATE INDEX "purchase_items_purchaseId_idx" ON "purchase_items"("purchaseId");
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;