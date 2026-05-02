-- CreateEnum
CREATE TYPE "WorkforceBillingFeeType" AS ENUM ('HOUR', 'SHIFT');

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

-- CreateIndex
CREATE UNIQUE INDEX "organization_workforce_billing_rates_organizationId_workforceType_key" ON "organization_workforce_billing_rates"("organizationId", "workforceType");

-- CreateIndex
CREATE INDEX "organization_workforce_billing_rates_organizationId_idx" ON "organization_workforce_billing_rates"("organizationId");

-- AddForeignKey
ALTER TABLE "organization_workforce_billing_rates" ADD CONSTRAINT "organization_workforce_billing_rates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
