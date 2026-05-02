CREATE TABLE "candidate_saved_requisitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidateId" UUID NOT NULL,
    "requisitionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_saved_requisitions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "candidate_saved_requisitions_candidateId_requisitionId_key" ON "candidate_saved_requisitions"("candidateId", "requisitionId");

CREATE INDEX "candidate_saved_requisitions_candidateId_idx" ON "candidate_saved_requisitions"("candidateId");

CREATE INDEX "candidate_saved_requisitions_requisitionId_idx" ON "candidate_saved_requisitions"("requisitionId");

ALTER TABLE "candidate_saved_requisitions" ADD CONSTRAINT "candidate_saved_requisitions_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "candidate_saved_requisitions" ADD CONSTRAINT "candidate_saved_requisitions_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
