-- 1. New join table
CREATE TABLE "requisition_template_specialty" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "templateId" UUID NOT NULL,
  "organizationSpecialtyId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "requisition_template_specialty_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "requisition_template_specialty_templateId_organizationSpec_key"
  ON "requisition_template_specialty"("templateId", "organizationSpecialtyId");

CREATE INDEX "requisition_template_specialty_templateId_idx"
  ON "requisition_template_specialty"("templateId");

CREATE INDEX "requisition_template_specialty_organizationSpecialtyId_idx"
  ON "requisition_template_specialty"("organizationSpecialtyId");

ALTER TABLE "requisition_template_specialty"
  ADD CONSTRAINT "requisition_template_specialty_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "requisition_template"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "requisition_template_specialty"
  ADD CONSTRAINT "requisition_template_specialty_organizationSpecialtyId_fkey"
  FOREIGN KEY ("organizationSpecialtyId") REFERENCES "organization_specialty"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Backfill: copy every existing single-specialty link into the join table
INSERT INTO "requisition_template_specialty" ("id", "templateId", "organizationSpecialtyId", "createdAt")
SELECT
  gen_random_uuid(),
  "id",
  "organizationSpecialtyId",
  NOW()
FROM "requisition_template"
WHERE "organizationSpecialtyId" IS NOT NULL;

-- 3. Drop the old singular column + its index/FK
DROP INDEX IF EXISTS "requisition_template_organizationSpecialtyId_idx";

ALTER TABLE "requisition_template"
  DROP CONSTRAINT IF EXISTS "requisition_template_organizationSpecialtyId_fkey";

ALTER TABLE "requisition_template"
  DROP COLUMN IF EXISTS "organizationSpecialtyId";
