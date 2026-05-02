ALTER TABLE "timesheet_entry"
  ADD COLUMN IF NOT EXISTS "billRate" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "billAmount" DOUBLE PRECISION;

ALTER TABLE "invoice_line_items"
  ADD COLUMN IF NOT EXISTS "timesheetId" UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'invoice_line_items_timesheetId_fkey'
  ) THEN
    ALTER TABLE "invoice_line_items"
      ADD CONSTRAINT "invoice_line_items_timesheetId_fkey"
      FOREIGN KEY ("timesheetId")
      REFERENCES "timesheet"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "invoice_line_items_timesheetId_idx"
  ON "invoice_line_items"("timesheetId");

