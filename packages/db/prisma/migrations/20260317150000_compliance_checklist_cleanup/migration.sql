-- Remove unused columns added in schema_align_dbml from compliance_checklists
ALTER TABLE "compliance_checklists" DROP COLUMN IF EXISTS "occupationId";
ALTER TABLE "compliance_checklists" DROP COLUMN IF EXISTS "specialtyId";
ALTER TABLE "compliance_checklists" DROP COLUMN IF EXISTS "usageCount";

-- Remove isRequired from compliance_checklist_items
ALTER TABLE "compliance_checklist_items" DROP COLUMN IF EXISTS "isRequired";
