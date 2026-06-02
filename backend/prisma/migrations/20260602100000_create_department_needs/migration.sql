CREATE TYPE "NeedStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CONVERTED_TO_TENDER', 'CANCELLED');

CREATE TYPE "NeedPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TABLE "Need" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "priority" "NeedPriority" NOT NULL,
    "status" "NeedStatus" NOT NULL DEFAULT 'SUBMITTED',
    "departmentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Need_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NeedItem" (
    "id" TEXT NOT NULL,
    "needId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "estimatedUnitPrice" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeedItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Need_departmentId_idx" ON "Need"("departmentId");
CREATE INDEX "Need_createdById_idx" ON "Need"("createdById");
CREATE INDEX "Need_status_idx" ON "Need"("status");
CREATE INDEX "Need_priority_idx" ON "Need"("priority");
CREATE INDEX "Need_createdAt_idx" ON "Need"("createdAt");
CREATE INDEX "NeedItem_needId_idx" ON "NeedItem"("needId");

ALTER TABLE "Need" ADD CONSTRAINT "Need_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Need" ADD CONSTRAINT "Need_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NeedItem" ADD CONSTRAINT "NeedItem_needId_fkey" FOREIGN KEY ("needId") REFERENCES "Need"("id") ON DELETE CASCADE ON UPDATE CASCADE;
