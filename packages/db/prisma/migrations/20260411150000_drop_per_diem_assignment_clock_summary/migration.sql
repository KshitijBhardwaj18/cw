-- Time lives in timesheet_entry only (same as placements); drop denormalized assignment columns.
ALTER TABLE "per_diem_assignments" DROP COLUMN IF EXISTS "clockInTime";
ALTER TABLE "per_diem_assignments" DROP COLUMN IF EXISTS "clockOutTime";
ALTER TABLE "per_diem_assignments" DROP COLUMN IF EXISTS "timecardBreakMinutes";
ALTER TABLE "per_diem_assignments" DROP COLUMN IF EXISTS "actualHours";
