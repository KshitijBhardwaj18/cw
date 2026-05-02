/*
  Warnings:

  - You are about to drop the `_OccupationSpecialties` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `back_ground_job` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[organizationId,occupationId]` on the table `organization_occupation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,specialtyId]` on the table `organization_specialty` will be added. If there are existing duplicate values, this will fail.
  - Made the column `organizationOccupationId` on table `department` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `matching_criterion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TagStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RequisitionType" AS ENUM ('LONG_TERM_ORDER', 'PER_DIEM', 'PERMANENT_ROLE', 'INTERNAL_FLEX_POOL');

-- CreateEnum
CREATE TYPE "RequisitionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'ON_HOLD', 'FILLED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('DAYS', 'EVENINGS', 'NIGHTS', 'ROTATING', 'WEEKENDS_ONLY', 'ON_CALL');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('NO_INTERVIEW', 'CLIENT_INTERVIEW', 'INTERNAL_INTERVIEW');

-- CreateEnum
CREATE TYPE "WorkflowType" AS ENUM ('VENDOR_CANDIDATE', 'VENDOR_ONLY', 'CANDIDATE_ONLY');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('UPCOMING', 'PENDING', 'ACTIVE', 'INACTIVE', 'COMPLETED', 'ENDING_SOON', 'TERMINATED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "PlacementComplianceStatus" AS ENUM ('COMPLETE', 'MISSING', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SubmissionStage" AS ENUM ('SUBMITTED', 'QUALIFIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFERED', 'ACCEPTED', 'WITHDRAWN', 'REJECTED');

-- CreateEnum
CREATE TYPE "CandidateWorkforceType" AS ENUM ('INTERNAL_FULL_TIME', 'INTERNAL_PART_TIME', 'INTERNAL_PRN', 'EXTERNAL_VENDOR_LTO', 'EXTERNAL_VENDOR_PER_DIEM');

-- CreateEnum
CREATE TYPE "CandidateSource" AS ENUM ('DIRECT', 'VENDOR', 'PREVIOUS_WORKER');

-- CreateEnum
CREATE TYPE "CandidateInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CandidateComplianceStatus" AS ENUM ('APPROVED', 'PENDING', 'EXPIRED', 'MISSING');

-- CreateEnum
CREATE TYPE "CandidateComplianceDocCategory" AS ENUM ('BACKGROUND_IDENTITY', 'EMPLOYEE_HEALTH', 'PROFESSIONAL_LICENSES', 'CERTIFICATIONS', 'OTHER');

-- CreateEnum
CREATE TYPE "PublishMode" AS ENUM ('DRAFT', 'PUBLISH_IMMEDIATELY', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('CONTRACT', 'PERMANENT', 'PER_DIEM');

-- CreateEnum
CREATE TYPE "OfferEventType" AS ENUM ('OFFER_EXTENDED', 'OFFER_VIEWED', 'OFFER_ACCEPTED', 'OFFER_DECLINED', 'OFFER_EXPIRED', 'OFFER_MODIFIED');

-- CreateEnum
CREATE TYPE "PlacementTaskStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PerDiemShiftStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TimesheetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GrievanceType" AS ENUM ('BEHAVIORAL', 'CLINICAL');

-- CreateEnum
CREATE TYPE "GrievanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "GrievanceTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "WorkforceTypeCategory" AS ENUM ('INTERNAL_STAFF', 'PER_DIEM', 'AGENCY_VENDOR', 'TRAVEL_NURSES', 'PREVIOUS_WORKERS');

-- CreateEnum
CREATE TYPE "DelayUnit" AS ENUM ('HOURS', 'MINUTES', 'DAYS');

-- CreateEnum
CREATE TYPE "ComplianceItemScopeType" AS ENUM ('OCCUPATION', 'SPECIALTY', 'LOCATION', 'DEPARTMENT');

-- DropForeignKey
ALTER TABLE "_OccupationSpecialties" DROP CONSTRAINT "_OccupationSpecialties_A_fkey";

-- DropForeignKey
ALTER TABLE "_OccupationSpecialties" DROP CONSTRAINT "_OccupationSpecialties_B_fkey";

-- DropForeignKey
ALTER TABLE "department" DROP CONSTRAINT "department_organizationOccupationId_fkey";

-- AlterTable
ALTER TABLE "department" ALTER COLUMN "organizationOccupationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "matching_criterion" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "organization_specialty" ADD COLUMN     "userId" UUID;

-- AlterTable
ALTER TABLE "tag" ADD COLUMN     "status" "TagStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "_OccupationSpecialties";

-- DropTable
DROP TABLE "back_ground_job";

-- CreateTable
CREATE TABLE "background_job" (
    "id" UUID NOT NULL,
    "type" "BackGroundJobType" NOT NULL,
    "status" "BackGroundJobStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "result" JSONB,
    "organizationId" UUID,
    "scheduledFor" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "background_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "occupationId" UUID NOT NULL,
    "specialtyId" UUID,
    "organizationId" UUID,
    "vendorId" UUID,
    "createdBy" UUID,
    "updatedBy" UUID,
    "workforceType" "CandidateWorkforceType",
    "workforceGroup" TEXT,
    "source" "CandidateSource",
    "sourceDetails" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "willingToRelocate" BOOLEAN NOT NULL DEFAULT false,
    "resumeUrl" TEXT,
    "portfolioUrl" TEXT,
    "linkedinUrl" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "skills" TEXT[],
    "languages" TEXT[],
    "preferredShiftTypes" TEXT[],
    "desiredBillRate" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "availableFrom" TIMESTAMP(3),
    "inviteStatus" "CandidateInviteStatus",
    "invitedAt" TIMESTAMP(3),
    "invitedById" UUID,
    "inviteToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_tags" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_preferred_locations" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_preferred_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_compliance" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "documentName" TEXT NOT NULL,
    "category" "CandidateComplianceDocCategory" NOT NULL,
    "documentUrl" TEXT,
    "documentFileName" TEXT,
    "expiryDate" TIMESTAMP(3),
    "status" "CandidateComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedById" UUID,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "uploadedById" UUID,
    "uploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_compliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission" (
    "id" UUID NOT NULL,
    "stage" "SubmissionStage" NOT NULL DEFAULT 'SUBMITTED',
    "summaryNote" TEXT,
    "rtos" JSONB,
    "billingRate" DOUBLE PRECISION,
    "overtimeRate" DOUBLE PRECISION,
    "requisitionId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "vendorId" UUID,
    "submittedByUserId" UUID,
    "stageEnteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qualifiedAt" TIMESTAMP(3),
    "shortlistedAt" TIMESTAMP(3),
    "interviewScheduledAt" TIMESTAMP(3),
    "interviewCompletedAt" TIMESTAMP(3),
    "offerExtendedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "interviewDate" TIMESTAMP(3),
    "interviewLocation" TEXT,
    "interviewNotes" TEXT,
    "offeredWithoutInterview" BOOLEAN NOT NULL DEFAULT false,
    "offerAmount" DOUBLE PRECISION,
    "offerLetterUrl" TEXT,
    "offerExpiresAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "withdrawalReason" TEXT,
    "internalNotes" TEXT,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_interviewers" (
    "id" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_interviewers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement" (
    "id" UUID NOT NULL,
    "placementNumber" TEXT NOT NULL,
    "organizationId" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "requisitionId" UUID,
    "candidateId" UUID,
    "vendorId" UUID,
    "vendorContactId" UUID,
    "hiringManagerId" UUID,
    "departmentId" UUID,
    "locationId" UUID,
    "jobTitle" TEXT,
    "unitName" TEXT,
    "workforceGroup" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "totalWeeks" INTEGER,
    "extensionCount" INTEGER NOT NULL DEFAULT 0,
    "shiftType" "ShiftType",
    "shiftStartTime" TEXT,
    "shiftEndTime" TEXT,
    "shiftSchedule" TEXT[],
    "hoursPerWeek" DOUBLE PRECISION,
    "billRate" DOUBLE PRECISION,
    "payRate" DOUBLE PRECISION,
    "overtimeEligible" BOOLEAN NOT NULL DEFAULT false,
    "employmentType" "EmploymentType",
    "acceptedById" UUID,
    "acceptedAt" TIMESTAMP(3),
    "status" "PlacementStatus" NOT NULL DEFAULT 'UPCOMING',
    "terminationReason" TEXT,
    "terminatedById" UUID,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_compliance_items" (
    "id" UUID NOT NULL,
    "placementId" UUID NOT NULL,
    "complianceItemId" UUID NOT NULL,
    "status" "PlacementComplianceStatus" NOT NULL DEFAULT 'MISSING',
    "completionDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "swappedFromItemId" UUID,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_compliance_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_offer_history" (
    "id" UUID NOT NULL,
    "placementId" UUID NOT NULL,
    "eventType" "OfferEventType" NOT NULL,
    "description" TEXT,
    "billRateSnapshot" DOUBLE PRECISION,
    "payRateSnapshot" DOUBLE PRECISION,
    "startDateSnapshot" TIMESTAMP(3),
    "employmentType" "EmploymentType",
    "performedById" UUID,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "placement_offer_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_tasks" (
    "id" UUID NOT NULL,
    "placementId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "PlacementTaskStatus" NOT NULL DEFAULT 'PENDING',
    "assignedToId" UUID,
    "assignedRole" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_notes" (
    "id" UUID NOT NULL,
    "placementId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdById" UUID,
    "createdByRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "placement_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "placementId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "weekEndingDate" TIMESTAMP(3) NOT NULL,
    "regularHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "regularAmount" DOUBLE PRECISION,
    "overtimeAmount" DOUBLE PRECISION,
    "totalAmount" DOUBLE PRECISION,
    "status" "TimesheetStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "rejectedById" UUID,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "paidAt" TIMESTAMP(3),
    "paymentReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet_entry" (
    "id" UUID NOT NULL,
    "timesheetId" UUID NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "clockIn" TEXT,
    "clockOut" TEXT,
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "regularHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet_disputes" (
    "id" UUID NOT NULL,
    "timesheetId" UUID NOT NULL,
    "disputeType" TEXT,
    "description" TEXT NOT NULL,
    "originalHours" DOUBLE PRECISION,
    "disputedHours" DOUBLE PRECISION,
    "originalAmount" DOUBLE PRECISION,
    "disputedAmount" DOUBLE PRECISION,
    "raisedById" UUID,
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedToId" UUID,
    "resolution" TEXT,
    "resolvedById" UUID,
    "resolvedAt" TIMESTAMP(3),
    "resolutionCategory" TEXT,
    "finalHours" DOUBLE PRECISION,
    "finalAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_checklists" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "occupationId" UUID,
    "specialtyId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_checklist_items" (
    "id" UUID NOT NULL,
    "checklistId" UUID NOT NULL,
    "complianceListItemId" UUID NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_items" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "itemCode" TEXT,
    "category" TEXT NOT NULL DEFAULT 'certification',
    "hasExpiration" BOOLEAN NOT NULL DEFAULT true,
    "validityPeriodDays" INTEGER,
    "renewalReminderDays" INTEGER NOT NULL DEFAULT 30,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 0,
    "requiresVerification" BOOLEAN NOT NULL DEFAULT true,
    "verificationAuthority" TEXT,
    "verificationUrl" TEXT,
    "requiresDocument" BOOLEAN NOT NULL DEFAULT true,
    "acceptedDocumentTypes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_item_scopes" (
    "id" UUID NOT NULL,
    "complianceItemId" UUID NOT NULL,
    "scopeType" "ComplianceItemScopeType" NOT NULL,
    "scopeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_item_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisition_template" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "type" "RequisitionType" NOT NULL,
    "templateName" TEXT NOT NULL,
    "organizationOccupationId" UUID NOT NULL,
    "organizationSpecialtyId" UUID,
    "locationId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "unitName" TEXT,
    "jobDescription" TEXT,
    "benefitsPerks" TEXT[],
    "status" "RequisitionStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "lengthWeeks" INTEGER,
    "startTime" TEXT,
    "endTime" TEXT,
    "shiftType" "ShiftType",
    "shiftHours" DOUBLE PRECISION,
    "shiftsPerWeek" INTEGER,
    "hoursPerWeek" DOUBLE PRECISION,
    "billRate" DOUBLE PRECISION,
    "numberOfPositions" INTEGER NOT NULL DEFAULT 1,
    "incentiveType" TEXT,
    "incentiveAmount" DOUBLE PRECISION,
    "interviewRequired" "InterviewType",
    "hiringManagerId" UUID,
    "complianceChecklistId" UUID,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "workflowType" "WorkflowType",
    "whoCanSubmit" TEXT NOT NULL DEFAULT 'all_vendors',
    "internalNotes" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requisition_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisition_template_vendor" (
    "id" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "vendorId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requisition_template_vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisition" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "requisitionNumber" TEXT,
    "type" "RequisitionType" NOT NULL,
    "templateId" UUID,
    "jobTitle" TEXT,
    "organizationOccupationId" UUID,
    "organizationSpecialtyId" UUID,
    "locationId" UUID,
    "departmentId" UUID,
    "unitName" TEXT,
    "hiringManagerId" UUID,
    "numberOfPositions" INTEGER NOT NULL DEFAULT 1,
    "positionsFilled" INTEGER NOT NULL DEFAULT 0,
    "jobSummary" TEXT,
    "billRate" DOUBLE PRECISION,
    "shiftType" "ShiftType",
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "lengthWeeks" INTEGER,
    "shiftHours" DOUBLE PRECISION,
    "shiftsPerWeek" INTEGER,
    "hoursPerWeek" DOUBLE PRECISION,
    "benefitsPerks" TEXT[],
    "complianceChecklistId" UUID,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "workflowType" "WorkflowType",
    "whoCanSubmit" TEXT NOT NULL DEFAULT 'all_vendors',
    "internalNotes" TEXT,
    "publishMode" "PublishMode" NOT NULL DEFAULT 'DRAFT',
    "scheduledPublishAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "status" "RequisitionStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "qualifiedCandidates" INTEGER NOT NULL DEFAULT 0,
    "projectId" UUID,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisition_vendor" (
    "id" UUID NOT NULL,
    "requisitionId" UUID NOT NULL,
    "vendorId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requisition_vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_metric" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "metricId" UUID NOT NULL,
    "goal" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workforce_lists" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workforce_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workforce_list_members" (
    "id" UUID NOT NULL,
    "listId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "addedById" UUID,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workforce_list_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_templates" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "templateName" TEXT NOT NULL,
    "occupationId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "shiftType" "ShiftType" NOT NULL,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "baseRate" DOUBLE PRECISION NOT NULL,
    "baseBillRate" DOUBLE PRECISION,
    "vendorRateMarkupPercent" DOUBLE PRECISION,
    "limitShiftVisibility" BOOLEAN NOT NULL DEFAULT false,
    "visibilityUnlockHours" INTEGER,
    "offerIncentive" BOOLEAN NOT NULL DEFAULT false,
    "incentiveByHour" DOUBLE PRECISION,
    "incentiveByShift" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "per_diem_shifts" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "shiftNumber" TEXT,
    "shiftTemplateId" UUID,
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "totalShiftHours" DOUBLE PRECISION NOT NULL,
    "shiftType" "ShiftType" NOT NULL,
    "occupationId" UUID NOT NULL,
    "specialtyId" UUID,
    "departmentId" UUID,
    "locationId" UUID NOT NULL,
    "shiftRate" DOUBLE PRECISION NOT NULL,
    "vendorRate" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION,
    "sendPersonalizedNotification" BOOLEAN NOT NULL DEFAULT false,
    "status" "PerDiemShiftStatus" NOT NULL DEFAULT 'OPEN',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "routingRuleId" UUID,
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "per_diem_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "per_diem_assignments" (
    "id" UUID NOT NULL,
    "shiftId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "vendorId" UUID,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" UUID,
    "confirmedAt" TIMESTAMP(3),
    "clockInTime" TIMESTAMP(3),
    "clockOutTime" TIMESTAMP(3),
    "breakStartTime" TIMESTAMP(3),
    "breakEndTime" TIMESTAMP(3),
    "actualHours" DOUBLE PRECISION,
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "candidateRating" DOUBLE PRECISION,
    "shiftRating" DOUBLE PRECISION,
    "candidateFeedback" TEXT,
    "clientFeedback" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledById" UUID,
    "cancellationReason" TEXT,
    "cancellationFee" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "per_diem_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_routing_settings" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "enableRoutingDelay" BOOLEAN NOT NULL DEFAULT false,
    "delayDuration" INTEGER NOT NULL DEFAULT 24,
    "delayUnit" "DelayUnit" NOT NULL DEFAULT 'HOURS',
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_routing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_routing_tiers" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "workforceType" "WorkforceTypeCategory" NOT NULL,
    "label" TEXT,
    "description" TEXT,
    "priorityOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_routing_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grievances" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "grievanceNumber" TEXT NOT NULL,
    "type" "GrievanceType" NOT NULL,
    "candidateId" UUID NOT NULL,
    "placementId" UUID,
    "description" TEXT NOT NULL,
    "status" "GrievanceStatus" NOT NULL DEFAULT 'OPEN',
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grievances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grievance_tasks" (
    "id" UUID NOT NULL,
    "grievanceId" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "assignedToUserId" UUID NOT NULL,
    "assignedRole" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "GrievanceTaskStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grievance_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceType" TEXT,
    "vendorId" UUID,
    "billToName" TEXT,
    "billToAddress" TEXT,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "periodStartDate" TIMESTAMP(3),
    "periodEndDate" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adjustmentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentTerms" TEXT NOT NULL DEFAULT 'net_30',
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "paidDate" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedById" UUID,
    "submittedAt" TIMESTAMP(3),
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "approvalNotes" TEXT,
    "sentToClientAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "lineType" TEXT,
    "candidateId" UUID,
    "placementId" UUID,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupation_specialties" (
    "id" UUID NOT NULL,
    "occupationId" UUID NOT NULL,
    "specialtyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occupation_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spend_analytics" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL,
    "departmentId" UUID,
    "locationId" UUID,
    "vendorId" UUID,
    "occupationId" UUID,
    "projectId" UUID,
    "totalSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "regularHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activePlacements" INTEGER NOT NULL DEFAULT 0,
    "totalInvoices" INTEGER NOT NULL DEFAULT 0,
    "averageBillRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "permanentHeadcount" INTEGER NOT NULL DEFAULT 0,
    "contingentHeadcount" INTEGER NOT NULL DEFAULT 0,
    "contractorHeadcount" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spend_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "command_center_metrics" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "metricDate" TIMESTAMP(3) NOT NULL,
    "overdueSubmissions" INTEGER NOT NULL DEFAULT 0,
    "agingQualified" INTEGER NOT NULL DEFAULT 0,
    "agingShortlisted" INTEGER NOT NULL DEFAULT 0,
    "overdueOffers" INTEGER NOT NULL DEFAULT 0,
    "delayedOnboarding" INTEGER NOT NULL DEFAULT 0,
    "activeRequisitions" INTEGER NOT NULL DEFAULT 0,
    "openPositions" INTEGER NOT NULL DEFAULT 0,
    "filledPositionsMtd" INTEGER NOT NULL DEFAULT 0,
    "totalSubmissions" INTEGER NOT NULL DEFAULT 0,
    "submissionsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "submissionsQualified" INTEGER NOT NULL DEFAULT 0,
    "submissionsShortlisted" INTEGER NOT NULL DEFAULT 0,
    "submissionsInterviewScheduled" INTEGER NOT NULL DEFAULT 0,
    "submissionsInterviewCompleted" INTEGER NOT NULL DEFAULT 0,
    "submissionsOffer" INTEGER NOT NULL DEFAULT 0,
    "submissionsAccepted" INTEGER NOT NULL DEFAULT 0,
    "submissionsWithdrawn" INTEGER NOT NULL DEFAULT 0,
    "submissionsRejected" INTEGER NOT NULL DEFAULT 0,
    "totalActiveWorkforce" INTEGER NOT NULL DEFAULT 0,
    "permanentCount" INTEGER NOT NULL DEFAULT 0,
    "contingentCount" INTEGER NOT NULL DEFAULT 0,
    "contractorCount" INTEGER NOT NULL DEFAULT 0,
    "fillRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeToFillAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "retentionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "candidateSatisfaction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clientSatisfaction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "complianceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expiringCredentials" INTEGER NOT NULL DEFAULT 0,
    "pendingTimesheets" INTEGER NOT NULL DEFAULT 0,
    "disputedTimesheets" INTEGER NOT NULL DEFAULT 0,
    "spendMtd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hoursWorkedMtd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "command_center_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_configs" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "vendorId" UUID,
    "clientName" TEXT,
    "billingFrequency" TEXT NOT NULL DEFAULT 'weekly',
    "paymentTerms" TEXT NOT NULL DEFAULT 'net_30',
    "invoiceFormat" TEXT,
    "rateCard" JSONB,
    "markupType" TEXT,
    "markupValue" DOUBLE PRECISION,
    "invoiceDeliveryMethod" TEXT,
    "invoiceEmailRecipients" TEXT[],
    "requiresPo" BOOLEAN NOT NULL DEFAULT false,
    "poNumber" TEXT,
    "poExpiryDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications_org" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "entityType" TEXT,
    "entityId" UUID,
    "actionUrl" TEXT,
    "deliveryMethod" TEXT,
    "sentAt" TIMESTAMP(3),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_org_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log_org" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID,
    "userEmail" TEXT,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "entityName" TEXT,
    "description" TEXT,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_org_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "background_job_organizationId_idx" ON "background_job"("organizationId");

-- CreateIndex
CREATE INDEX "background_job_status_idx" ON "background_job"("status");

-- CreateIndex
CREATE INDEX "background_job_type_idx" ON "background_job"("type");

-- CreateIndex
CREATE INDEX "background_job_scheduledFor_idx" ON "background_job"("scheduledFor");

-- CreateIndex
CREATE INDEX "background_job_completedAt_idx" ON "background_job"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_userId_key" ON "candidate"("userId");

-- CreateIndex
CREATE INDEX "candidate_userId_idx" ON "candidate"("userId");

-- CreateIndex
CREATE INDEX "candidate_organizationId_idx" ON "candidate"("organizationId");

-- CreateIndex
CREATE INDEX "candidate_vendorId_idx" ON "candidate"("vendorId");

-- CreateIndex
CREATE INDEX "candidate_occupationId_idx" ON "candidate"("occupationId");

-- CreateIndex
CREATE INDEX "candidate_specialtyId_idx" ON "candidate"("specialtyId");

-- CreateIndex
CREATE INDEX "candidate_isActive_idx" ON "candidate"("isActive");

-- CreateIndex
CREATE INDEX "candidate_isAvailable_idx" ON "candidate"("isAvailable");

-- CreateIndex
CREATE INDEX "candidate_inviteStatus_idx" ON "candidate"("inviteStatus");

-- CreateIndex
CREATE INDEX "candidate_tags_candidateId_idx" ON "candidate_tags"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_tags_tagId_idx" ON "candidate_tags"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_tags_candidateId_tagId_key" ON "candidate_tags"("candidateId", "tagId");

-- CreateIndex
CREATE INDEX "candidate_preferred_locations_candidateId_idx" ON "candidate_preferred_locations"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_preferred_locations_locationId_idx" ON "candidate_preferred_locations"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_preferred_locations_candidateId_locationId_key" ON "candidate_preferred_locations"("candidateId", "locationId");

-- CreateIndex
CREATE INDEX "candidate_compliance_candidateId_idx" ON "candidate_compliance"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_compliance_status_idx" ON "candidate_compliance"("status");

-- CreateIndex
CREATE INDEX "candidate_compliance_category_idx" ON "candidate_compliance"("category");

-- CreateIndex
CREATE INDEX "candidate_compliance_expiryDate_idx" ON "candidate_compliance"("expiryDate");

-- CreateIndex
CREATE INDEX "submission_candidateId_idx" ON "submission"("candidateId");

-- CreateIndex
CREATE INDEX "submission_organizationId_idx" ON "submission"("organizationId");

-- CreateIndex
CREATE INDEX "submission_requisitionId_idx" ON "submission"("requisitionId");

-- CreateIndex
CREATE INDEX "submission_vendorId_idx" ON "submission"("vendorId");

-- CreateIndex
CREATE INDEX "submission_stage_idx" ON "submission"("stage");

-- CreateIndex
CREATE INDEX "submission_createdBy_idx" ON "submission"("createdBy");

-- CreateIndex
CREATE INDEX "submission_updatedBy_idx" ON "submission"("updatedBy");

-- CreateIndex
CREATE INDEX "submission_interviewers_submissionId_idx" ON "submission_interviewers"("submissionId");

-- CreateIndex
CREATE INDEX "submission_interviewers_userId_idx" ON "submission_interviewers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "submission_interviewers_submissionId_userId_key" ON "submission_interviewers"("submissionId", "userId");

-- CreateIndex
CREATE INDEX "placement_organizationId_idx" ON "placement"("organizationId");

-- CreateIndex
CREATE INDEX "placement_submissionId_idx" ON "placement"("submissionId");

-- CreateIndex
CREATE INDEX "placement_requisitionId_idx" ON "placement"("requisitionId");

-- CreateIndex
CREATE INDEX "placement_candidateId_idx" ON "placement"("candidateId");

-- CreateIndex
CREATE INDEX "placement_vendorId_idx" ON "placement"("vendorId");

-- CreateIndex
CREATE INDEX "placement_status_idx" ON "placement"("status");

-- CreateIndex
CREATE INDEX "placement_startDate_idx" ON "placement"("startDate");

-- CreateIndex
CREATE INDEX "placement_createdBy_idx" ON "placement"("createdBy");

-- CreateIndex
CREATE INDEX "placement_updatedBy_idx" ON "placement"("updatedBy");

-- CreateIndex
CREATE INDEX "placement_compliance_items_placementId_idx" ON "placement_compliance_items"("placementId");

-- CreateIndex
CREATE INDEX "placement_compliance_items_complianceItemId_idx" ON "placement_compliance_items"("complianceItemId");

-- CreateIndex
CREATE INDEX "placement_compliance_items_status_idx" ON "placement_compliance_items"("status");

-- CreateIndex
CREATE UNIQUE INDEX "placement_compliance_items_placementId_complianceItemId_key" ON "placement_compliance_items"("placementId", "complianceItemId");

-- CreateIndex
CREATE INDEX "placement_offer_history_placementId_idx" ON "placement_offer_history"("placementId");

-- CreateIndex
CREATE INDEX "placement_offer_history_eventType_idx" ON "placement_offer_history"("eventType");

-- CreateIndex
CREATE INDEX "placement_offer_history_performedAt_idx" ON "placement_offer_history"("performedAt");

-- CreateIndex
CREATE INDEX "placement_tasks_placementId_idx" ON "placement_tasks"("placementId");

-- CreateIndex
CREATE INDEX "placement_tasks_status_idx" ON "placement_tasks"("status");

-- CreateIndex
CREATE INDEX "placement_tasks_dueDate_idx" ON "placement_tasks"("dueDate");

-- CreateIndex
CREATE INDEX "placement_tasks_assignedToId_idx" ON "placement_tasks"("assignedToId");

-- CreateIndex
CREATE INDEX "placement_notes_placementId_idx" ON "placement_notes"("placementId");

-- CreateIndex
CREATE INDEX "placement_notes_createdAt_idx" ON "placement_notes"("createdAt");

-- CreateIndex
CREATE INDEX "timesheet_organizationId_idx" ON "timesheet"("organizationId");

-- CreateIndex
CREATE INDEX "timesheet_placementId_idx" ON "timesheet"("placementId");

-- CreateIndex
CREATE INDEX "timesheet_candidateId_idx" ON "timesheet"("candidateId");

-- CreateIndex
CREATE INDEX "timesheet_status_idx" ON "timesheet"("status");

-- CreateIndex
CREATE INDEX "timesheet_weekEndingDate_idx" ON "timesheet"("weekEndingDate");

-- CreateIndex
CREATE INDEX "timesheet_entry_timesheetId_idx" ON "timesheet_entry"("timesheetId");

-- CreateIndex
CREATE INDEX "timesheet_entry_workDate_idx" ON "timesheet_entry"("workDate");

-- CreateIndex
CREATE INDEX "timesheet_disputes_timesheetId_idx" ON "timesheet_disputes"("timesheetId");

-- CreateIndex
CREATE INDEX "timesheet_disputes_raisedById_idx" ON "timesheet_disputes"("raisedById");

-- CreateIndex
CREATE INDEX "timesheet_disputes_assignedToId_idx" ON "timesheet_disputes"("assignedToId");

-- CreateIndex
CREATE INDEX "compliance_checklists_organizationId_idx" ON "compliance_checklists"("organizationId");

-- CreateIndex
CREATE INDEX "compliance_checklists_isActive_idx" ON "compliance_checklists"("isActive");

-- CreateIndex
CREATE INDEX "compliance_checklist_items_checklistId_idx" ON "compliance_checklist_items"("checklistId");

-- CreateIndex
CREATE INDEX "compliance_checklist_items_complianceListItemId_idx" ON "compliance_checklist_items"("complianceListItemId");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_checklist_items_checklistId_complianceListItemId_key" ON "compliance_checklist_items"("checklistId", "complianceListItemId");

-- CreateIndex
CREATE INDEX "compliance_items_organizationId_idx" ON "compliance_items"("organizationId");

-- CreateIndex
CREATE INDEX "compliance_items_isActive_idx" ON "compliance_items"("isActive");

-- CreateIndex
CREATE INDEX "compliance_item_scopes_complianceItemId_idx" ON "compliance_item_scopes"("complianceItemId");

-- CreateIndex
CREATE INDEX "compliance_item_scopes_scopeType_scopeId_idx" ON "compliance_item_scopes"("scopeType", "scopeId");

-- CreateIndex
CREATE INDEX "requisition_template_organizationId_idx" ON "requisition_template"("organizationId");

-- CreateIndex
CREATE INDEX "requisition_template_organizationOccupationId_idx" ON "requisition_template"("organizationOccupationId");

-- CreateIndex
CREATE INDEX "requisition_template_organizationSpecialtyId_idx" ON "requisition_template"("organizationSpecialtyId");

-- CreateIndex
CREATE INDEX "requisition_template_locationId_idx" ON "requisition_template"("locationId");

-- CreateIndex
CREATE INDEX "requisition_template_departmentId_idx" ON "requisition_template"("departmentId");

-- CreateIndex
CREATE INDEX "requisition_template_status_idx" ON "requisition_template"("status");

-- CreateIndex
CREATE INDEX "requisition_template_createdBy_idx" ON "requisition_template"("createdBy");

-- CreateIndex
CREATE INDEX "requisition_template_updatedBy_idx" ON "requisition_template"("updatedBy");

-- CreateIndex
CREATE INDEX "requisition_template_vendor_templateId_idx" ON "requisition_template_vendor"("templateId");

-- CreateIndex
CREATE INDEX "requisition_template_vendor_vendorId_idx" ON "requisition_template_vendor"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "requisition_template_vendor_templateId_vendorId_key" ON "requisition_template_vendor"("templateId", "vendorId");

-- CreateIndex
CREATE INDEX "requisition_organizationId_idx" ON "requisition"("organizationId");

-- CreateIndex
CREATE INDEX "requisition_templateId_idx" ON "requisition"("templateId");

-- CreateIndex
CREATE INDEX "requisition_organizationOccupationId_idx" ON "requisition"("organizationOccupationId");

-- CreateIndex
CREATE INDEX "requisition_organizationSpecialtyId_idx" ON "requisition"("organizationSpecialtyId");

-- CreateIndex
CREATE INDEX "requisition_locationId_idx" ON "requisition"("locationId");

-- CreateIndex
CREATE INDEX "requisition_departmentId_idx" ON "requisition"("departmentId");

-- CreateIndex
CREATE INDEX "requisition_hiringManagerId_idx" ON "requisition"("hiringManagerId");

-- CreateIndex
CREATE INDEX "requisition_projectId_idx" ON "requisition"("projectId");

-- CreateIndex
CREATE INDEX "requisition_status_idx" ON "requisition"("status");

-- CreateIndex
CREATE INDEX "requisition_publishMode_idx" ON "requisition"("publishMode");

-- CreateIndex
CREATE INDEX "requisition_createdBy_idx" ON "requisition"("createdBy");

-- CreateIndex
CREATE INDEX "requisition_updatedBy_idx" ON "requisition"("updatedBy");

-- CreateIndex
CREATE INDEX "requisition_vendor_requisitionId_idx" ON "requisition_vendor"("requisitionId");

-- CreateIndex
CREATE INDEX "requisition_vendor_vendorId_idx" ON "requisition_vendor"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "requisition_vendor_requisitionId_vendorId_key" ON "requisition_vendor"("requisitionId", "vendorId");

-- CreateIndex
CREATE INDEX "project_organizationId_idx" ON "project"("organizationId");

-- CreateIndex
CREATE INDEX "project_status_idx" ON "project"("status");

-- CreateIndex
CREATE INDEX "organization_metric_organizationId_idx" ON "organization_metric"("organizationId");

-- CreateIndex
CREATE INDEX "organization_metric_metricId_idx" ON "organization_metric"("metricId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_metric_organizationId_metricId_key" ON "organization_metric"("organizationId", "metricId");

-- CreateIndex
CREATE INDEX "workforce_lists_organizationId_idx" ON "workforce_lists"("organizationId");

-- CreateIndex
CREATE INDEX "workforce_list_members_listId_idx" ON "workforce_list_members"("listId");

-- CreateIndex
CREATE INDEX "workforce_list_members_candidateId_idx" ON "workforce_list_members"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "workforce_list_members_listId_candidateId_key" ON "workforce_list_members"("listId", "candidateId");

-- CreateIndex
CREATE INDEX "shift_templates_organizationId_idx" ON "shift_templates"("organizationId");

-- CreateIndex
CREATE INDEX "shift_templates_occupationId_idx" ON "shift_templates"("occupationId");

-- CreateIndex
CREATE INDEX "shift_templates_departmentId_idx" ON "shift_templates"("departmentId");

-- CreateIndex
CREATE INDEX "shift_templates_locationId_idx" ON "shift_templates"("locationId");

-- CreateIndex
CREATE INDEX "per_diem_shifts_organizationId_idx" ON "per_diem_shifts"("organizationId");

-- CreateIndex
CREATE INDEX "per_diem_shifts_shiftDate_idx" ON "per_diem_shifts"("shiftDate");

-- CreateIndex
CREATE INDEX "per_diem_shifts_status_idx" ON "per_diem_shifts"("status");

-- CreateIndex
CREATE INDEX "per_diem_shifts_occupationId_idx" ON "per_diem_shifts"("occupationId");

-- CreateIndex
CREATE INDEX "per_diem_shifts_locationId_idx" ON "per_diem_shifts"("locationId");

-- CreateIndex
CREATE INDEX "per_diem_shifts_departmentId_idx" ON "per_diem_shifts"("departmentId");

-- CreateIndex
CREATE INDEX "per_diem_assignments_shiftId_idx" ON "per_diem_assignments"("shiftId");

-- CreateIndex
CREATE INDEX "per_diem_assignments_candidateId_idx" ON "per_diem_assignments"("candidateId");

-- CreateIndex
CREATE INDEX "per_diem_assignments_vendorId_idx" ON "per_diem_assignments"("vendorId");

-- CreateIndex
CREATE INDEX "per_diem_assignments_status_idx" ON "per_diem_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "shift_routing_settings_organizationId_key" ON "shift_routing_settings"("organizationId");

-- CreateIndex
CREATE INDEX "shift_routing_settings_organizationId_idx" ON "shift_routing_settings"("organizationId");

-- CreateIndex
CREATE INDEX "shift_routing_tiers_organizationId_idx" ON "shift_routing_tiers"("organizationId");

-- CreateIndex
CREATE INDEX "shift_routing_tiers_priorityOrder_idx" ON "shift_routing_tiers"("priorityOrder");

-- CreateIndex
CREATE UNIQUE INDEX "shift_routing_tiers_organizationId_workforceType_key" ON "shift_routing_tiers"("organizationId", "workforceType");

-- CreateIndex
CREATE INDEX "grievances_organizationId_idx" ON "grievances"("organizationId");

-- CreateIndex
CREATE INDEX "grievances_candidateId_idx" ON "grievances"("candidateId");

-- CreateIndex
CREATE INDEX "grievances_status_idx" ON "grievances"("status");

-- CreateIndex
CREATE INDEX "grievance_tasks_grievanceId_idx" ON "grievance_tasks"("grievanceId");

-- CreateIndex
CREATE INDEX "grievance_tasks_assignedToUserId_idx" ON "grievance_tasks"("assignedToUserId");

-- CreateIndex
CREATE INDEX "grievance_tasks_status_idx" ON "grievance_tasks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_organizationId_idx" ON "invoices"("organizationId");

-- CreateIndex
CREATE INDEX "invoices_vendorId_idx" ON "invoices"("vendorId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_invoiceDate_idx" ON "invoices"("invoiceDate");

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "invoices"("dueDate");

-- CreateIndex
CREATE INDEX "invoice_line_items_invoiceId_idx" ON "invoice_line_items"("invoiceId");

-- CreateIndex
CREATE INDEX "occupation_specialties_occupationId_idx" ON "occupation_specialties"("occupationId");

-- CreateIndex
CREATE INDEX "occupation_specialties_specialtyId_idx" ON "occupation_specialties"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "occupation_specialties_occupationId_specialtyId_key" ON "occupation_specialties"("occupationId", "specialtyId");

-- CreateIndex
CREATE INDEX "spend_analytics_organizationId_idx" ON "spend_analytics"("organizationId");

-- CreateIndex
CREATE INDEX "spend_analytics_periodStart_periodEnd_idx" ON "spend_analytics"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "spend_analytics_periodType_idx" ON "spend_analytics"("periodType");

-- CreateIndex
CREATE INDEX "spend_analytics_departmentId_idx" ON "spend_analytics"("departmentId");

-- CreateIndex
CREATE INDEX "spend_analytics_vendorId_idx" ON "spend_analytics"("vendorId");

-- CreateIndex
CREATE INDEX "command_center_metrics_organizationId_idx" ON "command_center_metrics"("organizationId");

-- CreateIndex
CREATE INDEX "command_center_metrics_metricDate_idx" ON "command_center_metrics"("metricDate");

-- CreateIndex
CREATE INDEX "billing_configs_organizationId_idx" ON "billing_configs"("organizationId");

-- CreateIndex
CREATE INDEX "billing_configs_vendorId_idx" ON "billing_configs"("vendorId");

-- CreateIndex
CREATE INDEX "notifications_org_organizationId_idx" ON "notifications_org"("organizationId");

-- CreateIndex
CREATE INDEX "notifications_org_userId_idx" ON "notifications_org"("userId");

-- CreateIndex
CREATE INDEX "notifications_org_isRead_idx" ON "notifications_org"("isRead");

-- CreateIndex
CREATE INDEX "notifications_org_createdAt_idx" ON "notifications_org"("createdAt");

-- CreateIndex
CREATE INDEX "activity_log_org_organizationId_idx" ON "activity_log_org"("organizationId");

-- CreateIndex
CREATE INDEX "activity_log_org_userId_idx" ON "activity_log_org"("userId");

-- CreateIndex
CREATE INDEX "activity_log_org_entityType_entityId_idx" ON "activity_log_org"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_log_org_action_idx" ON "activity_log_org"("action");

-- CreateIndex
CREATE INDEX "activity_log_org_createdAt_idx" ON "activity_log_org"("createdAt");

-- CreateIndex
CREATE INDEX "department_organizationOccupationId_idx" ON "department"("organizationOccupationId");

-- CreateIndex
CREATE INDEX "member_role_idx" ON "member"("role");

-- CreateIndex
CREATE INDEX "metric_status_idx" ON "metric"("status");

-- CreateIndex
CREATE UNIQUE INDEX "organization_occupation_organizationId_occupationId_key" ON "organization_occupation"("organizationId", "occupationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_specialty_organizationId_specialtyId_key" ON "organization_specialty"("organizationId", "specialtyId");

-- CreateIndex
CREATE INDEX "tag_type_idx" ON "tag"("type");

-- CreateIndex
CREATE INDEX "tag_status_idx" ON "tag"("status");

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_organizationOccupationId_fkey" FOREIGN KEY ("organizationOccupationId") REFERENCES "organization_occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_specialty" ADD CONSTRAINT "organization_specialty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_tags" ADD CONSTRAINT "candidate_tags_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_tags" ADD CONSTRAINT "candidate_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_preferred_locations" ADD CONSTRAINT "candidate_preferred_locations_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_preferred_locations" ADD CONSTRAINT "candidate_preferred_locations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_compliance" ADD CONSTRAINT "candidate_compliance_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_compliance" ADD CONSTRAINT "candidate_compliance_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_compliance" ADD CONSTRAINT "candidate_compliance_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_interviewers" ADD CONSTRAINT "submission_interviewers_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_interviewers" ADD CONSTRAINT "submission_interviewers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_vendorContactId_fkey" FOREIGN KEY ("vendorContactId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_hiringManagerId_fkey" FOREIGN KEY ("hiringManagerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_terminatedById_fkey" FOREIGN KEY ("terminatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_compliance_items" ADD CONSTRAINT "placement_compliance_items_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_compliance_items" ADD CONSTRAINT "placement_compliance_items_complianceItemId_fkey" FOREIGN KEY ("complianceItemId") REFERENCES "compliance_list_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_offer_history" ADD CONSTRAINT "placement_offer_history_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_offer_history" ADD CONSTRAINT "placement_offer_history_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_tasks" ADD CONSTRAINT "placement_tasks_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_tasks" ADD CONSTRAINT "placement_tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_tasks" ADD CONSTRAINT "placement_tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_notes" ADD CONSTRAINT "placement_notes_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_notes" ADD CONSTRAINT "placement_notes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "timesheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_disputes" ADD CONSTRAINT "timesheet_disputes_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "timesheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_disputes" ADD CONSTRAINT "timesheet_disputes_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_disputes" ADD CONSTRAINT "timesheet_disputes_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_disputes" ADD CONSTRAINT "timesheet_disputes_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checklists" ADD CONSTRAINT "compliance_checklists_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checklists" ADD CONSTRAINT "compliance_checklists_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checklists" ADD CONSTRAINT "compliance_checklists_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checklists" ADD CONSTRAINT "compliance_checklists_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checklists" ADD CONSTRAINT "compliance_checklists_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checklist_items" ADD CONSTRAINT "compliance_checklist_items_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "compliance_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checklist_items" ADD CONSTRAINT "compliance_checklist_items_complianceListItemId_fkey" FOREIGN KEY ("complianceListItemId") REFERENCES "compliance_list_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_items" ADD CONSTRAINT "compliance_items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_items" ADD CONSTRAINT "compliance_items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_items" ADD CONSTRAINT "compliance_items_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_item_scopes" ADD CONSTRAINT "compliance_item_scopes_complianceItemId_fkey" FOREIGN KEY ("complianceItemId") REFERENCES "compliance_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_template" ADD CONSTRAINT "requisition_template_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_template" ADD CONSTRAINT "requisition_template_organizationOccupationId_fkey" FOREIGN KEY ("organizationOccupationId") REFERENCES "organization_occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_template" ADD CONSTRAINT "requisition_template_organizationSpecialtyId_fkey" FOREIGN KEY ("organizationSpecialtyId") REFERENCES "organization_specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_template" ADD CONSTRAINT "requisition_template_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_template" ADD CONSTRAINT "requisition_template_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_template" ADD CONSTRAINT "requisition_template_hiringManagerId_fkey" FOREIGN KEY ("hiringManagerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_template" ADD CONSTRAINT "requisition_template_complianceChecklistId_fkey" FOREIGN KEY ("complianceChecklistId") REFERENCES "compliance_checklists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_template" ADD CONSTRAINT "requisition_template_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_template" ADD CONSTRAINT "requisition_template_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_template_vendor" ADD CONSTRAINT "requisition_template_vendor_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "requisition_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_template_vendor" ADD CONSTRAINT "requisition_template_vendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "requisition_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_organizationOccupationId_fkey" FOREIGN KEY ("organizationOccupationId") REFERENCES "organization_occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_organizationSpecialtyId_fkey" FOREIGN KEY ("organizationSpecialtyId") REFERENCES "organization_specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_hiringManagerId_fkey" FOREIGN KEY ("hiringManagerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_complianceChecklistId_fkey" FOREIGN KEY ("complianceChecklistId") REFERENCES "compliance_checklists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_vendor" ADD CONSTRAINT "requisition_vendor_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_vendor" ADD CONSTRAINT "requisition_vendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_metric" ADD CONSTRAINT "organization_metric_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_metric" ADD CONSTRAINT "organization_metric_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "metric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_metric" ADD CONSTRAINT "organization_metric_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workforce_lists" ADD CONSTRAINT "workforce_lists_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workforce_lists" ADD CONSTRAINT "workforce_lists_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workforce_lists" ADD CONSTRAINT "workforce_lists_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workforce_list_members" ADD CONSTRAINT "workforce_list_members_listId_fkey" FOREIGN KEY ("listId") REFERENCES "workforce_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workforce_list_members" ADD CONSTRAINT "workforce_list_members_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workforce_list_members" ADD CONSTRAINT "workforce_list_members_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_templates" ADD CONSTRAINT "shift_templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_templates" ADD CONSTRAINT "shift_templates_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_templates" ADD CONSTRAINT "shift_templates_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_templates" ADD CONSTRAINT "shift_templates_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_templates" ADD CONSTRAINT "shift_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_templates" ADD CONSTRAINT "shift_templates_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_shifts" ADD CONSTRAINT "per_diem_shifts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_shifts" ADD CONSTRAINT "per_diem_shifts_shiftTemplateId_fkey" FOREIGN KEY ("shiftTemplateId") REFERENCES "shift_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_shifts" ADD CONSTRAINT "per_diem_shifts_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_shifts" ADD CONSTRAINT "per_diem_shifts_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_shifts" ADD CONSTRAINT "per_diem_shifts_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_shifts" ADD CONSTRAINT "per_diem_shifts_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_shifts" ADD CONSTRAINT "per_diem_shifts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_shifts" ADD CONSTRAINT "per_diem_shifts_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_assignments" ADD CONSTRAINT "per_diem_assignments_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "per_diem_shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_assignments" ADD CONSTRAINT "per_diem_assignments_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_assignments" ADD CONSTRAINT "per_diem_assignments_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_assignments" ADD CONSTRAINT "per_diem_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_assignments" ADD CONSTRAINT "per_diem_assignments_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_assignments" ADD CONSTRAINT "per_diem_assignments_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_routing_settings" ADD CONSTRAINT "shift_routing_settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_routing_settings" ADD CONSTRAINT "shift_routing_settings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_routing_settings" ADD CONSTRAINT "shift_routing_settings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_routing_tiers" ADD CONSTRAINT "shift_routing_tiers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grievance_tasks" ADD CONSTRAINT "grievance_tasks_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "grievances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grievance_tasks" ADD CONSTRAINT "grievance_tasks_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grievance_tasks" ADD CONSTRAINT "grievance_tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupation_specialties" ADD CONSTRAINT "occupation_specialties_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupation_specialties" ADD CONSTRAINT "occupation_specialties_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spend_analytics" ADD CONSTRAINT "spend_analytics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spend_analytics" ADD CONSTRAINT "spend_analytics_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spend_analytics" ADD CONSTRAINT "spend_analytics_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spend_analytics" ADD CONSTRAINT "spend_analytics_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spend_analytics" ADD CONSTRAINT "spend_analytics_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spend_analytics" ADD CONSTRAINT "spend_analytics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "command_center_metrics" ADD CONSTRAINT "command_center_metrics_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_configs" ADD CONSTRAINT "billing_configs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_configs" ADD CONSTRAINT "billing_configs_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications_org" ADD CONSTRAINT "notifications_org_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications_org" ADD CONSTRAINT "notifications_org_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log_org" ADD CONSTRAINT "activity_log_org_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log_org" ADD CONSTRAINT "activity_log_org_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
