-- Make department -> organization_occupation optional
ALTER TABLE "department" ALTER COLUMN "organizationOccupationId" DROP NOT NULL;
