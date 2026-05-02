-- Invoice routing metadata (final invoice route-to-approver flow)
ALTER TABLE "invoices"
ADD COLUMN "routedToUserId" UUID,
ADD COLUMN "routedByUserId" UUID,
ADD COLUMN "routedAt" TIMESTAMP(3),
ADD COLUMN "routingNotes" TEXT;

ALTER TABLE "invoices"
ADD CONSTRAINT "invoices_routedToUserId_fkey"
FOREIGN KEY ("routedToUserId") REFERENCES "user"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "invoices"
ADD CONSTRAINT "invoices_routedByUserId_fkey"
FOREIGN KEY ("routedByUserId") REFERENCES "user"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Final invoices list/cards query performance
CREATE INDEX "invoices_organizationId_status_invoiceDate_idx"
ON "invoices"("organizationId", "status", "invoiceDate");

CREATE INDEX "invoices_organizationId_status_dueDate_idx"
ON "invoices"("organizationId", "status", "dueDate");

CREATE INDEX "invoices_organizationId_approvedAt_idx"
ON "invoices"("organizationId", "approvedAt");

CREATE INDEX "invoices_routedToUserId_idx"
ON "invoices"("routedToUserId");
