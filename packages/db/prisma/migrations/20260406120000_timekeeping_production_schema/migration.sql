-- CreateEnum
CREATE TYPE "TimesheetEntryStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "TimeEntryDataSource" AS ENUM ('FILE_UPLOAD', 'MOBILE_APP', 'MANUAL', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "MissingTimeCaseStatus" AS ENUM ('OPEN', 'REMINDED', 'RESOLVED', 'WAIVED');

-- CreateTable
CREATE TABLE "organization_pay_code" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "multiplier" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_pay_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_holiday" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "observedOn" TIMESTAMP(3) NOT NULL,
    "holidayType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missing_time_case" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "placementId" UUID,
    "departmentId" UUID,
    "locationId" UUID,
    "workDate" TIMESTAMP(3) NOT NULL,
    "status" "MissingTimeCaseStatus" NOT NULL DEFAULT 'OPEN',
    "daysOverdue" INTEGER NOT NULL DEFAULT 0,
    "lastRemindedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "missing_time_case_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "timesheet" ADD COLUMN "departmentId" UUID,
ADD COLUMN "locationId" UUID;

UPDATE "timesheet" t
SET
    "departmentId" = p."departmentId",
    "locationId" = p."locationId"
FROM "placement" p
WHERE t."placementId" = p."id";

-- AlterTable
ALTER TABLE "timesheet_entry" ADD COLUMN "organizationId" UUID,
ADD COLUMN "candidateId" UUID,
ADD COLUMN "placementId" UUID,
ADD COLUMN "departmentId" UUID,
ADD COLUMN "locationId" UUID,
ADD COLUMN "payCodeId" UUID,
ADD COLUMN "hours" DOUBLE PRECISION,
ADD COLUMN "status" "TimesheetEntryStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "dataSource" "TimeEntryDataSource" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN "approvalSource" TEXT,
ADD COLUMN "approvedById" UUID,
ADD COLUMN "approvedAt" TIMESTAMP(3);

UPDATE "timesheet_entry" te
SET
    "organizationId" = t."organizationId",
    "candidateId" = t."candidateId",
    "placementId" = t."placementId"
FROM "timesheet" t
WHERE te."timesheetId" = t."id";

UPDATE "timesheet_entry" te
SET
    "departmentId" = p."departmentId",
    "locationId" = p."locationId"
FROM "timesheet" t
JOIN "placement" p ON p."id" = t."placementId"
WHERE te."timesheetId" = t."id";

UPDATE "timesheet_entry"
SET "hours" = COALESCE("regularHours", 0) + COALESCE("overtimeHours", 0)
WHERE "hours" IS NULL;

ALTER TABLE "timesheet_entry" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "timesheet_entry" ALTER COLUMN "candidateId" SET NOT NULL;
ALTER TABLE "timesheet_entry" ALTER COLUMN "placementId" SET NOT NULL;

-- AlterTable
ALTER TABLE "timesheet_disputes" ADD COLUMN "timesheetEntryId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "organization_pay_code_organizationId_code_key" ON "organization_pay_code"("organizationId", "code");

-- CreateIndex
CREATE INDEX "organization_pay_code_organizationId_idx" ON "organization_pay_code"("organizationId");

-- CreateIndex
CREATE INDEX "organization_holiday_organizationId_idx" ON "organization_holiday"("organizationId");

-- CreateIndex
CREATE INDEX "organization_holiday_organizationId_observedOn_idx" ON "organization_holiday"("organizationId", "observedOn");

-- CreateIndex
CREATE INDEX "missing_time_case_organizationId_workDate_idx" ON "missing_time_case"("organizationId", "workDate");

-- CreateIndex
CREATE INDEX "missing_time_case_candidateId_workDate_idx" ON "missing_time_case"("candidateId", "workDate");

-- CreateIndex
CREATE INDEX "missing_time_case_placementId_idx" ON "missing_time_case"("placementId");

-- CreateIndex
CREATE INDEX "missing_time_case_status_idx" ON "missing_time_case"("status");

-- CreateIndex
CREATE INDEX "timesheet_departmentId_idx" ON "timesheet"("departmentId");

-- CreateIndex
CREATE INDEX "timesheet_locationId_idx" ON "timesheet"("locationId");

-- CreateIndex
CREATE INDEX "timesheet_entry_organizationId_workDate_idx" ON "timesheet_entry"("organizationId", "workDate");

-- CreateIndex
CREATE INDEX "timesheet_entry_candidateId_workDate_idx" ON "timesheet_entry"("candidateId", "workDate");

-- CreateIndex
CREATE INDEX "timesheet_entry_placementId_idx" ON "timesheet_entry"("placementId");

-- CreateIndex
CREATE INDEX "timesheet_entry_locationId_workDate_idx" ON "timesheet_entry"("locationId", "workDate");

-- CreateIndex
CREATE INDEX "timesheet_entry_departmentId_idx" ON "timesheet_entry"("departmentId");

-- CreateIndex
CREATE INDEX "timesheet_entry_status_idx" ON "timesheet_entry"("status");

-- CreateIndex
CREATE INDEX "timesheet_disputes_timesheetEntryId_idx" ON "timesheet_disputes"("timesheetEntryId");

-- AddForeignKey
ALTER TABLE "organization_pay_code" ADD CONSTRAINT "organization_pay_code_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_holiday" ADD CONSTRAINT "organization_holiday_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_time_case" ADD CONSTRAINT "missing_time_case_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_time_case" ADD CONSTRAINT "missing_time_case_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_time_case" ADD CONSTRAINT "missing_time_case_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_time_case" ADD CONSTRAINT "missing_time_case_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_time_case" ADD CONSTRAINT "missing_time_case_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_payCodeId_fkey" FOREIGN KEY ("payCodeId") REFERENCES "organization_pay_code"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_disputes" ADD CONSTRAINT "timesheet_disputes_timesheetEntryId_fkey" FOREIGN KEY ("timesheetEntryId") REFERENCES "timesheet_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
