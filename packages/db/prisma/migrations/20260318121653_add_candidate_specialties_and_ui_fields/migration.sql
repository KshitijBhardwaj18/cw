-- CreateTable
CREATE TABLE "candidate_specialties" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "specialtyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_specialties_pkey" PRIMARY KEY ("id")
);

-- Migrate existing specialtyId to candidate_specialties
INSERT INTO "candidate_specialties" ("id", "candidateId", "specialtyId")
SELECT gen_random_uuid(), "id", "specialtyId"
FROM "candidate"
WHERE "specialtyId" IS NOT NULL;

-- AlterTable: add new columns to candidate
ALTER TABLE "candidate" ADD COLUMN IF NOT EXISTS "streetAddress" TEXT;
ALTER TABLE "candidate" ADD COLUMN IF NOT EXISTS "yearsOfExperience" INTEGER;

-- DropForeignKey and index before dropping column
ALTER TABLE "candidate" DROP CONSTRAINT IF EXISTS "candidate_specialtyId_fkey";
DROP INDEX IF EXISTS "candidate_specialtyId_idx";

-- AlterTable: drop specialtyId column
ALTER TABLE "candidate" DROP COLUMN IF EXISTS "specialtyId";

-- CreateIndex
CREATE UNIQUE INDEX "candidate_specialties_candidateId_specialtyId_key" ON "candidate_specialties"("candidateId", "specialtyId");

-- CreateIndex
CREATE INDEX "candidate_specialties_candidateId_idx" ON "candidate_specialties"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_specialties_specialtyId_idx" ON "candidate_specialties"("specialtyId");

-- AddForeignKey
ALTER TABLE "candidate_specialties" ADD CONSTRAINT "candidate_specialties_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "candidate_specialties" ADD CONSTRAINT "candidate_specialties_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
