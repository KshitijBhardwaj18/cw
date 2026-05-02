-- AlterTable
ALTER TABLE "requisition" ADD COLUMN "startTime" TEXT,
ADD COLUMN "endTime" TEXT,
ADD COLUMN "incentiveType" TEXT,
ADD COLUMN "incentiveAmount" DOUBLE PRECISION,
ADD COLUMN "interviewRequired" "InterviewType",
ADD COLUMN "vendorNotes" TEXT;

-- CreateTable
CREATE TABLE "requisition_acceptance_criterion" (
    "id" UUID NOT NULL,
    "requisitionId" UUID NOT NULL,
    "complianceListItemId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requisition_acceptance_criterion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "requisition_acceptance_criterion_requisitionId_complianceListItemId_key" ON "requisition_acceptance_criterion"("requisitionId", "complianceListItemId");

-- CreateIndex
CREATE INDEX "requisition_acceptance_criterion_requisitionId_idx" ON "requisition_acceptance_criterion"("requisitionId");

-- CreateIndex
CREATE INDEX "requisition_acceptance_criterion_complianceListItemId_idx" ON "requisition_acceptance_criterion"("complianceListItemId");

-- AddForeignKey
ALTER TABLE "requisition_acceptance_criterion" ADD CONSTRAINT "requisition_acceptance_criterion_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "requisition_acceptance_criterion" ADD CONSTRAINT "requisition_acceptance_criterion_complianceListItemId_fkey" FOREIGN KEY ("complianceListItemId") REFERENCES "compliance_list_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
