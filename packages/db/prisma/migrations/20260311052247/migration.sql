-- CreateEnum
CREATE TYPE "OrganizationVendorStatus" AS ENUM ('PENDING', 'ACTIVE');

-- AlterTable
ALTER TABLE "organization_vendor" ADD COLUMN     "contractDocumentKey" TEXT,
ADD COLUMN     "contractFileName" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" "OrganizationVendorStatus" NOT NULL DEFAULT 'PENDING';
