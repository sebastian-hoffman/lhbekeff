-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('ADULT', 'MINOR', 'FREE');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "logoUrl" TEXT,
    "mercadoPagoLink" TEXT NOT NULL,
    "adultPriceCents" INTEGER NOT NULL,
    "minorPriceCents" INTEGER NOT NULL,
    "freePriceCents" INTEGER NOT NULL DEFAULT 0,
    "voluntaryAmountsCents" INTEGER[] DEFAULT ARRAY[500000, 1000000, 2000000]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "adultQty" INTEGER NOT NULL,
    "minorQty" INTEGER NOT NULL,
    "freeQty" INTEGER NOT NULL,
    "adultUnitPriceCents" INTEGER NOT NULL,
    "minorUnitPriceCents" INTEGER NOT NULL,
    "freeUnitPriceCents" INTEGER NOT NULL,
    "adultSubtotalCents" INTEGER NOT NULL,
    "minorSubtotalCents" INTEGER NOT NULL,
    "freeSubtotalCents" INTEGER NOT NULL,
    "voluntaryContributionCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "receiptUrl" TEXT,
    "receiptMimeType" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL,
    "attendeeName" TEXT NOT NULL,
    "number" TEXT,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_sequences" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ticket_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_code_key" ON "purchases"("code");

-- CreateIndex
CREATE INDEX "purchases_eventId_status_idx" ON "purchases"("eventId", "status");

-- CreateIndex
CREATE INDEX "purchases_buyerEmail_idx" ON "purchases"("buyerEmail");

-- CreateIndex
CREATE INDEX "tickets_purchaseId_idx" ON "tickets"("purchaseId");

-- CreateIndex
CREATE INDEX "tickets_number_idx" ON "tickets"("number");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_eventId_category_number_key" ON "tickets"("eventId", "category", "number");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_sequences_eventId_category_key" ON "ticket_sequences"("eventId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_sequences" ADD CONSTRAINT "ticket_sequences_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
