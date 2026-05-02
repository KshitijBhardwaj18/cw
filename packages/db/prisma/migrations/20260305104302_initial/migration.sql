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
CREATE TYPE "ComplianceListItemCategory" AS ENUM ('BACKGROUND_AND_IDENTIFICATION', 'LICENSES', 'CERTIFICATIONS', 'OTHERS');

-- CreateEnum
CREATE TYPE "ComplianceListItemStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ExpirationRuleUnit" AS ENUM ('DAYS', 'MONTHS', 'YEARS');

-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('SKILL', 'COMPLIANCE', 'AVAILABILITY', 'PRIORITY', 'FLAG');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('RECRUITMENT_EFFICIENCY', 'COMPLIANCE', 'QUALITY_OF_SERVICE');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CANDIDATE_USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "phoneNumber" TEXT,
    "officePhone" TEXT,
    "timeZone" TEXT,
    "mspId" UUID,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "website" TEXT,
    "logo" TEXT,
    "metadata" TEXT,
    "serviceAgreement" TEXT,
    "description" TEXT,
    "agreementRenewalDate" TIMESTAMP(3),

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "member" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "MemberRole" NOT NULL,
    "status" "OrganizationMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "msp_linked_orgs" (
    "id" UUID NOT NULL,
    "mspId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "addendumAgreement" TEXT NOT NULL,
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
CREATE TABLE "tag" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TagType" NOT NULL,
    "description" TEXT,
    "showOnSubmission" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric" (
    "id" UUID NOT NULL,
    "type" "MetricType" NOT NULL,
    "name" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OccupationSpecialties" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_OccupationSpecialties_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "user_mspId_idx" ON "user"("mspId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

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
CREATE INDEX "organization_location_organizationId_idx" ON "organization_location"("organizationId");

-- CreateIndex
CREATE INDEX "member_organizationId_idx" ON "member"("organizationId");

-- CreateIndex
CREATE INDEX "member_userId_idx" ON "member"("userId");

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
CREATE INDEX "msp_headquartersId_idx" ON "msp"("headquartersId");

-- CreateIndex
CREATE INDEX "msp_billingId_idx" ON "msp"("billingId");

-- CreateIndex
CREATE INDEX "document_uploadedBy_idx" ON "document"("uploadedBy");

-- CreateIndex
CREATE INDEX "document_mspId_idx" ON "document"("mspId");

-- CreateIndex
CREATE INDEX "document_vendorId_idx" ON "document"("vendorId");

-- CreateIndex
CREATE INDEX "note_createdBy_idx" ON "note"("createdBy");

-- CreateIndex
CREATE INDEX "note_mspId_idx" ON "note"("mspId");

-- CreateIndex
CREATE INDEX "note_vendorId_idx" ON "note"("vendorId");

-- CreateIndex
CREATE INDEX "msp_linked_orgs_mspId_idx" ON "msp_linked_orgs"("mspId");

-- CreateIndex
CREATE INDEX "msp_linked_orgs_organizationId_idx" ON "msp_linked_orgs"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "msp_linked_orgs_mspId_organizationId_key" ON "msp_linked_orgs"("mspId", "organizationId");

-- CreateIndex
CREATE INDEX "occupation_status_idx" ON "occupation"("status");

-- CreateIndex
CREATE INDEX "specialty_status_idx" ON "specialty"("status");

-- CreateIndex
CREATE INDEX "compliance_list_item_category_idx" ON "compliance_list_item"("category");

-- CreateIndex
CREATE INDEX "compliance_list_item_expirationType_idx" ON "compliance_list_item"("expirationType");

-- CreateIndex
CREATE INDEX "compliance_list_item_responseStyle_idx" ON "compliance_list_item"("responseStyle");

-- CreateIndex
CREATE INDEX "compliance_list_item_status_idx" ON "compliance_list_item"("status");

-- CreateIndex
CREATE INDEX "tag_createdBy_idx" ON "tag"("createdBy");

-- CreateIndex
CREATE INDEX "metric_type_idx" ON "metric"("type");

-- CreateIndex
CREATE INDEX "_OccupationSpecialties_B_index" ON "_OccupationSpecialties"("B");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_mspId_fkey" FOREIGN KEY ("mspId") REFERENCES "msp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_location" ADD CONSTRAINT "organization_location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "msp" ADD CONSTRAINT "msp_headquartersId_fkey" FOREIGN KEY ("headquartersId") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "msp" ADD CONSTRAINT "msp_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_mspId_fkey" FOREIGN KEY ("mspId") REFERENCES "msp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_mspId_fkey" FOREIGN KEY ("mspId") REFERENCES "msp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "msp_linked_orgs" ADD CONSTRAINT "msp_linked_orgs_mspId_fkey" FOREIGN KEY ("mspId") REFERENCES "msp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "msp_linked_orgs" ADD CONSTRAINT "msp_linked_orgs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OccupationSpecialties" ADD CONSTRAINT "_OccupationSpecialties_A_fkey" FOREIGN KEY ("A") REFERENCES "occupation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OccupationSpecialties" ADD CONSTRAINT "_OccupationSpecialties_B_fkey" FOREIGN KEY ("B") REFERENCES "specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
