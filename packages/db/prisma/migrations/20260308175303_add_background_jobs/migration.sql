-- CreateEnum
CREATE TYPE "BackGroundJobType" AS ENUM ('BULK_ENROLL');

-- CreateEnum
CREATE TYPE "BackGroundJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "back_ground_job" (
    "id" UUID NOT NULL,
    "type" "BackGroundJobType" NOT NULL,
    "status" "BackGroundJobStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "result" JSONB,
    "organizationId" UUID,
    "scheduledFor" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "back_ground_job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "back_ground_job_organizationId_idx" ON "back_ground_job"("organizationId");

-- CreateIndex
CREATE INDEX "back_ground_job_status_idx" ON "back_ground_job"("status");

-- CreateIndex
CREATE INDEX "back_ground_job_type_idx" ON "back_ground_job"("type");
