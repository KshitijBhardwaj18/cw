-- Summary schema changes: candidate/placement/timekeeping summaries,
-- placement vendor denorm, per-diem indexes, and invoice cleanup.

-- 1) Candidate summary table
CREATE TABLE "candidate_summary" (
    "candidateId" UUID NOT NULL,
    "organizationId" UUID,
    "vendorId" UUID,
    "occupationId" UUID NOT NULL,
    "primarySpecialtyId" UUID,
    "totalSpecialties" INTEGER NOT NULL DEFAULT 0,
    "totalPreferredLocations" INTEGER NOT NULL DEFAULT 0,
    "hasResume" BOOLEAN NOT NULL DEFAULT FALSE,
    "hasAvatar" BOOLEAN NOT NULL DEFAULT FALSE,
    "hasCompletedProfile" BOOLEAN NOT NULL DEFAULT FALSE,
    "isSubmissionReady" BOOLEAN NOT NULL DEFAULT FALSE,
    "totalComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "completedComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "missingComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "expiredComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "expiringSoonComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "nextComplianceExpiryDate" TIMESTAMP(3),
    "lastComplianceUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_summary_pkey" PRIMARY KEY ("candidateId")
);

CREATE INDEX "candidate_summary_organizationId_idx" ON "candidate_summary"("organizationId");
CREATE INDEX "candidate_summary_vendorId_idx" ON "candidate_summary"("vendorId");
CREATE INDEX "candidate_summary_occupationId_idx" ON "candidate_summary"("occupationId");

ALTER TABLE "candidate_summary" ADD CONSTRAINT "candidate_summary_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "candidate_summary" ADD CONSTRAINT "candidate_summary_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "candidate_summary" ADD CONSTRAINT "candidate_summary_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "candidate_summary" ADD CONSTRAINT "candidate_summary_occupationId_fkey"
  FOREIGN KEY ("occupationId") REFERENCES "occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "candidate_summary" ADD CONSTRAINT "candidate_summary_primarySpecialtyId_fkey"
  FOREIGN KEY ("primarySpecialtyId") REFERENCES "specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- 2) OrganizationSpecialty: change uniqueness from (organizationId, specialtyId)
--    to (organizationOccupationId, specialtyId)
ALTER TABLE "organization_specialty"
  DROP CONSTRAINT IF EXISTS "organization_specialty_organizationId_specialtyId_key";

ALTER TABLE "organization_specialty"
  ADD CONSTRAINT "organization_specialty_organizationOccupationId_specialtyId_key"
  UNIQUE ("organizationOccupationId", "specialtyId");


-- 3) Placement: denormalize vendorId and add indexes
ALTER TABLE "placement"
  ADD COLUMN IF NOT EXISTS "vendorId" UUID;

ALTER TABLE "placement" ADD CONSTRAINT "placement_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "placement_vendorId_idx" ON "placement"("vendorId");
CREATE INDEX IF NOT EXISTS "placement_organizationId_vendorId_status_idx"
  ON "placement"("organizationId","vendorId","status");


-- 4) Placement summary table
CREATE TABLE "placement_summary" (
    "placementId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "vendorId" UUID,
    "candidateId" UUID NOT NULL,
    "requisitionId" UUID NOT NULL,
    "status" "PlacementStatus" NOT NULL,
    "complianceStatus" "PlacementComplianceStatus" NOT NULL,
    "complianceProgressCompleted" INTEGER NOT NULL DEFAULT 0,
    "complianceProgressTotal" INTEGER NOT NULL DEFAULT 0,
    "missingItemsCount" INTEGER NOT NULL DEFAULT 0,
    "expiredItemsCount" INTEGER NOT NULL DEFAULT 0,
    "expiringSoonItemsCount" INTEGER NOT NULL DEFAULT 0,
    "nextComplianceExpiryDate" TIMESTAMP(3),
    "lastComplianceUpdatedAt" TIMESTAMP(3),
    "latestTimecardStatus" "TimesheetEntryStatus",
    "totalApprovedHours" DOUBLE PRECISION,
    "lastTimeEntryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "placement_summary_pkey" PRIMARY KEY ("placementId")
);

CREATE INDEX "placement_summary_org_status_compliance_idx"
  ON "placement_summary"("organizationId","status","complianceStatus");

CREATE INDEX "placement_summary_org_vendor_status_idx"
  ON "placement_summary"("organizationId","vendorId","status");

ALTER TABLE "placement_summary" ADD CONSTRAINT "placement_summary_placementId_fkey"
  FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "placement_summary" ADD CONSTRAINT "placement_summary_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "placement_summary" ADD CONSTRAINT "placement_summary_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "placement_summary" ADD CONSTRAINT "placement_summary_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "placement_summary" ADD CONSTRAINT "placement_summary_requisitionId_fkey"
  FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- 5) Timekeeping summary table
CREATE TABLE "timekeeping_summary" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "vendorId" UUID,
    "weekEndingDate" TIMESTAMP(3) NOT NULL,
    "locationId" UUID,
    "departmentId" UUID,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "regularHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTimesheets" INTEGER NOT NULL DEFAULT 0,
    "submittedTimesheets" INTEGER NOT NULL DEFAULT 0,
    "approvedTimesheets" INTEGER NOT NULL DEFAULT 0,
    "openDisputes" INTEGER NOT NULL DEFAULT 0,
    "resolvedDisputes" INTEGER NOT NULL DEFAULT 0,
    "missingTimeCasesOpen" INTEGER NOT NULL DEFAULT 0,
    "missingTimeCasesResolved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timekeeping_summary_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "timekeeping_summary_org_week_idx"
  ON "timekeeping_summary"("organizationId","weekEndingDate");

CREATE INDEX "timekeeping_summary_org_vendor_week_idx"
  ON "timekeeping_summary"("organizationId","vendorId","weekEndingDate");

ALTER TABLE "timekeeping_summary" ADD CONSTRAINT "timekeeping_summary_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "timekeeping_summary" ADD CONSTRAINT "timekeeping_summary_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "timekeeping_summary" ADD CONSTRAINT "timekeeping_summary_locationId_fkey"
  FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "timekeeping_summary" ADD CONSTRAINT "timekeeping_summary_departmentId_fkey"
  FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- 6) Per-diem shifts: additional indexes for hot queries
CREATE INDEX IF NOT EXISTS "per_diem_shifts_org_status_shiftDate_idx"
  ON "per_diem_shifts"("organizationId","status","shiftDate");

CREATE INDEX IF NOT EXISTS "per_diem_shifts_org_shiftDate_startTime_idx"
  ON "per_diem_shifts"("organizationId","shiftDate","startTime");


-- 7) Per-diem assignments: uniqueness + indexes
ALTER TABLE "per_diem_assignments"
  ADD CONSTRAINT "per_diem_assignments_shiftId_candidateId_key"
  UNIQUE ("shiftId","candidateId");

CREATE INDEX IF NOT EXISTS "per_diem_assignments_candidate_status_assignedAt_idx"
  ON "per_diem_assignments"("candidateId","status","assignedAt");

CREATE INDEX IF NOT EXISTS "per_diem_assignments_shift_status_idx"
  ON "per_diem_assignments"("shiftId","status");


-- 8) Invoice: drop unused invoiceType column
ALTER TABLE "invoices"
  DROP COLUMN IF EXISTS "invoiceType";

