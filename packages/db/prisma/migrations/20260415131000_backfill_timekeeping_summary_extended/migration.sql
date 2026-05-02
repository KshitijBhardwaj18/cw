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
UPDATE "timekeeping_summary" s
SET
  "totalEntries" = ea."totalEntries",
  "fileUploadEntries" = ea."fileUploadEntries",
  "mobileAppEntries" = ea."mobileAppEntries",
  "totalHours" = ea."totalHours",
  "regularHours" = ea."regularHours",
  "overtimeHours" = ea."overtimeHours",
  "openDisputes" = ea."openDisputes",
  "missingTimeCasesOpen" = COALESCE(mo.open_count, 0),
  "missingTimeCasesOverdue" = COALESCE(mv.overdue_count, 0)
FROM entry_agg ea
LEFT JOIN missing_open mo
  ON mo."organizationId" = ea."organizationId"
LEFT JOIN missing_overdue mv
  ON mv."organizationId" = ea."organizationId"
WHERE s."organizationId" = ea."organizationId"
  AND s."weekEndingDate" = ea."weekEndingDate"
  AND s."vendorId" IS NULL
  AND s."locationId" IS NULL
  AND s."departmentId" IS NULL;

