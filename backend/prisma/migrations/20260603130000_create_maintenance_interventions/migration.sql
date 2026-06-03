-- CreateTable
CREATE TABLE "MaintenanceIntervention" (
    "id" TEXT NOT NULL,
    "maintenanceTicketId" TEXT NOT NULL,
    "technicianName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "cost" DECIMAL(65,30),
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceIntervention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MaintenanceIntervention_maintenanceTicketId_idx" ON "MaintenanceIntervention"("maintenanceTicketId");

-- CreateIndex
CREATE INDEX "MaintenanceIntervention_startedAt_idx" ON "MaintenanceIntervention"("startedAt");

-- CreateIndex
CREATE INDEX "MaintenanceIntervention_completedAt_idx" ON "MaintenanceIntervention"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceIntervention_active_ticket_key" ON "MaintenanceIntervention"("maintenanceTicketId") WHERE "completedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "MaintenanceIntervention" ADD CONSTRAINT "MaintenanceIntervention_maintenanceTicketId_fkey" FOREIGN KEY ("maintenanceTicketId") REFERENCES "MaintenanceTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
