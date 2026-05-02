-- Persisted read model for the org credentials tab (expiring/expired buckets)
-- Requires pgcrypto for gen_random_uuid(); most dev DBs already have it. If not, enable it:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE "CredentialExpiryStatus" AS ENUM ('EXPIRING_SOON', 'CRITICAL', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "credential_expiry_summary" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "organizationId" uuid NOT NULL,
  "placementId" uuid NOT NULL,
  "candidateId" uuid NOT NULL,
  "complianceListItemId" uuid NOT NULL,
  "status" "CredentialExpiryStatus" NOT NULL,
  "expiryDate" timestamp(3),

  "workerName" text NOT NULL,
  "credentialName" text NOT NULL,
  "credentialCategory" text NOT NULL,
  "credentialTypeLabel" text NOT NULL,
  "jobTitle" text NOT NULL,
  "requisitionJobTitle" text,

  "locationId" uuid,
  "locationName" text,
  "departmentId" uuid,
  "departmentName" text,
  "vendorId" uuid,
  "vendorName" text,
  "hiringManagerId" uuid,
  "hiringManagerName" text,

  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "credential_expiry_summary_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "credential_expiry_summary_placement_item_uidx"
    ON "credential_expiry_summary"("placementId","complianceListItemId");
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "credential_expiry_summary_org_status_idx"
  ON "credential_expiry_summary"("organizationId","status");
CREATE INDEX IF NOT EXISTS "credential_expiry_summary_org_expiry_idx"
  ON "credential_expiry_summary"("organizationId","expiryDate");
CREATE INDEX IF NOT EXISTS "credential_expiry_summary_org_location_idx"
  ON "credential_expiry_summary"("organizationId","locationId");
CREATE INDEX IF NOT EXISTS "credential_expiry_summary_org_department_idx"
  ON "credential_expiry_summary"("organizationId","departmentId");
CREATE INDEX IF NOT EXISTS "credential_expiry_summary_org_vendor_idx"
  ON "credential_expiry_summary"("organizationId","vendorId");
CREATE INDEX IF NOT EXISTS "credential_expiry_summary_org_hiring_manager_idx"
  ON "credential_expiry_summary"("organizationId","hiringManagerId");

DO $$ BEGIN
  ALTER TABLE "credential_expiry_summary"
    ADD CONSTRAINT "credential_expiry_summary_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "credential_expiry_summary"
    ADD CONSTRAINT "credential_expiry_summary_placementId_fkey"
    FOREIGN KEY ("placementId") REFERENCES "placement"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "credential_expiry_summary"
    ADD CONSTRAINT "credential_expiry_summary_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "candidate"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "credential_expiry_summary"
    ADD CONSTRAINT "credential_expiry_summary_complianceListItemId_fkey"
    FOREIGN KEY ("complianceListItemId") REFERENCES "compliance_list_item"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

