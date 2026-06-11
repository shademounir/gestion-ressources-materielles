-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM (
  'RESOURCE_CREATED',
  'RESOURCE_STATUS_UPDATED',
  'RESOURCE_ASSIGNED',
  'RESOURCE_RETURNED',
  'MAINTENANCE_REPORTED',
  'MAINTENANCE_REPORT_CREATED',
  'MAINTENANCE_INTERVENTION_CREATED',
  'SUPPLIER_RETURN_CREATED',
  'USER_CREATED',
  'USER_ROLE_UPDATED',
  'USER_DEACTIVATED'
);

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM (
  'RESOURCE',
  'RESOURCE_ASSIGNMENT',
  'MAINTENANCE_TICKET',
  'MAINTENANCE_REPORT',
  'MAINTENANCE_INTERVENTION',
  'SUPPLIER_RETURN',
  'USER'
);

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorId_fkey";

-- DropIndex
DROP INDEX "AuditLog_actorId_idx";

-- DropIndex
DROP INDEX "AuditLog_targetType_targetId_idx";

-- AlterTable
ALTER TABLE "AuditLog" RENAME COLUMN "actorId" TO "userId";
ALTER TABLE "AuditLog" RENAME COLUMN "targetId" TO "entityId";
ALTER TABLE "AuditLog" RENAME COLUMN "metadata" TO "details";
ALTER TABLE "AuditLog" DROP COLUMN "action";
ALTER TABLE "AuditLog" DROP COLUMN "targetType";
ALTER TABLE "AuditLog" ADD COLUMN "action" "AuditAction" NOT NULL DEFAULT 'RESOURCE_CREATED';
ALTER TABLE "AuditLog" ADD COLUMN "entityType" "AuditEntityType" NOT NULL DEFAULT 'RESOURCE';
UPDATE "AuditLog" SET "entityId" = 'unknown' WHERE "entityId" IS NULL;
ALTER TABLE "AuditLog" ALTER COLUMN "entityId" SET NOT NULL;
ALTER TABLE "AuditLog" ALTER COLUMN "action" DROP DEFAULT;
ALTER TABLE "AuditLog" ALTER COLUMN "entityType" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
