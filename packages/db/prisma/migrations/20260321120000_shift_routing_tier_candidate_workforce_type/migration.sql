-- ShiftRoutingTier.workforceType: WorkforceTypeCategory -> CandidateWorkforceType

DROP INDEX IF EXISTS "shift_routing_tiers_organizationId_workforceType_key";

ALTER TABLE "shift_routing_tiers" ALTER COLUMN "workforceType" DROP DEFAULT;

ALTER TABLE "shift_routing_tiers" ALTER COLUMN "workforceType" TYPE TEXT USING ("workforceType"::text);

UPDATE "shift_routing_tiers"
SET "workforceType" = CASE "workforceType"
  WHEN 'INTERNAL_STAFF' THEN 'INTERNAL_FULL_TIME'
  WHEN 'PER_DIEM' THEN 'INTERNAL_PRN'
  WHEN 'AGENCY_VENDOR' THEN 'EXTERNAL_VENDOR_LTO'
  WHEN 'TRAVEL_NURSES' THEN 'EXTERNAL_VENDOR_PER_DIEM'
  WHEN 'PREVIOUS_WORKERS' THEN 'INTERNAL_FULL_TIME'
  ELSE 'INTERNAL_FULL_TIME'
END;

ALTER TABLE "shift_routing_tiers"
ALTER COLUMN "workforceType" TYPE "CandidateWorkforceType" USING ("workforceType"::"CandidateWorkforceType");

CREATE UNIQUE INDEX "shift_routing_tiers_organizationId_workforceType_key" ON "shift_routing_tiers"("organizationId", "workforceType");

DROP TYPE "WorkforceTypeCategory";
