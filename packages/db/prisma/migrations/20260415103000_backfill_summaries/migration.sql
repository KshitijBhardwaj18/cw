-- Backfill candidate_summary, placement_summary, and timekeeping_summary
-- with baseline data from existing tables.

-- 1) CandidateSummary: one row per candidate with basic identity fields.
INSERT INTO "candidate_summary" (
  "candidateId",
  "organizationId",
  "vendorId",
  "occupationId",
  "primarySpecialtyId",
  "totalSpecialties",
  "totalPreferredLocations",
  "hasResume",
  "hasAvatar",
  "hasCompletedProfile",
  "isSubmissionReady",
  "totalComplianceItems",
  "completedComplianceItems",
  "missingComplianceItems",
  "expiredComplianceItems",
  "expiringSoonComplianceItems",
  "nextComplianceExpiryDate",
  "lastComplianceUpdatedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  c."id" AS "candidateId",
  c."organizationId",
  c."vendorId",
  c."occupationId",
  NULL::UUID AS "primarySpecialtyId",
  0 AS "totalSpecialties",
  0 AS "totalPreferredLocations",
  (c."resumeUrl" IS NOT NULL) AS "hasResume",
  (c."avatarUrl" IS NOT NULL) AS "hasAvatar",
  FALSE AS "hasCompletedProfile",
  FALSE AS "isSubmissionReady",
  0 AS "totalComplianceItems",
  0 AS "completedComplianceItems",
  0 AS "missingComplianceItems",
  0 AS "expiredComplianceItems",
  0 AS "expiringSoonComplianceItems",
  NULL::TIMESTAMP(3) AS "nextComplianceExpiryDate",
  NULL::TIMESTAMP(3) AS "lastComplianceUpdatedAt",
  NOW() AS "createdAt",
  NOW() AS "updatedAt"
FROM "candidate" c
ON CONFLICT ("candidateId") DO NOTHING;


-- 2) PlacementSummary: one row per placement with existing compliance snapshot.
INSERT INTO "placement_summary" (
  "placementId",
  "organizationId",
  "vendorId",
  "candidateId",
  "requisitionId",
  "status",
  "complianceStatus",
  "complianceProgressCompleted",
  "complianceProgressTotal",
  "missingItemsCount",
  "expiredItemsCount",
  "expiringSoonItemsCount",
  "nextComplianceExpiryDate",
  "lastComplianceUpdatedAt",
  "latestTimecardStatus",
  "totalApprovedHours",
  "lastTimeEntryDate",
  "createdAt",
  "updatedAt"
)
SELECT
  p."id" AS "placementId",
  p."organizationId",
  p."vendorId",
  p."candidateId",
  p."requisitionId",
  p."status",
  p."complianceStatus",
  p."complianceProgressCompleted",
  p."complianceProgressTotal",
  0 AS "missingItemsCount",
  0 AS "expiredItemsCount",
  0 AS "expiringSoonItemsCount",
  NULL::TIMESTAMP(3) AS "nextComplianceExpiryDate",
  NULL::TIMESTAMP(3) AS "lastComplianceUpdatedAt",
  NULL::"TimesheetEntryStatus" AS "latestTimecardStatus",
  NULL::DOUBLE PRECISION AS "totalApprovedHours",
  NULL::TIMESTAMP(3) AS "lastTimeEntryDate",
  NOW() AS "createdAt",
  NOW() AS "updatedAt"
FROM "placement" p
ON CONFLICT ("placementId") DO NOTHING;


-- 3) TimekeepingSummary: seed org/week rows with simple aggregates.
-- Vendor/location/department-level breakdowns can be refined later.
INSERT INTO "timekeeping_summary" (
  "id",
  "organizationId",
  "vendorId",
  "weekEndingDate",
  "locationId",
  "departmentId",
  "totalHours",
  "regularHours",
  "overtimeHours",
  "totalTimesheets",
  "submittedTimesheets",
  "approvedTimesheets",
  "openDisputes",
  "resolvedDisputes",
  "missingTimeCasesOpen",
  "missingTimeCasesResolved",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid() AS "id",
  t."organizationId",
  NULL::UUID AS "vendorId",
  t."weekEndingDate",
  NULL::UUID AS "locationId",
  NULL::UUID AS "departmentId",
  COALESCE(SUM(e."hours"), 0) AS "totalHours",
  COALESCE(SUM(e."regularHours"), 0) AS "regularHours",
  COALESCE(SUM(e."overtimeHours"), 0) AS "overtimeHours",
  COUNT(DISTINCT t."id") AS "totalTimesheets",
  0 AS "submittedTimesheets",
  0 AS "approvedTimesheets",
  0 AS "openDisputes",
  0 AS "resolvedDisputes",
  0 AS "missingTimeCasesOpen",
  0 AS "missingTimeCasesResolved",
  NOW() AS "createdAt",
  NOW() AS "updatedAt"
FROM "timesheet" t
LEFT JOIN "timesheet_entry" e ON e."timesheetId" = t."id"
GROUP BY t."organizationId", t."weekEndingDate"
ON CONFLICT DO NOTHING;

