DROP INDEX IF EXISTS "placement_complianceStatus_idx";
DROP INDEX IF EXISTS "placement_organizationId_status_complianceStatus_idx";

ALTER TABLE "placement"
  DROP COLUMN IF EXISTS "complianceStatus",
  DROP COLUMN IF EXISTS "complianceProgressCompleted",
  DROP COLUMN IF EXISTS "complianceProgressTotal",
  DROP COLUMN IF EXISTS "complianceMissingItemsPreview";

