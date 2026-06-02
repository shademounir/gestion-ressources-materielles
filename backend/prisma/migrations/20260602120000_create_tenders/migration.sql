CREATE TYPE "TenderStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'AWARDED', 'CANCELLED', 'ARCHIVED');

CREATE TABLE "Tender" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TenderStatus" NOT NULL DEFAULT 'DRAFT',
    "deadline" TIMESTAMP(3) NOT NULL,
    "needId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tender_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tender_reference_key" ON "Tender"("reference");
CREATE INDEX "Tender_needId_idx" ON "Tender"("needId");
CREATE INDEX "Tender_createdById_idx" ON "Tender"("createdById");
CREATE INDEX "Tender_status_idx" ON "Tender"("status");
CREATE INDEX "Tender_deadline_idx" ON "Tender"("deadline");

ALTER TABLE "Tender" ADD CONSTRAINT "Tender_needId_fkey" FOREIGN KEY ("needId") REFERENCES "Need"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
