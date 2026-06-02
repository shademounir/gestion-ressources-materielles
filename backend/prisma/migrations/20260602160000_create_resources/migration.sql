CREATE TYPE "ResourceStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'ARCHIVED');

CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inventoryCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "serialNumber" TEXT,
    "acquisitionDate" TIMESTAMP(3),
    "acquisitionValue" DECIMAL(65,30),
    "status" "ResourceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "supplierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Resource_inventoryCode_key" ON "Resource"("inventoryCode");
CREATE INDEX "Resource_inventoryCode_idx" ON "Resource"("inventoryCode");
CREATE INDEX "Resource_category_idx" ON "Resource"("category");
CREATE INDEX "Resource_status_idx" ON "Resource"("status");
CREATE INDEX "Resource_supplierId_idx" ON "Resource"("supplierId");
CREATE INDEX "Resource_createdAt_idx" ON "Resource"("createdAt");

ALTER TABLE "Resource" ADD CONSTRAINT "Resource_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
