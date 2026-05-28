-- 1. New join table
CREATE TABLE "requisition_specialty" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "requisitionId" UUID NOT NULL,
  "organizationSpecialtyId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "requisition_specialty_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "requisition_specialty_requisitionId_organizationSpecialty_key"
  ON "requisition_specialty"("requisitionId", "organizationSpecialtyId");

CREATE INDEX "requisition_specialty_requisitionId_idx"
  ON "requisition_specialty"("requisitionId");

CREATE INDEX "requisition_specialty_organizationSpecialtyId_idx"
  ON "requisition_specialty"("organizationSpecialtyId");

ALTER TABLE "requisition_specialty"
  ADD CONSTRAINT "requisition_specialty_requisitionId_fkey"
  FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "requisition_specialty"
  ADD CONSTRAINT "requisition_specialty_organizationSpecialtyId_fkey"
  FOREIGN KEY ("organizationSpecialtyId") REFERENCES "organization_specialty"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Backfill: copy existing single-specialty link into the join table
INSERT INTO "requisition_specialty" ("id", "requisitionId", "organizationSpecialtyId", "createdAt")
SELECT
  gen_random_uuid(),
  "id",
  "organizationSpecialtyId",
  NOW()
FROM "requisition"
WHERE "organizationSpecialtyId" IS NOT NULL;

-- 3. Drop the old singular column + its index/FK
DROP INDEX IF EXISTS "requisition_organizationSpecialtyId_idx";

ALTER TABLE "requisition"
  DROP CONSTRAINT IF EXISTS "requisition_organizationSpecialtyId_fkey";

ALTER TABLE "requisition"
  DROP COLUMN IF EXISTS "organizationSpecialtyId";
