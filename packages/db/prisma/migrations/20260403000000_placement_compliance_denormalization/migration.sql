DO $$ BEGIN
  CREATE TYPE "PlacementComplianceStatus" AS ENUM ('COMPLETE', 'IN_PROGRESS', 'MISSING');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE "PlacementRequiredItemSource" AS ENUM ('REQUISITION', 'PLACEMENT_EXTRA');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "placement"
  ADD COLUMN IF NOT EXISTS "candidateId" UUID,
  ADD COLUMN IF NOT EXISTS "requisitionId" UUID;

UPDATE "placement" p
SET
  "candidateId"   = s."candidateId",
  "requisitionId" = s."requisitionId"
FROM "submission" s
WHERE p."submissionId" = s.id
  AND (p."candidateId" IS NULL OR p."requisitionId" IS NULL);

ALTER TABLE "placement"
  ALTER COLUMN "candidateId"   SET NOT NULL,
  ALTER COLUMN "requisitionId" SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE "placement"
    ADD CONSTRAINT "placement_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "candidate"(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "placement"
    ADD CONSTRAINT "placement_requisitionId_fkey"
      FOREIGN KEY ("requisitionId") REFERENCES "requisition"(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "placement_candidateId_idx" ON "placement"("candidateId");
CREATE INDEX IF NOT EXISTS "placement_requisitionId_idx" ON "placement"("requisitionId");

ALTER TABLE "placement"
  ADD COLUMN IF NOT EXISTS "complianceStatus" "PlacementComplianceStatus" NOT NULL DEFAULT 'MISSING';

CREATE INDEX IF NOT EXISTS "placement_complianceStatus_idx" ON "placement"("complianceStatus");
CREATE INDEX IF NOT EXISTS "placement_organizationId_status_complianceStatus_idx"
  ON "placement"("organizationId", "status", "complianceStatus");

CREATE TABLE IF NOT EXISTS "placement_required_items" (
  "placementId"          UUID                          NOT NULL,
  "complianceListItemId" UUID                          NOT NULL,
  "source"               "PlacementRequiredItemSource" NOT NULL,

  CONSTRAINT "placement_required_items_pkey"
    PRIMARY KEY ("placementId", "complianceListItemId"),
  CONSTRAINT "placement_required_items_placementId_fkey"
    FOREIGN KEY ("placementId") REFERENCES "placement"(id) ON DELETE CASCADE,
  CONSTRAINT "placement_required_items_complianceListItemId_fkey"
    FOREIGN KEY ("complianceListItemId") REFERENCES "compliance_list_item"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "placement_required_items_placementId_idx"
  ON "placement_required_items"("placementId");
CREATE INDEX IF NOT EXISTS "placement_required_items_complianceListItemId_idx"
  ON "placement_required_items"("complianceListItemId");

INSERT INTO "placement_required_items" ("placementId", "complianceListItemId", "source")
SELECT p.id, rac."complianceListItemId", 'REQUISITION'::"PlacementRequiredItemSource"
FROM "placement" p
JOIN "requisition_acceptance_criterion" rac ON rac."requisitionId" = p."requisitionId"
ON CONFLICT DO NOTHING;

INSERT INTO "placement_required_items" ("placementId", "complianceListItemId", "source")
SELECT pci."placementId", pci."complianceListItemId", 'PLACEMENT_EXTRA'::"PlacementRequiredItemSource"
FROM "placement_compliance_items" pci
WHERE pci."removedAt" IS NULL
ON CONFLICT DO NOTHING;

UPDATE "placement" p
SET "complianceStatus" = CASE
  WHEN (SELECT COUNT(*) FROM "placement_required_items" pri WHERE pri."placementId" = p.id) = 0
    THEN 'COMPLETE'::"PlacementComplianceStatus"
  WHEN (
    SELECT COUNT(*) FROM "placement_required_items" pri
    JOIN "candidate_compliance" cc
      ON cc."candidateId" = p."candidateId"
      AND cc."complianceListItemId" = pri."complianceListItemId"
      AND cc.status = 'APPROVED'
      AND (cc."expiryDate" IS NULL OR cc."expiryDate" > NOW())
    WHERE pri."placementId" = p.id
  ) >= (SELECT COUNT(*) FROM "placement_required_items" pri WHERE pri."placementId" = p.id)
    THEN 'COMPLETE'::"PlacementComplianceStatus"
  WHEN (
    SELECT COUNT(*) FROM "placement_required_items" pri
    JOIN "candidate_compliance" cc
      ON cc."candidateId" = p."candidateId"
      AND cc."complianceListItemId" = pri."complianceListItemId"
      AND cc.status = 'APPROVED'
      AND (cc."expiryDate" IS NULL OR cc."expiryDate" > NOW())
    WHERE pri."placementId" = p.id
  ) > 0
    THEN 'IN_PROGRESS'::"PlacementComplianceStatus"
  ELSE 'MISSING'::"PlacementComplianceStatus"
END;
