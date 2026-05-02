-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "expected_annual_spend" DOUBLE PRECISION,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
