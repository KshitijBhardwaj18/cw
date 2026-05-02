-- Supports vendor onboarding metrics + similar filters (org + startDate range + status).
CREATE INDEX IF NOT EXISTS "placement_organizationId_startDate_status_idx"
ON "placement"("organizationId", "startDate", "status");
