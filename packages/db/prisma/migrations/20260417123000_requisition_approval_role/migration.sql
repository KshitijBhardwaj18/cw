-- Add configurable approver role for requisition template and requisition approval flows
ALTER TABLE "requisition_template"
ADD COLUMN "approvalRole" "MemberRole";

ALTER TABLE "requisition"
ADD COLUMN "approvalRole" "MemberRole";

CREATE INDEX "requisition_approvalRole_idx" ON "requisition"("approvalRole");
