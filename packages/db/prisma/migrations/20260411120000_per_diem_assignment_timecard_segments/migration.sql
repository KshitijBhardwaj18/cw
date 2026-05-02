-- AlterTable (idempotent: column may already exist from manual/schema sync)
ALTER TABLE "per_diem_assignments" ADD COLUMN IF NOT EXISTS "timecardSegments" JSONB;
