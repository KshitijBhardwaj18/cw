-- AlterTable
ALTER TABLE "candidate" ADD COLUMN     "licenseNumber" TEXT;

-- DropEnum
DROP TYPE "ComplianceItemScopeType";

-- RenameForeignKey
ALTER TABLE "placement_compliance_items" RENAME CONSTRAINT "placement_compliance_items_complianceItemId_fkey" TO "placement_compliance_items_complianceListItemId_fkey";

-- RenameIndex
ALTER INDEX "placement_compliance_items_complianceItemId_idx" RENAME TO "placement_compliance_items_complianceListItemId_idx";

-- RenameIndex
ALTER INDEX "placement_compliance_items_placementId_complianceItemId_key" RENAME TO "placement_compliance_items_placementId_complianceListItemId_key";
