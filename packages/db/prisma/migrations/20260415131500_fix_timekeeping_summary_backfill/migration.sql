-- Ensure we have a stable logical key for org/week rollups
CREATE UNIQUE INDEX IF NOT EXISTS "timekeeping_summary_org_vendor_week_loc_dept_idx"
  ON "timekeeping_summary"("organizationId","vendorId","weekEndingDate","locationId","departmentId");

WITH entry_agg AS (
  SELECT
    t."organizationId",
    t."weekEndingDate",
    COUNT(e.*) AS "totalEntries",
    COUNT(*) FILTER (WHERE e."dataSource" = 'FILE_UPLOAD') AS "fileUploadEntries",
    COUNT(*) FILTER (WHERE e."dataSource" = 'MOBILE_APP') AS "mobileAppEntries",
    COALESCE(SUM(e."hours"), 0) AS "totalHours",
    COALESCE(SUM(e."regularHours"), 0) AS "regularHours",
    COALESCE(SUM(e."overtimeHours"), 0) AS "overtimeHours",
    COUNT(DISTINCT t."id") AS "totalTimesheets",
    COUNT(*) FILTER (WHERE e."status" = 'DISPUTED') AS "openDisputes"
  FROM "timesheet" t
  LEFT JOIN "timesheet_entry" e ON e."timesheetId" = t."id"
  GROUP BY t."organizationId", t."weekEndingDate"
),
missing_open AS (
  SELECT
    "organizationId",
    COUNT(*) AS open_count
  FROM "missing_time_case"
  WHERE "status" = 'OPEN'
  GROUP BY "organizationId"
),
missing_overdue AS (
  SELECT
    "organizationId",
    COUNT(*) AS overdue_count
  FROM "missing_time_case"
  WHERE "status" IN ('OPEN', 'REMINDED') AND "daysOverdue" > 0
  GROUP BY "organizationId"
)
INSERT INTO "timekeeping_summary" (
  "organizationId",
  "vendorId",
  "weekEndingDate",
  "locationId",
  "departmentId",
  "totalEntries",
  "fileUploadEntries",
  "mobileAppEntries",
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
  "missingTimeCasesOverdue",
  "createdAt",
  "updatedAt"
)
SELECT
  ea."organizationId",
  NULL::UUID AS "vendorId",
  ea."weekEndingDate",
  NULL::UUID AS "locationId",
  NULL::UUID AS "departmentId",
  ea."totalEntries",
  ea."fileUploadEntries",
  ea."mobileAppEntries",
  ea."totalHours",
  ea."regularHours",
  ea."overtimeHours",
  ea."totalTimesheets",
  0 AS "submittedTimesheets",
  0 AS "approvedTimesheets",
  ea."openDisputes",
  0 AS "resolvedDisputes",
  COALESCE(mo.open_count, 0) AS "missingTimeCasesOpen",
  0 AS "missingTimeCasesResolved",
  COALESCE(mv.overdue_count, 0) AS "missingTimeCasesOverdue",
  NOW() AS "createdAt",
  NOW() AS "updatedAt"
FROM entry_agg ea
LEFT JOIN missing_open mo
  ON mo."organizationId" = ea."organizationId"
LEFT JOIN missing_overdue mv
  ON mv."organizationId" = ea."organizationId"
ON CONFLICT ("organizationId","vendorId","weekEndingDate","locationId","departmentId")
DO UPDATE SET
  "totalEntries" = EXCLUDED."totalEntries",
  "fileUploadEntries" = EXCLUDED."fileUploadEntries",
  "mobileAppEntries" = EXCLUDED."mobileAppEntries",
  "totalHours" = EXCLUDED."totalHours",
  "regularHours" = EXCLUDED."regularHours",
  "overtimeHours" = EXCLUDED."overtimeHours",
  "totalTimesheets" = EXCLUDED."totalTimesheets",
  "openDisputes" = EXCLUDED."openDisputes",
  "missingTimeCasesOpen" = EXCLUDED."missingTimeCasesOpen",
  "missingTimeCasesOverdue" = EXCLUDED."missingTimeCasesOverdue",
  "updatedAt" = NOW();
