-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AgingRuleStageTransition" AS ENUM ('SUBMISSION_TO_QUALIFIED', 'QUALIFIED_TO_SHORTLISTED', 'SHORTLISTED_TO_INTERVIEW_SCHEDULED', 'INTERVIEW_SCHEDULED_TO_INTERVIEW_COMPLETED', 'INTERVIEW_COMPLETED_TO_OFFER_SENT', 'OFFER_SENT_TO_OFFER_ACCEPTED', 'OFFER_ACCEPTED_TO_ONBOARDING', 'ONBOARDING_TO_STARTED', 'SUBMITTED_TO_REJECTED', 'OFFER_SENT_TO_OFFER_DECLINED');

-- CreateEnum
CREATE TYPE "AgingRuleUnit" AS ENUM ('HOURS', 'DAYS');

-- CreateEnum
CREATE TYPE "RequisitionAttentionRuleKey" AS ENUM ('SLOW_TIME_TO_FILL', 'LOW_SUBMISSION_COUNT', 'NO_SUBMISSIONS');

-- CreateEnum
CREATE TYPE "RequisitionAttentionRuleUnit" AS ENUM ('HOURS', 'DAYS', 'COUNT');

-- CreateEnum
CREATE TYPE "MatchingCriterionKey" AS ENUM ('PREFERRED_LOCATION', 'SHIFT_TYPE', 'CONTRACT_LENGTH', 'OCCUPATION', 'SPECIALTIES');

-- CreateEnum
CREATE TYPE "CandidatePreferredContractLength" AS ENUM ('PER_DIEM', 'BLOCKED_BOOKING', 'WEEKS_4_12', 'MONTHS_3', 'MONTHS_3_6', 'MONTHS_6_9', 'MONTHS_9_12', 'PERMANENT_ROLES', 'OPEN_TO_ANYTHING');

-- CreateEnum
CREATE TYPE "CandidateExperienceBand" AS ENUM ('LT_1', 'Y1_2', 'Y3_5', 'Y6_9', 'Y10_PLUS');

-- CreateEnum
CREATE TYPE "CredentialExpiryStatus" AS ENUM ('EXPIRING_SOON', 'CRITICAL', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WorkforceBillingFeeType" AS ENUM ('HOUR', 'SHIFT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'GENERAL_ADMIN', 'OPERATIONS_MANAGER', 'PROGRAM_MANAGER', 'TECHNICAL_MANAGER', 'PROGRAM_VENDOR_MANAGER', 'COMPLIANCE_MANAGER', 'VENDOR_USER', 'ORGANIZATION_USER', 'CANDIDATE_USER');

-- CreateEnum
CREATE TYPE "VendorUserRole" AS ENUM ('VENDOR_MANAGER', 'VENDOR_USER', 'VENDOR_VIEW_ONLY');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('EXECUTIVE', 'HIRING_MANAGER', 'OPERATIONS', 'OPERATIONS_MANAGER', 'PROGRAM_MANAGER', 'TECHNICAL_MANAGER', 'PROGRAM_VENDOR_MANAGER', 'COMPLIANCE_MANAGER', 'VENDOR_MANAGER', 'VENDOR_USER', 'VENDOR_VIEW_ONLY');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('HEADQUARTERS', 'BRANCH', 'SATELLITE', 'REMOTE');

-- CreateEnum
CREATE TYPE "DepartmentType" AS ENUM ('CLINICAL', 'NON_CLINICAL', 'ADMINISTRATIVE');

-- CreateEnum
CREATE TYPE "OrganizationIndustry" AS ENUM ('HEALTHCARE', 'TECHNOLOGY', 'FINANCE', 'MANUFACTURING', 'RETAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('HOSPITAL_NETWORK', 'CLINIC', 'CORPORATE', 'NON_PROFIT', 'GOVERNMENT');

-- CreateEnum
CREATE TYPE "OrganizationTimezone" AS ENUM ('EASTERN', 'CENTRAL', 'MOUNTAIN', 'PACIFIC');

-- CreateEnum
CREATE TYPE "OrganizationMemberStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OccupationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SpecialtyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CertifiedBusinessClassification" AS ENUM ('MINORITY_OWNED_BUSINESS', 'WOMEN_OWNED_BUSINESS', 'SMALL_BUSINESS', 'VETERAN_OWNED_BUSINESS', 'DISABLED_VETERAN_OWNED_BUSINESS');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('LEGAL', 'MARKETING', 'FINANCE', 'OTHERS');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('GENERAL', 'BILLING', 'ISSUE', 'REQUEST', 'MEETING', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "MSPOrganizationType" AS ENUM ('ORGANIZATION_STAFFING_OFFICE', 'CORPORATE_OFFICE', 'BRANCH_OFFICE', 'REMOTE_OFFICE');

-- CreateEnum
CREATE TYPE "ComplianceListItemResponseStyle" AS ENUM ('PENDING_FILE_UPLOAD', 'INTERNAL_TASK', 'DOWNLOAD_AND_UPLOAD', 'LINK');

-- CreateEnum
CREATE TYPE "ComplianceListItemExpirationType" AS ENUM ('EXPIRATION_DATE', 'EXPIRATION_RULE', 'NON_EXPIRABLE');

-- CreateEnum
CREATE TYPE "ComplianceListItemCategory" AS ENUM ('BACKGROUND_AND_IDENTIFICATION', 'CERTIFICATIONS', 'EMPLOYEE_HEALTH', 'IMMIGRATION', 'LICENSES', 'ASSESSMENTS', 'CLIENT_POLICY', 'OTHERS');

-- CreateEnum
CREATE TYPE "ComplianceListItemStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ExpirationRuleUnit" AS ENUM ('DAYS', 'MONTHS', 'YEARS');

-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('SKILL', 'COMPLIANCE', 'AVAILABILITY', 'PRIORITY', 'FLAG');

-- CreateEnum
CREATE TYPE "TagStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('RECRUITMENT_EFFICIENCY', 'COMPLIANCE', 'QUALITY_OF_SERVICE');

-- CreateEnum
CREATE TYPE "MetricKey" AS ENUM ('REJECTION_PERCENTAGE', 'FILL_RATE_LONG_TERM_REQS', 'FILL_RATE_SHIFTS', 'SUBMIT_TO_OFFER_RATIO', 'AVG_TIME_TO_FIRST_SUBMISSION', 'AVG_TIME_PUBLISH_TO_ACCEPT', 'PERCENT_INCOMPLETE_ASSIGNMENTS', 'EXPIRED_CREDENTIALING_PERCENT', 'ON_TIME_STARTS_PERCENT', 'BACK_OUT_PERCENTAGE', 'PERFORMANCE_GRIEVANCE_PERCENT', 'GRIEVANCE_PERCENTAGE');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('CHECKBOX', 'SELECT', 'RADIO_BUTTON', 'TEXT');

-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('EQUALS', 'LESS_THAN', 'GREATER_THAN', 'LESS_THAN_OR_EQUAL_TO', 'GREATER_THAN_OR_EQUAL_TO', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS');

-- CreateEnum
CREATE TYPE "MemberInviteStatus" AS ENUM ('NOT_SENT', 'PENDING', 'SCHEDULED', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "BackGroundJobType" AS ENUM ('BULK_ENROLL', 'BULK_PLATFORM_USERS', 'INVITE_SINGLE', 'INVITE_BULK', 'INVITE_CANDIDATE', 'TIMEKEEPING_REMINDER', 'TIMEKEEPING_UPLOAD', 'BILLING_INVOICE_GENERATION', 'BILLING_SPEND_ANALYTICS_REFRESH', 'METRIC_SNAPSHOT_RECOMPUTE');

-- CreateEnum
CREATE TYPE "BackGroundJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RequisitionType" AS ENUM ('LONG_TERM_ORDER', 'PER_DIEM', 'PERMANENT_ROLE', 'INTERNAL_FLEX_POOL');

-- CreateEnum
CREATE TYPE "RequisitionStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'SCHEDULED', 'PUBLISHED', 'FILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RequisitionTemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('DAY', 'EVENING', 'NIGHT', 'ROTATING', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('NO_INTERVIEW', 'CLIENT_INTERVIEW', 'INTERNAL_INTERVIEW');

-- CreateEnum
CREATE TYPE "WorkflowType" AS ENUM ('VENDOR_CANDIDATE', 'VENDOR_ONLY', 'CANDIDATE_ONLY');

-- CreateEnum
CREATE TYPE "ComplianceChecklistItemPhase" AS ENUM ('SUBMISSION', 'PLACEMENT');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "PlacementComplianceStatus" AS ENUM ('COMPLETE', 'IN_PROGRESS', 'MISSING');

-- CreateEnum
CREATE TYPE "MetricSnapshotPeriodType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "PlacementComplianceItemSource" AS ENUM ('REQUISITION', 'PLACEMENT_EXTRA');

-- CreateEnum
CREATE TYPE "SubmissionStage" AS ENUM ('SUBMITTED', 'QUALIFIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFERED', 'ACCEPTED', 'WITHDRAWN', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrganizationVendorStatus" AS ENUM ('PENDING', 'ACTIVE');

-- CreateEnum
CREATE TYPE "CandidateWorkforceType" AS ENUM ('INTERNAL_FULL_TIME', 'INTERNAL_PART_TIME', 'INTERNAL_PRN', 'INTERNAL_FLOAT_POOL', 'INTERNAL_VOLUNTEER', 'EXTERNAL_1099', 'EXTERNAL_EOR', 'EXTERNAL_VENDOR_LTO', 'EXTERNAL_VENDOR_PER_DIEM');

-- CreateEnum
CREATE TYPE "CandidateSource" AS ENUM ('DIRECT', 'VENDOR', 'PREVIOUS_WORKER');

-- CreateEnum
CREATE TYPE "CandidateInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CandidateComplianceStatus" AS ENUM ('MISSING', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PublishMode" AS ENUM ('DRAFT', 'PUBLISH_IMMEDIATELY', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('CONTRACT', 'PERMANENT', 'PER_DIEM');

-- CreateEnum
CREATE TYPE "OfferEventType" AS ENUM ('OFFER_EXTENDED', 'OFFER_VIEWED', 'OFFER_ACCEPTED', 'OFFER_DECLINED', 'OFFER_EXPIRED', 'OFFER_MODIFIED', 'PLACEMENT_CREATED', 'START_DATE_ADJUSTED', 'ASSIGNMENT_STARTED', 'PLACEMENT_TERMINATED');

-- CreateEnum
CREATE TYPE "PlacementTaskStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PerDiemShiftStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TimesheetEntryStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DISPUTED', 'DRAFT');

-- CreateEnum
CREATE TYPE "TimeEntryDataSource" AS ENUM ('FILE_UPLOAD', 'MOBILE_APP', 'MANUAL', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "MissingTimeCaseStatus" AS ENUM ('OPEN', 'REMINDED', 'RESOLVED', 'WAIVED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'DISPUTED', 'APPROVED', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GrievanceType" AS ENUM ('BEHAVIORAL', 'CLINICAL');

-- CreateEnum
CREATE TYPE "GrievanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "GrievanceTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DelayUnit" AS ENUM ('HOURS', 'MINUTES', 'DAYS');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CANDIDATE_USER',
    "subRole" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "phoneNumber" TEXT,
    "officePhone" TEXT,
    "timeZone" TEXT,
    "mspId" UUID,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" UUID NOT NULL,
    "activeOrganizationId" UUID,
    "vendorId" UUID,
    "vendorUserId" UUID,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" UUID NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "industry" "OrganizationIndustry" NOT NULL,
    "organizationType" "OrganizationType" NOT NULL,
    "timezone" "OrganizationTimezone" NOT NULL,
    "website" TEXT,
    "logo" TEXT,
    "metadata" TEXT,
    "serviceAgreement" TEXT,
    "description" TEXT,
    "agreementRenewalDate" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expected_annual_spend" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aging_rule" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "stageTransition" "AgingRuleStageTransition" NOT NULL,
    "thresholdValue" INTEGER NOT NULL,
    "thresholdUnit" "AgingRuleUnit" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aging_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisition_attention_rule" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "key" "RequisitionAttentionRuleKey" NOT NULL,
    "thresholdValue" INTEGER NOT NULL,
    "thresholdUnit" "RequisitionAttentionRuleUnit" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requisition_attention_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_location" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "locationType" "LocationType" NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "costCenter" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "departmentType" "DepartmentType" NOT NULL,
    "costCenter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_occupation" (
    "id" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "organizationOccupationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "department_occupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_specialty" (
    "id" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "organizationSpecialtyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "department_specialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_timekeeping_approver" (
    "id" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_timekeeping_approver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_user" (
    "id" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "MemberRole" NOT NULL,
    "status" "OrganizationMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "last_invite_status" "MemberInviteStatus" NOT NULL DEFAULT 'NOT_SENT',
    "last_invite_at" TIMESTAMP(3),
    "last_invite_scheduled_for" TIMESTAMP(3),
    "last_invite_job_id" UUID,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor" (
    "id" UUID NOT NULL,
    "logo" TEXT,
    "name" TEXT NOT NULL,
    "industries" "OrganizationIndustry"[],
    "certifiedBusinessClassifications" "CertifiedBusinessClassification"[],
    "about" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "taxId" TEXT,
    "phoneNumber" TEXT,
    "website" TEXT,
    "addressId" UUID,
    "annualRevenue" DOUBLE PRECISION,
    "employeeCount" INTEGER,
    "internalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_occupation_specialization" (
    "id" UUID NOT NULL,
    "vendorId" UUID NOT NULL,
    "occupationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_occupation_specialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_vendor" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "vendorId" UUID NOT NULL,
    "status" "OrganizationVendorStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3),
    "contractDocumentKey" TEXT,
    "contractFileName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_user" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "vendorId" UUID NOT NULL,
    "role" "VendorUserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_user_saved_requisitions" (
    "id" UUID NOT NULL,
    "vendorUserId" UUID NOT NULL,
    "requisitionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_user_saved_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "msp" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "industry" "OrganizationIndustry" NOT NULL,
    "organizationType" "MSPOrganizationType" NOT NULL,
    "headquartersId" UUID NOT NULL,
    "billingId" UUID,
    "isBillingSame" BOOLEAN NOT NULL DEFAULT true,
    "phoneNumber" TEXT NOT NULL,
    "timezone" "OrganizationTimezone" NOT NULL,
    "msaDocument" TEXT NOT NULL,
    "msaFileName" TEXT,
    "msaUploadedAt" TIMESTAMP(3),
    "msaAgreementRevisionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "msp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "msp_linked_orgs" (
    "id" UUID NOT NULL,
    "mspId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "addendumAgreement" TEXT NOT NULL,
    "addendumAgreementFileName" TEXT,
    "addendumAgreementUploadedAt" TIMESTAMP(3),
    "addendumRevisionDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3) NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "possibleCancellationDate" TIMESTAMP(3),
    "mspFeePercentage" DOUBLE PRECISION NOT NULL,
    "saasFeePercentage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "msp_linked_orgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" UUID NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uploadedBy" UUID,
    "mspId" UUID,
    "vendorId" UUID,
    "organizationId" UUID,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note" (
    "id" UUID NOT NULL,
    "type" "NoteType" NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "mspId" UUID,
    "vendorId" UUID,
    "organizationId" UUID,

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupation" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "industry" "OrganizationIndustry",
    "acronym" TEXT NOT NULL,
    "description" TEXT,
    "status" "OccupationStatus" NOT NULL DEFAULT 'ACTIVE',
    "hasSpecialty" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialty" (
    "id" UUID NOT NULL,
    "acronym" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT,
    "description" TEXT,
    "status" "SpecialtyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_occupation" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "occupationId" UUID NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_occupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_specialty" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "specialtyId" UUID NOT NULL,
    "organizationOccupationId" UUID NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_specialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_list_item" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ComplianceListItemCategory" NOT NULL,
    "expirationType" "ComplianceListItemExpirationType" NOT NULL,
    "expirationRuleValue" INTEGER,
    "expirationRuleUnit" "ExpirationRuleUnit",
    "issuerRequirement" BOOLEAN NOT NULL DEFAULT false,
    "issuer" TEXT,
    "responseStyle" "ComplianceListItemResponseStyle" NOT NULL,
    "file" TEXT,
    "instructionalNotes" TEXT,
    "displayToCandidate" BOOLEAN NOT NULL,
    "status" "ComplianceListItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_list_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_wallet_template" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "organizationOccupationId" UUID NOT NULL,
    "organizationSpecialtyId" UUID,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_wallet_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_wallet_template_item" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "complianceWalletTemplateId" UUID NOT NULL,
    "complianceListItemId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_wallet_template_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TagType" NOT NULL,
    "description" TEXT,
    "showOnSubmission" BOOLEAN NOT NULL,
    "status" "TagStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" UUID NOT NULL,
    "order" INTEGER,
    "questionText" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'TEXT',
    "options" TEXT[],
    "required" BOOLEAN NOT NULL DEFAULT false,
    "includeInSubmission" BOOLEAN NOT NULL DEFAULT true,
    "questionnaireId" UUID NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaire" (
    "id" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" UUID NOT NULL,
    "occupationId" UUID,
    "specialtyId" UUID,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tagging_rule" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "ruleName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "showOnSubmission" BOOLEAN NOT NULL DEFAULT true,
    "tagId" UUID NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tagging_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tagging_rule_question" (
    "id" UUID NOT NULL,
    "taggingRuleId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "condition" "ConditionType" NOT NULL,
    "triggerValue" TEXT NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tagging_rule_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_logic" (
    "id" UUID NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "matchingCriterionId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matching_logic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_criterion" (
    "id" UUID NOT NULL,
    "key" "MatchingCriterionKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matching_criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric" (
    "id" UUID NOT NULL,
    "key" "MetricKey" NOT NULL,
    "type" "MetricType" NOT NULL,
    "name" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metric_pkey" PRIMARY KEY ("id")
);

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
    "organizationId" UUID,
    "vendorId" UUID,
    "createdBy" UUID,
    "updatedBy" UUID,
    "workforceType" "CandidateWorkforceType",
    "source" "CandidateSource",
    "streetAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "licenseNumber" TEXT,
    "willingToRelocate" BOOLEAN NOT NULL DEFAULT false,
    "resumeUrl" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "skills" TEXT[],
    "preferredShiftTypes" "ShiftType"[],
    "preferredContractLengths" "CandidatePreferredContractLength"[] DEFAULT ARRAY[]::"CandidatePreferredContractLength"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "availableFrom" TIMESTAMP(3),
    "rtos" JSONB,
    "closedAt" TIMESTAMPTZ,
    "inviteStatus" "CandidateInviteStatus",
    "invitedAt" TIMESTAMP(3),
    "invitedById" UUID,
    "inviteToken" TEXT,
    "inviteTokenExpiresAt" TIMESTAMP(3),
    "onboardingCompletedAt" TIMESTAMPTZ,
    "profileBannerDismissedAt" TIMESTAMPTZ,
    "totalProfessionalExperienceBand" "CandidateExperienceBand",
    "earliestStartDate" DATE,
    "recentJobTitle" TEXT,
    "dateOfBirth" DATE,
    "lastFourSsn" TEXT,
    "skillsChecklistFileKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_specialties" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "specialtyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_professional_reference" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "fullName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_professional_reference_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "candidate_saved_requisitions" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "requisitionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_saved_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_requisition_vendor_reviews" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "requisitionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_requisition_vendor_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_compliance" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "complianceListItemId" UUID NOT NULL,
    "documentUrl" TEXT,
    "documentFileName" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "status" "CandidateComplianceStatus" NOT NULL DEFAULT 'MISSING',
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
CREATE TABLE "candidate_questionnaire_response" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_questionnaire_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_summary" (
    "candidateId" UUID NOT NULL,
    "organizationId" UUID,
    "vendorId" UUID,
    "occupationId" UUID NOT NULL,
    "primarySpecialtyId" UUID,
    "totalSpecialties" INTEGER NOT NULL DEFAULT 0,
    "totalPreferredLocations" INTEGER NOT NULL DEFAULT 0,
    "hasResume" BOOLEAN NOT NULL DEFAULT false,
    "hasAvatar" BOOLEAN NOT NULL DEFAULT false,
    "hasCompletedProfile" BOOLEAN NOT NULL DEFAULT false,
    "isSubmissionReady" BOOLEAN NOT NULL DEFAULT false,
    "totalComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "completedComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "missingComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "expiredComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "expiringSoonComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "nextComplianceExpiryDate" TIMESTAMP(3),
    "lastComplianceUpdatedAt" TIMESTAMP(3),
    "walletTotalComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "walletApprovedComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "walletPendingUploadComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "walletPendingVerificationComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "walletExpiredComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "walletExpiringSoonComplianceItems" INTEGER NOT NULL DEFAULT 0,
    "walletNextComplianceExpiryDate" TIMESTAMP(3),
    "walletLastComplianceUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_summary_pkey" PRIMARY KEY ("candidateId")
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
    "candidateId" UUID NOT NULL,
    "vendorId" UUID,
    "requisitionId" UUID NOT NULL,
    "vendorContactId" UUID,
    "hiringManagerId" UUID,
    "departmentId" UUID,
    "locationId" UUID,
    "jobTitle" TEXT,
    "unitName" TEXT,
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
    "complianceListItemId" UUID NOT NULL,
    "source" "PlacementComplianceItemSource" NOT NULL DEFAULT 'PLACEMENT_EXTRA',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_compliance_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_summary" (
    "placementId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "vendorId" UUID,
    "candidateId" UUID NOT NULL,
    "requisitionId" UUID NOT NULL,
    "status" "PlacementStatus" NOT NULL,
    "complianceStatus" "PlacementComplianceStatus" NOT NULL,
    "complianceProgressCompleted" INTEGER NOT NULL DEFAULT 0,
    "complianceProgressTotal" INTEGER NOT NULL DEFAULT 0,
    "complianceMissingItemsPreview" TEXT,
    "missingItemsCount" INTEGER NOT NULL DEFAULT 0,
    "expiredItemsCount" INTEGER NOT NULL DEFAULT 0,
    "expiringSoonItemsCount" INTEGER NOT NULL DEFAULT 0,
    "nextComplianceExpiryDate" TIMESTAMP(3),
    "lastComplianceUpdatedAt" TIMESTAMP(3),
    "latestTimecardStatus" "TimesheetEntryStatus",
    "totalApprovedHours" DOUBLE PRECISION,
    "lastTimeEntryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_summary_pkey" PRIMARY KEY ("placementId")
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "placementId" UUID,
    "perDiemAssignmentId" UUID,
    "candidateId" UUID NOT NULL,
    "departmentId" UUID,
    "locationId" UUID,
    "weekEndingDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeping_summary" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "vendorId" UUID,
    "weekEndingDate" TIMESTAMP(3) NOT NULL,
    "locationId" UUID,
    "departmentId" UUID,
    "totalEntries" INTEGER NOT NULL DEFAULT 0,
    "fileUploadEntries" INTEGER NOT NULL DEFAULT 0,
    "mobileAppEntries" INTEGER NOT NULL DEFAULT 0,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "regularHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTimesheets" INTEGER NOT NULL DEFAULT 0,
    "submittedTimesheets" INTEGER NOT NULL DEFAULT 0,
    "approvedTimesheets" INTEGER NOT NULL DEFAULT 0,
    "openDisputes" INTEGER NOT NULL DEFAULT 0,
    "resolvedDisputes" INTEGER NOT NULL DEFAULT 0,
    "missingTimeCasesOpen" INTEGER NOT NULL DEFAULT 0,
    "missingTimeCasesResolved" INTEGER NOT NULL DEFAULT 0,
    "missingTimeCasesOverdue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timekeeping_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential_expiry_summary" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "placementId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "complianceListItemId" UUID NOT NULL,
    "status" "CredentialExpiryStatus" NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "workerName" TEXT NOT NULL,
    "credentialName" TEXT NOT NULL,
    "credentialCategory" TEXT NOT NULL,
    "credentialTypeLabel" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "requisitionJobTitle" TEXT,
    "locationId" UUID,
    "locationName" TEXT,
    "departmentId" UUID,
    "departmentName" TEXT,
    "vendorId" UUID,
    "vendorName" TEXT,
    "hiringManagerId" UUID,
    "hiringManagerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credential_expiry_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet_entry" (
    "id" UUID NOT NULL,
    "timesheetId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "placementId" UUID,
    "perDiemAssignmentId" UUID,
    "departmentId" UUID,
    "locationId" UUID,
    "payCodeId" UUID,
    "workDate" TIMESTAMP(3) NOT NULL,
    "clockIn" TEXT,
    "clockOut" TEXT,
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "regularHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hours" DOUBLE PRECISION,
    "billRate" DOUBLE PRECISION,
    "billAmount" DOUBLE PRECISION,
    "notes" TEXT,
    "status" "TimesheetEntryStatus" NOT NULL DEFAULT 'PENDING',
    "dataSource" "TimeEntryDataSource" NOT NULL DEFAULT 'MANUAL',
    "approvalSource" TEXT,
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet_disputes" (
    "id" UUID NOT NULL,
    "timesheetId" UUID NOT NULL,
    "timesheetEntryId" UUID,
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
    "supportingDocuments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_disputes_pkey" PRIMARY KEY ("id")
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missing_time_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeping_policy" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "submissionDeadlineDays" INTEGER NOT NULL DEFAULT 3,
    "reminderIntervalDays" INTEGER NOT NULL DEFAULT 2,
    "autoCreateMissingCases" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timekeeping_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_checklists" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phase" "ComplianceChecklistItemPhase" NOT NULL DEFAULT 'SUBMISSION',

    CONSTRAINT "compliance_checklist_items_pkey" PRIMARY KEY ("id")
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
    "status" "RequisitionTemplateStatus" NOT NULL DEFAULT 'DRAFT',
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
    "approvalRole" "MemberRole",
    "workflowType" "WorkflowType",
    "whoCanSubmit" TEXT NOT NULL DEFAULT 'all_vendors',
    "internalNotes" TEXT,
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
    "incentiveType" TEXT,
    "incentiveAmount" DOUBLE PRECISION,
    "shiftType" "ShiftType",
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "lengthWeeks" INTEGER,
    "startTime" TEXT,
    "endTime" TEXT,
    "shiftHours" DOUBLE PRECISION,
    "shiftsPerWeek" INTEGER,
    "hoursPerWeek" DOUBLE PRECISION,
    "benefitsPerks" TEXT[],
    "interviewRequired" "InterviewType",
    "complianceChecklistId" UUID,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvalRole" "MemberRole",
    "workflowType" "WorkflowType",
    "whoCanSubmit" TEXT NOT NULL DEFAULT 'all_vendors',
    "internalNotes" TEXT,
    "vendorNotes" TEXT,
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
CREATE TABLE "requisition_acceptance_criterion" (
    "id" UUID NOT NULL,
    "requisitionId" UUID NOT NULL,
    "complianceListItemId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requisition_acceptance_criterion_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "organization_metric_snapshot" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "metricId" UUID NOT NULL,
    "periodType" "MetricSnapshotPeriodType" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "numerator" DOUBLE PRECISION,
    "denominator" DOUBLE PRECISION,
    "formulaVersion" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_metric_snapshot_pkey" PRIMARY KEY ("id")
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
    "visibilityUnlockDuration" INTEGER,
    "visibilityUnlockUnit" "DelayUnit",
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
    "departmentId" UUID,
    "locationId" UUID NOT NULL,
    "shiftRate" DOUBLE PRECISION NOT NULL,
    "vendorRate" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION,
    "sendPersonalizedNotification" BOOLEAN NOT NULL DEFAULT false,
    "status" "PerDiemShiftStatus" NOT NULL DEFAULT 'OPEN',
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
CREATE TABLE "per_diem_shift_specialties" (
    "id" UUID NOT NULL,
    "shiftId" UUID NOT NULL,
    "specialtyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "per_diem_shift_specialties_pkey" PRIMARY KEY ("id")
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
    "workforceType" "CandidateWorkforceType" NOT NULL,
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
    "routedToUserId" UUID,
    "routedByUserId" UUID,
    "routedAt" TIMESTAMP(3),
    "routingNotes" TEXT,
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
    "timesheetId" UUID,
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
CREATE TABLE "billing_configs" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "clientBillingId" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "billingStreet" TEXT,
    "billingCity" TEXT,
    "billingState" TEXT,
    "billingZip" TEXT,
    "remittanceStreet" TEXT,
    "remittanceCity" TEXT,
    "remittanceState" TEXT,
    "remittanceZip" TEXT,
    "billingFrequency" TEXT NOT NULL DEFAULT 'monthly',
    "paymentTerms" TEXT NOT NULL DEFAULT 'net_30',
    "invoiceGrouping" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "cycleStartDay" TEXT,
    "invoiceFormat" TEXT,
    "invoiceDeliveryEmail" BOOLEAN NOT NULL DEFAULT false,
    "invoiceDeliverySftp" BOOLEAN NOT NULL DEFAULT false,
    "invoiceDeliveryDownload" BOOLEAN NOT NULL DEFAULT false,
    "invoiceEmailRecipients" TEXT[],
    "otThreshold" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "timesheetApproval" BOOLEAN NOT NULL DEFAULT true,
    "mobileEntry" BOOLEAN NOT NULL DEFAULT false,
    "fileUpload" BOOLEAN NOT NULL DEFAULT false,
    "disputeTracking" BOOLEAN NOT NULL DEFAULT true,
    "mspPercent" DOUBLE PRECISION,
    "saasPercent" DOUBLE PRECISION,
    "markupType" TEXT,
    "markupValue" DOUBLE PRECISION,
    "vendorId" UUID,
    "requiresPo" BOOLEAN NOT NULL DEFAULT false,
    "poNumber" TEXT,
    "poExpiryDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_workforce_billing_rates" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "workforceType" "CandidateWorkforceType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "techFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "feeType" "WorkforceBillingFeeType" NOT NULL DEFAULT 'HOUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_workforce_billing_rates_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_mspId_idx" ON "user"("mspId");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "aging_rule_organizationId_stageTransition_key" ON "aging_rule"("organizationId", "stageTransition");

-- CreateIndex
CREATE UNIQUE INDEX "requisition_attention_rule_organizationId_key_key" ON "requisition_attention_rule"("organizationId", "key");

-- CreateIndex
CREATE INDEX "organization_location_organizationId_idx" ON "organization_location"("organizationId");

-- CreateIndex
CREATE INDEX "department_organizationId_idx" ON "department"("organizationId");

-- CreateIndex
CREATE INDEX "department_locationId_idx" ON "department"("locationId");

-- CreateIndex
CREATE INDEX "department_occupation_departmentId_idx" ON "department_occupation"("departmentId");

-- CreateIndex
CREATE INDEX "department_occupation_organizationOccupationId_idx" ON "department_occupation"("organizationOccupationId");

-- CreateIndex
CREATE UNIQUE INDEX "department_occupation_departmentId_organizationOccupationId_key" ON "department_occupation"("departmentId", "organizationOccupationId");

-- CreateIndex
CREATE INDEX "department_specialty_departmentId_idx" ON "department_specialty"("departmentId");

-- CreateIndex
CREATE INDEX "department_specialty_organizationSpecialtyId_idx" ON "department_specialty"("organizationSpecialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "department_specialty_departmentId_organizationSpecialtyId_key" ON "department_specialty"("departmentId", "organizationSpecialtyId");

-- CreateIndex
CREATE INDEX "department_timekeeping_approver_departmentId_idx" ON "department_timekeeping_approver"("departmentId");

-- CreateIndex
CREATE INDEX "department_timekeeping_approver_userId_idx" ON "department_timekeeping_approver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "department_timekeeping_approver_departmentId_userId_key" ON "department_timekeeping_approver"("departmentId", "userId");

-- CreateIndex
CREATE INDEX "department_user_departmentId_idx" ON "department_user"("departmentId");

-- CreateIndex
CREATE INDEX "department_user_userId_idx" ON "department_user"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "department_user_departmentId_userId_key" ON "department_user"("departmentId", "userId");

-- CreateIndex
CREATE INDEX "member_organizationId_idx" ON "member"("organizationId");

-- CreateIndex
CREATE INDEX "member_userId_idx" ON "member"("userId");

-- CreateIndex
CREATE INDEX "member_role_idx" ON "member"("role");

-- CreateIndex
CREATE UNIQUE INDEX "member_userId_organizationId_key" ON "member"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_internalId_key" ON "vendor"("internalId");

-- CreateIndex
CREATE INDEX "vendor_internalId_idx" ON "vendor"("internalId");

-- CreateIndex
CREATE INDEX "vendor_addressId_idx" ON "vendor"("addressId");

-- CreateIndex
CREATE INDEX "vendor_occupation_specialization_vendorId_idx" ON "vendor_occupation_specialization"("vendorId");

-- CreateIndex
CREATE INDEX "vendor_occupation_specialization_occupationId_idx" ON "vendor_occupation_specialization"("occupationId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_occupation_specialization_vendorId_occupationId_key" ON "vendor_occupation_specialization"("vendorId", "occupationId");

-- CreateIndex
CREATE INDEX "organization_vendor_organizationId_idx" ON "organization_vendor"("organizationId");

-- CreateIndex
CREATE INDEX "organization_vendor_vendorId_idx" ON "organization_vendor"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_vendor_organizationId_vendorId_key" ON "organization_vendor"("organizationId", "vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_user_userId_key" ON "vendor_user"("userId");

-- CreateIndex
CREATE INDEX "vendor_user_userId_idx" ON "vendor_user"("userId");

-- CreateIndex
CREATE INDEX "vendor_user_vendorId_idx" ON "vendor_user"("vendorId");

-- CreateIndex
CREATE INDEX "vendor_user_saved_requisitions_vendorUserId_idx" ON "vendor_user_saved_requisitions"("vendorUserId");

-- CreateIndex
CREATE INDEX "vendor_user_saved_requisitions_requisitionId_idx" ON "vendor_user_saved_requisitions"("requisitionId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_user_saved_requisitions_vendorUserId_requisitionId_key" ON "vendor_user_saved_requisitions"("vendorUserId", "requisitionId");

-- CreateIndex
CREATE INDEX "msp_headquartersId_idx" ON "msp"("headquartersId");

-- CreateIndex
CREATE INDEX "msp_billingId_idx" ON "msp"("billingId");

-- CreateIndex
CREATE INDEX "msp_linked_orgs_mspId_idx" ON "msp_linked_orgs"("mspId");

-- CreateIndex
CREATE INDEX "msp_linked_orgs_organizationId_idx" ON "msp_linked_orgs"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "msp_linked_orgs_mspId_organizationId_key" ON "msp_linked_orgs"("mspId", "organizationId");

-- CreateIndex
CREATE INDEX "document_uploadedBy_idx" ON "document"("uploadedBy");

-- CreateIndex
CREATE INDEX "document_mspId_idx" ON "document"("mspId");

-- CreateIndex
CREATE INDEX "document_vendorId_idx" ON "document"("vendorId");

-- CreateIndex
CREATE INDEX "document_organizationId_idx" ON "document"("organizationId");

-- CreateIndex
CREATE INDEX "note_createdBy_idx" ON "note"("createdBy");

-- CreateIndex
CREATE INDEX "note_mspId_idx" ON "note"("mspId");

-- CreateIndex
CREATE INDEX "note_vendorId_idx" ON "note"("vendorId");

-- CreateIndex
CREATE INDEX "note_organizationId_idx" ON "note"("organizationId");

-- CreateIndex
CREATE INDEX "occupation_status_idx" ON "occupation"("status");

-- CreateIndex
CREATE INDEX "specialty_status_idx" ON "specialty"("status");

-- CreateIndex
CREATE INDEX "organization_occupation_organizationId_idx" ON "organization_occupation"("organizationId");

-- CreateIndex
CREATE INDEX "organization_occupation_occupationId_idx" ON "organization_occupation"("occupationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_occupation_organizationId_occupationId_key" ON "organization_occupation"("organizationId", "occupationId");

-- CreateIndex
CREATE INDEX "organization_specialty_organizationId_idx" ON "organization_specialty"("organizationId");

-- CreateIndex
CREATE INDEX "organization_specialty_specialtyId_idx" ON "organization_specialty"("specialtyId");

-- CreateIndex
CREATE INDEX "organization_specialty_organizationOccupationId_idx" ON "organization_specialty"("organizationOccupationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_specialty_organizationOccupationId_specialtyId_key" ON "organization_specialty"("organizationOccupationId", "specialtyId");

-- CreateIndex
CREATE INDEX "compliance_list_item_category_idx" ON "compliance_list_item"("category");

-- CreateIndex
CREATE INDEX "compliance_list_item_expirationType_idx" ON "compliance_list_item"("expirationType");

-- CreateIndex
CREATE INDEX "compliance_list_item_responseStyle_idx" ON "compliance_list_item"("responseStyle");

-- CreateIndex
CREATE INDEX "compliance_list_item_status_idx" ON "compliance_list_item"("status");

-- CreateIndex
CREATE INDEX "compliance_wallet_template_organizationId_organizationOccup_idx" ON "compliance_wallet_template"("organizationId", "organizationOccupationId", "organizationSpecialtyId");

-- CreateIndex
CREATE INDEX "compliance_wallet_template_createdBy_idx" ON "compliance_wallet_template"("createdBy");

-- CreateIndex
CREATE INDEX "compliance_wallet_template_updatedBy_idx" ON "compliance_wallet_template"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_wallet_template_organizationId_organizationOccup_key" ON "compliance_wallet_template"("organizationId", "organizationOccupationId", "organizationSpecialtyId");

-- CreateIndex
CREATE INDEX "compliance_wallet_template_item_organizationId_complianceWa_idx" ON "compliance_wallet_template_item"("organizationId", "complianceWalletTemplateId");

-- CreateIndex
CREATE INDEX "compliance_wallet_template_item_complianceListItemId_idx" ON "compliance_wallet_template_item"("complianceListItemId");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_wallet_template_item_complianceWalletTemplateId__key" ON "compliance_wallet_template_item"("complianceWalletTemplateId", "complianceListItemId");

-- CreateIndex
CREATE INDEX "tag_type_idx" ON "tag"("type");

-- CreateIndex
CREATE INDEX "tag_status_idx" ON "tag"("status");

-- CreateIndex
CREATE INDEX "tag_createdBy_idx" ON "tag"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_type_key" ON "tag"("name", "type");

-- CreateIndex
CREATE INDEX "question_questionnaireId_idx" ON "question"("questionnaireId");

-- CreateIndex
CREATE INDEX "question_createdBy_idx" ON "question"("createdBy");

-- CreateIndex
CREATE INDEX "question_updatedBy_idx" ON "question"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "questionnaire_occupationId_key" ON "questionnaire"("occupationId");

-- CreateIndex
CREATE UNIQUE INDEX "questionnaire_specialtyId_key" ON "questionnaire"("specialtyId");

-- CreateIndex
CREATE INDEX "questionnaire_organizationId_idx" ON "questionnaire"("organizationId");

-- CreateIndex
CREATE INDEX "questionnaire_specialtyId_idx" ON "questionnaire"("specialtyId");

-- CreateIndex
CREATE INDEX "questionnaire_occupationId_idx" ON "questionnaire"("occupationId");

-- CreateIndex
CREATE INDEX "tagging_rule_organizationId_idx" ON "tagging_rule"("organizationId");

-- CreateIndex
CREATE INDEX "tagging_rule_tagId_idx" ON "tagging_rule"("tagId");

-- CreateIndex
CREATE INDEX "tagging_rule_createdBy_idx" ON "tagging_rule"("createdBy");

-- CreateIndex
CREATE INDEX "tagging_rule_updatedBy_idx" ON "tagging_rule"("updatedBy");

-- CreateIndex
CREATE INDEX "tagging_rule_question_taggingRuleId_idx" ON "tagging_rule_question"("taggingRuleId");

-- CreateIndex
CREATE INDEX "tagging_rule_question_questionId_idx" ON "tagging_rule_question"("questionId");

-- CreateIndex
CREATE INDEX "tagging_rule_question_createdBy_idx" ON "tagging_rule_question"("createdBy");

-- CreateIndex
CREATE INDEX "tagging_rule_question_updatedBy_idx" ON "tagging_rule_question"("updatedBy");

-- CreateIndex
CREATE INDEX "matching_logic_organizationId_idx" ON "matching_logic"("organizationId");

-- CreateIndex
CREATE INDEX "matching_logic_matchingCriterionId_idx" ON "matching_logic"("matchingCriterionId");

-- CreateIndex
CREATE INDEX "matching_logic_createdBy_idx" ON "matching_logic"("createdBy");

-- CreateIndex
CREATE INDEX "matching_logic_updatedBy_idx" ON "matching_logic"("updatedBy");

-- CreateIndex
CREATE UNIQUE INDEX "matching_logic_organizationId_matchingCriterionId_key" ON "matching_logic"("organizationId", "matchingCriterionId");

-- CreateIndex
CREATE UNIQUE INDEX "matching_criterion_key_key" ON "matching_criterion"("key");

-- CreateIndex
CREATE UNIQUE INDEX "matching_criterion_name_key" ON "matching_criterion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "metric_key_key" ON "metric"("key");

-- CreateIndex
CREATE UNIQUE INDEX "metric_name_key" ON "metric"("name");

-- CreateIndex
CREATE INDEX "metric_type_idx" ON "metric"("type");

-- CreateIndex
CREATE INDEX "metric_status_idx" ON "metric"("status");

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
CREATE INDEX "candidate_isActive_idx" ON "candidate"("isActive");

-- CreateIndex
CREATE INDEX "candidate_isAvailable_idx" ON "candidate"("isAvailable");

-- CreateIndex
CREATE INDEX "candidate_inviteStatus_idx" ON "candidate"("inviteStatus");

-- CreateIndex
CREATE INDEX "candidate_closedAt_idx" ON "candidate"("closedAt");

-- CreateIndex
CREATE INDEX "candidate_specialties_candidateId_idx" ON "candidate_specialties"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_specialties_specialtyId_idx" ON "candidate_specialties"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_specialties_candidateId_specialtyId_key" ON "candidate_specialties"("candidateId", "specialtyId");

-- CreateIndex
CREATE INDEX "candidate_professional_reference_candidateId_idx" ON "candidate_professional_reference"("candidateId");

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
CREATE INDEX "candidate_saved_requisitions_candidateId_idx" ON "candidate_saved_requisitions"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_saved_requisitions_requisitionId_idx" ON "candidate_saved_requisitions"("requisitionId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_saved_requisitions_candidateId_requisitionId_key" ON "candidate_saved_requisitions"("candidateId", "requisitionId");

-- CreateIndex
CREATE INDEX "candidate_requisition_vendor_reviews_candidateId_idx" ON "candidate_requisition_vendor_reviews"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_requisition_vendor_reviews_requisitionId_idx" ON "candidate_requisition_vendor_reviews"("requisitionId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_requisition_vendor_reviews_candidateId_requisitio_key" ON "candidate_requisition_vendor_reviews"("candidateId", "requisitionId");

-- CreateIndex
CREATE INDEX "candidate_compliance_candidateId_idx" ON "candidate_compliance"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_compliance_complianceListItemId_idx" ON "candidate_compliance"("complianceListItemId");

-- CreateIndex
CREATE INDEX "candidate_compliance_status_idx" ON "candidate_compliance"("status");

-- CreateIndex
CREATE INDEX "candidate_compliance_expiryDate_idx" ON "candidate_compliance"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_compliance_candidateId_complianceListItemId_key" ON "candidate_compliance"("candidateId", "complianceListItemId");

-- CreateIndex
CREATE INDEX "candidate_questionnaire_response_candidateId_idx" ON "candidate_questionnaire_response"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_questionnaire_response_questionId_idx" ON "candidate_questionnaire_response"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_questionnaire_response_candidateId_questionId_key" ON "candidate_questionnaire_response"("candidateId", "questionId");

-- CreateIndex
CREATE INDEX "candidate_summary_organizationId_idx" ON "candidate_summary"("organizationId");

-- CreateIndex
CREATE INDEX "candidate_summary_vendorId_idx" ON "candidate_summary"("vendorId");

-- CreateIndex
CREATE INDEX "candidate_summary_occupationId_idx" ON "candidate_summary"("occupationId");

-- CreateIndex
CREATE INDEX "candidate_summary_lastComplianceUpdatedAt_idx" ON "candidate_summary"("lastComplianceUpdatedAt");

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
CREATE INDEX "submission_organizationId_stage_stageEnteredAt_idx" ON "submission"("organizationId", "stage", "stageEnteredAt");

-- CreateIndex
CREATE INDEX "submission_organizationId_stage_submittedAt_idx" ON "submission"("organizationId", "stage", "submittedAt");

-- CreateIndex
CREATE INDEX "submission_organizationId_stage_qualifiedAt_idx" ON "submission"("organizationId", "stage", "qualifiedAt");

-- CreateIndex
CREATE INDEX "submission_organizationId_stage_offerExtendedAt_idx" ON "submission"("organizationId", "stage", "offerExtendedAt");

-- CreateIndex
CREATE INDEX "submission_organizationId_stage_acceptedAt_idx" ON "submission"("organizationId", "stage", "acceptedAt");

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
CREATE INDEX "placement_candidateId_idx" ON "placement"("candidateId");

-- CreateIndex
CREATE INDEX "placement_requisitionId_idx" ON "placement"("requisitionId");

-- CreateIndex
CREATE INDEX "placement_vendorId_idx" ON "placement"("vendorId");

-- CreateIndex
CREATE INDEX "placement_status_idx" ON "placement"("status");

-- CreateIndex
CREATE INDEX "placement_organizationId_startDate_status_idx" ON "placement"("organizationId", "startDate", "status");

-- CreateIndex
CREATE INDEX "placement_organizationId_vendorId_status_idx" ON "placement"("organizationId", "vendorId", "status");

-- CreateIndex
CREATE INDEX "placement_startDate_idx" ON "placement"("startDate");

-- CreateIndex
CREATE INDEX "placement_createdBy_idx" ON "placement"("createdBy");

-- CreateIndex
CREATE INDEX "placement_updatedBy_idx" ON "placement"("updatedBy");

-- CreateIndex
CREATE INDEX "placement_compliance_items_placementId_idx" ON "placement_compliance_items"("placementId");

-- CreateIndex
CREATE INDEX "placement_compliance_items_placementId_removedAt_idx" ON "placement_compliance_items"("placementId", "removedAt");

-- CreateIndex
CREATE INDEX "placement_compliance_items_complianceListItemId_idx" ON "placement_compliance_items"("complianceListItemId");

-- CreateIndex
CREATE UNIQUE INDEX "placement_compliance_items_placementId_complianceListItemId_key" ON "placement_compliance_items"("placementId", "complianceListItemId");

-- CreateIndex
CREATE INDEX "placement_summary_organizationId_status_complianceStatus_idx" ON "placement_summary"("organizationId", "status", "complianceStatus");

-- CreateIndex
CREATE INDEX "placement_summary_organizationId_vendorId_status_idx" ON "placement_summary"("organizationId", "vendorId", "status");

-- CreateIndex
CREATE INDEX "placement_summary_lastComplianceUpdatedAt_idx" ON "placement_summary"("lastComplianceUpdatedAt");

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
CREATE INDEX "organization_pay_code_organizationId_idx" ON "organization_pay_code"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_pay_code_organizationId_code_key" ON "organization_pay_code"("organizationId", "code");

-- CreateIndex
CREATE INDEX "organization_holiday_organizationId_idx" ON "organization_holiday"("organizationId");

-- CreateIndex
CREATE INDEX "organization_holiday_organizationId_observedOn_idx" ON "organization_holiday"("organizationId", "observedOn");

-- CreateIndex
CREATE UNIQUE INDEX "timesheet_perDiemAssignmentId_key" ON "timesheet"("perDiemAssignmentId");

-- CreateIndex
CREATE INDEX "timesheet_organizationId_idx" ON "timesheet"("organizationId");

-- CreateIndex
CREATE INDEX "timesheet_placementId_idx" ON "timesheet"("placementId");

-- CreateIndex
CREATE INDEX "timesheet_candidateId_idx" ON "timesheet"("candidateId");

-- CreateIndex
CREATE INDEX "timesheet_departmentId_idx" ON "timesheet"("departmentId");

-- CreateIndex
CREATE INDEX "timesheet_locationId_idx" ON "timesheet"("locationId");

-- CreateIndex
CREATE INDEX "timesheet_weekEndingDate_idx" ON "timesheet"("weekEndingDate");

-- CreateIndex
CREATE INDEX "timekeeping_summary_organizationId_weekEndingDate_idx" ON "timekeeping_summary"("organizationId", "weekEndingDate");

-- CreateIndex
CREATE INDEX "timekeeping_summary_organizationId_vendorId_weekEndingDate_idx" ON "timekeeping_summary"("organizationId", "vendorId", "weekEndingDate");

-- CreateIndex
CREATE INDEX "credential_expiry_summary_organizationId_status_idx" ON "credential_expiry_summary"("organizationId", "status");

-- CreateIndex
CREATE INDEX "credential_expiry_summary_organizationId_expiryDate_idx" ON "credential_expiry_summary"("organizationId", "expiryDate");

-- CreateIndex
CREATE INDEX "credential_expiry_summary_organizationId_locationId_idx" ON "credential_expiry_summary"("organizationId", "locationId");

-- CreateIndex
CREATE INDEX "credential_expiry_summary_organizationId_departmentId_idx" ON "credential_expiry_summary"("organizationId", "departmentId");

-- CreateIndex
CREATE INDEX "credential_expiry_summary_organizationId_vendorId_idx" ON "credential_expiry_summary"("organizationId", "vendorId");

-- CreateIndex
CREATE INDEX "credential_expiry_summary_organizationId_hiringManagerId_idx" ON "credential_expiry_summary"("organizationId", "hiringManagerId");

-- CreateIndex
CREATE UNIQUE INDEX "credential_expiry_summary_placementId_complianceListItemId_key" ON "credential_expiry_summary"("placementId", "complianceListItemId");

-- CreateIndex
CREATE INDEX "timesheet_entry_timesheetId_idx" ON "timesheet_entry"("timesheetId");

-- CreateIndex
CREATE INDEX "timesheet_entry_organizationId_workDate_idx" ON "timesheet_entry"("organizationId", "workDate");

-- CreateIndex
CREATE INDEX "timesheet_entry_candidateId_workDate_idx" ON "timesheet_entry"("candidateId", "workDate");

-- CreateIndex
CREATE INDEX "timesheet_entry_placementId_idx" ON "timesheet_entry"("placementId");

-- CreateIndex
CREATE INDEX "timesheet_entry_perDiemAssignmentId_idx" ON "timesheet_entry"("perDiemAssignmentId");

-- CreateIndex
CREATE INDEX "timesheet_entry_locationId_workDate_idx" ON "timesheet_entry"("locationId", "workDate");

-- CreateIndex
CREATE INDEX "timesheet_entry_departmentId_idx" ON "timesheet_entry"("departmentId");

-- CreateIndex
CREATE INDEX "timesheet_entry_status_idx" ON "timesheet_entry"("status");

-- CreateIndex
CREATE INDEX "timesheet_entry_workDate_idx" ON "timesheet_entry"("workDate");

-- CreateIndex
CREATE INDEX "timesheet_disputes_timesheetId_idx" ON "timesheet_disputes"("timesheetId");

-- CreateIndex
CREATE INDEX "timesheet_disputes_timesheetEntryId_idx" ON "timesheet_disputes"("timesheetEntryId");

-- CreateIndex
CREATE INDEX "timesheet_disputes_raisedById_idx" ON "timesheet_disputes"("raisedById");

-- CreateIndex
CREATE INDEX "timesheet_disputes_assignedToId_idx" ON "timesheet_disputes"("assignedToId");

-- CreateIndex
CREATE INDEX "missing_time_case_organizationId_workDate_idx" ON "missing_time_case"("organizationId", "workDate");

-- CreateIndex
CREATE INDEX "missing_time_case_candidateId_workDate_idx" ON "missing_time_case"("candidateId", "workDate");

-- CreateIndex
CREATE INDEX "missing_time_case_placementId_idx" ON "missing_time_case"("placementId");

-- CreateIndex
CREATE INDEX "missing_time_case_status_idx" ON "missing_time_case"("status");

-- CreateIndex
CREATE UNIQUE INDEX "timekeeping_policy_organizationId_key" ON "timekeeping_policy"("organizationId");

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
CREATE INDEX "requisition_approvalRole_idx" ON "requisition"("approvalRole");

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
CREATE INDEX "requisition_organizationId_status_createdAt_idx" ON "requisition"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "requisition_acceptance_criterion_requisitionId_idx" ON "requisition_acceptance_criterion"("requisitionId");

-- CreateIndex
CREATE INDEX "requisition_acceptance_criterion_complianceListItemId_idx" ON "requisition_acceptance_criterion"("complianceListItemId");

-- CreateIndex
CREATE UNIQUE INDEX "requisition_acceptance_criterion_requisitionId_complianceLi_key" ON "requisition_acceptance_criterion"("requisitionId", "complianceListItemId");

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
CREATE INDEX "organization_metric_snapshot_organizationId_periodStart_idx" ON "organization_metric_snapshot"("organizationId", "periodStart");

-- CreateIndex
CREATE INDEX "organization_metric_snapshot_organizationId_metricId_period_idx" ON "organization_metric_snapshot"("organizationId", "metricId", "periodType", "periodStart");

-- CreateIndex
CREATE INDEX "organization_metric_snapshot_metricId_periodStart_idx" ON "organization_metric_snapshot"("metricId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "organization_metric_snapshot_organizationId_metricId_period_key" ON "organization_metric_snapshot"("organizationId", "metricId", "periodType", "periodStart", "periodEnd");

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
CREATE INDEX "per_diem_shifts_organizationId_status_shiftDate_idx" ON "per_diem_shifts"("organizationId", "status", "shiftDate");

-- CreateIndex
CREATE INDEX "per_diem_shifts_organizationId_shiftDate_startTime_idx" ON "per_diem_shifts"("organizationId", "shiftDate", "startTime");

-- CreateIndex
CREATE INDEX "per_diem_shift_specialties_shiftId_idx" ON "per_diem_shift_specialties"("shiftId");

-- CreateIndex
CREATE INDEX "per_diem_shift_specialties_specialtyId_idx" ON "per_diem_shift_specialties"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "per_diem_shift_specialties_shiftId_specialtyId_key" ON "per_diem_shift_specialties"("shiftId", "specialtyId");

-- CreateIndex
CREATE INDEX "per_diem_assignments_shiftId_idx" ON "per_diem_assignments"("shiftId");

-- CreateIndex
CREATE INDEX "per_diem_assignments_candidateId_idx" ON "per_diem_assignments"("candidateId");

-- CreateIndex
CREATE INDEX "per_diem_assignments_vendorId_idx" ON "per_diem_assignments"("vendorId");

-- CreateIndex
CREATE INDEX "per_diem_assignments_status_idx" ON "per_diem_assignments"("status");

-- CreateIndex
CREATE INDEX "per_diem_assignments_candidateId_status_assignedAt_idx" ON "per_diem_assignments"("candidateId", "status", "assignedAt");

-- CreateIndex
CREATE INDEX "per_diem_assignments_shiftId_status_idx" ON "per_diem_assignments"("shiftId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "per_diem_assignments_shiftId_candidateId_key" ON "per_diem_assignments"("shiftId", "candidateId");

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
CREATE INDEX "grievances_organizationId_status_idx" ON "grievances"("organizationId", "status");

-- CreateIndex
CREATE INDEX "grievances_placementId_idx" ON "grievances"("placementId");

-- CreateIndex
CREATE UNIQUE INDEX "grievances_organizationId_grievanceNumber_key" ON "grievances"("organizationId", "grievanceNumber");

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
CREATE INDEX "invoices_organizationId_status_invoiceDate_idx" ON "invoices"("organizationId", "status", "invoiceDate");

-- CreateIndex
CREATE INDEX "invoices_organizationId_status_dueDate_idx" ON "invoices"("organizationId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "invoices_organizationId_approvedAt_idx" ON "invoices"("organizationId", "approvedAt");

-- CreateIndex
CREATE INDEX "invoices_routedToUserId_idx" ON "invoices"("routedToUserId");

-- CreateIndex
CREATE INDEX "invoice_line_items_invoiceId_idx" ON "invoice_line_items"("invoiceId");

-- CreateIndex
CREATE INDEX "invoice_line_items_timesheetId_idx" ON "invoice_line_items"("timesheetId");

-- CreateIndex
CREATE INDEX "occupation_specialties_occupationId_idx" ON "occupation_specialties"("occupationId");

-- CreateIndex
CREATE INDEX "occupation_specialties_specialtyId_idx" ON "occupation_specialties"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "occupation_specialties_occupationId_specialtyId_key" ON "occupation_specialties"("occupationId", "specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "billing_configs_clientBillingId_key" ON "billing_configs"("clientBillingId");

-- CreateIndex
CREATE INDEX "billing_configs_organizationId_idx" ON "billing_configs"("organizationId");

-- CreateIndex
CREATE INDEX "billing_configs_vendorId_idx" ON "billing_configs"("vendorId");

-- CreateIndex
CREATE INDEX "organization_workforce_billing_rates_organizationId_idx" ON "organization_workforce_billing_rates"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_workforce_billing_rates_organizationId_workfor_key" ON "organization_workforce_billing_rates"("organizationId", "workforceType");

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

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_mspId_fkey" FOREIGN KEY ("mspId") REFERENCES "msp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aging_rule" ADD CONSTRAINT "aging_rule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_attention_rule" ADD CONSTRAINT "requisition_attention_rule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_location" ADD CONSTRAINT "organization_location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_occupation" ADD CONSTRAINT "department_occupation_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_occupation" ADD CONSTRAINT "department_occupation_organizationOccupationId_fkey" FOREIGN KEY ("organizationOccupationId") REFERENCES "organization_occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_specialty" ADD CONSTRAINT "department_specialty_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_specialty" ADD CONSTRAINT "department_specialty_organizationSpecialtyId_fkey" FOREIGN KEY ("organizationSpecialtyId") REFERENCES "organization_specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_timekeeping_approver" ADD CONSTRAINT "department_timekeeping_approver_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_timekeeping_approver" ADD CONSTRAINT "department_timekeeping_approver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_user" ADD CONSTRAINT "department_user_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_user" ADD CONSTRAINT "department_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor" ADD CONSTRAINT "vendor_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_occupation_specialization" ADD CONSTRAINT "vendor_occupation_specialization_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_occupation_specialization" ADD CONSTRAINT "vendor_occupation_specialization_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_vendor" ADD CONSTRAINT "organization_vendor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_vendor" ADD CONSTRAINT "organization_vendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_user" ADD CONSTRAINT "vendor_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_user" ADD CONSTRAINT "vendor_user_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_user_saved_requisitions" ADD CONSTRAINT "vendor_user_saved_requisitions_vendorUserId_fkey" FOREIGN KEY ("vendorUserId") REFERENCES "vendor_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_user_saved_requisitions" ADD CONSTRAINT "vendor_user_saved_requisitions_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "msp" ADD CONSTRAINT "msp_headquartersId_fkey" FOREIGN KEY ("headquartersId") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "msp" ADD CONSTRAINT "msp_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "msp_linked_orgs" ADD CONSTRAINT "msp_linked_orgs_mspId_fkey" FOREIGN KEY ("mspId") REFERENCES "msp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "msp_linked_orgs" ADD CONSTRAINT "msp_linked_orgs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_mspId_fkey" FOREIGN KEY ("mspId") REFERENCES "msp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_mspId_fkey" FOREIGN KEY ("mspId") REFERENCES "msp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_occupation" ADD CONSTRAINT "organization_occupation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_occupation" ADD CONSTRAINT "organization_occupation_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_occupation" ADD CONSTRAINT "organization_occupation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_occupation" ADD CONSTRAINT "organization_occupation_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_specialty" ADD CONSTRAINT "organization_specialty_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_specialty" ADD CONSTRAINT "organization_specialty_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_specialty" ADD CONSTRAINT "organization_specialty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_specialty" ADD CONSTRAINT "organization_specialty_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_specialty" ADD CONSTRAINT "organization_specialty_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_specialty" ADD CONSTRAINT "organization_specialty_organizationOccupationId_fkey" FOREIGN KEY ("organizationOccupationId") REFERENCES "organization_occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template" ADD CONSTRAINT "compliance_wallet_template_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template" ADD CONSTRAINT "compliance_wallet_template_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template" ADD CONSTRAINT "compliance_wallet_template_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template" ADD CONSTRAINT "compliance_wallet_template_organizationOccupationId_fkey" FOREIGN KEY ("organizationOccupationId") REFERENCES "organization_occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template" ADD CONSTRAINT "compliance_wallet_template_organizationSpecialtyId_fkey" FOREIGN KEY ("organizationSpecialtyId") REFERENCES "organization_specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template_item" ADD CONSTRAINT "compliance_wallet_template_item_complianceWalletTemplateId_fkey" FOREIGN KEY ("complianceWalletTemplateId") REFERENCES "compliance_wallet_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template_item" ADD CONSTRAINT "compliance_wallet_template_item_complianceListItemId_fkey" FOREIGN KEY ("complianceListItemId") REFERENCES "compliance_list_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_wallet_template_item" ADD CONSTRAINT "compliance_wallet_template_item_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire" ADD CONSTRAINT "questionnaire_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire" ADD CONSTRAINT "questionnaire_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire" ADD CONSTRAINT "questionnaire_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire" ADD CONSTRAINT "questionnaire_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "organization_occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire" ADD CONSTRAINT "questionnaire_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "organization_specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule" ADD CONSTRAINT "tagging_rule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule" ADD CONSTRAINT "tagging_rule_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule" ADD CONSTRAINT "tagging_rule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule" ADD CONSTRAINT "tagging_rule_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule_question" ADD CONSTRAINT "tagging_rule_question_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule_question" ADD CONSTRAINT "tagging_rule_question_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule_question" ADD CONSTRAINT "tagging_rule_question_taggingRuleId_fkey" FOREIGN KEY ("taggingRuleId") REFERENCES "tagging_rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_rule_question" ADD CONSTRAINT "tagging_rule_question_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_logic" ADD CONSTRAINT "matching_logic_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_logic" ADD CONSTRAINT "matching_logic_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_logic" ADD CONSTRAINT "matching_logic_matchingCriterionId_fkey" FOREIGN KEY ("matchingCriterionId") REFERENCES "matching_criterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_logic" ADD CONSTRAINT "matching_logic_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "candidate_specialties" ADD CONSTRAINT "candidate_specialties_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_specialties" ADD CONSTRAINT "candidate_specialties_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_professional_reference" ADD CONSTRAINT "candidate_professional_reference_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_tags" ADD CONSTRAINT "candidate_tags_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_tags" ADD CONSTRAINT "candidate_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_preferred_locations" ADD CONSTRAINT "candidate_preferred_locations_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_preferred_locations" ADD CONSTRAINT "candidate_preferred_locations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_saved_requisitions" ADD CONSTRAINT "candidate_saved_requisitions_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_saved_requisitions" ADD CONSTRAINT "candidate_saved_requisitions_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_requisition_vendor_reviews" ADD CONSTRAINT "candidate_requisition_vendor_reviews_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_requisition_vendor_reviews" ADD CONSTRAINT "candidate_requisition_vendor_reviews_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_compliance" ADD CONSTRAINT "candidate_compliance_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_compliance" ADD CONSTRAINT "candidate_compliance_complianceListItemId_fkey" FOREIGN KEY ("complianceListItemId") REFERENCES "compliance_list_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_compliance" ADD CONSTRAINT "candidate_compliance_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_compliance" ADD CONSTRAINT "candidate_compliance_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_questionnaire_response" ADD CONSTRAINT "candidate_questionnaire_response_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_questionnaire_response" ADD CONSTRAINT "candidate_questionnaire_response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_summary" ADD CONSTRAINT "candidate_summary_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_summary" ADD CONSTRAINT "candidate_summary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_summary" ADD CONSTRAINT "candidate_summary_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_summary" ADD CONSTRAINT "candidate_summary_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_summary" ADD CONSTRAINT "candidate_summary_primarySpecialtyId_fkey" FOREIGN KEY ("primarySpecialtyId") REFERENCES "specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "placement" ADD CONSTRAINT "placement_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement" ADD CONSTRAINT "placement_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "placement_compliance_items" ADD CONSTRAINT "placement_compliance_items_complianceListItemId_fkey" FOREIGN KEY ("complianceListItemId") REFERENCES "compliance_list_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_summary" ADD CONSTRAINT "placement_summary_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_summary" ADD CONSTRAINT "placement_summary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_summary" ADD CONSTRAINT "placement_summary_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_summary" ADD CONSTRAINT "placement_summary_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_summary" ADD CONSTRAINT "placement_summary_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "organization_pay_code" ADD CONSTRAINT "organization_pay_code_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_holiday" ADD CONSTRAINT "organization_holiday_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_perDiemAssignmentId_fkey" FOREIGN KEY ("perDiemAssignmentId") REFERENCES "per_diem_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet" ADD CONSTRAINT "timesheet_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timekeeping_summary" ADD CONSTRAINT "timekeeping_summary_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timekeeping_summary" ADD CONSTRAINT "timekeeping_summary_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timekeeping_summary" ADD CONSTRAINT "timekeeping_summary_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timekeeping_summary" ADD CONSTRAINT "timekeeping_summary_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "timesheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_perDiemAssignmentId_fkey" FOREIGN KEY ("perDiemAssignmentId") REFERENCES "per_diem_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_payCodeId_fkey" FOREIGN KEY ("payCodeId") REFERENCES "organization_pay_code"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entry" ADD CONSTRAINT "timesheet_entry_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_disputes" ADD CONSTRAINT "timesheet_disputes_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "timesheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_disputes" ADD CONSTRAINT "timesheet_disputes_timesheetEntryId_fkey" FOREIGN KEY ("timesheetEntryId") REFERENCES "timesheet_entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_disputes" ADD CONSTRAINT "timesheet_disputes_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_disputes" ADD CONSTRAINT "timesheet_disputes_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_disputes" ADD CONSTRAINT "timesheet_disputes_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "timekeeping_policy" ADD CONSTRAINT "timekeeping_policy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checklists" ADD CONSTRAINT "compliance_checklists_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checklists" ADD CONSTRAINT "compliance_checklists_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checklists" ADD CONSTRAINT "compliance_checklists_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checklist_items" ADD CONSTRAINT "compliance_checklist_items_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "compliance_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checklist_items" ADD CONSTRAINT "compliance_checklist_items_complianceListItemId_fkey" FOREIGN KEY ("complianceListItemId") REFERENCES "compliance_list_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "requisition_acceptance_criterion" ADD CONSTRAINT "requisition_acceptance_criterion_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition_acceptance_criterion" ADD CONSTRAINT "requisition_acceptance_criterion_complianceListItemId_fkey" FOREIGN KEY ("complianceListItemId") REFERENCES "compliance_list_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "organization_metric_snapshot" ADD CONSTRAINT "organization_metric_snapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_metric_snapshot" ADD CONSTRAINT "organization_metric_snapshot_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "metric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "per_diem_shifts" ADD CONSTRAINT "per_diem_shifts_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_shifts" ADD CONSTRAINT "per_diem_shifts_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_shifts" ADD CONSTRAINT "per_diem_shifts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_shifts" ADD CONSTRAINT "per_diem_shifts_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_shift_specialties" ADD CONSTRAINT "per_diem_shift_specialties_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "per_diem_shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_shift_specialties" ADD CONSTRAINT "per_diem_shift_specialties_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_routedToUserId_fkey" FOREIGN KEY ("routedToUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_routedByUserId_fkey" FOREIGN KEY ("routedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "timesheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupation_specialties" ADD CONSTRAINT "occupation_specialties_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupation_specialties" ADD CONSTRAINT "occupation_specialties_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_configs" ADD CONSTRAINT "billing_configs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_configs" ADD CONSTRAINT "billing_configs_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_workforce_billing_rates" ADD CONSTRAINT "organization_workforce_billing_rates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications_org" ADD CONSTRAINT "notifications_org_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications_org" ADD CONSTRAINT "notifications_org_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log_org" ADD CONSTRAINT "activity_log_org_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log_org" ADD CONSTRAINT "activity_log_org_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

