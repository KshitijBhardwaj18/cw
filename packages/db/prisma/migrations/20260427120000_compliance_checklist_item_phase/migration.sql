-- When each checklist item applies: submission vs placement
CREATE TYPE "ComplianceChecklistItemPhase" AS ENUM ('SUBMISSION', 'PLACEMENT');

ALTER TABLE "compliance_checklist_items" ADD COLUMN "phase" "ComplianceChecklistItemPhase" NOT NULL DEFAULT 'SUBMISSION';
