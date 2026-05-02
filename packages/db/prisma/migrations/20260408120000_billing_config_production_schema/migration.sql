-- Migration: billing_config_production_schema
-- Replace JSON rateCard + loose string fields with proper typed columns
-- and add clientBillingId as a unique, human-readable billing reference

-- 1. Add all new columns (nullable / with defaults so existing rows are safe)
ALTER TABLE "billing_configs"
  ADD COLUMN "clientBillingId"         TEXT,
  ADD COLUMN "contactName"             TEXT,
  ADD COLUMN "contactEmail"            TEXT,
  ADD COLUMN "contactPhone"            TEXT,
  ADD COLUMN "billingStreet"           TEXT,
  ADD COLUMN "billingCity"             TEXT,
  ADD COLUMN "billingState"            TEXT,
  ADD COLUMN "billingZip"              TEXT,
  ADD COLUMN "remittanceStreet"        TEXT,
  ADD COLUMN "remittanceCity"          TEXT,
  ADD COLUMN "remittanceState"         TEXT,
  ADD COLUMN "remittanceZip"           TEXT,
  ADD COLUMN "invoiceGrouping"         TEXT,
  ADD COLUMN "currency"                TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN "cycleStartDay"           TEXT,
  ADD COLUMN "invoiceDeliveryEmail"    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "invoiceDeliverySftp"     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "invoiceDeliveryDownload" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "otThreshold"             DOUBLE PRECISION NOT NULL DEFAULT 40,
  ADD COLUMN "timesheetApproval"       BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "mobileEntry"             BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "fileUpload"              BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "disputeTracking"         BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "mspPercent"              DOUBLE PRECISION,
  ADD COLUMN "saasPercent"             DOUBLE PRECISION;

-- 2. Backfill clientBillingId for any existing rows using a deterministic format
UPDATE "billing_configs"
SET "clientBillingId" = 'BIL-' || TO_CHAR(NOW(), 'YYYY') || '-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 6))
WHERE "clientBillingId" IS NULL;

-- 3. Apply NOT NULL + UNIQUE now that every row has a value
ALTER TABLE "billing_configs"
  ALTER COLUMN "clientBillingId" SET NOT NULL;

CREATE UNIQUE INDEX "billing_configs_clientBillingId_key" ON "billing_configs"("clientBillingId");

-- 4. Drop old columns that are replaced or no longer needed
ALTER TABLE "billing_configs"
  DROP COLUMN IF EXISTS "rateCard",
  DROP COLUMN IF EXISTS "invoiceDeliveryMethod",
  DROP COLUMN IF EXISTS "clientName";

-- 5. Adjust billingFrequency default (was "weekly", now "monthly")
ALTER TABLE "billing_configs"
  ALTER COLUMN "billingFrequency" SET DEFAULT 'monthly';
