CREATE TYPE "ProductDeliveryStatus" AS ENUM ('PENDING', 'DELIVERED');

ALTER TABLE "purchases"
ADD COLUMN "deliveryStatus" "ProductDeliveryStatus" NOT NULL DEFAULT 'PENDING';