CREATE TYPE "ResourceAssignmentStatus" AS ENUM ('ACTIVE', 'RETURNED', 'CANCELLED');

CREATE TABLE "ResourceAssignment" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    "status" "ResourceAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceAssignment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ResourceAssignment_resourceId_idx" ON "ResourceAssignment"("resourceId");
CREATE INDEX "ResourceAssignment_userId_idx" ON "ResourceAssignment"("userId");
CREATE INDEX "ResourceAssignment_status_idx" ON "ResourceAssignment"("status");
CREATE INDEX "ResourceAssignment_assignedAt_idx" ON "ResourceAssignment"("assignedAt");
CREATE UNIQUE INDEX "ResourceAssignment_resourceId_active_key" ON "ResourceAssignment"("resourceId") WHERE "status" = 'ACTIVE';

ALTER TABLE "ResourceAssignment" ADD CONSTRAINT "ResourceAssignment_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResourceAssignment" ADD CONSTRAINT "ResourceAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
