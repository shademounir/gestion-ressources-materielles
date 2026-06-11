-- CreateEnum
CREATE TYPE "SupplierReturnStatus" AS ENUM ('SENT_TO_SUPPLIER', 'IN_REPAIR', 'RETURNED', 'CANCELLED');

-- CreateTable
CREATE TABLE "SupplierReturn" (
    "id" TEXT NOT NULL,
    "maintenanceTicketId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "expectedReturnAt" TIMESTAMP(3),
    "actualReturnAt" TIMESTAMP(3),
    "status" "SupplierReturnStatus" NOT NULL DEFAULT 'SENT_TO_SUPPLIER',
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierReturn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupplierReturn_maintenanceTicketId_idx" ON "SupplierReturn"("maintenanceTicketId");

-- CreateIndex
CREATE INDEX "SupplierReturn_resourceId_idx" ON "SupplierReturn"("resourceId");

-- CreateIndex
CREATE INDEX "SupplierReturn_supplierId_idx" ON "SupplierReturn"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierReturn_status_idx" ON "SupplierReturn"("status");

-- CreateIndex
CREATE INDEX "SupplierReturn_sentAt_idx" ON "SupplierReturn"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierReturn_active_ticket_key" ON "SupplierReturn"("maintenanceTicketId") WHERE "status" IN ('SENT_TO_SUPPLIER', 'IN_REPAIR');

-- AddForeignKey
ALTER TABLE "SupplierReturn" ADD CONSTRAINT "SupplierReturn_maintenanceTicketId_fkey" FOREIGN KEY ("maintenanceTicketId") REFERENCES "MaintenanceTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierReturn" ADD CONSTRAINT "SupplierReturn_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierReturn" ADD CONSTRAINT "SupplierReturn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
