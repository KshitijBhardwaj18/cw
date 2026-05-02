-- AlterTable
ALTER TABLE "session" ADD COLUMN     "vendorId" UUID,
ADD COLUMN     "vendorUserId" UUID,
ADD COLUMN     "vendorUserRole" TEXT;
