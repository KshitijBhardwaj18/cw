-- =============================================================================
-- Placement: drop redundant FKs (requisition / candidate / vendor via submission)
-- =============================================================================
ALTER TABLE "placement" DROP CONSTRAINT "placement_requisitionId_fkey";
ALTER TABLE "placement" DROP CONSTRAINT "placement_candidateId_fkey";
ALTER TABLE "placement" DROP CONSTRAINT "placement_vendorId_fkey";

DROP INDEX "placement_requisitionId_idx";
DROP INDEX "placement_candidateId_idx";
DROP INDEX "placement_vendorId_idx";

ALTER TABLE "placement"
  DROP COLUMN "requisitionId",
  DROP COLUMN "candidateId",
  DROP COLUMN "vendorId";

-- =============================================================================
-- Remove unused legacy tables (compliance_items / scopes)
-- =============================================================================
DROP TABLE "compliance_item_scopes";

ALTER TABLE "compliance_items" DROP CONSTRAINT "compliance_items_organizationId_fkey";
ALTER TABLE "compliance_items" DROP CONSTRAINT "compliance_items_createdById_fkey";
ALTER TABLE "compliance_items" DROP CONSTRAINT "compliance_items_updatedById_fkey";
DROP TABLE "compliance_items";

-- =============================================================================
-- candidate_compliance: link to compliance_list_item, drop redundant columns
-- =============================================================================
ALTER TABLE "candidate_compliance" ADD COLUMN "complianceListItemId" UUID;

DELETE FROM "candidate_compliance" WHERE "complianceListItemId" IS NULL;

ALTER TABLE "candidate_compliance" ALTER COLUMN "complianceListItemId" SET NOT NULL;

ALTER TABLE "candidate_compliance" ADD CONSTRAINT "candidate_compliance_complianceListItemId_fkey"
  FOREIGN KEY ("complianceListItemId") REFERENCES "compliance_list_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "candidate_compliance_complianceListItemId_idx" ON "candidate_compliance"("complianceListItemId");

ALTER TABLE "candidate_compliance"
  DROP COLUMN "documentName",
  DROP COLUMN "category";

ALTER TABLE "candidate_compliance"
  ADD CONSTRAINT "candidate_compliance_candidateId_complianceListItemId_key"
  UNIQUE ("candidateId", "complianceListItemId");

DROP INDEX IF EXISTS "candidate_compliance_category_idx";

-- =============================================================================
-- placement_compliance_items: slim to placement + list item + flags only
-- =============================================================================
ALTER TABLE "placement_compliance_items"
  DROP COLUMN "status",
  DROP COLUMN "completionDate",
  DROP COLUMN "expiryDate",
  DROP COLUMN "swappedFromItemId";

DROP INDEX IF EXISTS "placement_compliance_items_status_idx";

ALTER TABLE "placement_compliance_items"
  RENAME COLUMN "complianceItemId" TO "complianceListItemId";

DROP TYPE IF EXISTS "PlacementComplianceStatus";
DROP TYPE IF EXISTS "CandidateComplianceDocCategory";
