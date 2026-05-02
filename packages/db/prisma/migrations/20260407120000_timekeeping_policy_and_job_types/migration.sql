-- AlterEnum: add TIMEKEEPING_REMINDER and TIMEKEEPING_UPLOAD to BackGroundJobType
ALTER TYPE "BackGroundJobType" ADD VALUE 'TIMEKEEPING_REMINDER';
ALTER TYPE "BackGroundJobType" ADD VALUE 'TIMEKEEPING_UPLOAD';

-- CreateTable: timekeeping_policy
CREATE TABLE "timekeeping_policy" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "submissionDeadlineDays" INTEGER NOT NULL DEFAULT 3,
    "reminderIntervalDays" INTEGER NOT NULL DEFAULT 2,
    "autoCreateMissingCases" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timekeeping_policy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "timekeeping_policy_organizationId_key" ON "timekeeping_policy"("organizationId");

-- AddForeignKey
ALTER TABLE "timekeeping_policy" ADD CONSTRAINT "timekeeping_policy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
