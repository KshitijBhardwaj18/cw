DO $$ BEGIN
  ALTER TYPE "PlacementRequiredItemSource" RENAME TO "PlacementComplianceItemSource";
EXCEPTION
  WHEN undefined_object THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "placement_compliance_items"
  ADD COLUMN IF NOT EXISTS "source" "PlacementComplianceItemSource" NOT NULL DEFAULT 'PLACEMENT_EXTRA';

UPDATE "placement_compliance_items" pci
SET "source" = pri."source"
FROM "placement_required_items" pri
WHERE pci."placementId" = pri."placementId"
  AND pci."complianceListItemId" = pri."complianceListItemId";

INSERT INTO "placement_compliance_items" (
  "id",
  "placementId",
  "complianceListItemId",
  "source",
  "isRequired",
  "removedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid(),
  pri."placementId",
  pri."complianceListItemId",
  pri."source",
  true,
  NULL,
  NOW(),
  NOW()
FROM "placement_required_items" pri
WHERE NOT EXISTS (
  SELECT 1
  FROM "placement_compliance_items" pci2
  WHERE pci2."placementId" = pri."placementId"
    AND pci2."complianceListItemId" = pri."complianceListItemId"
);

DROP TABLE IF EXISTS "placement_required_items";

ALTER TABLE "placement"
  ADD COLUMN IF NOT EXISTS "complianceProgressCompleted" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "complianceProgressTotal" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "complianceMissingItemsPreview" TEXT;

UPDATE "placement" p
SET
  "complianceProgressTotal" = COALESCE(
    (
      SELECT COUNT(*)::INTEGER
      FROM "placement_compliance_items" pci
      WHERE pci."placementId" = p.id
        AND pci."removedAt" IS NULL
    ),
    0
  ),
  "complianceProgressCompleted" = COALESCE(
    (
      SELECT COUNT(*)::INTEGER
      FROM "placement_compliance_items" pci
      INNER JOIN "candidate_compliance" cc
        ON cc."candidateId" = p."candidateId"
        AND cc."complianceListItemId" = pci."complianceListItemId"
      WHERE pci."placementId" = p.id
        AND pci."removedAt" IS NULL
        AND cc.status = 'APPROVED'
        AND (cc."expiryDate" IS NULL OR cc."expiryDate" > NOW())
    ),
    0
  );
