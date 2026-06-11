-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
  'RESOURCE_ASSIGNED',
  'RESOURCE_RETURNED',
  'MAINTENANCE_REPORTED',
  'MAINTENANCE_REPORT_CREATED',
  'MAINTENANCE_INTERVENTION_CREATED',
  'SUPPLIER_RETURN_CREATED'
);

-- CreateEnum
CREATE TYPE "NotificationEntityType" AS ENUM (
  'RESOURCE',
  'RESOURCE_ASSIGNMENT',
  'MAINTENANCE_TICKET',
  'MAINTENANCE_REPORT',
  'MAINTENANCE_INTERVENTION',
  'SUPPLIER_RETURN'
);

-- CreateTable
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "recipientId" TEXT,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "entityType" "NotificationEntityType" NOT NULL,
  "entityId" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_entityType_entityId_idx" ON "Notification"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Notification_readAt_idx" ON "Notification"("readAt");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_recipientId_fkey"
FOREIGN KEY ("recipientId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
