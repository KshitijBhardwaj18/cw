-- Enum may already exist if created manually / via db push — skip if present.
DO $$
BEGIN
  CREATE TYPE "CandidatePreferredContractLength" AS ENUM (
    'PER_DIEM',
    'BLOCKED_BOOKING',
    'WEEKS_4_12',
    'MONTHS_3',
    'MONTHS_3_6',
    'MONTHS_6_9',
    'MONTHS_9_12',
    'PERMANENT_ROLES',
    'OPEN_TO_ANYTHING'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Column: add only if missing (fresh DBs + DBs that already had the enum only).
ALTER TABLE "candidate"
ADD COLUMN IF NOT EXISTS "preferredContractLengths" "CandidatePreferredContractLength"[] NOT NULL DEFAULT ARRAY[]::"CandidatePreferredContractLength"[];
