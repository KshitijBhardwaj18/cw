CREATE TABLE "vendor_requisition_candidate_mark" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "vendorId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "requisitionId" UUID NOT NULL,
    "insertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_requisition_candidate_mark_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vendor_requisition_candidate_mark_vendorId_candidateId_requisitionId_key" ON "vendor_requisition_candidate_mark"("vendorId", "candidateId", "requisitionId");

CREATE INDEX "vendor_requisition_candidate_mark_requisitionId_vendorId_idx" ON "vendor_requisition_candidate_mark"("requisitionId", "vendorId");

CREATE INDEX "vendor_requisition_candidate_mark_candidateId_idx" ON "vendor_requisition_candidate_mark"("candidateId");

ALTER TABLE "vendor_requisition_candidate_mark" ADD CONSTRAINT "vendor_requisition_candidate_mark_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vendor_requisition_candidate_mark" ADD CONSTRAINT "vendor_requisition_candidate_mark_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vendor_requisition_candidate_mark" ADD CONSTRAINT "vendor_requisition_candidate_mark_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vendor_requisition_candidate_mark" ADD CONSTRAINT "vendor_requisition_candidate_mark_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
