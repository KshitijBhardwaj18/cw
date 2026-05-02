-- Migration: simplify_timesheet_model
-- Remove unused approval/payment/rollup columns from timesheet (workflow is entry-level).
-- Drop TimesheetStatus enum after the status column is removed.

DROP INDEX IF EXISTS "timesheet_status_idx";

ALTER TABLE "timesheet"
  DROP COLUMN IF EXISTS "regularHours",
  DROP COLUMN IF EXISTS "overtimeHours",
  DROP COLUMN IF EXISTS "totalHours",
  DROP COLUMN IF EXISTS "regularAmount",
  DROP COLUMN IF EXISTS "overtimeAmount",
  DROP COLUMN IF EXISTS "totalAmount",
  DROP COLUMN IF EXISTS "status",
  DROP COLUMN IF EXISTS "submittedAt",
  DROP COLUMN IF EXISTS "approvedById",
  DROP COLUMN IF EXISTS "approvedAt",
  DROP COLUMN IF EXISTS "rejectedById",
  DROP COLUMN IF EXISTS "rejectedAt",
  DROP COLUMN IF EXISTS "rejectionReason",
  DROP COLUMN IF EXISTS "paidAt",
  DROP COLUMN IF EXISTS "paymentReference";

DROP TYPE IF EXISTS "TimesheetStatus";
