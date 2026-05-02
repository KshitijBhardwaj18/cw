-- CreateEnum
CREATE TYPE "DepartmentType" AS ENUM ('CLINICAL', 'NON_CLINICAL', 'ADMINISTRATIVE');

-- CreateTable
CREATE TABLE "department" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "locationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "departmentType" "DepartmentType" NOT NULL,
    "costCenter" TEXT,
    "organizationOccupationId" UUID,
    "organizationSpecialtyId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_user" (
    "id" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "department_organizationId_idx" ON "department"("organizationId");

-- CreateIndex
CREATE INDEX "department_locationId_idx" ON "department"("locationId");

-- CreateIndex
CREATE INDEX "department_user_departmentId_idx" ON "department_user"("departmentId");

-- CreateIndex
CREATE INDEX "department_user_userId_idx" ON "department_user"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "department_user_departmentId_userId_key" ON "department_user"("departmentId", "userId");

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "organization_location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_organizationOccupationId_fkey" FOREIGN KEY ("organizationOccupationId") REFERENCES "organization_occupation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_organizationSpecialtyId_fkey" FOREIGN KEY ("organizationSpecialtyId") REFERENCES "organization_specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_user" ADD CONSTRAINT "department_user_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_user" ADD CONSTRAINT "department_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
