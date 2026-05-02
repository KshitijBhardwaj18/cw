-- AlterTable
ALTER TABLE "grievances" ADD CONSTRAINT "grievances_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "placement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "grievances_organizationId_grievanceNumber_key" ON "grievances"("organizationId", "grievanceNumber");

-- CreateIndex
CREATE INDEX "grievances_organizationId_status_idx" ON "grievances"("organizationId", "status");

-- CreateIndex
CREATE INDEX "grievances_placementId_idx" ON "grievances"("placementId");
