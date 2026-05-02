-- Stable code keys for matching criteria (logic switches on `key`, not display `name`).
CREATE TYPE "MatchingCriterionKey" AS ENUM (
  'PREFERRED_LOCATION',
  'SHIFT_TYPE',
  'CONTRACT_LENGTH',
  'OCCUPATION',
  'SPECIALTIES'
);

ALTER TABLE "matching_criterion" ADD COLUMN "key" "MatchingCriterionKey";

UPDATE "matching_criterion" SET "key" = 'PREFERRED_LOCATION' WHERE "name" = 'Preferred Location';
UPDATE "matching_criterion" SET "key" = 'SHIFT_TYPE' WHERE "name" = 'Shift Type (Day/Night)';
UPDATE "matching_criterion" SET "key" = 'CONTRACT_LENGTH' WHERE "name" = 'Contract Length';
UPDATE "matching_criterion" SET "key" = 'OCCUPATION' WHERE "name" = 'Occupation';
UPDATE "matching_criterion" SET "key" = 'SPECIALTIES' WHERE "name" = 'Specialties';

ALTER TABLE "matching_criterion" ALTER COLUMN "key" SET NOT NULL;

CREATE UNIQUE INDEX "matching_criterion_key_key" ON "matching_criterion"("key");
