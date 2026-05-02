-- Store per-diem shift timecard rows in timesheet / timesheet_entry (same as placements).
-- Drop JSON column if present from earlier migration.
ALTER TABLE "per_diem_assignments" DROP COLUMN IF EXISTS "timecardSegments";

-- Timesheet: either placement or per-diem assignment (app-enforced)
ALTER TABLE "timesheet" ALTER COLUMN "placementId" DROP NOT NULL;
ALTER TABLE "timesheet" ADD COLUMN IF NOT EXISTS "perDiemAssignmentId" UUID;
CREATE UNIQUE INDEX IF NOT EXISTS "timesheet_perDiemAssignmentId_key" ON "timesheet"("perDiemAssignmentId");
DO $$ BEGIN
 ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_perDiemAssignmentId_fkey" FOREIGN KEY ("perDiemAssignmentId") REFERENCES "per_diem_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;

-- Timesheet entry: optional placement; denormalized per-diem assignment for shift rows
ALTER TABLE "timesheet_entry" ALTER COLUMN "placementId" DROP NOT NULL;
ALTER TABLE "timesheet_entry" ADD COLUMN IF NOT EXISTS "perDiemAssignmentId" UUID;
DO $$ BEGIN
 ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_perDiemAssignmentId_fkey" FOREIGN KEY ("perDiemAssignmentId") REFERENCES "per_diem_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS "timesheet_entry_perDiemAssignmentId_idx" ON "timesheet_entry"("perDiemAssignmentId");
