-- CreateEnum
CREATE TYPE "MaintenanceSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "MaintenanceReport" (
    "id" TEXT NOT NULL,
    "maintenanceTicketId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "probableCause" TEXT NOT NULL,
    "severity" "MaintenanceSeverity" NOT NULL,
    "recommendations" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceReport_maintenanceTicketId_key" ON "MaintenanceReport"("maintenanceTicketId");

-- CreateIndex
CREATE INDEX "MaintenanceReport_authorId_idx" ON "MaintenanceReport"("authorId");

-- CreateIndex
CREATE INDEX "MaintenanceReport_severity_idx" ON "MaintenanceReport"("severity");

-- CreateIndex
CREATE INDEX "MaintenanceReport_reportedAt_idx" ON "MaintenanceReport"("reportedAt");

-- AddForeignKey
ALTER TABLE "MaintenanceReport" ADD CONSTRAINT "MaintenanceReport_maintenanceTicketId_fkey" FOREIGN KEY ("maintenanceTicketId") REFERENCES "MaintenanceTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceReport" ADD CONSTRAINT "MaintenanceReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
