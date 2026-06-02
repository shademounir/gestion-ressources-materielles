CREATE TYPE "SupplierOfferStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'REJECTED', 'SELECTED', 'WITHDRAWN');

CREATE TABLE "SupplierOffer" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "proposedDeliveryDays" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "SupplierOfferStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierOffer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SupplierOffer_tenderId_supplierId_key" ON "SupplierOffer"("tenderId", "supplierId");
CREATE INDEX "SupplierOffer_tenderId_idx" ON "SupplierOffer"("tenderId");
CREATE INDEX "SupplierOffer_supplierId_idx" ON "SupplierOffer"("supplierId");
CREATE INDEX "SupplierOffer_status_idx" ON "SupplierOffer"("status");
CREATE INDEX "SupplierOffer_submittedAt_idx" ON "SupplierOffer"("submittedAt");

ALTER TABLE "SupplierOffer" ADD CONSTRAINT "SupplierOffer_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SupplierOffer" ADD CONSTRAINT "SupplierOffer_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
